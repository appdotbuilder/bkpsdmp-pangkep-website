
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { newsTable } from '../db/schema';
import { type CreateNewsInput } from '../schema';
import { createNews } from '../handlers/create_news';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateNewsInput = {
  title: 'Test News Article',
  content: 'This is a test news article content with detailed information.',
  publication_date: new Date('2024-01-15T10:00:00Z'),
  thumbnail_url: 'https://example.com/thumbnail.jpg'
};

// Test input with null thumbnail
const testInputNoThumbnail: CreateNewsInput = {
  title: 'News Without Thumbnail',
  content: 'This news article has no thumbnail image.',
  publication_date: new Date('2024-01-16T14:30:00Z'),
  thumbnail_url: null
};

describe('createNews', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a news article with thumbnail', async () => {
    const result = await createNews(testInput);

    // Basic field validation
    expect(result.title).toEqual('Test News Article');
    expect(result.content).toEqual(testInput.content);
    expect(result.publication_date).toEqual(testInput.publication_date);
    expect(result.thumbnail_url).toEqual('https://example.com/thumbnail.jpg');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeNull();
  });

  it('should create a news article without thumbnail', async () => {
    const result = await createNews(testInputNoThumbnail);

    // Basic field validation
    expect(result.title).toEqual('News Without Thumbnail');
    expect(result.content).toEqual(testInputNoThumbnail.content);
    expect(result.publication_date).toEqual(testInputNoThumbnail.publication_date);
    expect(result.thumbnail_url).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeNull();
  });

  it('should save news article to database', async () => {
    const result = await createNews(testInput);

    // Query the database to verify the news was saved
    const savedNews = await db.select()
      .from(newsTable)
      .where(eq(newsTable.id, result.id))
      .execute();

    expect(savedNews).toHaveLength(1);
    expect(savedNews[0].title).toEqual('Test News Article');
    expect(savedNews[0].content).toEqual(testInput.content);
    expect(new Date(savedNews[0].publication_date)).toEqual(testInput.publication_date);
    expect(savedNews[0].thumbnail_url).toEqual('https://example.com/thumbnail.jpg');
    expect(savedNews[0].created_at).toBeInstanceOf(Date);
    expect(savedNews[0].updated_at).toBeNull();
  });

  it('should handle publication date correctly', async () => {
    const futureDate = new Date('2025-06-01T09:00:00Z');
    const futureNewsInput: CreateNewsInput = {
      title: 'Future News',
      content: 'This news will be published in the future.',
      publication_date: futureDate,
      thumbnail_url: null
    };

    const result = await createNews(futureNewsInput);

    expect(result.publication_date).toEqual(futureDate);
    expect(result.publication_date.getTime()).toEqual(futureDate.getTime());

    // Verify in database
    const savedNews = await db.select()
      .from(newsTable)
      .where(eq(newsTable.id, result.id))
      .execute();

    expect(new Date(savedNews[0].publication_date).getTime()).toEqual(futureDate.getTime());
  });

  it('should auto-generate created_at timestamp', async () => {
    const beforeCreate = new Date();
    const result = await createNews(testInput);
    const afterCreate = new Date();

    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.created_at.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
    expect(result.created_at.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
  });
});
