
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { newsTable } from '../db/schema';
import { type CreateNewsInput } from '../schema';
import { getNews } from '../handlers/get_news';

// Test data
const testNews1: Omit<CreateNewsInput, 'publication_date'> & { publication_date: Date } = {
  title: 'Latest News Article',
  content: 'This is the content of the latest news article',
  publication_date: new Date('2024-01-15'),
  thumbnail_url: 'https://example.com/thumbnail1.jpg'
};

const testNews2: Omit<CreateNewsInput, 'publication_date'> & { publication_date: Date } = {
  title: 'Older News Article',
  content: 'This is the content of an older news article',
  publication_date: new Date('2024-01-10'),
  thumbnail_url: null
};

const testNews3: Omit<CreateNewsInput, 'publication_date'> & { publication_date: Date } = {
  title: 'Newest News Article',
  content: 'This is the content of the newest news article',
  publication_date: new Date('2024-01-20'),
  thumbnail_url: 'https://example.com/thumbnail3.jpg'
};

describe('getNews', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no news exists', async () => {
    const result = await getNews();
    expect(result).toEqual([]);
  });

  it('should return all news articles', async () => {
    // Create test news articles
    await db.insert(newsTable).values([
      testNews1,
      testNews2,
      testNews3
    ]).execute();

    const result = await getNews();

    expect(result).toHaveLength(3);
    
    // Verify all articles are returned
    const titles = result.map(news => news.title);
    expect(titles).toContain('Latest News Article');
    expect(titles).toContain('Older News Article');
    expect(titles).toContain('Newest News Article');
  });

  it('should return news ordered by publication date (newest first)', async () => {
    // Create test news articles
    await db.insert(newsTable).values([
      testNews1, // 2024-01-15
      testNews2, // 2024-01-10 (oldest)
      testNews3  // 2024-01-20 (newest)
    ]).execute();

    const result = await getNews();

    expect(result).toHaveLength(3);
    
    // Should be ordered by publication_date descending (newest first)
    expect(result[0].title).toEqual('Newest News Article');
    expect(result[1].title).toEqual('Latest News Article');
    expect(result[2].title).toEqual('Older News Article');
    
    // Verify dates are in descending order
    expect(result[0].publication_date).toEqual(new Date('2024-01-20'));
    expect(result[1].publication_date).toEqual(new Date('2024-01-15'));
    expect(result[2].publication_date).toEqual(new Date('2024-01-10'));
  });

  it('should include all news fields correctly', async () => {
    await db.insert(newsTable).values(testNews1).execute();

    const result = await getNews();
    const news = result[0];

    expect(news.id).toBeDefined();
    expect(news.title).toEqual('Latest News Article');
    expect(news.content).toEqual('This is the content of the latest news article');
    expect(news.publication_date).toEqual(new Date('2024-01-15'));
    expect(news.thumbnail_url).toEqual('https://example.com/thumbnail1.jpg');
    expect(news.created_at).toBeInstanceOf(Date);
    expect(news.updated_at).toBeNull();
  });

  it('should handle null thumbnail_url correctly', async () => {
    await db.insert(newsTable).values(testNews2).execute();

    const result = await getNews();
    const news = result[0];

    expect(news.thumbnail_url).toBeNull();
    expect(news.title).toEqual('Older News Article');
  });
});
