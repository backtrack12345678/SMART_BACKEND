import { HttpException, Injectable } from '@nestjs/common';
import { AxiosService } from '../axios/axios.service';

@Injectable()
export class NotificationService {
  constructor(private axiosService: AxiosService) {}

  async meeting(participansNotifToken: string[], meeting) {
    const batchSize = 100;
    const requestCount = Math.ceil(participansNotifToken.length / batchSize);

    try {
      for (let i = 0; i < requestCount; i++) {
        const batch = participansNotifToken.slice(
          i * batchSize,
          (i + 1) * batchSize,
        );
        await this.axiosService.notificationInstance.post(
          '--/api/v2/push/send',
          [
            {
              to: batch, // Menggunakan batch yang benar
              title: `Rapat ${meeting.nama}`,
              body: 'Anda Diundang Untuk Hadir, Ketuk Untuk Melihat',
              priority: 'high',
              data: {
                id: meeting.id, // aktivitas id,
                surat: meeting.surat,
              },
            },
          ],
        );
      }
    } catch (e) {
      throw new HttpException('Gagal Mengirim Notifikasi', 500);
    }
  }
}
