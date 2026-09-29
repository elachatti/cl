-- =====================================================================
-- Migration 002 — Event publication (Feature 1) + News feed (Feature 2)
-- Run this only if your `events` table was already created from the
-- Module 1 version of schema.sql. New installs can just run schema.sql.
-- Usage:  mysql -u root -p ai_career_companion < migrations/002_events_publication_and_feed.sql
-- =====================================================================

USE ai_career_companion;

-- category / event_type are no longer required (classification now uses tags).
ALTER TABLE events
  MODIFY COLUMN category ENUM(
    'artificial_intelligence', 'cybersecurity', 'web_development',
    'mobile', 'cloud', 'data_science', 'robotics', 'devops', 'game_development'
  ) NULL,
  MODIFY COLUMN event_type ENUM('hackathon', 'competition', 'workshop', 'conference') NULL,
  MODIFY COLUMN location VARCHAR(255) NOT NULL;
ALTER TABLE events
    ADD COLUMN target_audience ENUM('students', 'clubs', 'everyone')
    NOT NULL DEFAULT 'everyone'
    AFTER image_url;

ALTER TABLE events
    ADD COLUMN max_participants INT NULL
    AFTER target_audience;
-- Run once. If you re-run this migration, drop the index first
-- (ALTER TABLE events DROP INDEX ix_events_target_audience) to avoid a duplicate-key error.
ALTER TABLE events
  ADD KEY ix_events_target_audience (target_audience);

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
