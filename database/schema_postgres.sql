-- ============================================================
-- Base de données Clubi V2.0 — Schéma Complet PostgreSQL (Neon / Supabase / Local)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------
-- 1. Types ENUM
-- ------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'club', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE target_audience AS ENUM ('students', 'clubs', 'everyone');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE interaction_type AS ENUM ('interested', 'participate', 'going');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE participation_status AS ENUM ('registered', 'waitlist', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ------------------------------------------------------------
-- 2. Tables
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    avatar_url VARCHAR(500),
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    is_online BOOLEAN NOT NULL DEFAULT FALSE,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    registration_deadline TIMESTAMP WITH TIME ZONE,
    registration_url VARCHAR(500),
    image_url VARCHAR(500),
    target_audience target_audience NOT NULL DEFAULT 'everyone',
    max_participants INT,
    organizer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_tags (
    event_id INT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    tag_id INT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (event_id, tag_id)
);

CREATE TABLE IF NOT EXISTS interactions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id INT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    type interaction_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, event_id, type)
);

CREATE TABLE IF NOT EXISTS participations (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id INT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    status participation_status NOT NULL DEFAULT 'registered',
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, event_id)
);

CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id INT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id INT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, event_id)
);

-- ------------------------------------------------------------
-- Index pour performances
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_event_tags_tag ON event_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_interactions_event ON interactions(event_id);

-- ------------------------------------------------------------
-- Données initiales
-- ------------------------------------------------------------
INSERT INTO tags (id, name, slug) VALUES
    (1, 'IA', 'ia'),
    (2, 'Cybersécurité', 'cyber'),
    (3, 'Développement web', 'web'),
    (4, 'Musique', 'musique'),
    (5, 'Sport', 'sport'),
    (6, 'Design', 'design'),
    (7, 'Photo', 'photo'),
    (8, 'Entrepreneuriat', 'entrepreneuriat')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO users (id, full_name, email, password_hash, role, is_verified, is_active) VALUES
    (1, 'Platform Admin', 'admin@example.com', '$2b$12$P8D/77ryrXyyjv4kq4DmKeYpg0467qF.E.x5MPayw77XXrm6ttwMy', 'admin', true, true),
    (2, 'Club Démo', 'demo@clubi.app', '$2b$12$Qq0GY.DrkpUeZ/PW4bQwEuZRrBoMRwEAFTjzskukUvj3RAxMuEik2', 'club', true, true),
    (3, 'Étudiant Démo', 'etudiant.demo@clubi.app', '$2b$12$1NIoQ6yj.0eR//iGZa0Rq.GTB61QvK/vYr.5P9YIgWHYOQckqxxUW', 'student', true, true)
ON CONFLICT (email) DO NOTHING;

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('tags_id_seq', (SELECT MAX(id) FROM tags));

INSERT INTO events (id, title, description, location, start_date, target_audience, max_participants, organizer_id, is_published) VALUES
    (1, 'Capture The Flag — nuit blanche', 'Une nuit de CTF en équipes de 3, du reverse au web exploitation. Pizzas et boissons fournies !', 'Amphi B', NOW() + INTERVAL '3 days', 'everyone', 60, 2, true),
    (2, 'Atelier : construire son premier modèle de classification', 'On code ensemble un classifieur en Python, aucun prérequis en machine learning.', 'Salle info 3', NOW() + INTERVAL '5 days', 'everyone', 35, 2, true),
    (3, 'Scène ouverte de rentrée', 'Chante, joue, slame — 5 min par passage sur scène.', 'Foyer étudiant', NOW() + INTERVAL '7 days', 'everyone', 120, 2, true)
ON CONFLICT (id) DO NOTHING;

SELECT setval('events_id_seq', (SELECT MAX(id) FROM events));

INSERT INTO event_tags (event_id, tag_id) VALUES
    (1, 2),
    (2, 1),
    (2, 3),
    (3, 4),
    (3, 6)
ON CONFLICT DO NOTHING;

INSERT INTO interactions (user_id, event_id, type) VALUES
    (3, 1, 'interested'),
    (3, 2, 'participate')
ON CONFLICT DO NOTHING;
