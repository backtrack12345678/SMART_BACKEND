import { Injectable } from '@nestjs/common';
import { ErrorService } from '../../common/error/error.service';

@Injectable()
export class MeetHelper {
  constructor(private errorService: ErrorService) {}
  error() {
    this.errorService.notFound('tes');
  }

  tes() {
    this.error();
  }
}
