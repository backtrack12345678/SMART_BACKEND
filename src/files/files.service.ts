import { Injectable, NotFoundException } from '@nestjs/common';
import { join } from 'path';
import * as fs from 'fs';
import { ErrorService } from '../common/error/error.service';
import { fromFile } from 'file-type';
import { PrismaService } from '../common/prisma/prisma.service';
import { IAuth } from '../common/model/web.model';

@Injectable()
export class FilesService {
  constructor(
    private errorService: ErrorService,
    private prismaService: PrismaService,
  ) {}

  async serveFile(filename: string, folder: string, auth?: IAuth) {
    const filePath = join(process.cwd(), `uploads/${folder}/${filename}`);

    if (!fs.existsSync(filePath)) {
      this.errorService.notFound('File Tidak Ditemukan');
    }

    if (['bukti-absensi', 'tanda-tangan'].includes(folder)) {
      await this.checkMeetingAttendanceFilesAccess(auth, filename, folder);
    }

    if (folder === 'surat') {
      await this.checkMeetingDocumentFileAccess(auth, filename);
    }

    if (folder === 'dokumentasi') {
      await this.checkMeetingDocumentationsFileAccess(auth, filename);
    }

    const { mime } = await fromFile(filePath);
    const fileStream = fs.createReadStream(filePath);
    return { fileStream, mime };
  }

  deleteFile(file: Express.Multer.File | { path: string }): void {
    if (fs.existsSync(file.path)) {
      fs.unlink(file.path, (err) => {
        if (err) {
          console.error(`Failed to delete file: ${file.path}`, err);
        }
      });
    } else {
      console.error(`File not found: ${file.path}`);
    }
  }

  deleteFiles(
    files:
      | Express.Multer.File[]
      | { [fieldname: string]: Express.Multer.File[] }
      | { path: string }[]
      | any,
  ): void {
    if (Array.isArray(files)) {
      const filePaths = files.map((file) =>
        typeof file === 'object' ? file.path : file,
      );
      filePaths.forEach((filePath) => {
        if (fs.existsSync(filePath)) {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(`Failed to delete file: ${filePath}`, err);
            }
          });
        } else {
          console.error(`File not found: ${filePath}`);
        }
      });
    } else if (typeof files === 'object') {
      for (const fieldname in files) {
        const fieldFiles = files[fieldname];

        fieldFiles.forEach((file) => {
          if (fs.existsSync(file.path)) {
            fs.unlink(file.path, (err) => {
              if (err) {
                console.error(`Failed to delete file: ${file.path}`, err);
              }
            });
          } else {
            console.error(`File not found: ${file.path}`);
          }
        });
      }
    } else {
      console.error('Invalid file input');
    }
  }

  async checkMeetingAttendanceFilesAccess(
    auth: IAuth,
    filename: string,
    type: string,
  ) {
    let meetingAttendance;
    const message = {
      'bukti-absensi': 'Bukti Absensi',
      'tanda-tangan': 'Tanda Tangan',
    };

    if (type === 'bukti-absensi') {
      meetingAttendance =
        await this.prismaService.bukti_Absensi_Rapat.findFirst({
          where: {
            nama: filename,
          },
          select: this.meetingAttendanceSelectCondition,
        });
    }

    if (type === 'tanda-tangan') {
      meetingAttendance = await this.prismaService.tanda_Tangan_Rapat.findFirst(
        {
          where: {
            nama: filename,
          },
          select: this.meetingAttendanceSelectCondition,
        },
      );
    }

    if (auth.role === 'user') {
      if (auth.id !== meetingAttendance.anggotaRapat.userId) {
        this.errorService.forbidden(
          `Tidak Dapat Melihat ${message[type]} Milik Peserta Lain`,
        );
      }
    }

    if (auth.role === 'operator') {
      if (
        auth.unitKerjaId !== meetingAttendance.anggotRapat.rapat.unitKerjaId
      ) {
        this.errorService.forbidden(
          `Tidak Dapat Melihat Dari ${message[type]} Unit Kerja Lain`,
        );
      }
    }
  }

  meetingAttendanceSelectCondition = {
    anggotaRapat: {
      select: {
        userId: true,
        rapat: {
          select: {
            unitKerjaId: true,
          },
        },
      },
    },
  };

  async checkMeetingDocumentFileAccess(auth: IAuth, filename: string) {
    const document = await this.prismaService.bukti_Surat_Rapat.findFirst({
      where: {
        nama: filename,
        rapat: {
          ...(auth.role === 'user' && {
            anggota: {
              some: {
                userId: auth.id || undefined,
              },
            },
          }),
          ...(auth.role === 'operator' && {
            unitKerjaId:
              auth.role === 'operator' ? auth.unitKerjaId : undefined,
          }),
        },
      },
    });

    if (!document) {
      const message = {
        user: 'Karena Bukan Peserta',
        operator: 'Dari Unit Kerja Lain',
      };
      this.errorService.forbidden(
        `Tidak Dapat Melihat Dokumen Rapat ${message[auth.role]}`,
      );
    }
  }

  async checkMeetingDocumentationsFileAccess(auth: IAuth, filename: string) {
    const documentation = await this.prismaService.dokumentasi_Rapat.findFirst({
      where: {
        nama: filename,
        rapat: {
          ...(auth.role === 'user' && {
            anggota: {
              some: {
                userId: auth.id || undefined,
              },
            },
          }),
          ...(auth.role === 'operator' && {
            unitKerjaId:
              auth.role === 'operator' ? auth.unitKerjaId : undefined,
          }),
        },
      },
    });

    if (!documentation) {
      const message = {
        user: 'Karena Bukan Peserta',
        operator: 'Dari Unit Kerja Lain',
      };
      this.errorService.forbidden(
        `Tidak Dapat Melihat Dokumentasi Rapat ${message[auth.role]}`,
      );
    }
  }
}
