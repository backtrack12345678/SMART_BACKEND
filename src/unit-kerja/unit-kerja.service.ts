import { Injectable } from '@nestjs/common';
import { CreateUnitKerjaDto } from './dto/create-unit-kerja.dto';
import { UpdateUnitKerjaDto } from './dto/update-unit-kerja.dto';
import { PrismaService } from '../common/prisma/prisma.service';
import { ErrorService } from '../common/error/error.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { GetUnitKerjaQueryDto } from './dto/query.dto';

@Injectable()
export class UnitKerjaService {
  constructor(
    private prismaService: PrismaService,
    private errorService: ErrorService,
  ) {}

  async createUnitKerja(payload: CreateUnitKerjaDto) {
    await this.checkKodeMustUnique(payload.kode);

    const unitKerja = await this.prismaService.unit_Kerja.create({
      data: {
        ...payload,
      },
      select: this.unitKerjaSelectCondition,
    });

    return unitKerja;
  }

  async findAllUnitKerja(query: GetUnitKerjaQueryDto) {
    const unitKerja = await this.prismaService.unit_Kerja.findMany({
      where: {
        nama: {
          contains: query.name || undefined,
        },
      },
      ...(query.size && {
        skip: (query.page - 1) * query.size,
        take: query.size || undefined,
      }),
      select: this.unitKerjaSelectCondition,
    });

    const total = await this.prismaService.unit_Kerja.count({
      where: {
        nama: {
          contains: query.name || undefined,
        },
      },
    });

    return {
      data: unitKerja.map((uk) => uk),
      paging: {
        size: query.size || total,
        currentPage: query.page,
        totalPage: query.size ? Math.ceil(total / query.size) : 1,
        totalItem: total,
      },
    };
  }

  async findOneUnitKerja(unitKerjaId: number) {
    const unitKerja = await this.prismaService.unit_Kerja.findUnique({
      where: {
        id: unitKerjaId,
      },
      select: this.unitKerjaSelectCondition,
    });

    if (!unitKerja) {
      this.errorService.notFound('Unit Kerja Tidak Ditemukan');
    }

    return unitKerja;
  }

  async updateUnitKerja(unitKerjaId: number, payload: UpdateUnitKerjaDto) {
    await this.findOneUnitKerja(unitKerjaId);
    await this.checkKodeMustUnique(payload.kode, unitKerjaId);

    const unitKerja = await this.prismaService.unit_Kerja.update({
      where: {
        id: unitKerjaId,
      },
      data: {
        ...payload,
      },
      select: this.unitKerjaSelectCondition,
    });

    return unitKerja;
  }

  async removeUnitKerja(unitKerjaId: number) {
    try {
      await this.findOneUnitKerja(unitKerjaId);
      await this.prismaService.unit_Kerja.delete({
        where: {
          id: unitKerjaId,
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
          'Unit Kerja Ini Tidak Dapat Dihapus Karena Masih Digunakan Ditempat Lain',
        );
      } else {
        throw error;
      }
    }
  }

  unitKerjaSelectCondition = {
    id: true,
    kode: true,
    nama: true,
    createdAt: true,
  };

  async checkKodeMustUnique(kodeUnitKerja: string, unitKerjaId?: number) {
    const kode = await this.prismaService.unit_Kerja.count({
      where: {
        id: {
          not: unitKerjaId || undefined,
        },
        kode: kodeUnitKerja,
      },
    });

    if (kode !== 0) {
      this.errorService.badRequest('Kode Sudah Digunakan');
    }
  }
}
