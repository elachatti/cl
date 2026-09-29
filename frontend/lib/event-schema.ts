import { z } from "zod";

const MAX_TAGS = 8;
const MAX_TAG_LENGTH = 30;
const MAX_IMAGE_MB = 5;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const urlOrEmpty = z
  .string()
  .trim()
  .refine((value) => value === "" || /^https?:\/\/.+/i.test(value), {
    message: "Must start with http:// or https://",
  });

export const eventFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title is required (at least 3 characters)")
      .max(200, "Title must be at most 200 characters"),
    description: z
      .string()
      .trim()
      .min(10, "Description is required (at least 10 characters)")
      .max(10000, "Description is too long"),
    date: z.string().min(1, "Event date and time are required"),
    registration_deadline: z.string().optional().default(""),
    location: z.string().trim().min(2, "Location is required"),
    tags: z
      .array(z.string().trim().min(1).max(MAX_TAG_LENGTH, `Tags must be at most ${MAX_TAG_LENGTH} characters`))
      .max(MAX_TAGS, `You can add at most ${MAX_TAGS} tags`)
      .default([]),
    target_audience: z.enum(["students", "clubs", "everyone"]),
    max_participants: z
      .string()
      .optional()
      .default("")
      .refine((value) => value === "" || (/^\d+$/.test(value) && Number(value) >= 1), {
        message: "Must be a whole number of 1 or more",
      }),
    registration_url: urlOrEmpty.optional().default(""),
    image: z
      .instanceof(File)
      .optional()
      .nullable()
      .refine((file) => !file || ALLOWED_IMAGE_TYPES.includes(file.type), {
        message: "Only JPG, PNG or WEBP images are allowed",
      })
      .refine((file) => !file || file.size <= MAX_IMAGE_MB * 1024 * 1024, {
        message: `Image must be smaller than ${MAX_IMAGE_MB} MB`,
      }),
  })
  .superRefine((data, ctx) => {
    const date = new Date(data.date);
    if (Number.isNaN(date.getTime())) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["date"], message: "Enter a valid date and time" });
    } else if (date.getTime() <= Date.now()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["date"], message: "Event date must be in the future" });
    }

    if (data.registration_deadline) {
      const deadline = new Date(data.registration_deadline);
      if (Number.isNaN(deadline.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["registration_deadline"],
          message: "Enter a valid date and time",
        });
      } else if (!Number.isNaN(date.getTime()) && deadline.getTime() >= date.getTime()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["registration_deadline"],
          message: "Must be before the event date",
        });
      }
    }
  });

export type EventFormSchema = z.infer<typeof eventFormSchema>;
