
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { announcementsTable } from '../db/schema';
import { type GetByIdInput, type CreateAnnouncementInput } from '../schema';
import { deleteAnnouncement } from '../handlers/delete_announcement';
import { eq } from 'drizzle-orm';

const testAnnouncementInput: CreateAnnouncementInput = {
  title: 'Test Announcement',
  content: 'This is a test announcement content',
  publication_date: new Date('2024-01-15T10:00:00Z')
};

describe('deleteAnnouncement', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an announcement successfully', async () => {
    // Create test announcement first
    const insertResult = await db.insert(announcementsTable)
      .values(testAnnouncementInput)
      .returning()
      .execute();

    const announcementId = insertResult[0].id;

    // Delete the announcement
    const input: GetByIdInput = { id: announcementId };
    const result = await deleteAnnouncement(input);

    expect(result.success).toBe(true);

    // Verify the announcement was deleted
    const announcements = await db.select()
      .from(announcementsTable)
      .where(eq(announcementsTable.id, announcementId))
      .execute();

    expect(announcements).toHaveLength(0);
  });

  it('should succeed even when announcement does not exist', async () => {
    const input: GetByIdInput = { id: 999999 };
    const result = await deleteAnnouncement(input);

    expect(result.success).toBe(true);
  });

  it('should not affect other announcements when deleting one', async () => {
    // Create two test announcements
    const firstInsert = await db.insert(announcementsTable)
      .values(testAnnouncementInput)
      .returning()
      .execute();

    const secondInsert = await db.insert(announcementsTable)
      .values({
        ...testAnnouncementInput,
        title: 'Second Announcement'
      })
      .returning()
      .execute();

    const firstId = firstInsert[0].id;
    const secondId = secondInsert[0].id;

    // Delete only the first announcement
    const input: GetByIdInput = { id: firstId };
    await deleteAnnouncement(input);

    // Verify first announcement is deleted
    const deletedAnnouncements = await db.select()
      .from(announcementsTable)
      .where(eq(announcementsTable.id, firstId))
      .execute();

    expect(deletedAnnouncements).toHaveLength(0);

    // Verify second announcement still exists
    const remainingAnnouncements = await db.select()
      .from(announcementsTable)
      .where(eq(announcementsTable.id, secondId))
      .execute();

    expect(remainingAnnouncements).toHaveLength(1);
    expect(remainingAnnouncements[0].title).toEqual('Second Announcement');
  });
});
