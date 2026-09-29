import { api } from "@/services/api";
import type { EventItem, EventListParams, InteractionResponse, PaginatedEvents } from "@/types/event";

export interface EventPayload {
  title: string;
  description?: string;
  desc?: string;
  date: string; // ISO string
  registration_deadline?: string | null;
  location: string;
  tags: string[];
  target_audience?: string;
  audience?: string;
  max_participants?: number | null;
  registration_url?: string | null;
  image_url?: string | null;
}

function buildQuery(params: EventListParams): string {
  const search = new URLSearchParams();
  if (params.tags && params.tags.length > 0) search.set("tags", params.tags.join(","));
  if (params.target) search.set("target", params.target);
  if (params.search) search.set("search", params.search);
  if (params.upcoming) search.set("upcoming", "true");
  if (params.page) search.set("page", String(params.page));
  if (params.page_size) search.set("page_size", String(params.page_size));
  if (params.sort) search.set("sort", params.sort);
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const eventService = {
  async list(params: EventListParams): Promise<PaginatedEvents> {
    const { data } = await api.get<PaginatedEvents | EventItem[]>(`/events${buildQuery(params)}`);
    if (Array.isArray(data)) {
      return {
        items: data,
        total: data.length,
        page: 1,
        page_size: data.length,
        total_pages: 1,
      };
    }
    return data;
  },

  async get(id: number | string): Promise<EventItem> {
    const { data } = await api.get<EventItem>(`/events/${id}`);
    return data;
  },

  async create(payload: EventPayload): Promise<EventItem> {
    const { data } = await api.post<EventItem>("/events", payload);
    return data;
  },

  async update(id: number | string, payload: EventPayload): Promise<EventItem> {
    const { data } = await api.put<EventItem>(`/events/${id}`, payload);
    return data;
  },

  async remove(id: number | string): Promise<void> {
    await api.delete(`/events/${id}`);
  },

  async interact(id: number | string, type: "interested" | "going" | "participate"): Promise<InteractionResponse> {
    const { data } = await api.post<InteractionResponse>(`/events/${id}/interact?type=${type}`);
    return data;
  },

  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post<{ image_url: string }>("/events/upload-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.image_url;
  },
};

