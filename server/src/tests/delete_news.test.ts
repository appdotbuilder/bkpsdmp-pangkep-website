
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { newsTable } from '../db/schema';
import { type GetByIdInput } from '../schema';
import { deleteNews } from '../handlers/delete_news';
import { eq } from 'drizzle-orm';

// Test input
const testInput: GetByIdInput = {
  id: 1
};

describe('deleteNews', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing news article', async () => {
    // Create a news article first
    await db.insert(newsTable)
      .values({
        title: 'Test News',
        content: 'Test content for news',
        publication_date: new Date(),
        thumbnail_url: 'https://example.com/image.jpg'
      })
      .execute();

    // Delete the news article
    const result = await deleteNews(testInput);

    expect(result.success).toBe(true);

    // Verify the news article is deleted from database
    const news = await db.select()
      .from(newsTable)
      .where(eq(newsTable.id, testInput.id))
      .execute();

    expect(news).toHaveLength(0);
  });

  it('should return false when trying to delete non-existent news', async () => {
    // Try to delete a news article that doesn't exist
    const result = await deleteNews({ id: 999 });

    expect(result.success).toBe(false);
  });

  it('should handle multiple news articles correctly', async () => {
    // Create multiple news articles
    await db.insert(newsTable)
      .values([
        {
          title: 'News 1',
          content: 'Content 1',
          publication_date: new Date(),
          thumbnail_url: null
        },
        {
          title: 'News 2', 
          content: 'Content 2',
          publication_date: new Date(),
          thumbnail_url: 'https://example.com/image2.jpg'
        }
      ])
      .execute();

    // Delete the first news article
    const result = await deleteNews({ id: 1 });

    expect(result.success).toBe(true);

    // Verify only the first article is deleted
    const remainingNews = await db.select()
      .from(newsTable)
      .execute();

    expect(remainingNews).toHaveLength(1);
    expect(remainingNews[0].title).toBe('News 2');
  });
});
