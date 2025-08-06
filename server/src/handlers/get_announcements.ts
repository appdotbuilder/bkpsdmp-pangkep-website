
import { db } from '../db';
import { announcementsTable } from '../db/schema';
import { type Announcement } from '../schema';
import { desc } from 'drizzle-orm';

export const getAnnouncements = async (): Promise<Announcement[]> => {
  try {
    const results = await db.select()
      .from(announcementsTable)
      .orderBy(desc(announcementsTable.publication_date))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to get announcements:', error);
    throw error;
  }
};
