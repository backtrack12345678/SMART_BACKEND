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
import { MeetingRoomService } from './meeting-room.service';
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto';
import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto';
import { Auth } from '../common/auth/auth.decorator';
import { Roles } from '../common/role/role.decorator';
import { Role } from '../common/role/role.enum';
import { GetMeetingRoomQueryDto } from './dto/query.dto';

@Controller('/api/meeting-room')
export class MeetingRoomController {
  constructor(private readonly meetingRoomService: MeetingRoomService) { }

  @Auth()
  @Roles(Role.ADMIN)
  @Post()
  async createRoom(@Body() payload: CreateMeetingRoomDto) {
    const result = await this.meetingRoomService.createRoom(payload);
    return {
      status: 'success',
      message: 'Ruangan Rapat Berhasil Dibuat',
      data: result,
    };
  }

  @Auth()
  @Roles(Role.ADMIN, Role.OPERATOR)
  @Get()
  async findAllMeetingRooms(
    @Query() query: GetMeetingRoomQueryDto
  ) {
    const result = await this.meetingRoomService.findAllMeetingRooms(query);
    return {
      status: 'success',
      paging: result.paging,
      data: result.data,
    };
  }

  @Auth()
  @Roles(Role.ADMIN)
  @Get('/:roomId')
  async findOneRoom(@Param('roomId', ParseIntPipe) roomId: number) {
    const result = await this.meetingRoomService.findOneRoom(roomId);
    return {
      status: 'success',
      data: result,
    };
  }

  @Auth()
  @Roles(Role.ADMIN)
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

  @Auth()
  @Roles(Role.ADMIN)
  @Delete('/:roomId')
  async removeRoom(@Param('roomId', ParseIntPipe) roomId: number) {
    await this.meetingRoomService.removeRoom(roomId);
    return {
      status: 'success',
      message: 'Ruangan Rapat Berhasil DiHapus',
    };
  }
}
