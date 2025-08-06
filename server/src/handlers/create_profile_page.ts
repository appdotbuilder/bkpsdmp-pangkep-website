
import { db } from '../db';
import { profilePagesTable } from '../db/schema';
import { type CreateProfilePageInput, type ProfilePage } from '../schema';

export const createProfilePage = async (input: CreateProfilePageInput): Promise<ProfilePage> => {
  try {
    // Insert profile page record
    const result = await db.insert(profilePagesTable)
      .values({
        page_type: input.page_type,
        title: input.title,
        content: input.content
      })
      .returning()
      .execute();

    // Return the created profile page
    return result[0];
  } catch (error) {
    console.error('Profile page creation failed:', error);
    throw error;
  }
};
