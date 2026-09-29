"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import TagInput from "@/components/events/TagInput";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { eventFormSchema, type EventFormSchema } from "@/lib/event-schema";
import { fromDatetimeLocalValue, parseApiError, resolveMediaUrl, toDatetimeLocalValue } from "@/lib/utils";
import { eventService, type EventPayload } from "@/services/event.service";
import { TARGET_AUDIENCE_OPTIONS } from "@/types/event";
import type { EventItem } from "@/types/event";

interface EventFormProps {
  mode: "create" | "edit";
  event?: EventItem;
}

function toDefaultValues(event?: EventItem): EventFormSchema {
  return {
    title: event?.title ?? "",
    description: event?.description ?? "",
    date: event ? toDatetimeLocalValue(event.date) : "",
    registration_deadline: event?.registration_deadline
      ? toDatetimeLocalValue(event.registration_deadline)
      : "",
    location: event?.location ?? "",
    tags: event?.tags.map((tag) => tag.name) ?? [],
    target_audience: event?.target_audience ?? "everyone",
    max_participants: event?.max_participants ? String(event.max_participants) : "",
    registration_url: event?.registration_url ?? "",
    image: undefined,
  };
}

export default function EventForm({ mode, event }: EventFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(resolveMediaUrl(event?.image_url));
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<EventFormSchema>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: toDefaultValues(event),
  });

  function handleImageChange(fileList: FileList | null) {
    const file = fileList?.[0] ?? null;
    setValue("image", file, { shouldValidate: true });
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(resolveMediaUrl(event?.image_url));
    }
  }

  function removeImage() {
    setValue("image", null, { shouldValidate: true });
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function onSubmit(values: EventFormSchema) {
    setSubmitting(true);
    try {
      let imageUrl = event?.image_url ?? null;
      if (values.image) {
        imageUrl = await eventService.uploadImage(values.image);
      } else if (previewUrl === null) {
        imageUrl = null;
      }

      const payload: EventPayload = {
        title: values.title,
        description: values.description,
        date: fromDatetimeLocalValue(values.date) as string,
        registration_deadline: fromDatetimeLocalValue(values.registration_deadline ?? ""),
        location: values.location,
        tags: values.tags,
        target_audience: values.target_audience,
        max_participants: values.max_participants ? Number(values.max_participants) : null,
        registration_url: values.registration_url ? values.registration_url : null,
        image_url: imageUrl,
      };

      if (mode === "create") {
        const created = await eventService.create(payload);
        toast.success("Event published", { description: created.title });
        router.push(`/events/${created.id}`);
      } else if (event) {
        const updated = await eventService.update(event.id, payload);
        toast.success("Event updated", { description: updated.title });
        router.push(`/events/${updated.id}`);
      }
    } catch (error) {
      toast.error(mode === "create" ? "Could not publish event" : "Could not update event", {
        description: parseApiError(error).message,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <Input label="Title" placeholder="e.g. Campus AI Hackathon" error={errors.title?.message} {...register("title")} />

      <Textarea
        label="Description"
        placeholder="What is this event about? What should attendees expect?"
        error={errors.description?.message}
        {...register("description")}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Event date and time"
          type="datetime-local"
          error={errors.date?.message}
          {...register("date")}
        />
        <Input
          label="Registration deadline (optional)"
          type="datetime-local"
          error={errors.registration_deadline?.message}
          {...register("registration_deadline")}
        />
      </div>

      <Input label="Location" placeholder="e.g. Engineering Building, Room 204" error={errors.location?.message} {...register("location")} />

      <Controller
        control={control}
        name="tags"
        render={({ field }) => (
          <TagInput label="Tags" value={field.value} onChange={field.onChange} error={errors.tags?.message} />
        )}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Select label="Target audience" error={errors.target_audience?.message} {...register("target_audience")}>
          {TARGET_AUDIENCE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <Input
          label="Maximum participants (optional)"
          type="number"
          min={1}
          inputMode="numeric"
          placeholder="No limit"
          error={errors.max_participants?.message}
          {...register("max_participants")}
        />
      </div>

      <Input
        label="External registration link (optional)"
        type="url"
        placeholder="https://forms.example.com/your-event"
        error={errors.registration_url?.message}
        {...register("registration_url")}
      />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-800 dark:text-ink-100">
          Event image (optional)
        </label>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex h-36 w-full max-w-xs items-center justify-center overflow-hidden rounded-lg border border-dashed border-ink-300 bg-ink-50 dark:border-ink-700 dark:bg-ink-800">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Event preview" className="h-full w-full object-cover" />
            ) : (
              <span className="px-4 text-center text-sm text-ink-400 dark:text-ink-500">No image selected</span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => handleImageChange(e.target.files)}
              className="text-sm text-ink-600 file:mr-3 file:rounded-lg file:border-0 file:bg-cobalt-50 file:px-3.5 file:py-2 file:text-sm file:font-semibold file:text-cobalt-700 hover:file:bg-cobalt-100 dark:text-ink-300 dark:file:bg-cobalt-400/15 dark:file:text-cobalt-200"
            />
            {previewUrl && (
              <button
                type="button"
                onClick={removeImage}
                className="self-start text-sm font-medium text-red-600 hover:underline dark:text-red-400"
              >
                Remove image
              </button>
            )}
            <p className="text-xs text-ink-500 dark:text-ink-400">JPG, PNG or WEBP, up to 5 MB.</p>
            {errors.image?.message && (
              <p className="text-sm text-red-600 dark:text-red-400">{String(errors.image.message)}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-ink-200 pt-6 dark:border-ink-800">
        <Button type="button" variant="secondary" onClick={() => router.back()} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {mode === "create" ? "Publish event" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
