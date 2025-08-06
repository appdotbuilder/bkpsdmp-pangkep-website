
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { downloadsTable } from '../db/schema';
import { type GetByIdInput, type CreateDownloadInput } from '../schema';
import { deleteDownload } from '../handlers/delete_download';
import { eq } from 'drizzle-orm';

// Test input for creating a download
const testDownloadInput: CreateDownloadInput = {
  title: 'Test Download',
  category: 'Documents',
  publisher: 'Test Publisher',
  file_url: 'https://example.com/test-file.pdf',
  file_name: 'test-file.pdf'
};

describe('deleteDownload', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing download', async () => {
    // Create a download first
    const createResult = await db.insert(downloadsTable)
      .values(testDownloadInput)
      .returning()
      .execute();

    const createdDownload = createResult[0];

    const deleteInput: GetByIdInput = {
      id: createdDownload.id
    };

    // Delete the download
    const result = await deleteDownload(deleteInput);

    expect(result.success).toBe(true);

    // Verify download no longer exists in database
    const downloads = await db.select()
      .from(downloadsTable)
      .where(eq(downloadsTable.id, createdDownload.id))
      .execute();

    expect(downloads).toHaveLength(0);
  });

  it('should handle deletion of non-existent download', async () => {
    const deleteInput: GetByIdInput = {
      id: 99999 // Non-existent ID
    };

    // Should not throw error even if download doesn't exist
    const result = await deleteDownload(deleteInput);

    expect(result.success).toBe(true);
  });

  it('should not affect other downloads when deleting one', async () => {
    // Create two downloads
    const download1 = await db.insert(downloadsTable)
      .values(testDownloadInput)
      .returning()
      .execute();

    const download2 = await db.insert(downloadsTable)
      .values({
        ...testDownloadInput,
        title: 'Another Download',
        file_name: 'another-file.pdf'
      })
      .returning()
      .execute();

    const deleteInput: GetByIdInput = {
      id: download1[0].id
    };

    // Delete first download
    const result = await deleteDownload(deleteInput);

    expect(result.success).toBe(true);

    // Verify first download is deleted
    const deletedDownload = await db.select()
      .from(downloadsTable)
      .where(eq(downloadsTable.id, download1[0].id))
      .execute();

    expect(deletedDownload).toHaveLength(0);

    // Verify second download still exists
    const remainingDownload = await db.select()
      .from(downloadsTable)
      .where(eq(downloadsTable.id, download2[0].id))
      .execute();

    expect(remainingDownload).toHaveLength(1);
    expect(remainingDownload[0].title).toEqual('Another Download');
  });
});
