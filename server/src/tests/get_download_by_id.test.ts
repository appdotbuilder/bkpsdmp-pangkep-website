
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { downloadsTable } from '../db/schema';
import { type GetByIdInput, type CreateDownloadInput } from '../schema';
import { getDownloadById } from '../handlers/get_download_by_id';

const testDownloadInput: CreateDownloadInput = {
  title: 'Test Document',
  category: 'Forms',
  publisher: 'Test Publisher',
  file_url: 'https://example.com/test.pdf',
  file_name: 'test.pdf'
};

describe('getDownloadById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return download when ID exists', async () => {
    // Create test download
    const insertResult = await db.insert(downloadsTable)
      .values({
        title: testDownloadInput.title,
        category: testDownloadInput.category,
        publisher: testDownloadInput.publisher,
        file_url: testDownloadInput.file_url,
        file_name: testDownloadInput.file_name
      })
      .returning()
      .execute();

    const createdDownload = insertResult[0];
    const input: GetByIdInput = { id: createdDownload.id };

    // Test the handler
    const result = await getDownloadById(input);

    expect(result).not.toBeNull();
    expect(result?.id).toEqual(createdDownload.id);
    expect(result?.title).toEqual('Test Document');
    expect(result?.category).toEqual('Forms');
    expect(result?.publisher).toEqual('Test Publisher');
    expect(result?.file_url).toEqual('https://example.com/test.pdf');
    expect(result?.file_name).toEqual('test.pdf');
    expect(result?.hits).toEqual(0);
    expect(result?.created_at).toBeInstanceOf(Date);
    expect(result?.updated_at).toBeNull();
  });

  it('should return null when ID does not exist', async () => {
    const input: GetByIdInput = { id: 999 };

    const result = await getDownloadById(input);

    expect(result).toBeNull();
  });

  it('should return correct download data when multiple downloads exist', async () => {
    // Create multiple test downloads
    const firstDownload = await db.insert(downloadsTable)
      .values({
        title: 'First Document',
        category: 'Forms',
        publisher: 'Publisher 1',
        file_url: 'https://example.com/first.pdf',
        file_name: 'first.pdf'
      })
      .returning()
      .execute();

    const secondDownload = await db.insert(downloadsTable)
      .values({
        title: 'Second Document',
        category: 'Reports',
        publisher: 'Publisher 2',
        file_url: 'https://example.com/second.pdf',
        file_name: 'second.pdf'
      })
      .returning()
      .execute();

    const input: GetByIdInput = { id: secondDownload[0].id };

    const result = await getDownloadById(input);

    expect(result).not.toBeNull();
    expect(result?.id).toEqual(secondDownload[0].id);
    expect(result?.title).toEqual('Second Document');
    expect(result?.category).toEqual('Reports');
    expect(result?.publisher).toEqual('Publisher 2');
    expect(result?.file_url).toEqual('https://example.com/second.pdf');
    expect(result?.file_name).toEqual('second.pdf');
  });
});
