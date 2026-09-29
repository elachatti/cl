// Constantes partagées entre les pages et composants (Plateforme-clubi)

export interface TagMetaItem {
  label: string;
  category: "tech" | "cyber" | "musique" | "sport" | "arts" | "business";
}

export const TAG_META: Record<string, TagMetaItem> = {
  ia: { label: "IA", category: "tech" },
  cyber: { label: "Cybersécurité", category: "cyber" },
  web: { label: "Développement web", category: "tech" },
  musique: { label: "Musique", category: "musique" },
  sport: { label: "Sport", category: "sport" },
  design: { label: "Design", category: "arts" },
  photo: { label: "Photo", category: "arts" },
  entrepreneuriat: { label: "Entrepreneuriat", category: "business" },
};

export const CATEGORY_COLOR: Record<string, string> = {
  tech: "var(--tag-tech)",
  cyber: "var(--tag-cyber)",
  musique: "var(--tag-musique)",
  sport: "var(--tag-sport)",
  arts: "var(--tag-arts)",
  business: "var(--tag-business)",
};

export function tagAccent(tagKey?: string): string {
  if (!tagKey) return "var(--ink)";
  const meta = TAG_META[tagKey.toLowerCase()];
  return meta ? CATEGORY_COLOR[meta.category] : "var(--ink)";
}

export interface ClubiEvent {
  id: number | string;
  club: string;
  title: string;
  date: string;
  location: string;
  tags: string[];
  desc: string;
  description?: string;
  audience?: string;
  interested: number;
  going: number;
}

// Utilisés uniquement si le backend FastAPI est injoignable (dev hors-ligne)
export const MOCK_EVENTS: ClubiEvent[] = [
  {
    id: 1,
    club: "Club Cybersécurité",
    title: "Capture The Flag — nuit blanche",
    date: "24 sept.",
    location: "Amphi B",
    tags: ["cyber"],
    desc: "Une nuit de CTF en équipes de 3, du reverse au web exploitation.",
    description: "Une nuit de CTF en équipes de 3, du reverse au web exploitation.",
    audience: "tous",
    interested: 34,
    going: 12,
  },
  {
    id: 2,
    club: "Club IA & Data",
    title: "Atelier : construire son premier modèle de classification",
    date: "27 sept.",
    location: "Salle info 3",
    tags: ["ia"],
    desc: "On code ensemble un classifieur en Python, aucun prérequis en ML.",
    description: "On code ensemble un classifieur en Python, aucun prérequis en ML.",
    audience: "tous",
    interested: 51,
    going: 22,
  },
  {
    id: 3,
    club: "Club Musique",
    title: "Scène ouverte de rentrée",
    date: "20 sept.",
    location: "Foyer étudiant",
    tags: ["musique"],
    desc: "Chante, joue, slame — 5 min par passage sur scène.",
    description: "Chante, joue, slame — 5 min par passage sur scène.",
    audience: "tous",
    interested: 40,
    going: 28,
  },
];

// Intérêts déclarés par l'étudiant pour trier le panneau
export const USER_INTERESTS: string[] = ["ia", "cyber", "web"];
