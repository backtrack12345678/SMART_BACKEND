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
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { WebResponse } from '../common/model/web.model';
import { GetAllUsersQueryDto } from './dto/get.dto';
import { Auth } from '../common/auth/auth.decorator';
import { FileTypeValidator } from '../common/validations/file/file.validator';
import { Roles } from '../common/role/role.decorator';
import { Role } from '../common/role/role.enum';
import { LoginDto } from './dto/login.dto';

const allowedMimeTypes = {
  photo: ['image/png', 'image/jpg', 'image/jpeg'],
};

@Controller('/api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

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
    const { data, paging } = await this.userService.getAllUsers(request, query);
    return {
      status: 'success',
      data: data,
      paging: paging,
    };
  }

  // @Get('/:id')
  // getUser(@Param('id') id: string) {
  //   return this.userService.findOne(+id);
  // }

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
      new ParseFilePipe({
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

  // @Delete(':id')
  // deleteUser(@Param('id') id: string) {
  //   return this.userService.deleteUser(+id);
  // }

  @Post('/login')
  async login(@Body() payload: LoginDto) {
    const result = await this.userService.login(payload);
    return {
      status: 'success',
      message: 'Login Berhasil',
      data: result,
    };
  }
}
