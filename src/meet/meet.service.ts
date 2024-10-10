import { Injectable } from '@nestjs/common';
import { AddParticipantsDto, CreateMeetDto } from './dto/create-meet.dto';
import { UpdateMeetDto } from './dto/update-meet.dto';
import { MeetHelper } from './helper/meet.helper';
import { ErrorService } from '../common/error/error.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { v4 as uuid } from 'uuid';
import { ValidationService } from '../common/validation/validation.service';
import { IAuth } from '../common/model/web.model';
import { getHost } from '../common/utlis/utils';
import { FilesService } from '../files/files.service';
import { GetParticipantsQueryDto } from './dto/query.dto';
import { UpdateMeetingStatusDto } from './dto/param.dto';

@Injectable()
export class MeetService {
  constructor(
    private meetHelper: MeetHelper,
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

    if (dataRapat.tipe === 'offline') {
      //cek ruangan kosong
      await this.meetHelper.checkRuanganMustsExist(ruanganId);

      // cek ruangan sedang di gunakan atau tidak
      await this.meetHelper.checkConflictMeeting(
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
        ...(dataRapat.tipe === 'offline'
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
    const user: IAuth = request.user;
    const meeting = await this.prismaService.rapat.findUnique({
      where: {
        id: meetingId,
      },
      select: this.meetingSelectCondition,
    });

    if (!meeting) {
      this.errorService.notFound('Rapat Tidak Ditemukan');
    }

    if (user.role === 'pengurus') {
      if (user.unitKerjaId !== meeting.unitKerja.id) {
        this.errorService.forbidden(
          'Tidak Dapat Mengakses Rapat Dari Unit Kerja Lain',
        );
      }
    }

    if (user.role === 'user') {
      this.meetHelper.checkMeetingParticipant(meetingId, user.id);
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

    if (dataRapat.tipe === 'offline') {
      //cek ruangan kosong
      await this.meetHelper.checkRuanganMustsExist(ruanganId);

      // cek ruangan sedang di gunakan atau tidak
      await this.meetHelper.checkConflictMeeting(
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
        ...(dataRapat.tipe === 'offline'
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
          'Tidak Dapat Menghapus Rapat Dari Unit Kerja Lain',
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

  async addMeetingParticipants(
    request,
    meetingId: string,
    payload: AddParticipantsDto,
  ) {
    const meeting = await this.findOneMeeting(request, meetingId);

    this.meetHelper.checkDuplicateParticipantIdsPayload(payload.anggota);
    const participants = await this.meetHelper.checkParticipantsExist(
      request,
      payload.anggota,
    );
    await this.meetHelper.checkParticipantsAlreadyExistOnMeeting(
      meeting.id,
      payload.anggota,
    );

    await this.prismaService.anggota_Rapat.createMany({
      data: payload.anggota.map((userId) => ({
        rapatId: meeting.id,
        userId: userId,
      })),
    });

    return participants;
  }

  async findMeetingParticipants(
    request,
    meetingId,
    query?: GetParticipantsQueryDto,
  ) {
    await this.findOneMeeting(request, meetingId);

    const participants = await this.prismaService.anggota_Rapat.findMany({
      where: {
        rapatId: meetingId,
        user: {
          userData: {
            nama: {
              contains: query.name || undefined,
            },
          },
        },
      },
      take: query.size,
      skip: (query.page - 1) * query.size,
      select: {
        user: {
          select: this.meetHelper.participantsSelectCondition,
        },
      },
    });

    const total = participants.length;

    return {
      data: participants.map((participant) =>
        this.meetHelper.toParticipantsResponse(request, participant.user),
      ),
      paging: {
        size: query.size,
        currentPage: query.page,
        totalPage: Math.ceil(total / query.size),
      },
    };
  }

  async updateMeetingStatus(request, param: UpdateMeetingStatusDto) {
    const meeting = await this.findOneMeeting(request, param.meetingId);

    const currentTime = new Date();
    if (currentTime <= new Date(meeting.selesai)) {
      this.errorService.badRequest('Rapat Belum Selesai');
    }

    await this.prismaService.rapat.update({
      where: {
        id: meeting.id,
      },
      data: {
        status: param.status,
      },
    });
  }

  async meetingAttendance(
    request,
    meetingId: string,
    buktiAbsensi: Express.Multer.File,
  ) {
    const meeting = await this.findOneMeeting(request, meetingId);
    const currentTime = new Date();
    if (currentTime < new Date(meeting.mulai)) {
      this.errorService.badRequest('Tidak Bisa Absen, Rapat Belum Dimulai');
    }

    if (meeting.status === 'Selesai') {
      this.errorService.badRequest('Tidak Bisa Absen, Rapat Telah Selesai');
    }

    const oldAttendancePhoto = await this.meetHelper.getOldAttendancePhoto(
      meeting.id,
      request.user.id,
    );
    const participantsId = await this.meetHelper.getMeetingParticipantsId(
      meeting.id,
      request.user.id,
    );

    await this.prismaService.anggota_Rapat.update({
      where: {
        id: participantsId,
      },
      data: {
        kehadiran: true,
        buktiAbsensi: {
          upsert: {
            create: {
              nama: buktiAbsensi.filename,
              path: buktiAbsensi.path,
            },
            update: {
              nama: buktiAbsensi.filename,
              path: buktiAbsensi.path,
            },
          },
        },
      },
    });

    if (oldAttendancePhoto) {
      this.fileService.deleteFile(oldAttendancePhoto);
    }
  }
}
