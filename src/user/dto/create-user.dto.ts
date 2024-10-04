import { Transform } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  @Matches(/^\S*$/, { message: 'username tidak boleh mengandung spasi' })
  username: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(12)
  password: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(15)
  @IsIn(['admin', 'operator', 'user'], {
    message: 'Role harus "admin", "operator" atau "user"',
  })
  role: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  nama: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  @Matches(/^[0-9]+$/, { message: 'phone must be digit' })
  phone: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(18)
  nip: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseInt(value, 10))
  unitKerjaId: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseInt(value, 10))
  subUnitKerjaId: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseInt(value, 10))
  pangkatGolonganId: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseInt(value, 10))
  jabatanId: number;
}
