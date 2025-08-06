
import { db } from '../db';
import { newsTable } from '../db/schema';
import { type CreateNewsInput, type News } from '../schema';

export const createNews = async (input: CreateNewsInput): Promise<News> => {
  try {
    // Insert news record
    const result = await db.insert(newsTable)
      .values({
        title: input.title,
        content: input.content,
        publication_date: input.publication_date,
        thumbnail_url: input.thumbnail_url
      })
      .returning()
      .execute();

    // Return the created news article
    const news = result[0];
    return {
      ...news,
      // Convert timestamp fields to Date objects if needed
      publication_date: new Date(news.publication_date),
      created_at: new Date(news.created_at),
      updated_at: news.updated_at ? new Date(news.updated_at) : null
    };
  } catch (error) {
    console.error('News creation failed:', error);
    throw error;
  }
};
