
import { db } from '../db';
import { profilePagesTable } from '../db/schema';
import { type ProfilePage } from '../schema';

export const getProfilePages = async (): Promise<ProfilePage[]> => {
  try {
    const results = await db.select()
      .from(profilePagesTable)
      .execute();

    // Return the results - no numeric conversions needed for this table
    return results;
  } catch (error) {
    console.error('Failed to fetch profile pages:', error);
    throw error;
  }
};
