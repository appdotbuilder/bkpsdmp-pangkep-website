
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { downloadsTable } from '../db/schema';
import { type UpdateDownloadInput, type CreateDownloadInput } from '../schema';
import { updateDownload } from '../handlers/update_download';
import { eq } from 'drizzle-orm';

// Test input for creating initial download
const testCreateInput: CreateDownloadInput = {
  title: 'Original Document',
  category: 'Reports',
  publisher: 'Original Publisher',
  file_url: 'https://example.com/original.pdf',
  file_name: 'original_document.pdf'
};

// Helper function to create a download directly in database
const createTestDownload = async (input: CreateDownloadInput) => {
  const result = await db.insert(downloadsTable)
    .values({
      title: input.title,
      category: input.category,
      publisher: input.publisher,
      file_url: input.file_url,
      file_name: input.file_name,
      hits: 0
    })
    .returning()
    .execute();
  
  return result[0];
};

describe('updateDownload', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update all fields of a download', async () => {
    // Create initial download
    const created = await createTestDownload(testCreateInput);

    const updateInput: UpdateDownloadInput = {
      id: created.id,
      title: 'Updated Document',
      category: 'Updated Reports',
      publisher: 'Updated Publisher',
      file_url: 'https://example.com/updated.pdf',
      file_name: 'updated_document.pdf'
    };

    const result = await updateDownload(updateInput);

    // Verify updated fields
    expect(result.id).toEqual(created.id);
    expect(result.title).toEqual('Updated Document');
    expect(result.category).toEqual('Updated Reports');
    expect(result.publisher).toEqual('Updated Publisher');
    expect(result.file_url).toEqual('https://example.com/updated.pdf');
    expect(result.file_name).toEqual('updated_document.pdf');
    expect(result.hits).toEqual(0); // Should preserve original hits
    expect(result.created_at).toEqual(created.created_at); // Should preserve original created_at
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at).not.toEqual(created.updated_at);
  });

  it('should update only specified fields', async () => {
    // Create initial download
    const created = await createTestDownload(testCreateInput);

    const updateInput: UpdateDownloadInput = {
      id: created.id,
      title: 'Partially Updated Document',
      category: 'Partially Updated Category'
    };

    const result = await updateDownload(updateInput);

    // Verify updated fields
    expect(result.title).toEqual('Partially Updated Document');
    expect(result.category).toEqual('Partially Updated Category');
    
    // Verify unchanged fields
    expect(result.publisher).toEqual(testCreateInput.publisher);
    expect(result.file_url).toEqual(testCreateInput.file_url);
    expect(result.file_name).toEqual(testCreateInput.file_name);
    expect(result.hits).toEqual(0);
    expect(result.created_at).toEqual(created.created_at);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save updated download to database', async () => {
    // Create initial download
    const created = await createTestDownload(testCreateInput);

    const updateInput: UpdateDownloadInput = {
      id: created.id,
      title: 'Database Updated Document'
    };

    await updateDownload(updateInput);

    // Query database to verify changes
    const downloads = await db.select()
      .from(downloadsTable)
      .where(eq(downloadsTable.id, created.id))
      .execute();

    expect(downloads).toHaveLength(1);
    expect(downloads[0].title).toEqual('Database Updated Document');
    expect(downloads[0].category).toEqual(testCreateInput.category); // Unchanged
    expect(downloads[0].updated_at).toBeInstanceOf(Date);
  });

  it('should throw error for non-existent download', async () => {
    const updateInput: UpdateDownloadInput = {
      id: 99999,
      title: 'Non-existent Download'
    };

    expect(updateDownload(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should preserve hits count when updating', async () => {
    // Create initial download
    const created = await createTestDownload(testCreateInput);

    // Manually update hits count to test preservation
    await db.update(downloadsTable)
      .set({ hits: 5 })
      .where(eq(downloadsTable.id, created.id))
      .execute();

    const updateInput: UpdateDownloadInput = {
      id: created.id,
      title: 'Updated with Preserved Hits'
    };

    const result = await updateDownload(updateInput);

    expect(result.hits).toEqual(5); // Should preserve the existing hits
    expect(result.title).toEqual('Updated with Preserved Hits');
  });
});
