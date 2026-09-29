export type TargetAudience = "students" | "clubs" | "everyone";
export type EventSort = "newest" | "oldest" | "closest";

export interface Tag {
  id: number;
  name: string;
  slug: string;
  key?: string;
  label?: string;
  category?: string;
}

export interface EventOrganizer {
  id: number;
  full_name: string;
}

export interface EventItem {
  id: number;
  title: string;
  description: string;
  desc?: string;
  date: string;
  registration_deadline: string | null;
  location: string;
  tags: Tag[];
  target_audience: TargetAudience;
  audience?: string;
  max_participants: number | null;
  image_url: string | null;
  registration_url: string | null;
  created_by: number;
  club?: string;
  organizer: EventOrganizer;
  is_published: boolean;
  interested_count: number;
  participants_count: number;
  interested?: number;
  going?: number;
  user_interested?: boolean;
  user_participating?: boolean;
  created_at: string;
  updated_at: string;
}

export interface InteractionResponse {
  status: string;
  action: "added" | "removed";
  type: string;
  user_interested: boolean;
  user_participating: boolean;
  interested_count: number;
  participants_count: number;
  interested: number;
  going: number;
}


export interface PaginatedEvents {
  items: EventItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface EventFormValues {
  title: string;
  description: string;
  date: string;
  registration_deadline: string;
  location: string;
  tags: string[];
  target_audience: TargetAudience;
  max_participants: string;
  registration_url: string;
}

export interface EventListParams {
  tags?: string[];
  target?: TargetAudience;
  search?: string;
  upcoming?: boolean;
  page?: number;
  page_size?: number;
  sort?: EventSort;
}

export const TARGET_AUDIENCE_OPTIONS: Array<{ value: TargetAudience; label: string }> = [
  { value: "everyone", label: "Everyone" },
  { value: "students", label: "Students" },
  { value: "clubs", label: "Clubs" },
];

export const SORT_OPTIONS: Array<{ value: EventSort; label: string }> = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "closest", label: "Closest date" },
];
