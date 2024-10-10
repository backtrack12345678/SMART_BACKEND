import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { FilesModule } from '../files/files.module';
import { UserHelper } from './helper/user.helper';
import { MeetModule } from '../meet/meet.module';

@Module({
  imports: [FilesModule, MeetModule],
  controllers: [UserController],
  providers: [UserService, UserHelper],
})
export class UserModule {}
