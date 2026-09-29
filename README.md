# 📌 Clubi — Plateforme & Panneau d'Événements Universitaires

> **Projet unifié & fusionné** regroupant l'ensemble des travaux du binôme (**Plateforme-clubi** & **CLUBI_V2.0**).
> Cette version unifiée intègre l'ensemble du **Frontend** (Next.js, TypeScript, TailwindCSS, vue Panneau de liège / Corkboard & Grille moderne) et du **Backend** (FastAPI, SQLAlchemy, authentification JWT, gestion des rôles, publication d'événements, interactions et upload d'images).

---

## 🌟 Fonctionnalités Unifiées

### 📰 1. Fil d'actualité & « Le Panneau » (Le fil des clubs)
- **Double vue au choix** :
  - 📌 **Mode Panneau** : Texture authentique de tableau en liège, cartes notes adhésives avec épingle 3D réaliste, inclinaisons subtiles et bordures thématiques colorées.
  - ▦ **Mode Grille** : Affichage moderne en grille responsive épurée.
- **Filtres intelligents par thématiques** : IA & Data, Cybersécurité, Développement web, Musique, Sport, Design, Photo & Vidéo, Entrepreneuriat.
- **Scoring prédictif** : Les événements correspondant aux centres d'intérêt de l'étudiant (`USER_INTERESTS`) sont automatiquement mis en avant.
- **Recherche en temps réel** : Recherche combinée par titre, nom de club, description et tags.
- **Interactions dynamiques** :
  - ★ **Intéressé** (incrément/décrément et sauvegarde instantanée)
  - ⚡ **Je participe** (inscription à l'événement)
  - ↗ **Partager** (copie instantanée du lien dans le presse-papiers)
  - 📄 **Détails** (page dédiée avec description complète, affiches et informations d'inscription)

### ➕ 2. Publication d'événements (`/publier` et `/club/events/create`)
- Formulaire intuitif de publication :
  - Titre, Date & heure, Lieu / salle
  - Sélecteur rapide de tags + ajout de tags personnalisés à la volée
  - Public cible (Tous les étudiants, Membres du club, Étudiants de la faculté)
  - Places limitées / illimitées
  - Upload d'affiche ou image de couverture avec prévisualisation immédiate
  - Lien d'inscription externe
  - Description complète
- **Mode démo & connecté** : Possibilité de publier immédiatement (rattaché au Club Démo) ou avec un compte club officiel connecté.
- Redirection automatique vers Le Panneau après publication.

### 🔐 3. Authentification & Rôles
- **3 rôles distincts** : Étudiant (`student`), Club (`club`), Administrateur (`admin`).
- **Sécurité** : Hachage bcrypt, tokens JWT sécurisés, vérification d'email et réinitialisation de mot de passe.
- **Tableaux de bord personnalisés** pour chaque rôle :
  - `/student/dashboard`
  - `/club/dashboard`
  - `/admin/dashboard`
- **Thème Sombre / Clair** persistant avec détection automatique.

### 🗄️ 4. Base de données Flexible & Compatible
- Compatible au choix avec :
  - **MySQL 8** (configuration par défaut)
  - **PostgreSQL / Neon / Supabase** (via la chaîne `DATABASE_URL`)
- Schémas SQL complets fournis dans le dossier `database/` :
  - `database/schema_mysql.sql`
  - `database/schema_postgres.sql`
- **Initialisation automatique** : Création automatique des tables et injection des tags et événements de démonstration au premier lancement.

---

## 🚀 Démarrage Rapide

### 1. Prérequis
- **Python 3.11+**
- **Node.js 18.18+** (Node 20 recommandé)
- **MySQL 8** ou **PostgreSQL (Neon)**

---

### 2. Démarrage du Backend (FastAPI)

```bash
cd backend

# 1. Créer et activer l'environnement virtuel
python -m venv .venv
# Sur Windows (PowerShell) :
.\.venv\Scripts\Activate.ps1
# Sur Linux / macOS :
source .venv/bin/activate

# 2. Installer les dépendances unifiées
pip install -r requirements.txt

# 3. Configurer l'environnement
# Le fichier .env est déjà présent. Si besoin, ajustez MYSQL_PASSWORD ou DATABASE_URL.

# 4. Lancer le serveur backend
uvicorn app.main:app --reload --port 8000
```

- **Documentation Swagger interactive** : [http://localhost:8000/docs](http://localhost:8000/docs)
- **Point d'entrée API** : [http://localhost:8000/api/events](http://localhost:8000/api/events)

---

### 3. Démarrage du Frontend (Next.js)

```bash
cd frontend

# 1. Installer les dépendances
npm install

# 2. Lancer le serveur de développement
npm run dev
```

- **Application Web** : [http://localhost:3000](http://localhost:3000)
- **Le Panneau (Fil d'actualité)** : [http://localhost:3000/feed](http://localhost:3000/feed)
- **Publier un événement** : [http://localhost:3000/publier](http://localhost:3000/publier)
- **Connexion** : [http://localhost:3000/login](http://localhost:3000/login)

---

## 🔑 Comptes de Démonstration Pré-configurés

| Rôle | Email | Mot de passe |
| :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `ChangeMe123` |
| **Club Démo** | `demo@clubi.app` | `club123456` |
| **Étudiant Démo** | `etudiant.demo@clubi.app` | `student123456` |
| **Étudiant** | `elaachatti198@gmail.com` | `password123` |

---

## 📁 Architecture du Projet Unifié

```
CLUBI_V2.0/
├── backend/
│   ├── app/
│   │   ├── auth/            # Sécurité JWT, hash bcrypt, dépendances
│   │   ├── database/        # Session SQLAlchemy, support multi-SGBD
│   │   ├── models/          # Modèles ORM (User, Event, Tag, Interaction...)
│   │   ├── routers/         # Endpoints (/events, /api/events, /auth...)
│   │   ├── schemas/         # Schémas Pydantic avec alias de compatibilité
│   │   ├── services/        # Services (events, auth, image upload, email)
│   │   ├── config.py        # Paramètres d'environnement
│   │   └── main.py          # Point d'entrée FastAPI unifié
│   ├── static/uploads/      # Stockage des affiches et images d'événements
│   ├── requirements.txt     # Dépendances unifiées
│   └── .env                 # Variables d'environnement
│
├── frontend/
│   ├── app/
│   │   ├── feed/            # Le Panneau d'événements (Corkboard & Grille)
│   │   ├── publier/         # Formulaire de publication d'événement unifié
│   │   ├── events/          # Liste et détail complet des événements
│   │   ├── club/            # Dashboard club et création avancée
│   │   ├── student/         # Dashboard étudiant
│   │   ├── admin/           # Dashboard administrateur
│   │   ├── login/ & register/ # Parcours d'authentification complet
│   │   └── globals.css      # Styles Tailwind + textures de liège et épingles 3D
│   ├── components/
│   │   ├── events/          # EventCard, EventsFeedClient, TagFilters, Form...
│   │   ├── layout/          # Navbar, Logo, ThemeToggle...
│   │   └── ui/              # Composants UI réutilisables
│   ├── lib/
│   │   ├── api.ts           # Client API avec fallback mock hors-ligne
│   │   ├── data.ts          # Métadonnées tags, couleurs, intérêts & mock events
│   │   └── utils.ts         # Utilitaires de formatage et dates
│   └── package.json         # Dépendances Next.js 15, React 19, Tailwind
│
├── database/
│   ├── schema_mysql.sql     # Script complet MySQL 8 avec données de départ
│   └── schema_postgres.sql  # Script complet PostgreSQL (Neon / Supabase)
│
└── Plateforme-clubi/        # Archive originale du binôme préservée
```
