import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateMeetingRoomDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  nama: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  kampus: string;

  @IsNotEmpty()
  @IsString()
  alamat: string;
}
