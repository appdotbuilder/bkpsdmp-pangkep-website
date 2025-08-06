
import { db } from '../db';
import { profilePagesTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type GetByIdInput } from '../schema';

export const deleteProfilePage = async (input: GetByIdInput): Promise<{ success: boolean }> => {
  try {
    // Delete the profile page by ID
    const result = await db.delete(profilePagesTable)
      .where(eq(profilePagesTable.id, input.id))
      .returning()
      .execute();

    // Return success status based on whether any rows were deleted
    return { success: result.length > 0 };
  } catch (error) {
    console.error('Profile page deletion failed:', error);
    throw error;
  }
};
