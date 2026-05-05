-- ============================================================
-- CMS MIGRATION SQL
-- Jalankan file ini di phpMyAdmin: Database ninetynine_shoe
-- ============================================================

USE `ninetynine_shoe`;

-- ----------------------------
-- Table: Testimonials
-- ----------------------------
CREATE TABLE IF NOT EXISTS `Testimonials` (
  `id`         INT(11)      NOT NULL AUTO_INCREMENT,
  `name`       VARCHAR(255) NOT NULL,
  `location`   VARCHAR(255) NOT NULL DEFAULT 'Pelanggan',
  `rating`     INT(11)      NOT NULL DEFAULT 5,
  `text`       TEXT         NOT NULL,
  `sort_order` INT(11)      NOT NULL DEFAULT 0,
  `createdAt`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table: ShowcaseItems
-- ----------------------------
CREATE TABLE IF NOT EXISTS `ShowcaseItems` (
  `id`         INT(11)                  NOT NULL AUTO_INCREMENT,
  `label`      VARCHAR(255)             NOT NULL,
  `icon`       VARCHAR(255)             NOT NULL DEFAULT 'fa-shoe-prints',
  `media_url`  TEXT                     NOT NULL,
  `media_type` ENUM('video','image')    NOT NULL DEFAULT 'video',
  `sort_order` INT(11)                  NOT NULL DEFAULT 0,
  `createdAt`  DATETIME                 NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`  DATETIME                 NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Seed Data: Testimonials
-- ----------------------------
INSERT IGNORE INTO `Testimonials` (`id`, `name`, `location`, `rating`, `text`, `sort_order`) VALUES
(1, 'Andi Saputra',  'Pelanggan Purwokerto', 5, '"Gila sih, sepatu putih kesayangan yang udah menguning parah bisa balik putih lagi kayak baru beli. Mantap Ninetynine!"', 1),
(2, 'Rina Melati',   'Pelanggan Cilacap',    5, '"Layanan pick-up delivery-nya ngebantu banget buat yang sibuk kerja. Tinggal WA, sepatu dijemput, balik-balik udah wangi."',  2),
(3, 'Dimas Anggara', 'Pelanggan Purwokerto', 4, '"Cuci helm dan tas carrier juga oke banget di sini. Harganya masuk akal, kualitasnya premium. Sukses terus!"', 3);

-- ----------------------------
-- Seed Data: ShowcaseItems
-- ----------------------------
INSERT IGNORE INTO `ShowcaseItems` (`id`, `label`, `icon`, `media_url`, `media_type`, `sort_order`) VALUES
(1, 'Deep Clean',        'fa-shoe-prints',        'https://videos.pexels.com/video-files/3635378/3635378-uhd_2560_1440_25fps.mp4',  'video', 1),
(2, 'Steam Uap',         'fa-spray-can-sparkles', 'https://videos.pexels.com/video-files/6461561/6461561-uhd_2560_1440_30fps.mp4',  'video', 2),
(3, 'Pick Up & Delivery','fa-truck-fast',          'https://videos.pexels.com/video-files/5384913/5384913-uhd_2560_1440_25fps.mp4',  'video', 3);
