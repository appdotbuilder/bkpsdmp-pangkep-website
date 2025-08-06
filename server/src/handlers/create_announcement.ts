
import { db } from '../db';
import { announcementsTable } from '../db/schema';
import { type CreateAnnouncementInput, type Announcement } from '../schema';

export const createAnnouncement = async (input: CreateAnnouncementInput): Promise<Announcement> => {
  try {
    // Insert announcement record
    const result = await db.insert(announcementsTable)
      .values({
        title: input.title,
        content: input.content,
        publication_date: input.publication_date
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Announcement creation failed:', error);
    throw error;
  }
};
