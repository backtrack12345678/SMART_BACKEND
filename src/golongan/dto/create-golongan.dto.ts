import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateGolonganDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  kode: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  nama: string;
}
