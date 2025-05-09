import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsPositive,
  Matches,
  IsDate,
  IsIn,
} from 'class-validator';

export class GetAllMeetingQueryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseInt(value, 10))
  size?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @IsOptional()
  @IsString()
  @IsIn(['offline', 'online'])
  tipe?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseInt(value, 10))
  unitKerjaId?: number;
}

export class GetMeetingByUserQueryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseInt(value, 10))
  size?: number = 12;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  date?: Date;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: 'Format bulan harus YYYY-MM' }) // Validasi format YYYY-MM
  month?: string;

  @IsOptional()
  @IsString()
  @IsIn(['offline', 'online'])
  tipe?: string;
}

export class GetParticipantsQueryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseInt(value, 10))
  cursor?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseInt(value, 10))
  size?: number = 12;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number;
}
