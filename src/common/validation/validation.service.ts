import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ErrorService } from '../error/error.service';

@Injectable()
export class ValidationService {
  constructor(
    private prismaService: PrismaService,
    private errorService: ErrorService,
  ) {}

  async checkUnitKerjaMustExists(unitKerjaId: number) {
    const count = await this.prismaService.unit_Kerja.count({
      where: {
        id: unitKerjaId,
      },
    });

    if (count === 0) {
      this.errorService.notFound('Unit Kerja Tidak Ditemukan');
    }
  }

  timeDuration(mulai: Date, selesai: Date) {
    if (selesai <= mulai) {
      this.errorService.badRequest('Selesai Harus Lebih Besar Dari Mulai');
    }
  }
}
