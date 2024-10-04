import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { SubUnitKerjaService } from './sub-unit-kerja.service';
import { CreateSubUnitKerjaDto } from './dto/create-sub-unit-kerja.dto';
import { UpdateSubUnitKerjaDto } from './dto/update-sub-unit-kerja.dto';
import { Role } from '../common/role/role.enum';
import { Auth } from '../common/auth/auth.decorator';
import { Roles } from '../common/role/role.decorator';

@Controller('/api/sub-unit-kerja')
export class SubUnitKerjaController {
  constructor(private readonly subUnitKerjaService: SubUnitKerjaService) {}

  @Auth()
  @Roles(Role.ADMIN)
  @Post()
  async createSubUnitKerja(@Body() payload: CreateSubUnitKerjaDto) {
    const result = await this.subUnitKerjaService.createSubUnitKerja(payload);
    return {
      status: 'success',
      message: 'Sub Unit Kerja Berhasil Dibuat',
      data: result,
    };
  }

  @Get()
  findAll() {
    return this.subUnitKerjaService.findAll();
  }

  @Auth()
  @Roles(Role.ADMIN)
  @Get('/:subUnitKerjaId')
  async findOneSubUnitKerja(
    @Param('subUnitKerjaId', ParseIntPipe) subUnitKerjaId: number,
  ) {
    const result =
      await this.subUnitKerjaService.findOneSubUnitKerja(subUnitKerjaId);
    return {
      status: 'success',
      data: result,
    };
  }

  @Auth()
  @Roles(Role.ADMIN)
  @Put('/:subUnitKerjaId')
  async updateSubUnitKerja(
    @Param('subUnitKerjaId', ParseIntPipe) subUnitKerjaId: number,
    @Body() payload: UpdateSubUnitKerjaDto,
  ) {
    const result = await this.subUnitKerjaService.updateSubUnitKerja(
      subUnitKerjaId,
      payload,
    );
    return {
      status: 'success',
      message: 'Sub Unit Kerja Berhasil Diperbarui',
      data: result,
    };
  }

  @Auth()
  @Roles(Role.ADMIN)
  @Delete('/:subUnitKerjaId')
  async removeSubUnitKerja(
    @Param('subUnitKerjaId', ParseIntPipe) subUnitKerjaId: number,
  ) {
    await this.subUnitKerjaService.removeSubUnitKerja(subUnitKerjaId);
    return {
      status: 'success',
      message: 'Sub Unit Kerja Berhasil Dihapus',
    };
  }
}
