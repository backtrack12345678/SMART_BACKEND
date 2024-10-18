import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  Put,
  Query,
} from '@nestjs/common';
import { UnitKerjaService } from './unit-kerja.service';
import { CreateUnitKerjaDto } from './dto/create-unit-kerja.dto';
import { UpdateUnitKerjaDto } from './dto/update-unit-kerja.dto';
import { Auth } from '../common/auth/auth.decorator';
import { Roles } from '../common/role/role.decorator';
import { Role } from '../common/role/role.enum';
import { GetUnitKerjaQueryDto } from './dto/query.dto';

@Controller('/api/unit-kerja')
export class UnitKerjaController {
  constructor(private readonly unitKerjaService: UnitKerjaService) { }

  @Auth()
  @Roles(Role.ADMIN)
  @Post()
  async createUnitKerja(@Body() payload: CreateUnitKerjaDto) {
    const result = await this.unitKerjaService.createUnitKerja(payload);
    return {
      status: 'success',
      message: 'Unit Kerja Berhasil Dibuat',
      data: result,
    };
  }

  @Auth()
  @Roles(Role.ADMIN, Role.OPERATOR)
  @Get()
  async findAllUnitKerja(
    @Query() query: GetUnitKerjaQueryDto,
  ) {
    const result = await this.unitKerjaService.findAllUnitKerja(query);
    return {
      status: 'success',
      paging: result.paging,
      data: result.data,
    };
  }

  @Auth()
  @Roles(Role.ADMIN)
  @Get('/:unitKerjaId')
  async findOneUnitKerja(
    @Param('unitKerjaId', ParseIntPipe) unitKerjaId: number,
  ) {
    const result = await this.unitKerjaService.findOneUnitKerja(unitKerjaId);
    return {
      status: 'success',
      data: result,
    };
  }

  @Auth()
  @Roles(Role.ADMIN)
  @Put('/:unitKerjaId')
  async updateUnitKerja(
    @Param('unitKerjaId', ParseIntPipe) unitKerjaId: number,
    @Body() payload: UpdateUnitKerjaDto,
  ) {
    const result = await this.unitKerjaService.updateUnitKerja(
      unitKerjaId,
      payload,
    );
    return {
      status: 'success',
      message: 'Unit Kerja Berhasil Diperbarui',
      data: result,
    };
  }

  @Auth()
  @Roles(Role.ADMIN)
  @Delete('/:unitKerjaId')
  async removeUnitKerja(
    @Param('unitKerjaId', ParseIntPipe) unitKerjaId: number,
  ) {
    await this.unitKerjaService.removeUnitKerja(unitKerjaId);
    return {
      status: 'success',
      message: 'Unit Kerja Berhasil Dihapus',
    };
  }
}
