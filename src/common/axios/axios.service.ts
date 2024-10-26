import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Axios from 'axios';

@Injectable()
export class AxiosService {
  constructor(private configService: ConfigService) {}

  public notificationInstance = Axios.create({
    baseURL: this.configService.get<string>('EXPO_NOTIFICATION_BASE_URL'),
  });
}
