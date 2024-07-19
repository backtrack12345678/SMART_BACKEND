import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FilesService } from '../../files/files.service';

@Catch()
export class ErrorFilter implements ExceptionFilter {
  constructor(private filesService: FilesService) {}

  catch(exception: any, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    const request = host.switchToHttp().getRequest();

    //single file
    if (request.file) {
      this.filesService.deleteFile(request.file);
    }

    //multi file
    if (request.files) {
      this.filesService.deleteFiles(request.files);
    }

    const statusCode: number =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message: string =
      exception instanceof HttpException
        ? exception.getResponse()['message']
        : 'Internal Server Error';

    response.status(statusCode).json({
      status: 'error',
      message: message,
    });
  }
}
