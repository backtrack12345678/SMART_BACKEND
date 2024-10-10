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
  Query,
  Patch,
} from '@nestjs/common';
import { MeetService } from './meet.service';
import { AddParticipantsDto, CreateMeetDto } from './dto/create-meet.dto';
import { UpdateMeetDto } from './dto/update-meet.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileTypeValidator } from '../common/validations/file/file.validator';
import { Role } from '../common/role/role.enum';
import { Auth } from '../common/auth/auth.decorator';
import { Roles } from '../common/role/role.decorator';
import { GetParticipantsQueryDto } from './dto/query.dto';
import { UpdateMeetingStatusDto } from './dto/param.dto';

const allowedMimeTypes = {
  buktiSurat: ['application/pdf'],
  buktiAbsensi: ['image/png', 'image/jpg', 'image/jpeg'],
};

@Controller('/api/meeting')
export class MeetController {
  constructor(private readonly meetService: MeetService) {}

  @Auth()
  @Roles(Role.ADMIN, Role.OPERATOR)
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

  @Auth()
  @Roles(Role.ADMIN, Role.OPERATOR)
  @Get()
  findAll() {
    return this.meetService.findAll();
  }

  @Auth()
  @Roles(Role.ADMIN, Role.OPERATOR)
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

  @Auth()
  @Roles(Role.ADMIN, Role.OPERATOR)
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

  @Auth()
  @Roles(Role.ADMIN, Role.OPERATOR)
  @Delete('/:meetingId')
  async removeMeeting(@Req() request, @Param('meetingId') meetingId: string) {
    await this.meetService.removeMeeting(request, meetingId);
    return {
      status: 'success',
      message: 'Rapat Berhasil Dihapus',
    };
  }

  @Auth()
  @Roles(Role.ADMIN, Role.OPERATOR)
  @Post('/:meetingId/participants')
  async addMeetingParticipants(
    @Req() request,
    @Param('meetingId') meetingId: string,
    @Body() payload: AddParticipantsDto,
  ) {
    const result = await this.meetService.addMeetingParticipants(
      request,
      meetingId,
      payload,
    );
    return {
      status: 'success',
      message: 'Peserta Berhasil Ditambahkan',
      data: result,
    };
  }

  @Auth()
  @Get('/:meetingId/participants')
  async getMeetingParticipants(
    @Req() request,
    @Param('meetingId') meetingId: string,
    @Query() query: GetParticipantsQueryDto,
  ) {
    const result = await this.meetService.findMeetingParticipants(
      request,
      meetingId,
      query,
    );
    return {
      status: 'success',
      paging: result.paging,
      data: result.data,
    };
  }

  @Auth()
  @Roles(Role.ADMIN, Role.OPERATOR)
  @Patch('/:meetingId/status/:status')
  async updateMeetingStatus(
    @Req() request,
    @Param() param: UpdateMeetingStatusDto,
  ) {
    await this.meetService.updateMeetingStatus(request, param);
    return {
      status: 'success',
      message: 'Rapat Diperbarui Menjadi Selesai',
    };
  }

  @Auth()
  @Roles(Role.USER)
  @Post('/:meetingId/attendance')
  @UseInterceptors(
    FileInterceptor('buktiAbsensi', {
      dest: './uploads/absensi',
    }),
  )
  async meetingAttendance(
    @Req() request,
    @Param('meetingId') meetingId: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addValidator(
          new FileTypeValidator({
            mimeTypes: allowedMimeTypes,
          }),
        )
        .build(),
    )
    buktiAbsensi: Express.Multer.File,
  ) {
    await this.meetService.meetingAttendance(request, meetingId, buktiAbsensi);
    return {
      status: 'success',
      message: 'Berhasil Absensi',
    };
  }
}
