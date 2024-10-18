import { Injectable } from '@nestjs/common';
import { CreateGolonganDto } from './dto/create-golongan.dto';
import { UpdateGolonganDto } from './dto/update-golongan.dto';
import { ErrorService } from '../common/error/error.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { GetGolonganQueryDto } from './dto/query.dto';

@Injectable()
export class GolonganService {
  constructor(
    private prismaService: PrismaService,
    private errorService: ErrorService,
  ) { }

  async createGroup(payload: CreateGolonganDto) {
    await this.checkKodeMustUnique(payload.kode);
    const group = await this.prismaService.pangkat_Golongan.create({
      data: {
        ...payload,
      },
      select: this.groupSelectCondition,
    });

    return group;
  }

  async findAllGroups(query: GetGolonganQueryDto) {
    const groups = await this.prismaService.pangkat_Golongan.findMany({
      where: {
        nama: {
          contains: query.name || undefined,
        },
      },
      skip: (query.page - 1) * query.size,
      take: query.size,
      select: this.groupSelectCondition,
    });

    return {
      data: groups.map((position) => position),
      paging: {
        size: query.size,
        currentPage: query.page,
        totalPage: Math.ceil(groups.length / query.size),
      },
    };
  }

  async findOneGroup(golonganId: number) {
    const group = await this.prismaService.pangkat_Golongan.findUnique({
      where: {
        id: golonganId,
      },
      select: this.groupSelectCondition,
    });

    if (!group) {
      this.errorService.notFound('Golongan Tidak Ditemukan');
    }

    return group;
  }

  async updateGroup(golonganId: number, payload: UpdateGolonganDto) {
    await this.findOneGroup(golonganId);
    await this.checkKodeMustUnique(payload.kode, golonganId);

    const group = await this.prismaService.pangkat_Golongan.update({
      where: {
        id: golonganId,
      },
      data: {
        ...payload,
      },
      select: this.groupSelectCondition,
    });

    return group;
  }

  async removeGroup(golonganId: number) {
    try {
      await this.findOneGroup(golonganId);
      await this.prismaService.pangkat_Golongan.delete({
        where: {
          id: golonganId,
        },
        select: {
          id: true,
        },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        this.errorService.badRequest(
          'Golongan Ini Tidak Dapat Dihapus Karena Masih Digunakan Ditempat Lain',
        );
      } else {
        throw error;
      }
    }
  }

  groupSelectCondition = {
    id: true,
    nama: true,
    kode: true,
    createdAt: true,
  };

  async checkKodeMustUnique(kodeGolongan: string, golonganId?: number) {
    const kode = await this.prismaService.pangkat_Golongan.count({
      where: {
        id: {
          not: golonganId || undefined,
        },
        kode: kodeGolongan,
      },
    });

    if (kode !== 0) {
      this.errorService.badRequest('Kode Sudah Digunakan');
    }
  }
}
