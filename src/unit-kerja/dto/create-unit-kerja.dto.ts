import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateUnitKerjaDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(5)
  @Transform(({ value }) => value.toUpperCase())
  kode: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  @Transform(({ value }) => value.toUpperCase())
  nama: string;
}
