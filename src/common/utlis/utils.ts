import { Request } from 'express';

export function getHost(request: Request): string {
  const protocol: string =
    process.env.NODE_ENV === 'production' ? 'https' : request.protocol;
  return protocol + '://' + request.get('host');
}
