
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Schema imports
import {
  createNewsInputSchema,
  updateNewsInputSchema,
  createAnnouncementInputSchema,
  updateAnnouncementInputSchema,
  createProfilePageInputSchema,
  updateProfilePageInputSchema,
  createDownloadInputSchema,
  updateDownloadInputSchema,
  incrementDownloadHitsInputSchema,
  getByIdInputSchema,
  getProfilePageByTypeInputSchema
} from './schema';

// Handler imports
import { createNews } from './handlers/create_news';
import { getNews } from './handlers/get_news';
import { getNewsById } from './handlers/get_news_by_id';
import { updateNews } from './handlers/update_news';
import { deleteNews } from './handlers/delete_news';

import { createAnnouncement } from './handlers/create_announcement';
import { getAnnouncements } from './handlers/get_announcements';
import { getAnnouncementById } from './handlers/get_announcement_by_id';
import { updateAnnouncement } from './handlers/update_announcement';
import { deleteAnnouncement } from './handlers/delete_announcement';

import { createProfilePage } from './handlers/create_profile_page';
import { getProfilePages } from './handlers/get_profile_pages';
import { getProfilePageByType } from './handlers/get_profile_page_by_type';
import { updateProfilePage } from './handlers/update_profile_page';
import { deleteProfilePage } from './handlers/delete_profile_page';

import { createDownload } from './handlers/create_download';
import { getDownloads } from './handlers/get_downloads';
import { getDownloadById } from './handlers/get_download_by_id';
import { updateDownload } from './handlers/update_download';
import { deleteDownload } from './handlers/delete_download';
import { incrementDownloadHits } from './handlers/increment_download_hits';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // News routes
  createNews: publicProcedure
    .input(createNewsInputSchema)
    .mutation(({ input }) => createNews(input)),
  getNews: publicProcedure
    .query(() => getNews()),
  getNewsById: publicProcedure
    .input(getByIdInputSchema)
    .query(({ input }) => getNewsById(input)),
  updateNews: publicProcedure
    .input(updateNewsInputSchema)
    .mutation(({ input }) => updateNews(input)),
  deleteNews: publicProcedure
    .input(getByIdInputSchema)
    .mutation(({ input }) => deleteNews(input)),

  // Announcements routes
  createAnnouncement: publicProcedure
    .input(createAnnouncementInputSchema)
    .mutation(({ input }) => createAnnouncement(input)),
  getAnnouncements: publicProcedure
    .query(() => getAnnouncements()),
  getAnnouncementById: publicProcedure
    .input(getByIdInputSchema)
    .query(({ input }) => getAnnouncementById(input)),
  updateAnnouncement: publicProcedure
    .input(updateAnnouncementInputSchema)
    .mutation(({ input }) => updateAnnouncement(input)),
  deleteAnnouncement: publicProcedure
    .input(getByIdInputSchema)
    .mutation(({ input }) => deleteAnnouncement(input)),

  // Profile pages routes
  createProfilePage: publicProcedure
    .input(createProfilePageInputSchema)
    .mutation(({ input }) => createProfilePage(input)),
  getProfilePages: publicProcedure
    .query(() => getProfilePages()),
  getProfilePageByType: publicProcedure
    .input(getProfilePageByTypeInputSchema)
    .query(({ input }) => getProfilePageByType(input)),
  updateProfilePage: publicProcedure
    .input(updateProfilePageInputSchema)
    .mutation(({ input }) => updateProfilePage(input)),
  deleteProfilePage: publicProcedure
    .input(getByIdInputSchema)
    .mutation(({ input }) => deleteProfilePage(input)),

  // Downloads routes
  createDownload: publicProcedure
    .input(createDownloadInputSchema)
    .mutation(({ input }) => createDownload(input)),
  getDownloads: publicProcedure
    .query(() => getDownloads()),
  getDownloadById: publicProcedure
    .input(getByIdInputSchema)
    .query(({ input }) => getDownloadById(input)),
  updateDownload: publicProcedure
    .input(updateDownloadInputSchema)
    .mutation(({ input }) => updateDownload(input)),
  deleteDownload: publicProcedure
    .input(getByIdInputSchema)
    .mutation(({ input }) => deleteDownload(input)),
  incrementDownloadHits: publicProcedure
    .input(incrementDownloadHitsInputSchema)
    .mutation(({ input }) => incrementDownloadHits(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
