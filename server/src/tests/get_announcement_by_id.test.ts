
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { announcementsTable } from '../db/schema';
import { type GetByIdInput, type CreateAnnouncementInput } from '../schema';
import { getAnnouncementById } from '../handlers/get_announcement_by_id';
import { eq } from 'drizzle-orm';

// Test input for creating an announcement
const testAnnouncementInput: CreateAnnouncementInput = {
  title: 'Test Announcement',
  content: 'This is a test announcement for unit testing.',
  publication_date: new Date('2023-12-25')
};

describe('getAnnouncementById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return announcement when found', async () => {
    // Create test announcement first
    const created = await db.insert(announcementsTable)
      .values({
        title: testAnnouncementInput.title,
        content: testAnnouncementInput.content,
        publication_date: testAnnouncementInput.publication_date
      })
      .returning()
      .execute();

    const createdAnnouncement = created[0];

    // Get the announcement by ID
    const input: GetByIdInput = { id: createdAnnouncement.id };
    const result = await getAnnouncementById(input);

    // Verify the result
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdAnnouncement.id);
    expect(result!.title).toEqual('Test Announcement');
    expect(result!.content).toEqual('This is a test announcement for unit testing.');
    expect(result!.publication_date).toEqual(new Date('2023-12-25'));
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeNull();
  });

  it('should return null when announcement not found', async () => {
    const input: GetByIdInput = { id: 999 };
    const result = await getAnnouncementById(input);

    expect(result).toBeNull();
  });

  it('should fetch the correct announcement from multiple records', async () => {
    // Create multiple test announcements
    const announcements = await db.insert(announcementsTable)
      .values([
        {
          title: 'First Announcement',
          content: 'First content',
          publication_date: new Date('2023-12-01')
        },
        {
          title: 'Second Announcement',
          content: 'Second content',
          publication_date: new Date('2023-12-02')
        },
        {
          title: 'Third Announcement',
          content: 'Third content',
          publication_date: new Date('2023-12-03')
        }
      ])
      .returning()
      .execute();

    // Get the second announcement
    const input: GetByIdInput = { id: announcements[1].id };
    const result = await getAnnouncementById(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(announcements[1].id);
    expect(result!.title).toEqual('Second Announcement');
    expect(result!.content).toEqual('Second content');
    expect(result!.publication_date).toEqual(new Date('2023-12-02'));
  });

  it('should verify database consistency', async () => {
    // Create test announcement
    const created = await db.insert(announcementsTable)
      .values({
        title: testAnnouncementInput.title,
        content: testAnnouncementInput.content,
        publication_date: testAnnouncementInput.publication_date
      })
      .returning()
      .execute();

    const createdId = created[0].id;

    // Get via handler
    const handlerResult = await getAnnouncementById({ id: createdId });

    // Get directly from database
    const dbResult = await db.select()
      .from(announcementsTable)
      .where(eq(announcementsTable.id, createdId))
      .execute();

    // Compare results
    expect(handlerResult).not.toBeNull();
    expect(handlerResult!.id).toEqual(dbResult[0].id);
    expect(handlerResult!.title).toEqual(dbResult[0].title);
    expect(handlerResult!.content).toEqual(dbResult[0].content);
    expect(handlerResult!.publication_date).toEqual(dbResult[0].publication_date);
    expect(handlerResult!.created_at).toEqual(dbResult[0].created_at);
    expect(handlerResult!.updated_at).toEqual(dbResult[0].updated_at);
  });
});
