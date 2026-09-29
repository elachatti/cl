import { getToken } from "./token-storage";
import { MOCK_EVENTS } from "./data";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "http://localhost:8001";

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (typeof window !== "undefined") {
    const token =
      getToken() ||
      localStorage.getItem("act_token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("access_token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchEvents(tags: string[] = []) {
  const query = tags.length ? `?tags=${tags.join(",")}` : "";
  try {
    let res = await fetch(`${API_BASE}/api/events${query}`, { cache: "no-store" });
    if (res.status === 404) {
      res = await fetch(`${API_BASE}/events${query}`, { cache: "no-store" });
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : (data.items || MOCK_EVENTS);
  } catch (err: any) {
    console.warn("Backend injoignable, utilisation des données mock :", err?.message);
    return MOCK_EVENTS;
  }
}

export async function createEvent(payload: any) {
  const headers = getAuthHeaders();

  // Normalize description fields for compatibility
  const descriptionText = payload.desc || payload.description || "";
  const normalizedPayload = {
    ...payload,
    desc: descriptionText,
    description: descriptionText,
  };

  // Try /api/events first, fallback to /events if 404
  let res = await fetch(`${API_BASE}/api/events`, {
    method: "POST",
    headers,
    body: JSON.stringify(normalizedPayload),
  });

  if (res.status === 404) {
    res = await fetch(`${API_BASE}/events`, {
      method: "POST",
      headers,
      body: JSON.stringify(normalizedPayload),
    });
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    let msg = "Échec de la création de l'événement";
    if (typeof errData.detail === "string") {
      msg = errData.detail;
    } else if (Array.isArray(errData.detail) && errData.detail.length > 0) {
      msg = errData.detail.map((d: any) => d.msg || d.message).join(", ");
    }
    throw new Error(msg);
  }

  return res.json();
}

export async function postInteraction(eventId: number | string, type: "interested" | "going") {
  const headers = getAuthHeaders();
  try {
    let res = await fetch(`${API_BASE}/api/events/${eventId}/interact?type=${type}`, {
      method: "POST",
      headers,
    });
    if (res.status === 404) {
      await fetch(`${API_BASE}/events/${eventId}/interact?type=${type}`, {
        method: "POST",
        headers,
      });
    }
  } catch (err: any) {
    console.warn("Impossible d'enregistrer l'interaction :", err?.message);
  }
}
