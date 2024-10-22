import { Controller, Get, Param, Res } from '@nestjs/common';
import { FilesService } from './files.service';
import { Response } from 'express';

@Controller('/api/files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  // @Get('/user/:filename')
  // getUserPhoto(
  //   @Param('filename') filename: string,
  //   @Res() response: Response,
  // ) {

  // }
}
