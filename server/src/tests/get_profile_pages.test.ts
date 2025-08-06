
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { profilePagesTable } from '../db/schema';
import { type CreateProfilePageInput } from '../schema';
import { getProfilePages } from '../handlers/get_profile_pages';

describe('getProfilePages', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no profile pages exist', async () => {
    const result = await getProfilePages();

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should return all profile pages when they exist', async () => {
    // Create test profile pages
    const testPages: CreateProfilePageInput[] = [
      {
        page_type: 'visi_misi',
        title: 'Visi & Misi',
        content: 'Visi dan misi organisasi kami'
      },
      {
        page_type: 'struktur_organisasi',
        title: 'Struktur Organisasi',
        content: 'Struktur organisasi lengkap'
      },
      {
        page_type: 'sejarah',
        title: 'Sejarah',
        content: 'Sejarah panjang organisasi'
      }
    ];

    // Insert test data
    await db.insert(profilePagesTable)
      .values(testPages)
      .execute();

    const result = await getProfilePages();

    expect(result).toHaveLength(3);
    
    // Verify all pages are returned
    const pageTypes = result.map(page => page.page_type);
    expect(pageTypes).toContain('visi_misi');
    expect(pageTypes).toContain('struktur_organisasi');
    expect(pageTypes).toContain('sejarah');

    // Verify structure of returned data
    result.forEach(page => {
      expect(page.id).toBeDefined();
      expect(typeof page.id).toBe('number');
      expect(page.page_type).toBeDefined();
      expect(page.title).toBeDefined();
      expect(page.content).toBeDefined();
      expect(page.created_at).toBeInstanceOf(Date);
      expect(page.updated_at).toBeNull(); // Should be null for new records
    });
  });

  it('should return profile pages with correct data structure', async () => {
    const testPage: CreateProfilePageInput = {
      page_type: 'visi_misi',
      title: 'Test Visi Misi',
      content: 'Test content for visi misi page'
    };

    await db.insert(profilePagesTable)
      .values(testPage)
      .execute();

    const result = await getProfilePages();

    expect(result).toHaveLength(1);
    
    const page = result[0];
    expect(page.page_type).toEqual('visi_misi');
    expect(page.title).toEqual('Test Visi Misi');
    expect(page.content).toEqual('Test content for visi misi page');
    expect(page.created_at).toBeInstanceOf(Date);
    expect(page.updated_at).toBeNull();
  });

  it('should handle multiple pages with same type', async () => {
    // Create multiple pages with same type (edge case)
    const testPages: CreateProfilePageInput[] = [
      {
        page_type: 'visi_misi',
        title: 'Visi Misi 1',
        content: 'First visi misi content'
      },
      {
        page_type: 'visi_misi',
        title: 'Visi Misi 2',
        content: 'Second visi misi content'
      }
    ];

    await db.insert(profilePagesTable)
      .values(testPages)
      .execute();

    const result = await getProfilePages();

    expect(result).toHaveLength(2);
    
    // Both should have same page_type but different content
    result.forEach(page => {
      expect(page.page_type).toEqual('visi_misi');
    });

    const titles = result.map(page => page.title);
    expect(titles).toContain('Visi Misi 1');
    expect(titles).toContain('Visi Misi 2');
  });
});
