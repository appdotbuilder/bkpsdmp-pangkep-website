
import { db } from '../db';
import { downloadsTable } from '../db/schema';
import { type GetByIdInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteDownload = async (input: GetByIdInput): Promise<{ success: boolean }> => {
  try {
    const result = await db.delete(downloadsTable)
      .where(eq(downloadsTable.id, input.id))
      .execute();

    return { success: true };
  } catch (error) {
    console.error('Download deletion failed:', error);
    throw error;
  }
};
