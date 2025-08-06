
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { downloadsTable } from '../db/schema';
import { type CreateDownloadInput } from '../schema';
import { createDownload } from '../handlers/create_download';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateDownloadInput = {
  title: 'Test Document',
  category: 'Legal',
  publisher: 'Test Publisher',
  file_url: 'https://example.com/document.pdf',
  file_name: 'document.pdf'
};

describe('createDownload', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a download', async () => {
    const result = await createDownload(testInput);

    // Basic field validation
    expect(result.title).toEqual('Test Document');
    expect(result.category).toEqual('Legal');
    expect(result.publisher).toEqual('Test Publisher');
    expect(result.file_url).toEqual('https://example.com/document.pdf');
    expect(result.file_name).toEqual('document.pdf');
    expect(result.hits).toEqual(0);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeNull();
  });

  it('should save download to database', async () => {
    const result = await createDownload(testInput);

    // Query using proper drizzle syntax
    const downloads = await db.select()
      .from(downloadsTable)
      .where(eq(downloadsTable.id, result.id))
      .execute();

    expect(downloads).toHaveLength(1);
    expect(downloads[0].title).toEqual('Test Document');
    expect(downloads[0].category).toEqual('Legal');
    expect(downloads[0].publisher).toEqual('Test Publisher');
    expect(downloads[0].file_url).toEqual('https://example.com/document.pdf');
    expect(downloads[0].file_name).toEqual('document.pdf');
    expect(downloads[0].hits).toEqual(0);
    expect(downloads[0].created_at).toBeInstanceOf(Date);
    expect(downloads[0].updated_at).toBeNull();
  });

  it('should create downloads with different categories', async () => {
    const legalDoc = await createDownload({
      ...testInput,
      title: 'Legal Document',
      category: 'Legal'
    });

    const policyDoc = await createDownload({
      ...testInput,
      title: 'Policy Document',
      category: 'Policy'
    });

    const regulationDoc = await createDownload({
      ...testInput,
      title: 'Regulation Document', 
      category: 'Regulation'
    });

    expect(legalDoc.category).toEqual('Legal');
    expect(policyDoc.category).toEqual('Policy');
    expect(regulationDoc.category).toEqual('Regulation');

    // Verify all are saved in database
    const allDownloads = await db.select()
      .from(downloadsTable)
      .execute();

    expect(allDownloads).toHaveLength(3);
    
    const categories = allDownloads.map(d => d.category);
    expect(categories).toContain('Legal');
    expect(categories).toContain('Policy');
    expect(categories).toContain('Regulation');
  });
});
