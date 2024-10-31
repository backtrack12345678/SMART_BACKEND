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
  UploadedFiles,
} from '@nestjs/common';
import { MeetService } from './meet.service';
import {
  AddParticipantsDto,
  CreateMeetDto,
  CreateMeetingReportDto,
} from './dto/create-meet.dto';
import { UpdateMeetDto } from './dto/update-meet.dto';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { FileTypeValidator } from '../common/validations/file/file.validator';
import { Role } from '../common/role/role.enum';
import { Auth } from '../common/auth/auth.decorator';
import { Roles } from '../common/role/role.decorator';
import {
  GetAllMeetingQueryDto,
  GetParticipantsQueryDto,
} from './dto/query.dto';
import { UpdateMeetingStatusDto } from './dto/param.dto';
import { FilesTypeValidator } from '../common/validations/file/files.validator';

const allowedMimeTypes = {
  buktiSurat: ['application/pdf'],
  buktiAbsensi: ['image/png', 'image/jpg', 'image/jpeg'],
  tandaTangan: ['image/png', 'image/jpg', 'image/jpeg'],
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
  async findAllMeeting(@Req() request, @Query() query: GetAllMeetingQueryDto) {
    const result = await this.meetService.findAllMeeting(request, query);
    return {
      status: 'success',
      paging: result.paging,
      data: result.data,
    };
  }

  @Auth()
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
      ...(result.paging && {
        paging: result.paging,
      }),
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
    // FileInterceptor('buktiAbsensi', {
    //   dest: './uploads/absensi',
    // }),
    FileFieldsInterceptor(
      [
        { name: 'buktiAbsensi', maxCount: 1 },
        { name: 'tandaTangan', maxCount: 1 },
      ],
      {
        dest: (req, file, cb) => {
          const folder =
            file.fieldname === 'buktiAbsensi'
              ? './uploads/bukti-absensi'
              : './uploads/tanda-tangan';
          cb(null, folder);
        },
      },
    ),
  )
  async meetingAttendance(
    @Req() request,
    @Param('meetingId') meetingId: string,
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addValidator(
          new FilesTypeValidator({
            mimeTypes: allowedMimeTypes,
          }),
        )
        .build(),
    )
    files: {
      buktiAbsensi: Express.Multer.File[];
      tandaTangan: Express.Multer.File[];
    },
  ) {
    await this.meetService.meetingAttendance(request, meetingId, files);
    return {
      status: 'success',
      message: 'Berhasil Absensi',
    };
  }

  @Auth()
  @Post('/:meetingId/report')
  async createMeetingReport(
    @Req() request,
    @Param('meetingId') meetingId: string,
    @Body() payload: CreateMeetingReportDto,
  ) {
    const result = await this.meetService.createMeetingReport(
      request,
      meetingId,
      payload,
    );
    return {
      status: 'success',
      message: 'Laporan Rapat Berhasil Dibuat',
      data: result,
    };
  }
}
