
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { newsTable } from '../db/schema';
import { type GetByIdInput } from '../schema';
import { getNewsById } from '../handlers/get_news_by_id';

// Test input
const testInput: GetByIdInput = {
  id: 1
};

describe('getNewsById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return news when found', async () => {
    // Create test news first
    const newsData = {
      title: 'Test News Article',
      content: 'This is a test news article content',
      publication_date: new Date('2024-01-15'),
      thumbnail_url: 'https://example.com/thumbnail.jpg'
    };

    const insertResult = await db.insert(newsTable)
      .values(newsData)
      .returning()
      .execute();

    const createdNews = insertResult[0];

    // Test retrieval
    const result = await getNewsById({ id: createdNews.id });

    expect(result).toBeDefined();
    expect(result?.id).toEqual(createdNews.id);
    expect(result?.title).toEqual('Test News Article');
    expect(result?.content).toEqual(newsData.content);
    expect(result?.publication_date).toBeInstanceOf(Date);
    expect(result?.thumbnail_url).toEqual(newsData.thumbnail_url);
    expect(result?.created_at).toBeInstanceOf(Date);
  });

  it('should return null when news not found', async () => {
    const result = await getNewsById({ id: 999 });

    expect(result).toBeNull();
  });

  it('should handle news with null thumbnail_url', async () => {
    // Create test news with null thumbnail
    const newsData = {
      title: 'News Without Thumbnail',
      content: 'This news has no thumbnail',
      publication_date: new Date('2024-02-01'),
      thumbnail_url: null
    };

    const insertResult = await db.insert(newsTable)
      .values(newsData)
      .returning()
      .execute();

    const createdNews = insertResult[0];

    // Test retrieval
    const result = await getNewsById({ id: createdNews.id });

    expect(result).toBeDefined();
    expect(result?.id).toEqual(createdNews.id);
    expect(result?.title).toEqual('News Without Thumbnail');
    expect(result?.thumbnail_url).toBeNull();
  });
});
