import { Injectable } from '@nestjs/common';
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto';
import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto';
import { PrismaService } from '../common/prisma/prisma.service';
import { ErrorService } from '../common/error/error.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class MeetingRoomService {
  constructor(
    private prismaService: PrismaService,
    private errorService: ErrorService,
  ) {}

  async createRoom(payload: CreateMeetingRoomDto) {
    const room = await this.prismaService.ruangan_Rapat.create({
      data: {
        ...payload,
      },
      select: this.meetingRoomSelectCondtion,
    });

    return room;
  }

  findAll() {
    return `This action returns all meetingRoom`;
  }

  async findOneRoom(roomId: number) {
    const room = await this.prismaService.ruangan_Rapat.findUnique({
      where: {
        id: roomId,
      },
      select: this.meetingRoomSelectCondtion,
    });

    if (!room) {
      this.errorService.notFound('Ruangan Rapat Tidak Ditemukan');
    }

    return room;
  }

  async updateRoom(roomId: number, payload: UpdateMeetingRoomDto) {
    await this.findOneRoom(roomId);

    const room = await this.prismaService.ruangan_Rapat.update({
      where: {
        id: roomId,
      },
      data: {
        ...payload,
      },
      select: this.meetingRoomSelectCondtion,
    });

    return room;
  }

  async removeRoom(roomId: number) {
    try {
      await this.findOneRoom(roomId);
      await this.prismaService.ruangan_Rapat.delete({
        where: {
          id: roomId,
        },
        select: {
          id: true,
        },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        this.errorService.badRequest(
          'Ruangan Rapat Ini Tidak Dapat Dihapus Karena Masih Digunakan Ditempat Lain',
        );
      } else {
        throw error;
      }
    }
  }

  meetingRoomSelectCondtion = {
    id: true,
    nama: true,
    kampus: true,
    createdAt: true,
  };
}
