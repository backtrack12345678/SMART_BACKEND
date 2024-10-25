import { Controller, Get, Param, Res } from '@nestjs/common';
import { FilesService } from './files.service';
import { Response } from 'express';
import { Auth } from '../common/auth/auth.decorator';

@Controller('/api/files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Auth()
  @Get('/user/:filename')
  async getUserPhoto(
    @Param('filename') filename: string,
    @Res() response: Response,
  ) {
    const { fileStream, mime } = await this.filesService.serveFile(
      filename,
      'user',
    );
    response.setHeader('Content-Type', mime);
    fileStream.pipe(response);
  }

  @Auth()
  @Get('/bukti-absensi/:filename')
  async getUserAttendanceProof(
    @Param('filename') filename: string,
    @Res() response: Response,
  ) {
    const { fileStream, mime } = await this.filesService.serveFile(
      filename,
      'bukti-absensi',
    );
    response.setHeader('Content-Type', mime);
    fileStream.pipe(response);
  }

  @Auth()
  @Get('/tanda-tangan/:filename')
  async getUserSignature(
    @Param('filename') filename: string,
    @Res() response: Response,
  ) {
    const { fileStream, mime } = await this.filesService.serveFile(
      filename,
      'tanda-tangan',
    );
    response.setHeader('Content-Type', mime);
    fileStream.pipe(response);
  }
}
