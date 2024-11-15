import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class UpdateMeetingStatusDto {
  @IsNotEmpty()
  @IsString()
  meetingId: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(['Selesai', 'Belum_Dimulai'], { message: 'Status must be "Selesai" or "Belum_Dimulai".' })
  status: string;
}
