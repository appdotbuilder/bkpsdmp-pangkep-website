
import { db } from '../db';
import { newsTable } from '../db/schema';
import { type GetByIdInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteNews = async (input: GetByIdInput): Promise<{ success: boolean }> => {
  try {
    // Delete the news article by ID
    const result = await db.delete(newsTable)
      .where(eq(newsTable.id, input.id))
      .execute();

    // Check if any rows were affected (i.e., if the news article existed)
    return { success: (result.rowCount ?? 0) > 0 };
  } catch (error) {
    console.error('News deletion failed:', error);
    throw error;
  }
};
