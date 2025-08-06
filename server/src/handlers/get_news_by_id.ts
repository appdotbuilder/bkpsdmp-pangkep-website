
import { db } from '../db';
import { newsTable } from '../db/schema';
import { type GetByIdInput, type News } from '../schema';
import { eq } from 'drizzle-orm';

export const getNewsById = async (input: GetByIdInput): Promise<News | null> => {
  try {
    const result = await db.select()
      .from(newsTable)
      .where(eq(newsTable.id, input.id))
      .limit(1)
      .execute();

    if (result.length === 0) {
      return null;
    }

    return result[0];
  } catch (error) {
    console.error('Failed to get news by id:', error);
    throw error;
  }
};
