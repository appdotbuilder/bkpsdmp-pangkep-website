
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { announcementsTable } from '../db/schema';
import { type CreateAnnouncementInput } from '../schema';
import { getAnnouncements } from '../handlers/get_announcements';

// Test data for announcements
const testAnnouncement1: CreateAnnouncementInput = {
  title: 'First Announcement',
  content: 'This is the first announcement content',
  publication_date: new Date('2024-01-01')
};

const testAnnouncement2: CreateAnnouncementInput = {
  title: 'Second Announcement',
  content: 'This is the second announcement content',
  publication_date: new Date('2024-01-02')
};

const testAnnouncement3: CreateAnnouncementInput = {
  title: 'Third Announcement',
  content: 'This is the third announcement content',
  publication_date: new Date('2024-01-03')
};

describe('getAnnouncements', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no announcements exist', async () => {
    const result = await getAnnouncements();

    expect(result).toEqual([]);
  });

  it('should return all announcements ordered by publication date descending', async () => {
    // Create test announcements
    await db.insert(announcementsTable).values([
      testAnnouncement1,
      testAnnouncement2,
      testAnnouncement3
    ]).execute();

    const result = await getAnnouncements();

    expect(result).toHaveLength(3);
    
    // Verify ordering (newest first)
    expect(result[0].title).toEqual('Third Announcement');
    expect(result[0].publication_date).toEqual(new Date('2024-01-03'));
    
    expect(result[1].title).toEqual('Second Announcement');
    expect(result[1].publication_date).toEqual(new Date('2024-01-02'));
    
    expect(result[2].title).toEqual('First Announcement');
    expect(result[2].publication_date).toEqual(new Date('2024-01-01'));
  });

  it('should return announcement with all required fields', async () => {
    await db.insert(announcementsTable).values(testAnnouncement1).execute();

    const result = await getAnnouncements();

    expect(result).toHaveLength(1);
    const announcement = result[0];
    
    expect(announcement.id).toBeDefined();
    expect(typeof announcement.id).toBe('number');
    expect(announcement.title).toEqual('First Announcement');
    expect(announcement.content).toEqual('This is the first announcement content');
    expect(announcement.publication_date).toEqual(new Date('2024-01-01'));
    expect(announcement.created_at).toBeInstanceOf(Date);
    expect(announcement.updated_at).toBeNull();
  });

  it('should handle single announcement correctly', async () => {
    await db.insert(announcementsTable).values(testAnnouncement2).execute();

    const result = await getAnnouncements();

    expect(result).toHaveLength(1);
    expect(result[0].title).toEqual('Second Announcement');
    expect(result[0].content).toEqual('This is the second announcement content');
    expect(result[0].publication_date).toEqual(new Date('2024-01-02'));
  });
});
