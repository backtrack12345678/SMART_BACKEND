import { Injectable } from '@nestjs/common';
import { CreateJabatanDto } from './dto/create-jabatan.dto';
import { UpdateJabatanDto } from './dto/update-jabatan.dto';
import { PrismaService } from '../common/prisma/prisma.service';
import { ErrorService } from '../common/error/error.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { GetJabatanQueryDto } from './dto/query.dto';

@Injectable()
export class JabatanService {
  constructor(
    private prismaService: PrismaService,
    private errorService: ErrorService,
  ) {}

  async createPosition(payload: CreateJabatanDto) {
    await this.checkKodeMustUnique(payload.kode);

    const position = await this.prismaService.jabatan.create({
      data: {
        ...payload,
      },
      select: this.positionSelectCondition,
    });

    return position;
  }

  async findAllPositions(query: GetJabatanQueryDto) {
    const positions = await this.prismaService.jabatan.findMany({
      where: {
        nama: {
          contains: query.name || undefined,
        },
      },
      ...(query.size && {
        skip: (query.page - 1) * query.size,
        take: query.size,
      }),
      select: this.positionSelectCondition,
    });

    const total = await this.prismaService.jabatan.count({
      where: {
        nama: {
          contains: query.name || undefined,
        },
      },
    });

    return {
      data: positions.map((position) => position),
      paging: {
        size: query.size || total,
        currentPage: query.page,
        totalPage: query.size ? Math.ceil(total / query.size) : 1,
        totalItem: total,
      },
    };
  }

  async findOnePosition(jabatanId: number) {
    const position = await this.prismaService.jabatan.findUnique({
      where: {
        id: jabatanId,
      },
      select: this.positionSelectCondition,
    });

    if (!position) {
      this.errorService.notFound('Jabatan Tidak Ditemukan');
    }

    return position;
  }

  async updatePosition(jabatanId: number, payload: UpdateJabatanDto) {
    await this.findOnePosition(jabatanId);
    await this.checkKodeMustUnique(payload.kode, jabatanId);

    const position = await this.prismaService.jabatan.update({
      where: {
        id: jabatanId,
      },
      data: {
        ...payload,
      },
      select: this.positionSelectCondition,
    });

    return position;
  }

  async removePosition(jabatanId: number) {
    try {
      await this.findOnePosition(jabatanId);
      await this.prismaService.jabatan.delete({
        where: {
          id: jabatanId,
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
          'Jabatan Ini Tidak Dapat Dihapus Karena Masih Digunakan Ditempat Lain',
        );
      } else {
        throw error;
      }
    }
  }

  positionSelectCondition = {
    id: true,
    kode: true,
    nama: true,
    klasifikasi: true,
    createdAt: true,
  };

  async checkKodeMustUnique(kodeJabatan: string, jabatanId?: number) {
    const kode = await this.prismaService.jabatan.count({
      where: {
        id: {
          not: jabatanId || undefined,
        },
        kode: kodeJabatan,
      },
    });

    if (kode !== 0) {
      this.errorService.badRequest('Kode Sudah Digunakan');
    }
  }
}
