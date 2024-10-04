import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Auth } from './auth.decorator';
import { ErrorService } from '../error/error.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private errorService: ErrorService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const auth = this.reflector.get<boolean>(Auth, context.getHandler());

    if (!auth) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    if (type !== 'Bearer' || !token) {
      this.errorService.unauthorized(
        'Kredensial Tidak Valid. Silahkan Login Kembali',
      );
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('ACCESS_TOKEN_KEY'),
      });

      request['user'] = {
        id: payload.id,
        role: payload.role,
      };
    } catch (e) {
      this.errorService.unauthorized(
        'Kredensial Tidak Valid. Silahkan Login Kembali',
      );
    }

    return true;
  }
}
