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
import { GolonganService } from './golongan.service';
import { CreateGolonganDto } from './dto/create-golongan.dto';
import { UpdateGolonganDto } from './dto/update-golongan.dto';
import { Auth } from '../common/auth/auth.decorator';
import { Roles } from '../common/role/role.decorator';
import { Role } from '../common/role/role.enum';
import { GetGolonganQueryDto } from './dto/query.dto';

@Controller('/api/golongan')
export class GolonganController {
  constructor(private readonly golonganService: GolonganService) { }

  @Auth()
  @Roles(Role.ADMIN)
  @Post()
  async createGroup(@Body() payload: CreateGolonganDto) {
    const result = await this.golonganService.createGroup(payload);
    return {
      status: 'success',
      message: 'Golongan Berhasil Dibuat',
      data: result,
    };
  }

  @Auth()
  @Roles(Role.ADMIN, Role.OPERATOR)
  @Get()
  async findAllGroups(
    @Query() query: GetGolonganQueryDto
  ) {
    const result = await this.golonganService.findAllGroups(query);
    return {
      status: 'success',
      paging: result.paging,
      data: result.data,
    };
  }

  @Auth()
  @Roles(Role.ADMIN)
  @Get('/:golonganId')
  async findOneGroup(@Param('golonganId', ParseIntPipe) golonganId: number) {
    const result = await this.golonganService.findOneGroup(golonganId);
    return {
      status: 'success',
      data: result,
    };
  }

  @Auth()
  @Roles(Role.ADMIN)
  @Put('/:golonganId')
  async updateGolongan(
    @Param('golonganId', ParseIntPipe) golonganId: number,
    @Body() payload: UpdateGolonganDto,
  ) {
    const result = await this.golonganService.updateGroup(golonganId, payload);
    return {
      status: 'success',
      message: 'Golongan Berhasil Diperbarui',
      data: result,
    };
  }

  @Auth()
  @Roles(Role.ADMIN)
  @Delete('/:golonganId')
  async removeGroup(@Param('golonganId', ParseIntPipe) golonganId: number) {
    await this.golonganService.removeGroup(golonganId);
    return {
      status: 'success',
      message: 'Golongan Berhasil Dihapus',
    };
  }
}
