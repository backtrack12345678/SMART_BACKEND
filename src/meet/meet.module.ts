import { Module } from '@nestjs/common';
import { MeetService } from './meet.service';
import { MeetController } from './meet.controller';
import { MeetHelper } from './helper/meet.helper';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [FilesModule],
  controllers: [MeetController],
  providers: [MeetService, MeetHelper],
})
export class MeetModule {}
