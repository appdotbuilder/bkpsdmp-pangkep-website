
import { db } from '../db';
import { announcementsTable } from '../db/schema';
import { type UpdateAnnouncementInput, type Announcement } from '../schema';
import { eq } from 'drizzle-orm';

export const updateAnnouncement = async (input: UpdateAnnouncementInput): Promise<Announcement> => {
  try {
    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date()
    };

    if (input.title !== undefined) {
      updateData.title = input.title;
    }

    if (input.content !== undefined) {
      updateData.content = input.content;
    }

    if (input.publication_date !== undefined) {
      updateData.publication_date = input.publication_date;
    }

    // Update announcement record
    const result = await db.update(announcementsTable)
      .set(updateData)
      .where(eq(announcementsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Announcement with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Announcement update failed:', error);
    throw error;
  }
};
