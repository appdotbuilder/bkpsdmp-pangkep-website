
import { serial, text, pgTable, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';

// Profile page type enum
export const profilePageTypeEnum = pgEnum('profile_page_type', ['visi_misi', 'struktur_organisasi', 'sejarah']);

// News table
export const newsTable = pgTable('news', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  publication_date: timestamp('publication_date').notNull(),
  thumbnail_url: text('thumbnail_url'), // Nullable by default
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at')
});

// Announcements table
export const announcementsTable = pgTable('announcements', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  publication_date: timestamp('publication_date').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at')
});

// Profile pages table
export const profilePagesTable = pgTable('profile_pages', {
  id: serial('id').primaryKey(),
  page_type: profilePageTypeEnum('page_type').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at')
});

// Downloads table
export const downloadsTable = pgTable('downloads', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  publisher: text('publisher').notNull(),
  file_url: text('file_url').notNull(),
  file_name: text('file_name').notNull(),
  hits: integer('hits').default(0).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at')
});

// TypeScript types for the table schemas
export type News = typeof newsTable.$inferSelect;
export type NewNews = typeof newsTable.$inferInsert;

export type Announcement = typeof announcementsTable.$inferSelect;
export type NewAnnouncement = typeof announcementsTable.$inferInsert;

export type ProfilePage = typeof profilePagesTable.$inferSelect;
export type NewProfilePage = typeof profilePagesTable.$inferInsert;

export type Download = typeof downloadsTable.$inferSelect;
export type NewDownload = typeof downloadsTable.$inferInsert;

// Export all tables for proper query building
export const tables = {
  news: newsTable,
  announcements: announcementsTable,
  profilePages: profilePagesTable,
  downloads: downloadsTable
};
