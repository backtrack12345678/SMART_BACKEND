import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { LoggerService } from './logger/logger.service';
import { ErrorFilter } from './error/error.filter';
import { FilesModule } from '../files/files.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ErrorService } from './error/error.service';
import { AuthGuard } from './auth/auth.guard';
import { RoleGuard } from './role/role.guard';
import { ValidationService } from './validation/validation.service';
import { NotificationService } from './notification/notification.service';
import { AxiosService } from './axios/axios.service';

@Global()
@Module({
  imports: [
    FilesModule,
    JwtModule.register({
      global: true,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
  ],
  providers: [
    PrismaService,
    ErrorService,
    LoggerService,
    {
      provide: 'APP_GUARD',
      useClass: AuthGuard,
    },
    {
      provide: 'APP_GUARD',
      useClass: RoleGuard,
    },
    {
      provide: 'APP_FILTER',
      useClass: ErrorFilter,
    },
    ValidationService,
    NotificationService,
    AxiosService,
  ],
  exports: [
    PrismaService,
    ErrorService,
    ValidationService,
    NotificationService,
  ],
})
export class CommonModule {}
