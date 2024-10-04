import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateSubUnitKerjaDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  unitKerjaId: number;

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(5)
  @Transform(({ value }) => value.toUpperCase())
  kode: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  @Transform(({ value }) => value.toUpperCase())
  nama: string;
}
