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
import { GetAllUsersQueryDto } from './dto/get.dto';
import { FilesService } from '../files/files.service';
import { UserHelper } from './helper/user.helper';

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private errorService: ErrorService,
    private jwtService: JwtService,
    private userHelper: UserHelper,
    private fileService: FilesService,
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

  async getAllUsers(request, query: GetAllUsersQueryDto) {
    const user: IAuth = request.user;
    const users = await this.prismaService.user.findMany({
      where: {
        userData: {
          unitKerjaId: user.role === 'operator' ? user.unitKerjaId : undefined,
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

    const oldPhoto = photo
      ? await this.userHelper.getUserPhoto(updatedUser.id)
      : '';

    if (oldPhoto && oldPhoto.photo !== 'default_user.jpg') {
      this.fileService.deleteFile(oldPhoto);
    }

    return this.userHelper.toUserResponse(request, updateUser);
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
