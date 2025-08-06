
import { db } from '../db';
import { profilePagesTable } from '../db/schema';
import { type UpdateProfilePageInput, type ProfilePage } from '../schema';
import { eq } from 'drizzle-orm';

export const updateProfilePage = async (input: UpdateProfilePageInput): Promise<ProfilePage> => {
  try {
    // Build update object with only provided fields
    const updateData: Record<string, any> = {
      updated_at: new Date()
    };

    if (input.page_type !== undefined) {
      updateData['page_type'] = input.page_type;
    }
    if (input.title !== undefined) {
      updateData['title'] = input.title;
    }
    if (input.content !== undefined) {
      updateData['content'] = input.content;
    }

    // Update the profile page record
    const result = await db.update(profilePagesTable)
      .set(updateData)
      .where(eq(profilePagesTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Profile page with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Profile page update failed:', error);
    throw error;
  }
};
