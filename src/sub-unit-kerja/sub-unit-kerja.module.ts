import { Module } from '@nestjs/common';
import { SubUnitKerjaService } from './sub-unit-kerja.service';
import { SubUnitKerjaController } from './sub-unit-kerja.controller';
import { UnitKerjaModule } from '../unit-kerja/unit-kerja.module';

@Module({
  imports: [UnitKerjaModule],
  controllers: [SubUnitKerjaController],
  providers: [SubUnitKerjaService],
})
export class SubUnitKerjaModule {}
