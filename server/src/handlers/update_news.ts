
import { db } from '../db';
import { newsTable } from '../db/schema';
import { type UpdateNewsInput, type News } from '../schema';
import { eq } from 'drizzle-orm';

export const updateNews = async (input: UpdateNewsInput): Promise<News> => {
  try {
    // Check if news article exists
    const existingNews = await db.select()
      .from(newsTable)
      .where(eq(newsTable.id, input.id))
      .execute();

    if (existingNews.length === 0) {
      throw new Error('News article not found');
    }

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

    if (input.thumbnail_url !== undefined) {
      updateData.thumbnail_url = input.thumbnail_url;
    }

    // Update the news article
    const result = await db.update(newsTable)
      .set(updateData)
      .where(eq(newsTable.id, input.id))
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('News update failed:', error);
    throw error;
  }
};
