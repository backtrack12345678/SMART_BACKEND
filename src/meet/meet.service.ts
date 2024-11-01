import { Injectable } from '@nestjs/common';
import {
  AddParticipantsDto,
  CreateMeetDto,
  CreateMeetingReportDto,
} from './dto/create-meet.dto';
import { UpdateMeetDto } from './dto/update-meet.dto';
import { MeetHelper } from './helper/meet.helper';
import { ErrorService } from '../common/error/error.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { v4 as uuid } from 'uuid';
import { ValidationService } from '../common/validation/validation.service';
import { IAuth } from '../common/model/web.model';
import { getHost } from '../common/utlis/utils';
import { FilesService } from '../files/files.service';
import {
  GetAllMeetingQueryDto,
  GetMeetingByUserQueryDto,
  GetParticipantsQueryDto,
} from './dto/query.dto';
import { UpdateMeetingStatusDto } from './dto/param.dto';
import { NotificationService } from '../common/notification/notification.service';

@Injectable()
export class MeetService {
  constructor(
    private meetHelper: MeetHelper,
    private errorService: ErrorService,
    private prismaService: PrismaService,
    private validationService: ValidationService,
    private fileService: FilesService,
    private notificationService: NotificationService,
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
        userId: user.id,
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

  async findAllMeeting(request, query: GetAllMeetingQueryDto) {
    const auth: IAuth = request.user;
    const meetings = await this.prismaService.rapat.findMany({
      where: {
        nama: {
          contains: query.name || undefined,
        },
        unitKerjaId: auth.role === 'pengurus' ? auth.unitKerjaId : undefined,
      },
      ...(query.size && {
        skip: (query.page - 1) * query.size,
        take: query.size,
      }),
      select: this.meetingSelectCondition,
    });

    const total = await this.prismaService.rapat.count({
      where: {
        nama: {
          contains: query.name || undefined,
        },
        unitKerjaId: auth.role === 'pengurus' ? auth.unitKerjaId : undefined,
      },
    });

    return {
      data: meetings.map((meeting) => this.toMeetingResponse(request, meeting)),
      paging: {
        size: query.size || total,
        currentPage: query.page,
        totalPage: query.size ? Math.ceil(total / query.size) : 1,
        totalItem: total,
      },
    };
  }

  async findAllMeetingByUser(request, query: GetMeetingByUserQueryDto) {
    if (query.date && query.month) {
      this.errorService.badRequest('Pilih Satu Antara date atau month');
    }

    const meetings = await this.prismaService.rapat.findMany({
      where: {
        nama: {
          contains: query.name || undefined,
        },
        ...(query.date && {
          mulai: {
            gte: new Date(query.date), // Rapat yang akan datang
          },
          status: 'Belum Dimulai',
        }),
        ...(query.month && {
          mulai: {
            gte: new Date(query.month + '-01'), // Awal bulan
            lt: new Date(
              new Date(query.month + '-01').setMonth(
                new Date(query.month + '-01').getMonth() + 1,
              ),
            ), // Awal bulan berikutnya
          },
          status: 'Selesai',
        }),
        tipe: query.tipe || undefined,
        anggota: {
          some: {
            userId: request.user.id,
          },
        },
      },
      take: query.size,
      ...(query.cursor && {
        skip: 1,
        cursor: {
          id: query.cursor,
        },
      }),
      select: {
        ...this.meetingSelectCondition,
      },
    });

    return meetings.map((meeting) => ({
      ...this.toMeetingResponse(request, meeting),
      kehadiran: meeting.anggota.some((anggota) => anggota.kehadiran)
        ? 'Hadir'
        : 'Tidak Hadir',
    }));
  }

  async findOneMeeting(request, meetingId: string, type?: string) {
    const user: IAuth = request.user;
    const meeting = await this.prismaService.rapat.findUnique({
      where: {
        id: meetingId,
      },
      select: {
        ...this.meetingSelectCondition,
      },
    });

    if (!meeting) {
      this.errorService.notFound('Rapat Tidak Ditemukan');
    }

    const presentParticipants = meeting.anggota.filter(
      (anggota) => anggota.kehadiran,
    ).length;
    const absentParticipants = meeting.anggota.filter(
      (anggota) => !anggota.kehadiran,
    ).length;
    const totalParticipants = presentParticipants + absentParticipants;

    if (user.role === 'pengurus') {
      if (user.unitKerjaId !== meeting.unitKerja.id) {
        this.errorService.forbidden(
          'Tidak Dapat Mengakses Rapat Dari Unit Kerja Lain',
        );
      }
    }

    if (user.role === 'user') {
      await this.meetHelper.checkMeetingParticipant(meetingId, user.id);
    }

    return {
      ...this.toMeetingResponse(request, meeting, type),
      jumlahPeserta: {
        hadir: presentParticipants,
        tidakHadir: absentParticipants,
        total: totalParticipants,
      },
    };
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
    tipe: true,
    surat: true,
    mulai: true,
    selesai: true,
    laporan: true,
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
    anggota: {
      select: {
        kehadiran: true,
      },
    },
  };

  toMeetingResponse(request, meeting, type?: string) {
    return {
      id: meeting.id,
      nama: meeting.nama,
      deskripsi: meeting.deskripsi,
      status: meeting.status,
      tipe: meeting.tipe,
      mulai: meeting.mulai,
      selesai: meeting.selesai,
      laporan: meeting.laporan,
      unitKerja: {
        id: meeting.unitKerja.id,
        nama: meeting.unitKerja.nama,
      },
      surat: {
        no: meeting.surat,
        bukti: `${getHost(request)}/api/files/surat/${meeting.buktiSurat?.nama}`,
        ...(type === 'update' && {
          path: meeting.buktiSurat?.path,
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

    let participantsNotifToken =
      await this.prismaService.refresh_Token.findMany({
        where: {
          userId: {
            in: payload.anggota,
          },
        },
        select: {
          notificationToken: true,
        },
      });
    const filteredToken =
      participantsNotifToken.length === 0
        ? []
        : participantsNotifToken
            .filter((item) => item.notificationToken !== null)
            .map((item) => item.notificationToken);

    if (filteredToken.length !== 0) {
      await this.notificationService.meeting(filteredToken, meeting);
    }

    return participants;
  }

  async findMeetingParticipants(
    request,
    meetingId,
    query?: GetParticipantsQueryDto,
  ) {
    if (query.page && query.cursor) {
      this.errorService.badRequest('Pilih Antara Page Atau Cursor');
    }
    await this.findOneMeeting(request, meetingId);
    const skipConditions = query.page
      ? (query.page - 1) * query.size
      : query.cursor
        ? 1
        : null;

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
      skip: skipConditions || undefined,
      ...(query.cursor && {
        cursor: {
          id: query.cursor,
        },
      }),
      select: {
        user: {
          select: this.meetHelper.participantsSelectCondition,
        },
        ...(request.user.role !== 'user' && {
          buktiAbsensi: {
            select: {
              nama: true,
            },
          },
          tandaTangan: {
            select: {
              nama: true,
            },
          },
        }),
      },
    });

    return {
      data: participants.map((participant) => {
        const absensi = {
          buktiAbsensi: participant.buktiAbsensi,
          tandaTangan: participant.tandaTangan,
        };
        return this.meetHelper.toParticipantsResponse(
          request,
          participant.user,
          absensi,
        );
      }),
      ...(query.page && {
        paging: {
          size: query.size,
          currentPage: query.page,
          totalPage: Math.ceil(participants.length / query.size),
        },
      }),
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
    files: {
      buktiAbsensi: Express.Multer.File[];
      tandaTangan: Express.Multer.File[];
    },
  ) {
    const meeting = await this.findOneMeeting(request, meetingId);
    const currentTime = new Date();
    if (currentTime < new Date(meeting.mulai)) {
      this.errorService.badRequest('Tidak Bisa Absen, Rapat Belum Dimulai');
    }

    if (meeting.status === 'Selesai') {
      this.errorService.badRequest('Tidak Bisa Absen, Rapat Telah Selesai');
    }

    const oldAttendanceFiles = await this.meetHelper.getOldAttendanceFiles(
      meeting.id,
      request.user.id,
    );
    const participantsId = await this.meetHelper.getMeetingParticipantsId(
      meeting.id,
      request.user.id,
    );

    const buktiAbsensi = {
      nama: files.buktiAbsensi[0].filename,
      path: files.buktiAbsensi[0].path,
    };

    const tandaTangan = {
      nama: files.tandaTangan[0].filename,
      path: files.tandaTangan[0].path,
    };

    await this.prismaService.anggota_Rapat.update({
      where: {
        id: participantsId,
      },
      data: {
        kehadiran: true,
        buktiAbsensi: {
          upsert: {
            create: buktiAbsensi,
            update: buktiAbsensi,
          },
        },
        tandaTangan: {
          upsert: {
            create: tandaTangan,
            update: tandaTangan,
          },
        },
      },
    });

    if (oldAttendanceFiles.buktiAbsensi) {
      this.fileService.deleteFile(oldAttendanceFiles.buktiAbsensi);
    }

    if (oldAttendanceFiles.tandaTangan) {
      this.fileService.deleteFile(oldAttendanceFiles.tandaTangan);
    }
  }

  async createMeetingReport(
    request,
    meetingId: string,
    payload: CreateMeetingReportDto,
  ) {
    const meeting = await this.findOneMeeting(request, meetingId);

    if (meeting.status !== 'Selesai') {
      this.errorService.badRequest(
        'Tidak Bisa Membuat Laporan, Rapat Belum Selesai',
      );
    }

    const meetingReport = await this.prismaService.rapat.update({
      where: {
        id: meetingId,
      },
      data: {
        laporan: payload.notulensi,
      },
      select: {
        laporan: true,
      },
    });

    return meetingReport;
  }
}
