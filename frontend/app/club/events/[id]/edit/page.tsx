"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import EventForm from "@/components/events/EventForm";
import EventFormShell from "@/components/events/EventFormShell";
import { SpinnerIcon } from "@/components/ui/icons";
import { useAuth } from "@/hooks/useAuth";
import { parseApiError } from "@/lib/utils";
import { eventService } from "@/services/event.service";
import type { EventItem } from "@/types/event";

export default function EditEventPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    eventService
      .get(params.id)
      .then((data) => {
        if (cancelled) return;
        if (user && data.created_by !== user.id) {
          toast.error("You can only edit events you created");
          router.replace(`/events/${data.id}`);
          return;
        }
        setEvent(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(parseApiError(err, "This event could not be loaded.").message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [params.id, router, user]);

  return (
    <EventFormShell title="Edit event" subtitle="Update the details students will see.">
      {loading && (
        <div className="flex items-center gap-3 text-ink-500 dark:text-ink-400">
          <SpinnerIcon />
          <span>Loading event...</span>
        </div>
      )}
      {!loading && error && <p className="text-red-600 dark:text-red-400">{error}</p>}
      {!loading && !error && event && <EventForm mode="edit" event={event} />}
    </EventFormShell>
  );
}
