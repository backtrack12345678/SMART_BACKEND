import { Injectable } from '@nestjs/common';
import { CreateSubUnitKerjaDto } from './dto/create-sub-unit-kerja.dto';
import { UpdateSubUnitKerjaDto } from './dto/update-sub-unit-kerja.dto';
import { PrismaService } from '../common/prisma/prisma.service';
import { ErrorService } from '../common/error/error.service';
import { UnitKerjaService } from '../unit-kerja/unit-kerja.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { GetSubUnitKerjaQueryDto } from './dto/query.dto';

@Injectable()
export class SubUnitKerjaService {
  constructor(
    private prismaService: PrismaService,
    private errorService: ErrorService,
    private unitKerjaService: UnitKerjaService,
  ) { }
  async createSubUnitKerja(payload: CreateSubUnitKerjaDto) {
    await this.unitKerjaService.findOneUnitKerja(payload.unitKerjaId);
    await this.checkKodeMustUnique(payload.kode);

    const subUnitKerja = await this.prismaService.sub_Unit_Kerja.create({
      data: payload,
      select: this.subUnitKerjaSelectCondition,
    });

    return subUnitKerja;
  }

  async findAllSubUnitKerja(query: GetSubUnitKerjaQueryDto) {
    const subUnitKerja = await this.prismaService.sub_Unit_Kerja.findMany({
      where: {
        nama: {
          contains: query.name || undefined,
        },
      },
      skip: (query.page - 1) * query.size,
      take: query.size,
      select: this.subUnitKerjaSelectCondition,
    });

    return {
      data: subUnitKerja.map((suk) => suk),
      paging: {
        size: query.size,
        currentPage: query.page,
        totalPage: Math.ceil(subUnitKerja.length / query.size),
      },
    };
  }

  async findOneSubUnitKerja(subUnitKerjaId: number) {
    const subUnitKerja = await this.prismaService.sub_Unit_Kerja.findUnique({
      where: {
        id: subUnitKerjaId,
      },
      select: this.subUnitKerjaSelectCondition,
    });

    if (!subUnitKerja) {
      this.errorService.notFound('Sub Unit Kerja Tidak Ditemukan');
    }

    return subUnitKerja;
  }

  async updateSubUnitKerja(
    subUnitKerjaId: number,
    payload: UpdateSubUnitKerjaDto,
  ) {
    await this.findOneSubUnitKerja(subUnitKerjaId);
    await this.unitKerjaService.findOneUnitKerja(payload.unitKerjaId);
    await this.checkKodeMustUnique(payload.kode, subUnitKerjaId);

    const subUnitKerja = await this.prismaService.sub_Unit_Kerja.update({
      where: {
        id: subUnitKerjaId,
      },
      data: payload,
      select: this.subUnitKerjaSelectCondition,
    });

    return subUnitKerja;
  }

  async removeSubUnitKerja(subUnitKerjaId: number) {
    try {
      await this.findOneSubUnitKerja(subUnitKerjaId);
      await this.prismaService.sub_Unit_Kerja.delete({
        where: {
          id: subUnitKerjaId,
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
          'Sub Unit Kerja Ini Tidak Dapat Dihapus Karena Masih Digunakan Ditempat Lain',
        );
      } else {
        throw error;
      }
    }
  }

  subUnitKerjaSelectCondition = {
    id: true,
    kode: true,
    nama: true,
    unitKerja: {
      select: this.unitKerjaService.unitKerjaSelectCondition,
    },
  };

  async checkKodeMustUnique(kodeSubUnitKerja: string, subUnitKerjaId?: number) {
    const kode = await this.prismaService.sub_Unit_Kerja.count({
      where: {
        id: {
          not: subUnitKerjaId || undefined,
        },
        kode: kodeSubUnitKerja,
      },
    });

    if (kode !== 0) {
      this.errorService.badRequest('Kode Sudah Digunakan');
    }
  }
}
