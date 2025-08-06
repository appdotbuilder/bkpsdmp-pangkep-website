
import { db } from '../db';
import { downloadsTable } from '../db/schema';
import { type Download } from '../schema';
import { desc } from 'drizzle-orm';

export const getDownloads = async (): Promise<Download[]> => {
  try {
    const results = await db.select()
      .from(downloadsTable)
      .orderBy(desc(downloadsTable.created_at))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch downloads:', error);
    throw error;
  }
};
