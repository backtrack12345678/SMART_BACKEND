import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { FilesModule } from './files/files.module';

@Module({
  imports: [CommonModule, FilesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
