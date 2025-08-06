
import { db } from '../db';
import { downloadsTable } from '../db/schema';
import { type IncrementDownloadHitsInput, type Download } from '../schema';
import { eq, sql } from 'drizzle-orm';

export const incrementDownloadHits = async (input: IncrementDownloadHitsInput): Promise<Download> => {
  try {
    // Increment hits count and return updated record
    const result = await db.update(downloadsTable)
      .set({ 
        hits: sql`${downloadsTable.hits} + 1`,
        updated_at: new Date()
      })
      .where(eq(downloadsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Download with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Download hits increment failed:', error);
    throw error;
  }
};
