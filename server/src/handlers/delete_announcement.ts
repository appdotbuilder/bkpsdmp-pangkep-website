
import { db } from '../db';
import { announcementsTable } from '../db/schema';
import { type GetByIdInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteAnnouncement = async (input: GetByIdInput): Promise<{ success: boolean }> => {
  try {
    const result = await db.delete(announcementsTable)
      .where(eq(announcementsTable.id, input.id))
      .execute();

    return { success: true };
  } catch (error) {
    console.error('Announcement deletion failed:', error);
    throw error;
  }
};
