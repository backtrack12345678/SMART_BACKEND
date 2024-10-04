import { Module } from '@nestjs/common';
import { UnitKerjaService } from './unit-kerja.service';
import { UnitKerjaController } from './unit-kerja.controller';

@Module({
  controllers: [UnitKerjaController],
  providers: [UnitKerjaService],
  exports: [UnitKerjaService],
})
export class UnitKerjaModule {}
