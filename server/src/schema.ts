
import { z } from 'zod';

// News schema
export const newsSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  publication_date: z.coerce.date(),
  thumbnail_url: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date().nullable()
});

export type News = z.infer<typeof newsSchema>;

// Input schema for creating news
export const createNewsInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  publication_date: z.coerce.date(),
  thumbnail_url: z.string().url().nullable()
});

export type CreateNewsInput = z.infer<typeof createNewsInputSchema>;

// Input schema for updating news
export const updateNewsInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  publication_date: z.coerce.date().optional(),
  thumbnail_url: z.string().url().nullable().optional()
});

export type UpdateNewsInput = z.infer<typeof updateNewsInputSchema>;

// Announcements schema
export const announcementSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  publication_date: z.coerce.date(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date().nullable()
});

export type Announcement = z.infer<typeof announcementSchema>;

// Input schema for creating announcements
export const createAnnouncementInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  publication_date: z.coerce.date()
});

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementInputSchema>;

// Input schema for updating announcements
export const updateAnnouncementInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  publication_date: z.coerce.date().optional()
});

export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementInputSchema>;

// Profile pages enum
export const profilePageTypeSchema = z.enum(['visi_misi', 'struktur_organisasi', 'sejarah']);
export type ProfilePageType = z.infer<typeof profilePageTypeSchema>;

// Profile pages schema
export const profilePageSchema = z.object({
  id: z.number(),
  page_type: profilePageTypeSchema,
  title: z.string(),
  content: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date().nullable()
});

export type ProfilePage = z.infer<typeof profilePageSchema>;

// Input schema for creating profile pages
export const createProfilePageInputSchema = z.object({
  page_type: profilePageTypeSchema,
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required")
});

export type CreateProfilePageInput = z.infer<typeof createProfilePageInputSchema>;

// Input schema for updating profile pages
export const updateProfilePageInputSchema = z.object({
  id: z.number(),
  page_type: profilePageTypeSchema.optional(),
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional()
});

export type UpdateProfilePageInput = z.infer<typeof updateProfilePageInputSchema>;

// Downloads schema
export const downloadSchema = z.object({
  id: z.number(),
  title: z.string(),
  category: z.string(),
  publisher: z.string(),
  file_url: z.string(),
  file_name: z.string(),
  hits: z.number().int(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date().nullable()
});

export type Download = z.infer<typeof downloadSchema>;

// Input schema for creating downloads
export const createDownloadInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.string().min(1, "Category is required"),
  publisher: z.string().min(1, "Publisher is required"),
  file_url: z.string().url("Invalid file URL"),
  file_name: z.string().min(1, "File name is required")
});

export type CreateDownloadInput = z.infer<typeof createDownloadInputSchema>;

// Input schema for updating downloads
export const updateDownloadInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  publisher: z.string().min(1).optional(),
  file_url: z.string().url().optional(),
  file_name: z.string().min(1).optional()
});

export type UpdateDownloadInput = z.infer<typeof updateDownloadInputSchema>;

// Input schema for incrementing download hits
export const incrementDownloadHitsInputSchema = z.object({
  id: z.number()
});

export type IncrementDownloadHitsInput = z.infer<typeof incrementDownloadHitsInputSchema>;

// Input schema for getting single items
export const getByIdInputSchema = z.object({
  id: z.number()
});

export type GetByIdInput = z.infer<typeof getByIdInputSchema>;

// Input schema for getting profile page by type
export const getProfilePageByTypeInputSchema = z.object({
  page_type: profilePageTypeSchema
});

export type GetProfilePageByTypeInput = z.infer<typeof getProfilePageByTypeInputSchema>;
