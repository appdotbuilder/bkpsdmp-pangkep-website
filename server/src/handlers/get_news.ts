
import { db } from '../db';
import { newsTable } from '../db/schema';
import { type News } from '../schema';
import { desc } from 'drizzle-orm';

export const getNews = async (): Promise<News[]> => {
  try {
    const results = await db.select()
      .from(newsTable)
      .orderBy(desc(newsTable.publication_date))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch news:', error);
    throw error;
  }
};
