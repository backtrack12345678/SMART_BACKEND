import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  Query,
  ParseFilePipeBuilder,
  Put,
  Res,
  Delete,
  Patch,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import {
  ChangePasswordDto,
  UpdateUserDto,
  UpdateUserProfileDto,
} from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { WebResponse } from '../common/model/web.model';
import { GetAllUsersQueryDto } from './dto/get.dto';
import { Auth } from '../common/auth/auth.decorator';
import { FileTypeValidator } from '../common/validations/file/file.validator';
import { Roles } from '../common/role/role.decorator';
import { Role } from '../common/role/role.enum';
import { LoginDto } from './dto/login.dto';
import { Request, Response } from 'express';
import { GetMeetingByUserQueryDto } from '../meet/dto/query.dto';
import { MeetService } from '../meet/meet.service';

const allowedMimeTypes = {
  photo: ['image/png', 'image/jpg', 'image/jpeg'],
};

@Controller('/api/user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly meetService: MeetService,
  ) {}

  @Auth()
  @Roles(Role.ADMIN, Role.OPERATOR)
  @Post('/')
  @UseInterceptors(
    FileInterceptor('photo', {
      dest: './uploads/user',
    }),
  )
  async createUser(
    @Body() payload: CreateUserDto,
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
    photo: Express.Multer.File,
  ): Promise<WebResponse<{ id: string }>> {
    const result = await this.userService.createUser(request, payload, photo);
    return {
      status: 'success',
      message: 'Pengguna Berhasil Dibuat',
      data: result,
    };
  }

  @Auth()
  @Roles(Role.ADMIN, Role.OPERATOR)
  @Get('')
  async getAllUsers(
    @Query() query: GetAllUsersQueryDto,
    @Req() request: Request,
  ) {
    const result = await this.userService.getAllUsers(request, query);
    return {
      status: 'success',
      paging: result.paging,
      data: result.data,
    };
  }

  @Auth()
  @Roles(Role.ADMIN,Role.OPERATOR)
  @Get('/list-participants')
  async getAllParticipants(
    @Query() query: GetAllUsersQueryDto,
    @Req() request: Request,
  ){
    const result = await this.userService.getAllParticipants(request, query);
    return {
      status: 'success',
      paging: result.paging,
      data: result.data,
    };
  }

  @Auth()
  @Get('/profile')
  async getProfile(@Req() request) {
    const result = await this.userService.findOneUser(request, request.user.id);
    return {
      status: 'success',
      data: result,
    };
  }

  @Auth()
  @Get('/meeting')
  async findAllMeetingByUser(
    @Req() request,
    @Query() query: GetMeetingByUserQueryDto,
  ) {
    const result = await this.meetService.findAllMeetingByUser(request, query);
    return {
      status: 'success',
      data: result,
    };
  }

  @Auth()
  @Roles(Role.ADMIN, Role.OPERATOR)
  @Get('/:userId')
  async findOneUser(@Req() request, @Param('userId') userId: string) {
    const result = await this.userService.findOneUser(request, userId);
    return {
      status: 'success',
      data: result,
    };
  }

  @Auth()
  @Roles(Role.ADMIN, Role.OPERATOR)
  @Put('/:userId')
  @UseInterceptors(
    FileInterceptor('photo', {
      dest: './uploads/user',
    }),
  )
  async updateUser(
    @Param('userId') userId: string,
    @Body() payload: UpdateUserDto,
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
    photo?: Express.Multer.File,
  ) {
    const result = this.userService.updateUser(request, userId, payload, photo);
    return {
      status: 'success',
      message: 'Pengguna Berhasil Diperbarui',
      data: result,
    };
  }

  @Auth()
  @Patch('/profile')
  @UseInterceptors(
    FileInterceptor('photo', {
      dest: './uploads/user',
    }),
  )
  async updateUserProfile(
    @Req() request,
    @Body() payload: UpdateUserProfileDto,
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
    photo?: Express.Multer.File,
  ) {
    const result = await this.userService.updateUserProfile(
      request,
      payload,
      photo,
    );
    return {
      status: 'success',
      message: 'Profile Pengguna Berhasil Diperbarui',
      data: result,
    };
  }

  @Auth()
  @Patch('/change-password')
  async changePassword(@Req() request, @Body() payload: ChangePasswordDto) {
    await this.userService.changePassword(request.user, payload);
    return {
      status: 'success',
      message: 'Kata Sandi Berhasil Diubah',
    };
  }

  // @Delete(':id')
  // deleteUser(@Param('id') id: string) {
  //   return this.userService.deleteUser(+id);
  // }
  @Post('/login')
  async login(
    @Body() payload: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.userService.login(payload);
    response.cookie('refresh_token', result.refreshToken, {
      path: '/',
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: 'none',
      secure: process.env.NODE_ENV === 'production',
    });
    return {
      status: 'success',
      message: 'Login Berhasil',
      data: {
        accessToken: result.accessToken,
      },
    };
  }

  @Post('/refresh-token')
  async updateAccessToken(@Req() request: Request) {
    const result = await this.userService.updateAccessToken(
      request.cookies?.refresh_token,
    );
    return {
      status: 'success',
      message: 'Access Token Berhasil Dibuat',
      data: {
        accessToken: result,
      },
    };
  }

  @Auth()
  @Delete('/logout')
  async logout(@Req() request, @Res({ passthrough: true }) response: Response) {
    await this.userService.logout(request.user);
    response.cookie('refresh_token', '', {
      path: '/',
      httpOnly: true,
      maxAge: 0,
      sameSite: 'none',
      secure: process.env.NODE_ENV === 'production',
    });
    return {
      status: 'success',
      message: 'Logout Berhasil',
      data: true,
    };
  }
}
