
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { downloadsTable } from '../db/schema';
import { type CreateDownloadInput } from '../schema';
import { getDownloads } from '../handlers/get_downloads';

// Test download inputs
const testDownload1: CreateDownloadInput = {
  title: 'Test Document 1',
  category: 'Reports',
  publisher: 'Test Publisher 1',
  file_url: 'https://example.com/file1.pdf',
  file_name: 'file1.pdf'
};

const testDownload2: CreateDownloadInput = {
  title: 'Test Document 2',
  category: 'Guides',
  publisher: 'Test Publisher 2',
  file_url: 'https://example.com/file2.pdf',
  file_name: 'file2.pdf'
};

describe('getDownloads', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no downloads exist', async () => {
    const result = await getDownloads();
    
    expect(result).toHaveLength(0);
  });

  it('should return all downloads', async () => {
    // Insert test downloads separately to ensure different timestamps
    await db.insert(downloadsTable)
      .values(testDownload1)
      .execute();

    // Wait a bit to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(downloadsTable)
      .values(testDownload2)
      .execute();

    const result = await getDownloads();

    expect(result).toHaveLength(2);
    expect(result[0].title).toEqual('Test Document 2'); // Most recent first
    expect(result[1].title).toEqual('Test Document 1');
    expect(result[0].category).toEqual('Guides');
    expect(result[1].category).toEqual('Reports');
  });

  it('should return downloads ordered by creation date descending', async () => {
    // Insert first download
    await db.insert(downloadsTable)
      .values(testDownload1)
      .execute();

    // Wait a bit to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    // Insert second download
    await db.insert(downloadsTable)
      .values(testDownload2)
      .execute();

    const result = await getDownloads();

    expect(result).toHaveLength(2);
    // Most recent should be first
    expect(result[0].title).toEqual('Test Document 2');
    expect(result[1].title).toEqual('Test Document 1');
    expect(result[0].created_at > result[1].created_at).toBe(true);
  });

  it('should include all download fields', async () => {
    await db.insert(downloadsTable)
      .values(testDownload1)
      .execute();

    const result = await getDownloads();

    expect(result).toHaveLength(1);
    const download = result[0];
    
    expect(download.id).toBeDefined();
    expect(download.title).toEqual('Test Document 1');
    expect(download.category).toEqual('Reports');
    expect(download.publisher).toEqual('Test Publisher 1');
    expect(download.file_url).toEqual('https://example.com/file1.pdf');
    expect(download.file_name).toEqual('file1.pdf');
    expect(download.hits).toEqual(0);
    expect(download.created_at).toBeInstanceOf(Date);
    expect(download.updated_at).toBeNull();
  });

  it('should handle downloads with different hit counts', async () => {
    // Insert download with custom hits value
    await db.insert(downloadsTable)
      .values({
        ...testDownload1,
        hits: 42
      })
      .execute();

    const result = await getDownloads();

    expect(result).toHaveLength(1);
    expect(result[0].hits).toEqual(42);
  });
});
