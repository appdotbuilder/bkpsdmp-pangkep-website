
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { newsTable } from '../db/schema';
import { type CreateNewsInput, type UpdateNewsInput } from '../schema';
import { updateNews } from '../handlers/update_news';
import { eq } from 'drizzle-orm';

// Helper to create a test news article
const createTestNews = async (): Promise<number> => {
  const testNewsInput: CreateNewsInput = {
    title: 'Original Title',
    content: 'Original content',
    publication_date: new Date('2024-01-01'),
    thumbnail_url: 'https://example.com/original.jpg'
  };

  const result = await db.insert(newsTable)
    .values({
      title: testNewsInput.title,
      content: testNewsInput.content,
      publication_date: testNewsInput.publication_date,
      thumbnail_url: testNewsInput.thumbnail_url
    })
    .returning()
    .execute();

  return result[0].id;
};

describe('updateNews', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update all fields of a news article', async () => {
    const newsId = await createTestNews();

    const updateInput: UpdateNewsInput = {
      id: newsId,
      title: 'Updated Title',
      content: 'Updated content',
      publication_date: new Date('2024-02-01'),
      thumbnail_url: 'https://example.com/updated.jpg'
    };

    const result = await updateNews(updateInput);

    expect(result.id).toEqual(newsId);
    expect(result.title).toEqual('Updated Title');
    expect(result.content).toEqual('Updated content');
    expect(result.publication_date).toEqual(new Date('2024-02-01'));
    expect(result.thumbnail_url).toEqual('https://example.com/updated.jpg');
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should update only specific fields', async () => {
    const newsId = await createTestNews();

    const updateInput: UpdateNewsInput = {
      id: newsId,
      title: 'Only Title Updated'
    };

    const result = await updateNews(updateInput);

    expect(result.id).toEqual(newsId);
    expect(result.title).toEqual('Only Title Updated');
    expect(result.content).toEqual('Original content'); // Should remain unchanged
    expect(result.publication_date).toEqual(new Date('2024-01-01')); // Should remain unchanged
    expect(result.thumbnail_url).toEqual('https://example.com/original.jpg'); // Should remain unchanged
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should set thumbnail_url to null when explicitly provided', async () => {
    const newsId = await createTestNews();

    const updateInput: UpdateNewsInput = {
      id: newsId,
      thumbnail_url: null
    };

    const result = await updateNews(updateInput);

    expect(result.id).toEqual(newsId);
    expect(result.thumbnail_url).toBeNull();
    expect(result.title).toEqual('Original Title'); // Should remain unchanged
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save updated news to database', async () => {
    const newsId = await createTestNews();

    const updateInput: UpdateNewsInput = {
      id: newsId,
      title: 'Database Test Title',
      content: 'Database test content'
    };

    await updateNews(updateInput);

    const savedNews = await db.select()
      .from(newsTable)
      .where(eq(newsTable.id, newsId))
      .execute();

    expect(savedNews).toHaveLength(1);
    expect(savedNews[0].title).toEqual('Database Test Title');
    expect(savedNews[0].content).toEqual('Database test content');
    expect(savedNews[0].updated_at).toBeInstanceOf(Date);
  });

  it('should throw error when news article does not exist', async () => {
    const updateInput: UpdateNewsInput = {
      id: 999,
      title: 'Non-existent News'
    };

    await expect(updateNews(updateInput)).rejects.toThrow(/news article not found/i);
  });

  it('should update publication_date correctly', async () => {
    const newsId = await createTestNews();

    const newDate = new Date('2024-12-25');
    const updateInput: UpdateNewsInput = {
      id: newsId,
      publication_date: newDate
    };

    const result = await updateNews(updateInput);

    expect(result.publication_date).toEqual(newDate);
    expect(result.title).toEqual('Original Title'); // Should remain unchanged
  });
});
