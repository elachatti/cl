-- =====================================================================
-- AI Career Companion - MySQL 8 schema (Module 1)
-- Usage:  mysql -u root -p < schema.sql
-- The FastAPI app can also create these tables automatically
-- (AUTO_CREATE_TABLES=true); this file is the reference schema.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS ai_career_companion
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ai_career_companion;

-- ---------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            INT           NOT NULL AUTO_INCREMENT,
  full_name     VARCHAR(120)  NOT NULL,
  email         VARCHAR(255)  NOT NULL,
  password_hash VARCHAR(255)  NOT NULL,
  role          ENUM('student', 'club', 'admin') NOT NULL DEFAULT 'student',
  is_verified   TINYINT(1)    NOT NULL DEFAULT 0,
  is_active     TINYINT(1)    NOT NULL DEFAULT 1,
  avatar_url    VARCHAR(500)  NULL,
  bio           TEXT          NULL,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY ix_users_email (email),
  KEY ix_users_role (role)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- events
-- category / event_type are legacy Module 1 fields, now optional; the
-- publication form (Module 2) classifies events with `tags` instead.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
  id                    INT           NOT NULL AUTO_INCREMENT,
  title                 VARCHAR(200)  NOT NULL,
  description           TEXT          NOT NULL,
  category              ENUM(
                          'artificial_intelligence', 'cybersecurity', 'web_development',
                          'mobile', 'cloud', 'data_science', 'robotics', 'devops',
                          'game_development'
                        ) NULL,
  event_type            ENUM('hackathon', 'competition', 'workshop', 'conference') NULL,
  location              VARCHAR(255)  NOT NULL,
  is_online             TINYINT(1)    NOT NULL DEFAULT 0,
  start_date            DATETIME      NOT NULL,
  end_date              DATETIME      NULL,
  registration_deadline DATETIME      NULL,
  registration_url      VARCHAR(500)  NULL,
  image_url             VARCHAR(500)  NULL,
  target_audience       ENUM('students', 'clubs', 'everyone') NOT NULL DEFAULT 'everyone',
  max_participants      INT           NULL,
  organizer_id          INT           NOT NULL,
  is_published          TINYINT(1)    NOT NULL DEFAULT 1,
  created_at            DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_events_title (title),
  KEY ix_events_category (category),
  KEY ix_events_event_type (event_type),
  KEY ix_events_start_date (start_date),
  KEY ix_events_target_audience (target_audience),
  KEY ix_events_organizer_id (organizer_id),
  CONSTRAINT fk_events_organizer FOREIGN KEY (organizer_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- tags  +  event_tags (many-to-many)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tags (
  id   INT          NOT NULL AUTO_INCREMENT,
  name VARCHAR(50)  NOT NULL,
  slug VARCHAR(50)  NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY ix_tags_name (name),
  UNIQUE KEY ix_tags_slug (slug)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS event_tags (
  event_id INT NOT NULL,
  tag_id   INT NOT NULL,
  PRIMARY KEY (event_id, tag_id),
  CONSTRAINT fk_event_tags_event FOREIGN KEY (event_id)
    REFERENCES events (id) ON DELETE CASCADE,
  CONSTRAINT fk_event_tags_tag FOREIGN KEY (tag_id)
    REFERENCES tags (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- comments
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS comments (
  id         INT      NOT NULL AUTO_INCREMENT,
  event_id   INT      NOT NULL,
  user_id    INT      NOT NULL,
  content    TEXT     NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_comments_event_id (event_id),
  KEY ix_comments_user_id (user_id),
  CONSTRAINT fk_comments_event FOREIGN KEY (event_id)
    REFERENCES events (id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- interactions  (interested / participate signals)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS interactions (
  id         INT      NOT NULL AUTO_INCREMENT,
  user_id    INT      NOT NULL,
  event_id   INT      NOT NULL,
  type       ENUM('interested', 'participate') NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_interaction_user_event_type (user_id, event_id, type),
  KEY ix_interactions_user_id (user_id),
  KEY ix_interactions_event_id (event_id),
  CONSTRAINT fk_interactions_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_interactions_event FOREIGN KEY (event_id)
    REFERENCES events (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- favorites
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS favorites (
  id         INT      NOT NULL AUTO_INCREMENT,
  user_id    INT      NOT NULL,
  event_id   INT      NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_favorite_user_event (user_id, event_id),
  KEY ix_favorites_user_id (user_id),
  KEY ix_favorites_event_id (event_id),
  CONSTRAINT fk_favorites_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_favorites_event FOREIGN KEY (event_id)
    REFERENCES events (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- participations
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS participations (
  id            INT      NOT NULL AUTO_INCREMENT,
  user_id       INT      NOT NULL,
  event_id      INT      NOT NULL,
  status        ENUM('registered', 'cancelled', 'attended') NOT NULL DEFAULT 'registered',
  registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_participation_user_event (user_id, event_id),
  KEY ix_participations_user_id (user_id),
  KEY ix_participations_event_id (event_id),
  CONSTRAINT fk_participations_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_participations_event FOREIGN KEY (event_id)
    REFERENCES events (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
