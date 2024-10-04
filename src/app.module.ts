import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { FilesModule } from './files/files.module';
import { UserModule } from './user/user.module';
import { MeetModule } from './meet/meet.module';
import { UnitKerjaModule } from './unit-kerja/unit-kerja.module';
import { MeetingRoomModule } from './meeting-room/meeting-room.module';
import { JabatanModule } from './jabatan/jabatan.module';
import { GolonganModule } from './golongan/golongan.module';
import { SubUnitKerjaModule } from './sub-unit-kerja/sub-unit-kerja.module';

@Module({
  imports: [
    CommonModule,
    FilesModule,
    UserModule,
    MeetModule,
    UnitKerjaModule,
    MeetingRoomModule,
    JabatanModule,
    GolonganModule,
    SubUnitKerjaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
