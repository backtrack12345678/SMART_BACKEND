import { Injectable } from '@nestjs/common';
import { CreateMeetDto } from './dto/create-meet.dto';
import { UpdateMeetDto } from './dto/update-meet.dto';
// import { MeetHelper } from './helper/meet.helper';
import { ErrorService } from '../common/error/error.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { v4 as uuid } from 'uuid';
import { ValidationService } from '../common/validation/validation.service';
import { IAuth } from '../common/model/web.model';
import { getHost } from '../common/utlis/utils';
import { FilesService } from '../files/files.service';

@Injectable()
export class MeetService {
  constructor(
    // private MeetHelper: MeetHelper,
    private errorService: ErrorService,
    private prismaService: PrismaService,
    private validationService: ValidationService,
    private fileService: FilesService,
  ) {}

  async createMeeting(
    request,
    payload: CreateMeetDto,
    buktiSurat: Express.Multer.File,
  ) {
    const { ruanganId = null, link = '', ...dataRapat } = payload;
    const user: IAuth = request.user;

    this.validationService.timeDuration(payload.mulai, payload.selesai);
    await this.validationService.checkUnitKerjaMustExists(
      dataRapat.unitKerjaId,
    );

    if (user.role === 'pengurus') {
      // cek unitkerja id
      if (payload.unitKerjaId !== user.unitKerjaId) {
        this.errorService.forbidden(
          'Tidak Bisa Membuat Rapat Dari Unit Kerja Ini',
        );
      }
    }

    if (dataRapat.status === 'offline') {
      //cek ruangan kosong
      await this.checkRuanganMustsExist(ruanganId);

      // cek ruangan sedang di gunakan atau tidak
      await this.checkConflictMeeting(
        ruanganId,
        dataRapat.mulai,
        dataRapat.selesai,
      );
    }

    const meeting = await this.prismaService.rapat.create({
      data: {
        id: `rapat-${uuid().toString()}`,
        userId: 'user-48a24b97-b1c2-40f8-8289-d14486b70543',
        ...dataRapat,
        ...(dataRapat.status === 'offline'
          ? {
              rapatOffline: {
                create: {
                  ruanganId: ruanganId,
                },
              },
            }
          : {
              rapatOnline: {
                create: {
                  link: link,
                },
              },
            }),
        buktiSurat: {
          create: {
            nama: buktiSurat.filename,
            path: buktiSurat.path,
          },
        },
      },
      select: this.meetingSelectCondition,
    });

    return this.toMeetingResponse(request, meeting);
  }

  findAll() {
    return `This action returns all meet`;
  }

  async findOneMeeting(request, meetingId: string, type?: string) {
    const meeting = await this.prismaService.rapat.findUnique({
      where: {
        id: meetingId,
      },
      select: this.meetingSelectCondition,
    });

    if (!meeting) {
      this.errorService.notFound('Rapat Tidak Ditemukan');
    }

    return this.toMeetingResponse(request, meeting, type);
  }

  meetingSelectCondition = {
    id: true,
    nama: true,
    deskripsi: true,
    unitKerja: {
      select: {
        id: true,
        nama: true,
      },
    },
    status: true,
    surat: true,
    mulai: true,
    selesai: true,
    createdAt: true,
    buktiSurat: {
      select: {
        nama: true,
        path: true,
      },
    },
    rapatOffline: {
      include: {
        ruangan: true,
      },
    },
    rapatOnline: {
      select: {
        link: true,
      },
    },
  };

  toMeetingResponse(request, meeting, type?: string) {
    return {
      id: meeting.id,
      nama: meeting.nama,
      deskripsi: meeting.deskripsi,
      status: meeting.status,
      mulai: meeting.mulai,
      selesai: meeting.selesai,
      unitKerja: {
        id: meeting.unitKerja.id,
        nama: meeting.unitKerja.nama,
      },
      surat: {
        no: meeting.surat,
        bukti: `${getHost(request)}/api/files/surat/${meeting.buktiSurat.nama}`,
        ...(type === 'update' && {
          path: meeting.buktiSurat.path,
        }),
      },
      lokasi: {
        id: meeting.rapatOffline?.ruangan.id || null,
        nama: meeting.rapatOffline?.ruangan.nama || null,
        alamat: meeting.rapatOffline?.ruangan.nama || meeting.rapatOnline?.link,
      },
      createdAt: meeting.createdAt,
    };
  }

