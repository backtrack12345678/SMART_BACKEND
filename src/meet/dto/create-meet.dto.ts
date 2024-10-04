import { Transform } from 'class-transformer';
import {
  IsDate,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
  MinDate,
  ValidateIf,
} from 'class-validator';

export class CreateMeetDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  nama: string;

  @IsNotEmpty()
  @IsString()
  deskripsi: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(['offline', 'online'])
  status: string;

  @ValidateIf((o) => o.status === 'offline')
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseInt(value, 10))
  ruanganId: number;

  @ValidateIf((o) => o.status === 'online')
  @IsString()
  @IsNotEmpty()
  link: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseInt(value, 10))
  unitKerjaId: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  surat: string;

  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @MinDate(new Date())
  mulai: Date;

  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @MinDate(new Date())
  selesai: Date;
}
