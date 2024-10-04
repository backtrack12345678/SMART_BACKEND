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

@Controller('/api/jabatan')
export class JabatanController {
  constructor(private readonly jabatanService: JabatanService) {}

  @Post()
  async createPosition(@Body() payload: CreateJabatanDto) {
    const result = await this.jabatanService.createPosition(payload);
    return {
      status: 'success',
      message: 'Jabatan Berhasil Dibuat',
      data: result,
    };
  }

  @Get()
  findAll() {
    return this.jabatanService.findAll();
  }

  @Get('/:jabatanId')
  async findOnePosition(@Param('jabatanId', ParseIntPipe) jabatanId: number) {
    const result = await this.jabatanService.findOnePosition(jabatanId);
    return {
      status: 'success',
      data: result,
    };
  }

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

  @Delete('/:jabatanId')
  async removePosition(@Param('jabatanId', ParseIntPipe) jabatanId: number) {
    await this.jabatanService.removePosition(jabatanId);
    return {
      status: 'success',
      message: 'Jabatan Berhasil Dihapus',
    };
  }
}
