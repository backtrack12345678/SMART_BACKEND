import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
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
  tipe: string;

  @ValidateIf((o) => o.tipe === 'offline')
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseInt(value, 10))
  ruanganId: number;

  @ValidateIf((o) => o.tipe === 'online')
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

export class AddParticipantsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  anggota: string[];
}

export class CreateMeetingReportDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  notulensi: string[];
}
