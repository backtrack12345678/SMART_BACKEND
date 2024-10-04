import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
  Put,
} from '@nestjs/common';
import { MeetService } from './meet.service';
import { CreateMeetDto } from './dto/create-meet.dto';
import { UpdateMeetDto } from './dto/update-meet.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileTypeValidator } from '../common/validations/file/file.validator';

const allowedMimeTypes = {
  buktiSurat: ['application/pdf'],
};

@Controller('/api/meeting')
export class MeetController {
  constructor(private readonly meetService: MeetService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('buktiSurat', {
      dest: './uploads/surat',
    }),
  )
  async createMeeting(
    @Body() payload: CreateMeetDto,
    @Req() request,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addValidator(
          new FileTypeValidator({
            mimeTypes: allowedMimeTypes,
          }),
        )
        .build(),
    )
    buktiSurat: Express.Multer.File,
  ) {
    const result = await this.meetService.createMeeting(
      request,
      payload,
      buktiSurat,
    );
    return {
      status: 'success',
      message: 'Rapat Berhasil Dibuat',
      data: result,
    };
  }

  @Get()
  findAll() {
    return this.meetService.findAll();
  }

  @Get('/:meetingId')
  async findOneMeeting(
    @Req() request: Request,
    @Param('meetingId') meetingId: string,
  ) {
    const result = await this.meetService.findOneMeeting(request, meetingId);
    return {
      status: 'success',
      data: result,
    };
  }

  @Put('/:meetingId')
  @UseInterceptors(
    FileInterceptor('buktiSurat', {
      dest: './uploads/surat',
    }),
  )
  async updateMeeting(
    @Param('meetingId') meetingId: string,
    @Body() payload: UpdateMeetDto,
    @Req() request,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addValidator(
          new FileTypeValidator({
            mimeTypes: allowedMimeTypes,
          }),
        )
        .build({
          fileIsRequired: false,
        }),
    )
    buktiSurat?: Express.Multer.File,
  ) {
    const result = await this.meetService.updateMeeting(
      request,
      meetingId,
      payload,
      buktiSurat,
    );
    return {
      status: 'success',
      message: 'Rapat Berhasil Diperbarui',
      data: result,
    };
  }

  @Delete('/:meetingId')
  async removeMeeting(@Req() request, @Param('meetingId') meetingId: string) {
    await this.meetService.removeMeeting(request, meetingId);
    return {
      status: 'success',
      message: 'Rapat Berhasil Dihapus',
    };
  }
}
