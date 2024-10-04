/*
  Warnings:

  - You are about to alter the column `created_at` on the `anggota_rapat` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updated_at` on the `anggota_rapat` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `created_at` on the `bukti_absensi_rapat` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updated_at` on the `bukti_absensi_rapat` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `created_at` on the `bukti_surat_rapat` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updated_at` on the `bukti_surat_rapat` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `created_at` on the `jabatan` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updated_at` on the `jabatan` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `created_at` on the `laporan_rapat` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updated_at` on the `laporan_rapat` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `created_at` on the `pangkat_golongan` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updated_at` on the `pangkat_golongan` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `created_at` on the `rapat` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updated_at` on the `rapat` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `created_at` on the `rapat_offline` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updated_at` on the `rapat_offline` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `created_at` on the `rapat_online` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updated_at` on the `rapat_online` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `created_at` on the `refresh_token` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updated_at` on the `refresh_token` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `created_at` on the `ruangan_rapat` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updated_at` on the `ruangan_rapat` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `created_at` on the `sub_unit_kerja` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updated_at` on the `sub_unit_kerja` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `created_at` on the `unit_kerja` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updated_at` on the `unit_kerja` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `created_at` on the `user` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updated_at` on the `user` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `created_at` on the `user_data` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updated_at` on the `user_data` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - Added the required column `user_id` to the `rapat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `anggota_rapat` MODIFY `created_at` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updated_at` DATETIME NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `bukti_absensi_rapat` MODIFY `created_at` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updated_at` DATETIME NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `bukti_surat_rapat` MODIFY `created_at` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updated_at` DATETIME NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `jabatan` MODIFY `created_at` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updated_at` DATETIME NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `laporan_rapat` MODIFY `created_at` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updated_at` DATETIME NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `pangkat_golongan` MODIFY `created_at` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updated_at` DATETIME NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `rapat` ADD COLUMN `user_id` VARCHAR(150) NOT NULL,
    MODIFY `created_at` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updated_at` DATETIME NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `rapat_offline` MODIFY `created_at` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updated_at` DATETIME NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `rapat_online` MODIFY `created_at` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updated_at` DATETIME NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `refresh_token` MODIFY `created_at` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updated_at` DATETIME NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `ruangan_rapat` MODIFY `created_at` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updated_at` DATETIME NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `sub_unit_kerja` MODIFY `created_at` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updated_at` DATETIME NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `unit_kerja` MODIFY `created_at` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updated_at` DATETIME NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `user` MODIFY `created_at` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updated_at` DATETIME NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `user_data` MODIFY `created_at` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updated_at` DATETIME NULL DEFAULT NOW() ON UPDATE NOW();

-- AddForeignKey
ALTER TABLE `rapat` ADD CONSTRAINT `rapat_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
