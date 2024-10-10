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
import { JabatanService } from './jabatan.service';
import { CreateJabatanDto } from './dto/create-jabatan.dto';
import { UpdateJabatanDto } from './dto/update-jabatan.dto';
import { Auth } from '../common/auth/auth.decorator';
import { Roles } from '../common/role/role.decorator';
import { Role } from '../common/role/role.enum';

@Controller('/api/jabatan')
export class JabatanController {
  constructor(private readonly jabatanService: JabatanService) {}

  @Auth()
  @Roles(Role.ADMIN)
  @Post()
  async createPosition(@Body() payload: CreateJabatanDto) {
    const result = await this.jabatanService.createPosition(payload);
    return {
      status: 'success',
      message: 'Jabatan Berhasil Dibuat',
      data: result,
    };
  }

  @Auth()
  @Roles(Role.ADMIN)
  @Get()
  findAll() {
    return this.jabatanService.findAll();
  }

  @Auth()
  @Roles(Role.ADMIN)
  @Get('/:jabatanId')
  async findOnePosition(@Param('jabatanId', ParseIntPipe) jabatanId: number) {
    const result = await this.jabatanService.findOnePosition(jabatanId);
    return {
      status: 'success',
      data: result,
    };
  }

  @Auth()
  @Roles(Role.ADMIN)
  @Put('/:jabatanId')
  async updatePosition(
    @Param('jabatanId') jabatanId: number,
    @Body() payload: UpdateJabatanDto,
  ) {
    const result = await this.jabatanService.updatePosition(jabatanId, payload);
    return {
      status: 'success',
      message: 'Jabatan Berhasil Diperbarui',
      data: result,
    };
  }

  @Auth()
  @Roles(Role.ADMIN)
  @Delete('/:jabatanId')
  async removePosition(@Param('jabatanId', ParseIntPipe) jabatanId: number) {
    await this.jabatanService.removePosition(jabatanId);
    return {
      status: 'success',
      message: 'Jabatan Berhasil Dihapus',
    };
  }
}
