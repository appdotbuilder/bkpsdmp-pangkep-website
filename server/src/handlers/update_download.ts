
import { db } from '../db';
import { downloadsTable } from '../db/schema';
import { type UpdateDownloadInput, type Download } from '../schema';
import { eq } from 'drizzle-orm';

export const updateDownload = async (input: UpdateDownloadInput): Promise<Download> => {
  try {
    // Build update object with only provided fields
    const updateData: any = {};
    
    if (input.title !== undefined) {
      updateData.title = input.title;
    }
    
    if (input.category !== undefined) {
      updateData.category = input.category;
    }
    
    if (input.publisher !== undefined) {
      updateData.publisher = input.publisher;
    }
    
    if (input.file_url !== undefined) {
      updateData.file_url = input.file_url;
    }
    
    if (input.file_name !== undefined) {
      updateData.file_name = input.file_name;
    }

    // Set updated_at timestamp
    updateData.updated_at = new Date();

    // Update the download record
    const result = await db.update(downloadsTable)
      .set(updateData)
      .where(eq(downloadsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Download with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Download update failed:', error);
    throw error;
  }
};
