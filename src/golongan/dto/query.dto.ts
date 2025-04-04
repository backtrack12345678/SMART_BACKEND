import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsNumber, IsPositive } from 'class-validator';

export class GetGolonganQueryDto {
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
}
