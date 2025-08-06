
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { announcementsTable } from '../db/schema';
import { type UpdateAnnouncementInput, type CreateAnnouncementInput } from '../schema';
import { updateAnnouncement } from '../handlers/update_announcement';
import { eq } from 'drizzle-orm';

// Helper function to create test announcement
const createTestAnnouncement = async () => {
  const testInput: CreateAnnouncementInput = {
    title: 'Original Announcement',
    content: 'Original announcement content',
    publication_date: new Date('2024-01-01')
  };

  const result = await db.insert(announcementsTable)
    .values({
      title: testInput.title,
      content: testInput.content,
      publication_date: testInput.publication_date
    })
    .returning()
    .execute();

  return result[0];
};

describe('updateAnnouncement', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update all fields of an announcement', async () => {
    const originalAnnouncement = await createTestAnnouncement();

    const updateInput: UpdateAnnouncementInput = {
      id: originalAnnouncement.id,
      title: 'Updated Announcement Title',
      content: 'Updated announcement content',
      publication_date: new Date('2024-02-01')
    };

    const result = await updateAnnouncement(updateInput);

    // Verify updated fields
    expect(result.id).toEqual(originalAnnouncement.id);
    expect(result.title).toEqual('Updated Announcement Title');
    expect(result.content).toEqual('Updated announcement content');
    expect(result.publication_date).toEqual(new Date('2024-02-01'));
    expect(result.created_at).toEqual(originalAnnouncement.created_at);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at).not.toEqual(originalAnnouncement.updated_at);
  });

  it('should update only provided fields', async () => {
    const originalAnnouncement = await createTestAnnouncement();

    const updateInput: UpdateAnnouncementInput = {
      id: originalAnnouncement.id,
      title: 'Only Title Updated'
    };

    const result = await updateAnnouncement(updateInput);

    // Verify only title was updated
    expect(result.id).toEqual(originalAnnouncement.id);
    expect(result.title).toEqual('Only Title Updated');
    expect(result.content).toEqual(originalAnnouncement.content);
    expect(result.publication_date).toEqual(originalAnnouncement.publication_date);
    expect(result.created_at).toEqual(originalAnnouncement.created_at);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at).not.toEqual(originalAnnouncement.updated_at);
  });

  it('should save changes to database', async () => {
    const originalAnnouncement = await createTestAnnouncement();

    const updateInput: UpdateAnnouncementInput = {
      id: originalAnnouncement.id,
      title: 'Database Updated Title',
      content: 'Database updated content'
    };

    await updateAnnouncement(updateInput);

    // Verify changes persisted in database
    const announcements = await db.select()
      .from(announcementsTable)
      .where(eq(announcementsTable.id, originalAnnouncement.id))
      .execute();

    expect(announcements).toHaveLength(1);
    expect(announcements[0].title).toEqual('Database Updated Title');
    expect(announcements[0].content).toEqual('Database updated content');
    expect(announcements[0].publication_date).toEqual(originalAnnouncement.publication_date);
    expect(announcements[0].updated_at).toBeInstanceOf(Date);
    expect(announcements[0].updated_at).not.toEqual(originalAnnouncement.updated_at);
  });

  it('should throw error when announcement not found', async () => {
    const updateInput: UpdateAnnouncementInput = {
      id: 999, // Non-existent ID
      title: 'This should fail'
    };

    expect(updateAnnouncement(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should handle partial updates correctly', async () => {
    const originalAnnouncement = await createTestAnnouncement();

    // Update only content
    const contentUpdateInput: UpdateAnnouncementInput = {
      id: originalAnnouncement.id,
      content: 'Only content changed'
    };

    const contentResult = await updateAnnouncement(contentUpdateInput);

    expect(contentResult.title).toEqual(originalAnnouncement.title);
    expect(contentResult.content).toEqual('Only content changed');
    expect(contentResult.publication_date).toEqual(originalAnnouncement.publication_date);

    // Update only publication date
    const dateUpdateInput: UpdateAnnouncementInput = {
      id: originalAnnouncement.id,
      publication_date: new Date('2024-03-01')
    };

    const dateResult = await updateAnnouncement(dateUpdateInput);

    expect(dateResult.title).toEqual(originalAnnouncement.title);
    expect(dateResult.content).toEqual('Only content changed'); // Should keep previous update
    expect(dateResult.publication_date).toEqual(new Date('2024-03-01'));
  });
});
