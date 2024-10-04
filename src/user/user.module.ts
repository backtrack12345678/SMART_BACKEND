import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { FilesModule } from '../files/files.module';
import { UserHelper } from './helper/user.helper';

@Module({
  imports: [FilesModule],
  controllers: [UserController],
  providers: [UserService, UserHelper],
})
export class UserModule {}
