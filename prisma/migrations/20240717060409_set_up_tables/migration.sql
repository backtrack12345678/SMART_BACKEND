-- CreateTable
CREATE TABLE `user` (
    `id` VARCHAR(150) NOT NULL,
    `username` VARCHAR(100) NOT NULL,
    `password` VARCHAR(100) NOT NULL,
    `role` VARCHAR(15) NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT NOW(),
    `updated_at` DATETIME NULL DEFAULT NOW() ON UPDATE NOW(),

    UNIQUE INDEX `user_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_data` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(150) NOT NULL,
    `nama` VARCHAR(150) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `nip` VARCHAR(150) NOT NULL,
    `sub_unit_kerja_id` INTEGER NOT NULL,
    `pangakt_golongan_id` INTEGER NOT NULL,
    `jabatan_id` INTEGER NOT NULL,
    `photo` VARCHAR(250) NOT NULL,
    `path` TEXT NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT NOW(),
    `updated_at` DATETIME NULL DEFAULT NOW() ON UPDATE NOW(),

    UNIQUE INDEX `user_data_user_id_key`(`user_id`),
    UNIQUE INDEX `user_data_phone_key`(`phone`),
    UNIQUE INDEX `user_data_nip_key`(`nip`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refresh_token` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(150) NOT NULL,
    `refresh_token` VARCHAR(250) NOT NULL,
    `notification_token` VARCHAR(250) NULL,
    `created_at` DATETIME NOT NULL DEFAULT NOW(),
    `updated_at` DATETIME NULL DEFAULT NOW() ON UPDATE NOW(),

    UNIQUE INDEX `refresh_token_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `unit_kerja` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kode` VARCHAR(5) NOT NULL,
    `nama` VARCHAR(150) NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT NOW(),
    `updated_at` DATETIME NULL DEFAULT NOW() ON UPDATE NOW(),

    UNIQUE INDEX `unit_kerja_kode_key`(`kode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sub_unit_kerja` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `unit_kerja_id` INTEGER NOT NULL,
    `kode` VARCHAR(5) NOT NULL,
    `nama` VARCHAR(150) NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT NOW(),
    `updated_at` DATETIME NULL DEFAULT NOW() ON UPDATE NOW(),

    UNIQUE INDEX `sub_unit_kerja_kode_key`(`kode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pangkat_golongan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kode` VARCHAR(10) NOT NULL,
    `nama` VARCHAR(150) NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT NOW(),
    `updated_at` DATETIME NULL DEFAULT NOW() ON UPDATE NOW(),

    UNIQUE INDEX `pangkat_golongan_kode_key`(`kode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jabatan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kode` VARCHAR(10) NOT NULL,
    `nama` VARCHAR(150) NOT NULL,
    `klasifikasi` VARCHAR(10) NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT NOW(),
    `updated_at` DATETIME NULL DEFAULT NOW() ON UPDATE NOW(),

    UNIQUE INDEX `jabatan_kode_key`(`kode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ruangan_rapat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(150) NOT NULL,
    `kampus` VARCHAR(150) NOT NULL,
    `lokasi` TEXT NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT NOW(),
    `updated_at` DATETIME NULL DEFAULT NOW() ON UPDATE NOW(),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rapat` (
    `id` VARCHAR(150) NOT NULL,
    `nama` VARCHAR(150) NOT NULL,
    `deskripsi` TEXT NOT NULL,
    `status` VARCHAR(10) NOT NULL,
    `lokasi` TEXT NOT NULL,
    `unit_kerja_id` INTEGER NOT NULL,
    `surat` VARCHAR(100) NOT NULL,
    `mulai` DATETIME(3) NOT NULL,
    `selesai` DATETIME(3) NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT NOW(),
    `updated_at` DATETIME NULL DEFAULT NOW() ON UPDATE NOW(),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bukti_surat_rapat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rapat_id` VARCHAR(150) NOT NULL,
    `nama` VARCHAR(250) NOT NULL,
    `path` TEXT NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT NOW(),
    `updated_at` DATETIME NULL DEFAULT NOW() ON UPDATE NOW(),

    UNIQUE INDEX `bukti_surat_rapat_rapat_id_key`(`rapat_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `laporan_rapat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rapat_id` VARCHAR(150) NOT NULL,
    `notulensi` TEXT NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT NOW(),
    `updated_at` DATETIME NULL DEFAULT NOW() ON UPDATE NOW(),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `anggota_rapat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rapat_id` VARCHAR(150) NOT NULL,
    `user_id` VARCHAR(150) NOT NULL,
    `kehadiran` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME NOT NULL DEFAULT NOW(),
    `updated_at` DATETIME NULL DEFAULT NOW() ON UPDATE NOW(),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Bukti_Absensi_Rapat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `anggota_rapat_id` INTEGER NOT NULL,
    `nama` VARCHAR(250) NOT NULL,
    `path` TEXT NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT NOW(),
    `updated_at` DATETIME NULL DEFAULT NOW() ON UPDATE NOW(),

    UNIQUE INDEX `Bukti_Absensi_Rapat_anggota_rapat_id_key`(`anggota_rapat_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_data` ADD CONSTRAINT `user_data_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_data` ADD CONSTRAINT `user_data_sub_unit_kerja_id_fkey` FOREIGN KEY (`sub_unit_kerja_id`) REFERENCES `sub_unit_kerja`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_data` ADD CONSTRAINT `user_data_pangakt_golongan_id_fkey` FOREIGN KEY (`pangakt_golongan_id`) REFERENCES `pangkat_golongan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_data` ADD CONSTRAINT `user_data_jabatan_id_fkey` FOREIGN KEY (`jabatan_id`) REFERENCES `jabatan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refresh_token` ADD CONSTRAINT `refresh_token_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sub_unit_kerja` ADD CONSTRAINT `sub_unit_kerja_unit_kerja_id_fkey` FOREIGN KEY (`unit_kerja_id`) REFERENCES `unit_kerja`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rapat` ADD CONSTRAINT `rapat_unit_kerja_id_fkey` FOREIGN KEY (`unit_kerja_id`) REFERENCES `unit_kerja`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bukti_surat_rapat` ADD CONSTRAINT `bukti_surat_rapat_rapat_id_fkey` FOREIGN KEY (`rapat_id`) REFERENCES `rapat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `laporan_rapat` ADD CONSTRAINT `laporan_rapat_rapat_id_fkey` FOREIGN KEY (`rapat_id`) REFERENCES `rapat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anggota_rapat` ADD CONSTRAINT `anggota_rapat_rapat_id_fkey` FOREIGN KEY (`rapat_id`) REFERENCES `rapat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anggota_rapat` ADD CONSTRAINT `anggota_rapat_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bukti_Absensi_Rapat` ADD CONSTRAINT `Bukti_Absensi_Rapat_anggota_rapat_id_fkey` FOREIGN KEY (`anggota_rapat_id`) REFERENCES `anggota_rapat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
