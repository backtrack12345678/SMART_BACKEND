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
import { MeetingRoomService } from './meeting-room.service';
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto';
import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto';

@Controller('/api/meeting-room')
export class MeetingRoomController {
  constructor(private readonly meetingRoomService: MeetingRoomService) {}

  @Post()
  async createRoom(@Body() payload: CreateMeetingRoomDto) {
    const result = await this.meetingRoomService.createRoom(payload);
    return {
      status: 'success',
      message: 'Ruangan Rapat Berhasil Dibuat',
      data: result,
    };
  }

  @Get()
  findAll() {
    return this.meetingRoomService.findAll();
  }

  @Get('/:roomId')
  async findOneRoom(@Param('roomId', ParseIntPipe) roomId: number) {
    const result = await this.meetingRoomService.findOneRoom(roomId);
    return {
      status: 'success',
      data: result,
    };
  }

  @Put('/:roomId')
  async updateRoom(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Body() payload: UpdateMeetingRoomDto,
  ) {
    const result = await this.meetingRoomService.updateRoom(roomId, payload);
    return {
      status: 'success',
      message: 'Ruangan Rapat Berhasil Diperbarui',
      data: result,
    };
  }

  @Delete('/:roomId')
  async removeRoom(@Param('roomId', ParseIntPipe) roomId: number) {
    await this.meetingRoomService.removeRoom(roomId);
    return {
      status: 'success',
      message: 'Ruangan Rapat Berhasil DiHapus',
    };
  }
}
