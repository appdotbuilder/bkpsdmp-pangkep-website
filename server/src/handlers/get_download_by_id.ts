
import { db } from '../db';
import { downloadsTable } from '../db/schema';
import { type GetByIdInput, type Download } from '../schema';
import { eq } from 'drizzle-orm';

export const getDownloadById = async (input: GetByIdInput): Promise<Download | null> => {
  try {
    const result = await db.select()
      .from(downloadsTable)
      .where(eq(downloadsTable.id, input.id))
      .execute();

    if (result.length === 0) {
      return null;
    }

    const download = result[0];
    return {
      ...download,
      created_at: download.created_at,
      updated_at: download.updated_at
    };
  } catch (error) {
    console.error('Failed to get download by ID:', error);
    throw error;
  }
};