  async updateMeeting(
    request,
    meetingId: string,
    payload: UpdateMeetDto,
    buktiSurat?: Express.Multer.File,
  ) {
    const user: IAuth = request.user;
    const meeting = await this.findOneMeeting(request, meetingId, 'update');
    const { ruanganId = null, link = '', ...dataRapat } = payload;

    if (new Date() >= meeting.selesai) {
      this.errorService.forbidden(
        'Rapat TIdak Dapat Diperbarui Karena Telah Selesai',
      );
    }
    if (new Date() >= meeting.mulai) {
      this.errorService.forbidden(
        'Rapat TIdak Dapat Diperbarui Karena Sedang Berlangsung',
      );
    }

    if (user.role === 'operator') {
      if (user.unitKerjaId !== meeting.unitKerja.id) {
        this.errorService.forbidden(
          'Tidak Dapat Memperbarui Rapat Dari Unit Kerja Lain',
        );
      }

      if (user.unitKerjaId !== payload.unitKerjaId) {
        this.errorService.forbidden(
          'Tidak Dapat Memperbarui Rapat Menjadi Unit Kerja Ini',
        );
      }
    }

    if (dataRapat.status === 'offline') {
      //cek ruangan kosong
      await this.checkRuanganMustsExist(ruanganId);

      // cek ruangan sedang di gunakan atau tidak
      await this.checkConflictMeeting(
        ruanganId,
        dataRapat.mulai,
        dataRapat.selesai,
        meetingId,
      );
    }

    const updateMeeting = await this.prismaService.rapat.update({
      where: {
        id: meetingId,
      },
      data: {
        ...dataRapat,
        ...(dataRapat.status === 'offline'
          ? {
              rapatOffline: {
                update: {
                  ruanganId: ruanganId,
                },
              },
            }
          : {
              rapatOnline: {
                update: {
                  link: link,
                },
              },
            }),
        ...(buktiSurat && {
          buktiSurat: {
            update: {
              nama: buktiSurat.filename,
              path: buktiSurat.path,
            },
          },
        }),
      },
      select: this.meetingSelectCondition,
    });

    if (buktiSurat) {
      this.fileService.deleteFile(meeting.surat);
    }

    return this.toMeetingResponse(request, updateMeeting);
  }

  async removeMeeting(request, meetingId: string) {
    const user: IAuth = request.user;
    const meeting = await this.findOneMeeting(request, meetingId);

    if (user.role === 'operator') {
      if (user.unitKerjaId !== meeting.unitKerja.id) {
        this.errorService.forbidden(
          'Tidak Dapat Memperbarui Rapat Dari Unit Kerja Lain',
        );
      }
    }

    const deleteMeeting = await this.prismaService.rapat.delete({
      where: {
        id: meetingId,
      },
      select: {
        buktiSurat: {
          select: {
            path: true,
          },
        },
      },
    });

    this.fileService.deleteFile(deleteMeeting.buktiSurat);
  }

  async checkConflictMeeting(
    ruanganId: number,
    mulai: Date,
    selesai: Date,
    meetingId?: string,
  ) {
    const conflict = await this.prismaService.rapat_Offline.findFirst({
      where: {
        rapatId: { not: meetingId || undefined },
        ruanganId: ruanganId,
        rapat: {
          AND: [
            {
              mulai: { lte: selesai },
            },
            {
              selesai: { gte: mulai },
            },
          ],
        },
      },
    });

    if (conflict) {
      this.errorService.badRequest('Ruangan Ini Sedang Digunakan');
    }
  }

  async checkRuanganMustsExist(ruanganId: number) {
    const ruangan = await this.prismaService.ruangan_Rapat.findUnique({
      where: {
        id: ruanganId,
      },
      select: {
        id: true,
      },
    });

    if (!ruangan) {
      this.errorService.notFound('Ruangan Tidak Ditemukan');
    }
  }
}
