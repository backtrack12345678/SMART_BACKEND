import { Injectable } from '@nestjs/common';
import { ErrorService } from '../../common/error/error.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { getHost } from '../../common/utlis/utils';

@Injectable()
export class MeetHelper {
  constructor(
    private errorService: ErrorService,
    private prismaService: PrismaService,
  ) {}

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

  async checkMeetingParticipant(meetingId: string, userId: string) {
    const participant = await this.prismaService.anggota_Rapat.findFirst({
      where: {
        rapatId: meetingId,
        userId: userId,
      },
      select: {
        id: true,
      },
    });

    if (!participant) {
      this.errorService.forbidden(
        'Tidak Dapat Mengakses Rapat Karena Bukan Peserta',
      );
    }
  }

  async checkParticipantsExist(request, userIds: string[]) {
    const users = await this.prismaService.user.findMany({
      where: {
        id: {
          in: userIds,
        },
        role: 'user',
      },
      select: this.participantsSelectCondition,
    });

    if (users.length === 0) {
      this.errorService.notFound('Pengguna Tidak Ditemukan');
    }

    const existingUserIds = users.map((user) => user.id);
    const notFoundUserIds = userIds.filter(
      (userId) => !existingUserIds.includes(userId),
    );

    if (notFoundUserIds.length > 0) {
      this.errorService.notFound(
        `Pengguna Dengan ID Berikut Tidak Ditemukan: ${notFoundUserIds.join(', ')}`,
      );
    }

    return users.map((user) => this.toParticipantsResponse(request, user));
  }

  checkDuplicateParticipantIdsPayload(userIds: string[]) {
    const seen = new Set<string>();
    const duplicates: string[] = [];

    for (const userId of userIds) {
      if (seen.has(userId)) {
        duplicates.push(userId); // Tambahkan ID yang duplikat ke array
      } else {
        seen.add(userId); // Tambahkan ID ke set jika belum ada
      }
    }

    if (duplicates.length > 0) {
      this.errorService.badRequest(
        `Terdapat ID Pengguna Yang Duplikat Dalam Payload: ${duplicates.join(', ')}`,
      );
    }
  }

  async checkParticipantsAlreadyExistOnMeeting(
    meetingId: string,
    userIds: string[],
  ) {
    const participants = await this.prismaService.anggota_Rapat.findMany({
      where: {
        rapatId: meetingId,
        userId: {
          in: userIds,
        },
      },
      select: {
        userId: true,
      },
    });

    const participantUserIds = participants.map(
      (participant) => participant.userId,
    );

    if (participantUserIds.length > 0) {
      this.errorService.badRequest(
        `Pengguna Dengan ID Berikut Sudah Terdaftar Dalam Rapat: ${participantUserIds.join(', ')}`,
      );
    }
  }

  async getOldAttendanceFiles(meetingId: string, userId: string) {
    const oldFiles = await this.prismaService.anggota_Rapat.findFirst({
      where: {
        rapatId: meetingId,
        userId: userId,
      },
      select: {
        buktiAbsensi: {
          select: {
            path: true,
          },
        },
        tandaTangan: {
          select: {
            path: true,
          },
        },
      },
    });

    return oldFiles;
  }

  async getMeetingParticipantsId(meetingId: string, userId: string) {
    const participant = await this.prismaService.anggota_Rapat.findFirst({
      where: {
        rapatId: meetingId,
        userId: userId,
      },
      select: {
        id: true,
      },
    });

    if (!participant) {
      this.errorService.notFound('Peserta Rapat Tidak Ditemukan');
    }

    return participant.id;
  }

  participantsSelectCondition = {
    id: true,
    userData: {
      select: {
        nama: true,
        nip: true,
        photo: true,
        jabatan: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
    },
    anggotaRapat: {
      select: {
        kehadiran: true,
      },
    },
  };

  toParticipantsResponse(request, participant) {
    return {
      id: participant.user.id,
      nama: participant.user.userData.nama,
      nip: participant.user.userData.nip,
      kehadiran:
        participant.user.anggotaRapat.length > 0 &&
        participant.user.anggotaRapat.some((anggota) => anggota.kehadiran)
          ? 'Hadir'
          : 'Tidak Hadir',
      jabatan: {
        id: participant.user.userData.jabatan?.id,
        nama: participant.user.userData.jabatan?.nama,
      },
      photo: `${getHost(request)}/api/files/user/${participant.user.userData.photo}`,
      ...(request.user.role !== 'user' && {
        buktiAbsensi: `${getHost(request)}/api/files/absensi/${participant.buktiAbsensi.nama}`,
        tandaTangan: `${getHost(request)}/api/files/absensi/${participant.tandaTangan.nama}`,
      }),
    };
  }
}
