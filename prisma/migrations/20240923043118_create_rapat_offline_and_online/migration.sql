/*
  Warnings:

  - You are about to alter the column `created_at` on the `Bukti_Absensi_Rapat` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updated_at` on the `Bukti_Absensi_Rapat` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `created_at` on the `anggota_rapat` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updated_at` on the `anggota_rapat` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
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
  - You are about to alter the column `created_at` on the `refresh_token` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updated_at` on the `refresh_token` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to drop the column `lokasi` on the `ruangan_rapat` table. All the data in the column will be lost.
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
  - Added the required column `alamat` to the `ruangan_rapat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Bukti_Absensi_Rapat` MODIFY `created_at` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updated_at` DATETIME NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `anggota_rapat` MODIFY `created_at` DATETIME NOT NULL DEFAULT NOW(),
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
ALTER TABLE `rapat` MODIFY `created_at` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updated_at` DATETIME NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `refresh_token` MODIFY `created_at` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updated_at` DATETIME NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `ruangan_rapat` DROP COLUMN `lokasi`,
    ADD COLUMN `alamat` TEXT NOT NULL,
    MODIFY `created_at` DATETIME NOT NULL DEFAULT NOW(),
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

-- CreateTable
CREATE TABLE `rapat_offline` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rapat_id` VARCHAR(150) NOT NULL,
    `ruangan_id` INTEGER NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT NOW(),
    `updated_at` DATETIME NULL DEFAULT NOW() ON UPDATE NOW(),

    UNIQUE INDEX `rapat_offline_rapat_id_key`(`rapat_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Rapat_Online` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rapat_id` VARCHAR(150) NOT NULL,
    `alamat` TEXT NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT NOW(),
    `updated_at` DATETIME NULL DEFAULT NOW() ON UPDATE NOW(),

    UNIQUE INDEX `Rapat_Online_rapat_id_key`(`rapat_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `rapat_offline` ADD CONSTRAINT `rapat_offline_rapat_id_fkey` FOREIGN KEY (`rapat_id`) REFERENCES `rapat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rapat_offline` ADD CONSTRAINT `rapat_offline_ruangan_id_fkey` FOREIGN KEY (`ruangan_id`) REFERENCES `ruangan_rapat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rapat_Online` ADD CONSTRAINT `Rapat_Online_rapat_id_fkey` FOREIGN KEY (`rapat_id`) REFERENCES `rapat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
