-- ============================================================
-- Base de données Clubi V2.0 — Schéma Complet MySQL 8
-- ============================================================

CREATE DATABASE IF NOT EXISTS `ai_career_companion`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `ai_career_companion`;

-- ------------------------------------------------------------
-- 1. Table users
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `interactions`;
DROP TABLE IF EXISTS `participations`;
DROP TABLE IF EXISTS `comments`;
DROP TABLE IF EXISTS `favorites`;
DROP TABLE IF EXISTS `event_tags`;
DROP TABLE IF EXISTS `events`;
DROP TABLE IF EXISTS `tags`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `full_name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('student', 'club', 'admin') NOT NULL DEFAULT 'student',
  `is_verified` TINYINT(1) NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `avatar_url` VARCHAR(500) DEFAULT NULL,
  `bio` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_users_email` (`email`),
  KEY `ix_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2. Table tags
-- ------------------------------------------------------------
CREATE TABLE `tags` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `slug` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_tags_name` (`name`),
  UNIQUE KEY `ix_tags_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 3. Table events
-- ------------------------------------------------------------
CREATE TABLE `events` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT NOT NULL,
  `category` ENUM(
    'artificial_intelligence', 'cybersecurity', 'web_development',
    'mobile', 'cloud', 'data_science', 'robotics', 'devops', 'game_development'
  ) NULL,
  `event_type` ENUM('hackathon', 'competition', 'workshop', 'conference') NULL,
  `location` VARCHAR(255) NOT NULL,
  `is_online` TINYINT(1) NOT NULL DEFAULT 0,
  `start_date` DATETIME NOT NULL,
  `end_date` DATETIME NULL,
  `registration_deadline` DATETIME NULL,
  `registration_url` VARCHAR(500) NULL,
  `image_url` VARCHAR(500) NULL,
  `target_audience` ENUM('students', 'clubs', 'everyone') NOT NULL DEFAULT 'everyone',
  `max_participants` INT NULL,
  `organizer_id` INT NOT NULL,
  `is_published` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_events_title` (`title`),
  KEY `ix_events_start_date` (`start_date`),
  KEY `ix_events_target_audience` (`target_audience`),
  KEY `ix_events_organizer_id` (`organizer_id`),
  CONSTRAINT `fk_events_organizer` FOREIGN KEY (`organizer_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 4. Table d'association event_tags
-- ------------------------------------------------------------
CREATE TABLE `event_tags` (
  `event_id` INT NOT NULL,
  `tag_id` INT NOT NULL,
  PRIMARY KEY (`event_id`, `tag_id`),
  CONSTRAINT `fk_event_tags_event` FOREIGN KEY (`event_id`)
    REFERENCES `events` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_event_tags_tag` FOREIGN KEY (`tag_id`)
    REFERENCES `tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 5. Table interactions (Intéressé / Je participe)
-- ------------------------------------------------------------
CREATE TABLE `interactions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `event_id` INT NOT NULL,
  `type` ENUM('interested', 'participate') NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_interaction_user_event_type` (`user_id`, `event_id`, `type`),
  KEY `ix_interactions_user_id` (`user_id`),
  KEY `ix_interactions_event_id` (`event_id`),
  CONSTRAINT `fk_interactions_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_interactions_event` FOREIGN KEY (`event_id`)
    REFERENCES `events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 6. Table participations (Inscriptions fermes)
-- ------------------------------------------------------------
CREATE TABLE `participations` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `event_id` INT NOT NULL,
  `status` ENUM('registered', 'waitlist', 'cancelled') NOT NULL DEFAULT 'registered',
  `registered_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_participation_user_event` (`user_id`, `event_id`),
  KEY `ix_participations_user_id` (`user_id`),
  KEY `ix_participations_event_id` (`event_id`),
  CONSTRAINT `fk_participations_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_participations_event` FOREIGN KEY (`event_id`)
    REFERENCES `events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 7. Table comments (Commentaires sous les événements)
-- ------------------------------------------------------------
CREATE TABLE `comments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `event_id` INT NOT NULL,
  `content` TEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_comments_user_id` (`user_id`),
  KEY `ix_comments_event_id` (`event_id`),
  CONSTRAINT `fk_comments_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comments_event` FOREIGN KEY (`event_id`)
    REFERENCES `events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 8. Table favorites (Événements mis en favoris)
-- ------------------------------------------------------------
CREATE TABLE `favorites` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `event_id` INT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_favorite_user_event` (`user_id`, `event_id`),
  KEY `ix_favorites_user_id` (`user_id`),
  KEY `ix_favorites_event_id` (`event_id`),
  CONSTRAINT `fk_favorites_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_favorites_event` FOREIGN KEY (`event_id`)
    REFERENCES `events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Données initiales (Tags, Utilisateurs démo, Événements démo)
-- ============================================================

INSERT INTO `tags` (`id`, `name`, `slug`) VALUES
  (1, 'IA', 'ia'),
  (2, 'Cybersécurité', 'cyber'),
  (3, 'Développement web', 'web'),
  (4, 'Musique', 'musique'),
  (5, 'Sport', 'sport'),
  (6, 'Design', 'design'),
  (7, 'Photo', 'photo'),
  (8, 'Entrepreneuriat', 'entrepreneuriat')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- Mot de passe par défaut : password123 (hash bcrypt)
INSERT INTO `users` (`id`, `full_name`, `email`, `password_hash`, `role`, `is_verified`, `is_active`) VALUES
  (1, 'Platform Admin', 'admin@example.com', '$2b$12$P8D/77ryrXyyjv4kq4DmKeYpg0467qF.E.x5MPayw77XXrm6ttwMy', 'admin', 1, 1),
  (2, 'Club Démo', 'demo@clubi.app', '$2b$12$Qq0GY.DrkpUeZ/PW4bQwEuZRrBoMRwEAFTjzskukUvj3RAxMuEik2', 'club', 1, 1),
  (3, 'Étudiant Démo', 'etudiant.demo@clubi.app', '$2b$12$1NIoQ6yj.0eR//iGZa0Rq.GTB61QvK/vYr.5P9YIgWHYOQckqxxUW', 'student', 1, 1),
  (4, 'Ela Chatti', 'elaachatti198@gmail.com', '$2b$12$1NIoQ6yj.0eR//iGZa0Rq.GTB61QvK/vYr.5P9YIgWHYOQckqxxUW', 'student', 1, 1)
ON DUPLICATE KEY UPDATE `full_name`=VALUES(`full_name`);

INSERT INTO `events` (`id`, `title`, `description`, `location`, `start_date`, `target_audience`, `max_participants`, `organizer_id`, `is_published`) VALUES
  (1, 'Capture The Flag — nuit blanche', 'Une nuit de CTF en équipes de 3, du reverse au web exploitation. Pizzas et boissons fournies !', 'Amphi B', DATE_ADD(NOW(), INTERVAL 3 DAY), 'everyone', 60, 2, 1),
  (2, 'Atelier : construire son premier modèle de classification', 'On code ensemble un classifieur en Python, aucun prérequis en machine learning.', 'Salle info 3', DATE_ADD(NOW(), INTERVAL 5 DAY), 'everyone', 35, 2, 1),
  (3, 'Scène ouverte de rentrée', 'Chante, joue, slame — 5 min par passage sur scène.', 'Foyer étudiant', DATE_ADD(NOW(), INTERVAL 7 DAY), 'everyone', 120, 2, 1)
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);

INSERT INTO `event_tags` (`event_id`, `tag_id`) VALUES
  (1, 2),
  (2, 1),
  (2, 3),
  (3, 4),
  (3, 6)
ON DUPLICATE KEY UPDATE `tag_id`=VALUES(`tag_id`);

INSERT INTO `interactions` (`user_id`, `event_id`, `type`) VALUES
  (3, 1, 'interested'),
  (3, 2, 'participate')
ON DUPLICATE KEY UPDATE `type`=VALUES(`type`);
