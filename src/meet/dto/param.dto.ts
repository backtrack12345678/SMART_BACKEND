import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class UpdateMeetingStatusDto {
  @IsNotEmpty()
  @IsString()
  meetingId: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(['Selesai'], { message: 'Status must be "Selesai".' })
  status: string;
}
