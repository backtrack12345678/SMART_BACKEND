import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ErrorService } from '../../common/error/error.service';
import { ValidationService } from '../../common/validation/validation.service';
import { IAuth } from '../../common/model/web.model';
import { getHost } from '../../common/utlis/utils';

@Injectable()
export class UserHelper {
  constructor(
    private prismaService: PrismaService,
    private errorService: ErrorService,
    private validationService: ValidationService,
  ) {}
  async checkUsernameMustUnique(username: string): Promise<void> {
    const countUsername: number = await this.prismaService.user.count({
      where: {
        username: username,
      },
    });

    if (countUsername !== 0) {
      this.errorService.badRequest('Username Sudah Digunakan');
    }
  }

  async checkNIPMustUnique(nip: string): Promise<void> {
    const countNIP = await this.prismaService.user_Data.count({
      where: {
        nip: nip,
      },
    });

    if (countNIP !== 0) {
      this.errorService.badRequest('NIP Sudah Digunakan');
    }
  }

  async checkPhoneMustUnique(phone: string): Promise<void> {
    const countPhone = await this.prismaService.user_Data.count({
      where: {
        phone: phone,
      },
    });

    if (countPhone !== 0) {
      this.errorService.badRequest('Nomor Telepon Sudah Digunakan');
    }
  }

  async checkSubUnitKerjaMustExists(
    subUnitKerjaId: number,
    unitKerjaId: number,
  ) {
    const subUnitKerja = await this.prismaService.sub_Unit_Kerja.findUnique({
      where: {
        id: subUnitKerjaId,
      },
      select: {
        id: true,
        unitKerjaId: true,
      },
    });

    if (!subUnitKerja) {
      this.errorService.notFound('Sub Unit Kerja Tidak Ditemukan');
    }

    console.log(unitKerjaId, subUnitKerja.unitKerjaId);

    if (unitKerjaId !== subUnitKerja.unitKerjaId) {
      this.errorService.badRequest(
        'Sub Unit Kerja Ini Tidak Terdaftar Di Unit Kerja Yang Dipilih',
      );
    }
  }

