import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  @Matches(/^ExponentPushToken/, {
    message: 'notificationToken must start with "ExponentPushToken"',
  })
  notificationToken: string;
}
