
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { announcementsTable } from '../db/schema';
import { type CreateAnnouncementInput } from '../schema';
import { createAnnouncement } from '../handlers/create_announcement';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateAnnouncementInput = {
  title: 'Test Announcement',
  content: 'This is a test announcement content',
  publication_date: new Date('2024-01-15T10:00:00Z')
};

describe('createAnnouncement', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an announcement', async () => {
    const result = await createAnnouncement(testInput);

    // Basic field validation
    expect(result.title).toEqual('Test Announcement');
    expect(result.content).toEqual('This is a test announcement content');
    expect(result.publication_date).toEqual(new Date('2024-01-15T10:00:00Z'));
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeNull();
  });

  it('should save announcement to database', async () => {
    const result = await createAnnouncement(testInput);

    // Query using proper drizzle syntax
    const announcements = await db.select()
      .from(announcementsTable)
      .where(eq(announcementsTable.id, result.id))
      .execute();

    expect(announcements).toHaveLength(1);
    expect(announcements[0].title).toEqual('Test Announcement');
    expect(announcements[0].content).toEqual('This is a test announcement content');
    expect(announcements[0].publication_date).toEqual(new Date('2024-01-15T10:00:00Z'));
    expect(announcements[0].created_at).toBeInstanceOf(Date);
    expect(announcements[0].updated_at).toBeNull();
  });

  it('should handle different publication dates correctly', async () => {
    const futureDate = new Date('2025-06-01T15:30:00Z');
    const futureInput: CreateAnnouncementInput = {
      title: 'Future Announcement',
      content: 'This announcement is scheduled for the future',
      publication_date: futureDate
    };

    const result = await createAnnouncement(futureInput);

    expect(result.publication_date).toEqual(futureDate);
    expect(result.title).toEqual('Future Announcement');

    // Verify in database
    const announcements = await db.select()
      .from(announcementsTable)
      .where(eq(announcementsTable.id, result.id))
      .execute();

    expect(announcements[0].publication_date).toEqual(futureDate);
  });
});
