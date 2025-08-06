
import { db } from '../db';
import { announcementsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type GetByIdInput, type Announcement } from '../schema';

export const getAnnouncementById = async (input: GetByIdInput): Promise<Announcement | null> => {
  try {
    const result = await db.select()
      .from(announcementsTable)
      .where(eq(announcementsTable.id, input.id))
      .execute();

    if (result.length === 0) {
      return null;
    }

    return result[0];
  } catch (error) {
    console.error('Get announcement by ID failed:', error);
    throw error;
  }
};