  async getUserData(request, userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        ...this.userSelectCondition,
      },
    });

    if (!user) {
      this.errorService.notFound('Pengguna Tidak Ditemukan');
    }

    return {
      ...this.toUserResponse(request, user),
      role: user.role,
      unitKerjaId: user.userData.unitKerja.id,
    };
  }

  // async getUserUnitKerjaId(userId: string): Promise<number> {
  //   const user = await this.prismaService.user.findUnique({
  //     where: {
  //       id: userId,
  //     },
  //     select: {
  //       userData: {
  //         select: {
  //           subUnitKerja: {
  //             select: {
  //               unitKerjaId: true,
  //             },
  //           },
  //         },
  //       },
  //     },
  //   });

  //   if (!user) {
  //     this.errorService.notFound('Pengguna Tidak Ditemukan');
  //   }

  //   return user.userData.subUnitKerja.unitKerjaId;
  // }

  async getUnitKerjaIdBySubUnitKerjaId(
    subUnitKerjaId: number,
  ): Promise<number> {
    const subUnitKerja = await this.prismaService.sub_Unit_Kerja.findUnique({
      where: {
        id: subUnitKerjaId,
      },
      select: {
        unitKerjaId: true,
      },
    });

    if (!subUnitKerja) {
      this.errorService.notFound('Sub Unit Kerja Tidak Ditemukan');
    }

    return subUnitKerja.unitKerjaId;
  }

  async checkPangkatMustExists(pangkatGolonganId) {
    const count = await this.prismaService.pangkat_Golongan.count({
      where: {
        id: pangkatGolonganId,
      },
    });

    if (count === 0) {
      this.errorService.notFound('Pangkat Atau Golongan Tidak Ditemukan');
    }
  }

  async checkJabatanMustExist(jabatanId) {
    const count = await this.prismaService.jabatan.count({
      where: {
        id: jabatanId,
      },
    });

    if (count === 0) {
      this.errorService.notFound('Jabatan Tidak Ditemukan');
    }
  }

  async checkUniqeUserData(payload, type: string, user?) {
    if (payload.username) {
      if (payload.username) {
        if (
          type === 'create' ||
          (type === 'update' && user?.username !== payload.username)
        ) {
          await this.checkUsernameMustUnique(payload.username);
        }
      }
    }

    if (payload.phone) {
      if (payload.phone) {
        if (
          type === 'create' ||
          (type === 'update' && user?.phone !== payload.phone)
        ) {
          await this.checkPhoneMustUnique(payload.phone);
        }
      }
    }

    if (payload.nip) {
      if (payload.nip) {
        if (
          type === 'create' ||
          (type === 'update' && user?.nip !== payload.nip)
        ) {
          await this.checkNIPMustUnique(payload.nip);
        }
      }
    }
  }

  async checkNonUniqueUserData(userDataPayload) {
    if (userDataPayload.unitKerjaId) {
      await this.validationService.checkUnitKerjaMustExists(
        userDataPayload.unitKerjaId,
      );
    }
    if (userDataPayload.subUnitKerjaId)
      await this.checkSubUnitKerjaMustExists(
        userDataPayload.subUnitKerjaId,
        userDataPayload.unitKerjaId,
      );
    if (userDataPayload.pangkatGolonganId)
      await this.checkPangkatMustExists(userDataPayload.pangkatGolonganId);
    if (userDataPayload.jabatanId)
      await this.checkJabatanMustExist(userDataPayload.jabatanId);
  }

  async checkForAdmin(createUserRole: string, type: string, updatedUser?) {
    if (type === 'update') {
      // const updatedUser = await this.getUserData(updatedUserId);
      if (!['operator', 'user'].includes(updatedUser.role)) {
        this.errorService.forbidden('Tidak Dapat Memperbarui User Ini');
      }
    }

    if (!['operator', 'user'].includes(createUserRole)) {
      this.errorService.forbidden(`Tidak Bisa Menambah ${createUserRole}`);
    }
  }

  async createUserForOperator(
    operator: IAuth,
    createUserRole: string,
    userDataPayload,
  ) {
    if (createUserRole !== 'user') {
      this.errorService.forbidden(`Tidak Bisa Menambah ${createUserRole}`);
    }

    // const operator = await this.getUserData(userId);

    // const createUserUnitKerjaId =
    //   await this.getUnitKerjaIdBySubUnitKerjaId(subUnitKerjaId);

    if (operator.unitKerjaId !== userDataPayload.unitKerjaId) {
      throw new this.errorService.forbidden(
        'Tidak Dapat Membuat User Dari Sub Unit Kerja Ini',
      );
    }
  }

  async updateUserForOperator(operator, updatedUser, payload?) {
    // const operator = await this.getUserData(operatorId);
    // const updatedUser = await this.getUserData(updatedUserId);

    // cek updated user
    if (updatedUser.role !== 'user') {
      this.errorService.forbidden('Tidak Dapat Memperbarui User Ini');
    }

    if (operator.unitKerjaId !== updatedUser.unitKerjaId) {
      throw new this.errorService.forbidden(
        'Tidak Dapat Memperbarui User Dari Unit Kerja Ini',
      );
    }

    //check payload
    if (payload.role) {
      if (payload.role !== 'user') {
        this.errorService.forbidden(
          `Tidak Dapat Memperbarui Role Menjadi ${payload.role}`,
        );
      }
    }

    if (payload.unitKerjaId) {
      if (payload.unitKerjaId !== operator.unitKerjaId) {
        throw new this.errorService.forbidden(
          'Tidak Dapat Memperbarui User Menjadi Unit Kerja Ini',
        );
      }
    }
  }

  async getUserPhoto(userId: string) {
    const user = await this.prismaService.user_Data.findUnique({
      where: {
        userId: userId,
      },
      select: {
        photo: true,
        path: true,
      },
    });

    if (!user) {
      this.errorService.notFound('Pengguna Tidak Ditemukan');
    }

    return user;
  }

  userSelectCondition = {
    id: true,
    role: true,
    userData: {
      select: {
        nama: true,
        nip: true,
        phone: true,
        jabatan: {
          select: {
            id: true,
            nama: true,
          },
        },
        unitKerja: {
          select: {
            id: true,
            nama: true,
          },
        },
        subUnitKerja: {
          select: {
            id: true,
            nama: true,
          },
        },
        pangkatGolongan: {
          select: {
            id: true,
            nama: true,
          },
        },
        photo: true,
      },
    },
  };

  toUserResponse(request, user, type?: string) {
    return {
      id: user.id,
      ...(type === 'private' && {
        role: user.role,
      }),
      nama: user.userData.nama,
      nip: user.userData.nip,
      phone: user.userData.phone,
      jabatan: {
        id: user.userData.jabatan.id,
        nama: user.userData.jabatan.nama,
      },
      pangkatGolongan: {
        id: user.userData.pangkatGolongan.id,
        nama: user.userData.pangkatGolongan.nama,
      },
      unitKerja: {
        id: user.userData.unitKerja.id,
        nama: user.userData.unitKerja.nama,
      },
      subUnitKerja: {
        id: user.userData.subUnitKerja.id,
        nama: user.userData.subUnitKerja.nama,
      },
      photo: `${getHost(request)}/api/files/user/${user.userData.photo}`,
    };
  }
}
