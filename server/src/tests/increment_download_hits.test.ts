
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { downloadsTable } from '../db/schema';
import { type IncrementDownloadHitsInput, type CreateDownloadInput } from '../schema';
import { incrementDownloadHits } from '../handlers/increment_download_hits';
import { eq } from 'drizzle-orm';

// Test input for creating a download
const testDownloadInput: CreateDownloadInput = {
  title: 'Test Download',
  category: 'Test Category',
  publisher: 'Test Publisher',
  file_url: 'https://example.com/test-file.pdf',
  file_name: 'test-file.pdf'
};

describe('incrementDownloadHits', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should increment hits count for existing download', async () => {
    // Create a download first
    const downloadResult = await db.insert(downloadsTable)
      .values({
        ...testDownloadInput,
        hits: 5 // Start with 5 hits
      })
      .returning()
      .execute();

    const downloadId = downloadResult[0].id;
    const input: IncrementDownloadHitsInput = { id: downloadId };

    // Increment hits
    const result = await incrementDownloadHits(input);

    // Verify result
    expect(result.id).toEqual(downloadId);
    expect(result.title).toEqual('Test Download');
    expect(result.category).toEqual('Test Category');
    expect(result.publisher).toEqual('Test Publisher');
    expect(result.file_url).toEqual('https://example.com/test-file.pdf');
    expect(result.file_name).toEqual('test-file.pdf');
    expect(result.hits).toEqual(6); // Should be incremented from 5 to 6
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update hits count in database', async () => {
    // Create a download first
    const downloadResult = await db.insert(downloadsTable)
      .values({
        ...testDownloadInput,
        hits: 10 // Start with 10 hits
      })
      .returning()
      .execute();

    const downloadId = downloadResult[0].id;
    const input: IncrementDownloadHitsInput = { id: downloadId };

    // Increment hits
    await incrementDownloadHits(input);

    // Verify database was updated
    const downloads = await db.select()
      .from(downloadsTable)
      .where(eq(downloadsTable.id, downloadId))
      .execute();

    expect(downloads).toHaveLength(1);
    expect(downloads[0].hits).toEqual(11); // Should be incremented from 10 to 11
    expect(downloads[0].updated_at).toBeInstanceOf(Date);
  });

  it('should increment hits multiple times correctly', async () => {
    // Create a download first
    const downloadResult = await db.insert(downloadsTable)
      .values({
        ...testDownloadInput,
        hits: 0 // Start with 0 hits
      })
      .returning()
      .execute();

    const downloadId = downloadResult[0].id;
    const input: IncrementDownloadHitsInput = { id: downloadId };

    // Increment hits multiple times
    await incrementDownloadHits(input);
    await incrementDownloadHits(input);
    const finalResult = await incrementDownloadHits(input);

    // Should be incremented 3 times: 0 -> 1 -> 2 -> 3
    expect(finalResult.hits).toEqual(3);
  });

  it('should throw error for non-existent download', async () => {
    const input: IncrementDownloadHitsInput = { id: 999 };

    await expect(incrementDownloadHits(input)).rejects.toThrow(/download with id 999 not found/i);
  });

  it('should handle downloads with default hits value', async () => {
    // Create a download without specifying hits (should default to 0)
    const downloadResult = await db.insert(downloadsTable)
      .values(testDownloadInput) // hits will default to 0
      .returning()
      .execute();

    const downloadId = downloadResult[0].id;
    const input: IncrementDownloadHitsInput = { id: downloadId };

    // Verify initial hits is 0
    expect(downloadResult[0].hits).toEqual(0);

    // Increment hits
    const result = await incrementDownloadHits(input);

    // Should be incremented from 0 to 1
    expect(result.hits).toEqual(1);
  });
});
