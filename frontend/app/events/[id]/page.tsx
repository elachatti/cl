"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { HeaderActions } from "@/components/layout/HomeActions";
import Logo from "@/components/layout/Logo";
import ThemeToggle from "@/components/layout/ThemeToggle";
import Button from "@/components/ui/Button";
import { SpinnerIcon } from "@/components/ui/icons";
import { useAuth } from "@/hooks/useAuth";
import { formatDateTime, parseApiError, resolveMediaUrl } from "@/lib/utils";
import { eventService } from "@/services/event.service";
import { TARGET_AUDIENCE_OPTIONS } from "@/types/event";
import type { EventItem } from "@/types/event";

export default function EventDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    eventService
      .get(params.id)
      .then((data) => {
        if (!cancelled) setEvent(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(parseApiError(err, "This event could not be found.").message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  async function handleDelete() {
    if (!event || !window.confirm("Delete this event? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await eventService.remove(event.id);
      toast.success("Event deleted");
      router.push("/events");
    } catch (err) {
      toast.error("Could not delete event", { description: parseApiError(err).message });
    } finally {
      setDeleting(false);
    }
  }

  const isOwner = !!user && !!event && user.id === event.created_by;
  const imageUrl = event ? resolveMediaUrl(event.image_url) : null;
  const audienceLabel = event
    ? TARGET_AUDIENCE_OPTIONS.find((option) => option.value === event.target_audience)?.label
    : "";

  return (
    <div className="min-h-screen">
      <header className="border-b border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-900">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-3">
            <HeaderActions />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link href="/events" className="text-sm font-medium text-cobalt-600 hover:underline dark:text-cobalt-300">
          ← Back to events
        </Link>

        {loading && (
          <div className="mt-10 flex items-center gap-3 text-ink-500 dark:text-ink-400">
            <SpinnerIcon />
            <span>Loading event...</span>
          </div>
        )}

        {!loading && error && (
          <p className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </p>
        )}

        {!loading && !error && event && (
          <article className="mt-6">
            {imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={event.title}
                className="aspect-[16/9] w-full rounded-2xl border border-ink-200 object-cover dark:border-ink-800"
              />
            )}

            <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-ink-900 dark:text-white">
                  {event.title}
                </h1>
                <p className="mt-1 text-ink-500 dark:text-ink-300">Organized by {event.organizer.full_name}</p>
              </div>

              {isOwner && (
                <div className="flex gap-2">
                  <Link
                    href={`/club/events/${event.id}/edit`}
                    className="inline-flex h-10 items-center justify-center rounded-lg border border-ink-200 bg-white px-4 text-sm font-semibold text-ink-800 transition-colors hover:bg-ink-50 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-100 dark:hover:bg-ink-700"
                  >
                    Edit
                  </Link>
                  <Button
                    variant="secondary"
                    className="!h-10 !border-red-200 !text-red-600 hover:!bg-red-50 dark:!border-red-500/30 dark:!text-red-300"
                    onClick={handleDelete}
                    loading={deleting}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>

            <dl className="mt-6 grid gap-4 rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-400 dark:text-ink-500">
                  Date and time
                </dt>
                <dd className="mt-1 text-[15px] text-ink-900 dark:text-white">{formatDateTime(event.date)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-400 dark:text-ink-500">
                  Location
                </dt>
                <dd className="mt-1 text-[15px] text-ink-900 dark:text-white">{event.location}</dd>
              </div>
              {event.registration_deadline && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-ink-400 dark:text-ink-500">
                    Registration deadline
                  </dt>
                  <dd className="mt-1 text-[15px] text-ink-900 dark:text-white">
                    {formatDateTime(event.registration_deadline)}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-400 dark:text-ink-500">
                  Audience
                </dt>
                <dd className="mt-1 text-[15px] text-ink-900 dark:text-white">{audienceLabel}</dd>
              </div>
              {event.max_participants && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-ink-400 dark:text-ink-500">
                    Maximum participants
                  </dt>
                  <dd className="mt-1 text-[15px] text-ink-900 dark:text-white">{event.max_participants}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-400 dark:text-ink-500">
                  Interest
                </dt>
                <dd className="mt-1 text-[15px] text-ink-900 dark:text-white">
                  {event.interested_count} interested · {event.participants_count} joining
                </dd>
              </div>
            </dl>

            {event.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="rounded-full bg-ink-100 px-3 py-1 text-sm font-medium text-ink-600 dark:bg-ink-800 dark:text-ink-300"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-6 whitespace-pre-line text-[15px] leading-relaxed text-ink-700 dark:text-ink-200">
              {event.description}
            </div>

            {event.registration_url && (
              <a
                href={event.registration_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex h-11 items-center justify-center rounded-lg bg-cobalt-600 px-6 text-[15px] font-semibold text-white transition-colors hover:bg-cobalt-700"
              >
                Register for this event
              </a>
            )}
          </article>
        )}
      </main>
    </div>
  );
}
