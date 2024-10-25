import { Injectable, NotFoundException } from '@nestjs/common';
import { join } from 'path';
import * as fs from 'fs';
import { ErrorService } from '../common/error/error.service';
import { fromFile } from 'file-type';

@Injectable()
export class FilesService {
  constructor(private errorService: ErrorService) {}

  async serveFile(filename: string, folder: string) {
    const filePath = join(process.cwd(), `uploads/${folder}/${filename}`);

    if (!fs.existsSync(filePath)) {
      this.errorService.notFound('File Tidak Ditemukan');
    }

    if (['bukti-absensi', 'tanda-tangan'].includes(filename)) {
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
}
