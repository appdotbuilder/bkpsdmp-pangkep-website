
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { profilePagesTable } from '../db/schema';
import { type GetByIdInput, type CreateProfilePageInput } from '../schema';
import { deleteProfilePage } from '../handlers/delete_profile_page';
import { eq } from 'drizzle-orm';

// Test input for deletion
const deleteInput: GetByIdInput = {
  id: 1
};

// Test input for creating profile page
const testProfilePageInput: CreateProfilePageInput = {
  page_type: 'visi_misi',
  title: 'Test Vision & Mission',
  content: 'This is test content for vision and mission page.'
};

describe('deleteProfilePage', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing profile page', async () => {
    // First create a profile page to delete
    const inserted = await db.insert(profilePagesTable)
      .values({
        page_type: testProfilePageInput.page_type,
        title: testProfilePageInput.title,
        content: testProfilePageInput.content
      })
      .returning()
      .execute();

    const profilePageId = inserted[0].id;

    // Delete the profile page
    const result = await deleteProfilePage({ id: profilePageId });

    expect(result.success).toBe(true);
  });

  it('should remove profile page from database', async () => {
    // Create a profile page first
    const inserted = await db.insert(profilePagesTable)
      .values({
        page_type: testProfilePageInput.page_type,
        title: testProfilePageInput.title,
        content: testProfilePageInput.content
      })
      .returning()
      .execute();

    const profilePageId = inserted[0].id;

    // Delete the profile page
    await deleteProfilePage({ id: profilePageId });

    // Verify it's removed from database
    const profilePages = await db.select()
      .from(profilePagesTable)
      .where(eq(profilePagesTable.id, profilePageId))
      .execute();

    expect(profilePages).toHaveLength(0);
  });

  it('should return false when trying to delete non-existent profile page', async () => {
    // Try to delete a profile page with non-existent ID
    const result = await deleteProfilePage({ id: 999 });

    expect(result.success).toBe(false);
  });

  it('should not affect other profile pages when deleting one', async () => {
    // Create multiple profile pages
    const page1 = await db.insert(profilePagesTable)
      .values({
        page_type: 'visi_misi',
        title: 'Vision & Mission',
        content: 'Vision and mission content'
      })
      .returning()
      .execute();

    const page2 = await db.insert(profilePagesTable)
      .values({
        page_type: 'sejarah',
        title: 'History',
        content: 'History content'
      })
      .returning()
      .execute();

    // Delete the first profile page
    const result = await deleteProfilePage({ id: page1[0].id });

    expect(result.success).toBe(true);

    // Verify second profile page still exists
    const remainingPages = await db.select()
      .from(profilePagesTable)
      .where(eq(profilePagesTable.id, page2[0].id))
      .execute();

    expect(remainingPages).toHaveLength(1);
    expect(remainingPages[0].title).toEqual('History');
  });
});
