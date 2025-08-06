
import { db } from '../db';
import { downloadsTable } from '../db/schema';
import { type CreateDownloadInput, type Download } from '../schema';

export const createDownload = async (input: CreateDownloadInput): Promise<Download> => {
  try {
    // Insert download record
    const result = await db.insert(downloadsTable)
      .values({
        title: input.title,
        category: input.category,
        publisher: input.publisher,
        file_url: input.file_url,
        file_name: input.file_name,
        hits: 0 // Start with 0 hits (default value)
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Download creation failed:', error);
    throw error;
  }
};
