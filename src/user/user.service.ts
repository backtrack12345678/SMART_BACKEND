import { Injectable } from '@nestjs/common';
// import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../common/prisma/prisma.service';
import { ErrorService } from '../common/error/error.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { IAuth } from '../common/model/web.model';
import { v4 as uuid } from 'uuid';
import { CreateUserDto } from './dto/create-user.dto';
import { GetAllParticipantsQueryDto, GetAllUsersQueryDto } from './dto/get.dto';
import { FilesService } from '../files/files.service';
import { UserHelper } from './helper/user.helper';
import { ConfigService } from '@nestjs/config';
import { UpdateUserProfileDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private errorService: ErrorService,
    private jwtService: JwtService,
    private userHelper: UserHelper,
    private fileService: FilesService,
    private configService: ConfigService,
  ) {}

  async createUser(
    request,
    payload: CreateUserDto,
    photo: Express.Multer.File,
  ): Promise<{ id: string }> {
    const { username, password, role, ...userDataPayload } = payload;
    const user: IAuth = request.user;

    // await this.userHelper.checkUsernameMustUnique(username);
    // await this.userHelper.checkNIPMustUnique(userDataPayload.nip);
    // await this.userHelper.checkPhoneMustUnique(userDataPayload.phone);
    // await this.userHelper.checkSubUnitKerjaMustExists(
    //   userDataPayload.subUnitKerjaId,
    // );
    // await this.userHelper.checkPangkatMustExists(
    //   userDataPayload.pangkatGolonganId,
    // );
    // await this.userHelper.checkJabatanMustExist(userDataPayload.jabatanId);

    //this.errorService.notFound('tes');

    await this.userHelper.checkUniqeUserData(payload, 'create');
    await this.userHelper.checkNonUniqueUserData(userDataPayload);

    if (user.role === 'admin') {
      await this.userHelper.checkForAdmin(role, 'create');
    }

    if (user.role === 'operator') {
      await this.userHelper.createUserForOperator(user, role, userDataPayload);
    }

    const createUser = await this.prismaService.user.create({
      data: {
        id: `user-${uuid().toString()}`,
        username: username,
        password: await bcrypt.hash(password, 10),
        role: role,
        userData: {
          create: {
            ...userDataPayload,
            photo: photo.filename,
            path: photo.path,
          },
        },
      },
      select: this.userHelper.userSelectCondition,
    });

    return this.userHelper.toUserResponse(request, createUser);
  }

  async findOneUser(request, userId: string) {
    const auth: IAuth = request.user;
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      select: this.userHelper.userSelectCondition,
    });

    if (!user) {
      this.errorService.notFound('Pengguna Tidak Ditemukan');
    }

    if (auth.role === 'operator') {
      if (auth.unitKerjaId !== user.userData.unitKerja.id) {
        this.errorService.forbidden(
          'Tidak Dapat Mengakses Pengguna Dari Unit Kerja Lain',
        );
      }
    }

    // if (auth.role === 'user') {
    //   if (auth.id !== user.id) {
    //     this.errorService.forbidden('Tidak Dapat Melihat Pengguna Lain');
    //   }
    // }

    return this.userHelper.toUserResponse(request, user);
  }

  async getAllUsers(request, query: GetAllUsersQueryDto) {
    const auth: IAuth = request.user;
    const users = await this.prismaService.user.findMany({
      where: {
        userData: {
          unitKerjaId: auth.role === 'operator' ? auth.unitKerjaId : undefined,
          nama: {
            contains: query.name || undefined,
          },
        },
      },
      take: query.size,
      skip: (query.page - 1) * query.size,
      select: this.userHelper.userSelectCondition,
    });

    const total = users.length;

    return {
      data: users.map((user) => this.userHelper.toUserResponse(request, user)),
      paging: {
        size: total < query.size ? total : query.size,
        currentPage: query.page,
        totalPage: Math.ceil(total / query.size),
      },
    };
  }

  async getAllParticipants(request, query: GetAllParticipantsQueryDto) {
    const user: IAuth = request.user;

    const users = await this.prismaService.user.findMany({
      where: {
        role: 'user',
        userData: {
          nama: {
            contains: query.name || undefined,
          },
        },
      },
      ...(query.size && {
        skip: (query.page - 1) * query.size,
        take: query.size,
      }),
      select: this.userHelper.userSelectCondition,
    });

    const total = await this.prismaService.user.count({
      where: {
        role: 'user',
        userData: {
          nama: {
            contains: query.name || undefined,
          },
        },
      },
    });

    return {
      data: users.map((user) => this.userHelper.toUserResponse(request, user)),
      paging: {
        size: query.size || total,
        currentPage: query.page,
        totalPage: query.size ? Math.ceil(total / query.size) : 1,
        totalItem: total,
      },
    };
  }

  async updateUser(
    request,
    updatedUserId: string,
    payload,
    photo?: Express.Multer.File,
  ) {
    const {
      username = '',
      password = '',
      role = '',
      ...userDataPayload
    } = payload;
    const user: IAuth = request.user;

    // if (username) await this.userHelper.checkUsernameMustUnique(username);
    // if (userDataPayload.nip)
    //   await this.userHelper.checkNIPMustUnique(userDataPayload.nip);
    // if (userDataPayload.phone)
    //   await this.userHelper.checkPhoneMustUnique(userDataPayload.phone);
    // if (userDataPayload.subUnitKerja)
    //   await this.userHelper.checkSubUnitKerjaMustExists(
    //     userDataPayload.subUnitKerjaId,
    //   );

    const updatedUser = await this.userHelper.getUserData(
      request,
      updatedUserId,
    );

    this.userHelper.checkUniqeUserData(payload, 'update', updatedUser);
    this.userHelper.checkNonUniqueUserData(userDataPayload);

    if (user.role === 'admin') {
      if (role)
        await this.userHelper.checkForAdmin(role, 'update', updatedUser);
    }

    if (user.role === 'operator') {
      // const operator = await this.userHelper.getUserData(user.id);
      await this.userHelper.updateUserForOperator(user, updatedUser, payload);
    }

    const oldPhoto = photo
      ? await this.userHelper.getUserPhoto(updatedUser.id)
      : '';

    const updateUser = await this.prismaService.user.update({
      where: {
        id: updatedUserId,
      },
      data: {
        username: username || undefined,
        password: password || undefined,
        role: role || undefined,
        userData: {
          update: {
            ...userDataPayload,
            ...(photo && {
              photo: photo.filename,
              path: photo.path,
            }),
          },
        },
      },
      select: this.userHelper.userSelectCondition,
    });

    if (oldPhoto && oldPhoto.photo !== 'default_user.jpg') {
      this.fileService.deleteFile(oldPhoto);
    }

    return this.userHelper.toUserResponse(request, updateUser);
  }

  async updateUserProfile(
    request,
    payload?: UpdateUserProfileDto,
    photo?: Express.Multer.File,
  ) {
    if (Object.keys(payload).length === 0 && !photo) {
      this.errorService.badRequest('Body Tidak Boleh Kosong');
    }

    if (payload.phone)
      await this.userHelper.checkPhoneMustUnique(payload.phone);

    return await this.prismaService.$transaction(async (prisma) => {
      const auth: IAuth = request.user;
      const oldPhoto = photo ? await this.userHelper.getUserPhoto(auth.id) : '';

      const { user } = await prisma.user_Data.update({
        where: {
          userId: auth.id,
        },
        data: {
          ...payload,
          ...(photo && {
            photo: photo.filename,
            path: photo.path,
          }),
        },
        select: {
          user: {
            select: this.userHelper.userSelectCondition,
          },
        },
      });

      if (oldPhoto && oldPhoto.photo !== 'default_user.jpg') {
        await this.fileService.deleteFile(oldPhoto);
      }

      return this.userHelper.toUserResponse(request, user);
    });
  }

  async changePassword(auth: IAuth, payload) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: auth.id,
      },
      select: {
        password: true,
      },
    });

    if (!user) {
      this.errorService.unauthorized('kredensial tidak valid');
    }

    const isOldPasswordValid = await bcrypt.compare(
      payload.oldPassword,
      user.password,
    );

    if (!isOldPasswordValid) {
      this.errorService.badRequest('Kata Sandi Lama Salah');
    }

    await this.prismaService.user.update({
      where: {
        id: auth.id,
      },
      data: {
        password: await bcrypt.hash(payload.newPassword, 10),
      },
      select: {
        id: true,
      },
    });
  }

  async deleteUser() {}

  async login(payload: LoginDto) {
    const user = await this.prismaService.user.findUnique({
      where: {
        username: payload.username,
      },
      select: {
        id: true,
        password: true,
        role: true,
        userData: {
          select: {
            unitKerjaId: true,
          },
        },
      },
    });

    if (!user) {
      this.errorService.unauthorized('kredensial tidak valid');
    }

    const isPasswordValid = await bcrypt.compare(
      payload.password,
      user.password,
    );

    if (!isPasswordValid) {
      this.errorService.unauthorized('Kredensial Tidak Valid');
    }

    const accessToken: string = await this.generateUserToken(
      user,
      'accessToken',
    );
    const refreshToken: string = await this.generateUserToken(
      user,
      'refreshToken',
    );

    await this.prismaService.refresh_Token.upsert({
      where: {
        userId: user.id,
      },
      update: {
        refreshToken,
        notificationToken: payload.notificationToken || null,
      },
      create: {
        userId: user.id,
        refreshToken,
        notificationToken: payload.notificationToken || null,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async updateAccessToken(refreshToken?: string) {
    if (!refreshToken) {
      this.errorService.unauthorized(
        'Kredensial Tidak Valid. Silahkan Login Kembali',
      );
    }

    try {
      await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('REFRESH_TOKEN_KEY'),
      });
    } catch (e) {
      this.errorService.unauthorized(
        'Kredensial Tidak Valid. Silahkan Login Kembali',
      );
    }

    const token = await this.prismaService.refresh_Token.findFirst({
      where: {
        refreshToken: refreshToken,
      },
      select: {
        id: true,
        user: {
          select: {
            id: true,
            role: true,
            userData: {
              select: {
                unitKerjaId: true,
              },
            },
          },
        },
      },
    });

    if (!token) {
      this.errorService.unauthorized(
        'Kredensial Tidak Valid. Silahkan Login Kembali',
      );
    }

    return this.generateUserToken(token.user, 'accessToken');
  }

  async logout(user: IAuth) {
    const refreshToken = await this.prismaService.refresh_Token.delete({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
      },
    });

    if (!refreshToken) {
      this.errorService.unauthorized('Gagal Logout');
    }
  }

  async generateUserToken(user, type: string): Promise<string> {
    const payload = {
      id: user.id,
      ...(type === 'accessToken' && {
        role: user.role,
        unitKerjaId: user.userData.unitKerjaId,
      }),
    };

    const expiresIn: string | number =
      type === 'accessToken' ? Number(process.env.ACCESS_TOKEN_AGE) : '30d';
    const secret: string =
      type === 'accessToken'
        ? process.env.ACCESS_TOKEN_KEY
        : process.env.REFRESH_TOKEN_KEY;

    return this.jwtService.signAsync(payload, {
      secret,
      expiresIn,
    });
  }
}
