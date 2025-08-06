
import { db } from '../db';
import { profilePagesTable } from '../db/schema';
import { type GetProfilePageByTypeInput, type ProfilePage } from '../schema';
import { eq } from 'drizzle-orm';

export const getProfilePageByType = async (input: GetProfilePageByTypeInput): Promise<ProfilePage | null> => {
  try {
    const results = await db.select()
      .from(profilePagesTable)
      .where(eq(profilePagesTable.page_type, input.page_type))
      .execute();

    if (results.length === 0) {
      return null;
    }

    return results[0];
  } catch (error) {
    console.error('Profile page fetch failed:', error);
    throw error;
  }
};
