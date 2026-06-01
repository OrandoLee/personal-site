import { z } from "zod";
import { uiText } from "@/content/uiText";

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, uiText.apiMessages.invalidDate);
const optionalText = z
  .string()
  .optional()
  .nullable()
  .transform((value) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  });

export const loginSchema = z.object({
  username: z.string().trim().min(1, uiText.apiMessages.inputUsername),
  password: z.string().min(1, uiText.apiMessages.inputPassword)
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, uiText.apiMessages.inputCurrentPassword),
    newPassword: z.string().min(8, uiText.apiMessages.newPasswordTooShort),
    confirmPassword: z.string().min(1, uiText.apiMessages.confirmPasswordRequired)
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: uiText.apiMessages.passwordMismatch,
    path: ["confirmPassword"]
  });

export const dailyUpdateSchema = z.object({
  title: z.string().trim().min(1, uiText.apiMessages.inputTitle),
  type: z.enum(["article", "image", "video", "note", "project"]),
  date: dateString,
  description: z.string().trim().min(1, uiText.apiMessages.inputDescription),
  cover: optionalText,
  link: optionalText,
  published: z.boolean().default(false)
});

export const articleSchema = z.object({
  title: z.string().trim().min(1, uiText.apiMessages.inputTitle),
  slug: z
    .string()
    .trim()
    .min(1, uiText.apiMessages.inputSlug)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, uiText.apiMessages.invalidSlug),
  date: dateString,
  category: z.string().trim().min(1, uiText.apiMessages.inputCategory),
  tags: z.array(z.string().trim().min(1)).default([]),
  summary: z.string().trim().min(1, uiText.apiMessages.inputSummary),
  cover: optionalText,
  content: z.string().trim().min(1, uiText.apiMessages.inputContent),
  published: z.boolean().default(false),
  featured: z.boolean().default(false)
});

export const gallerySchema = z.object({
  title: z.string().trim().min(1, uiText.apiMessages.inputTitle),
  slug: z
    .string()
    .trim()
    .min(1, uiText.apiMessages.inputSlug)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, uiText.apiMessages.invalidSlug),
  type: z.enum(["image", "video"]),
  src: z.string().trim().min(1, uiText.apiMessages.inputFileUrl),
  thumbnail: optionalText,
  date: dateString,
  description: z.string().trim().min(1, uiText.apiMessages.inputDescription),
  tags: z.array(z.string().trim().min(1)).default([]),
  category: z.enum(["image", "video", "poster", "animation", "experiment"]),
  published: z.boolean().default(false),
  featured: z.boolean().default(false)
});

export const oraskPatchSchema = z.object({
  read: z.boolean()
});

export type DailyUpdateInput = z.infer<typeof dailyUpdateSchema>;
export type ArticleInput = z.infer<typeof articleSchema>;
export type GalleryInput = z.infer<typeof gallerySchema>;
