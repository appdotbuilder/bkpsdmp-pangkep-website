
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { profilePagesTable } from '../db/schema';
import { type CreateProfilePageInput, type GetProfilePageByTypeInput } from '../schema';
import { getProfilePageByType } from '../handlers/get_profile_page_by_type';

// Test data
const visiMisiInput: CreateProfilePageInput = {
  page_type: 'visi_misi',
  title: 'Visi dan Misi',
  content: 'Visi dan misi organisasi kami adalah...'
};

const strukturInput: CreateProfilePageInput = {
  page_type: 'struktur_organisasi',
  title: 'Struktur Organisasi',
  content: 'Struktur organisasi terdiri dari...'
};

describe('getProfilePageByType', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return profile page when found', async () => {
    // Create test profile page
    await db.insert(profilePagesTable)
      .values({
        page_type: visiMisiInput.page_type,
        title: visiMisiInput.title,
        content: visiMisiInput.content
      })
      .execute();

    const input: GetProfilePageByTypeInput = {
      page_type: 'visi_misi'
    };

    const result = await getProfilePageByType(input);

    expect(result).not.toBeNull();
    expect(result!.page_type).toEqual('visi_misi');
    expect(result!.title).toEqual('Visi dan Misi');
    expect(result!.content).toEqual('Visi dan misi organisasi kami adalah...');
    expect(result!.id).toBeDefined();
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeNull();
  });

  it('should return null when profile page not found', async () => {
    const input: GetProfilePageByTypeInput = {
      page_type: 'sejarah'
    };

    const result = await getProfilePageByType(input);

    expect(result).toBeNull();
  });

  it('should return correct page when multiple pages exist', async () => {
    // Create multiple profile pages
    await db.insert(profilePagesTable)
      .values([
        {
          page_type: visiMisiInput.page_type,
          title: visiMisiInput.title,
          content: visiMisiInput.content
        },
        {
          page_type: strukturInput.page_type,
          title: strukturInput.title,
          content: strukturInput.content
        }
      ])
      .execute();

    const input: GetProfilePageByTypeInput = {
      page_type: 'struktur_organisasi'
    };

    const result = await getProfilePageByType(input);

    expect(result).not.toBeNull();
    expect(result!.page_type).toEqual('struktur_organisasi');
    expect(result!.title).toEqual('Struktur Organisasi');
    expect(result!.content).toEqual('Struktur organisasi terdiri dari...');
  });

  it('should handle all valid profile page types', async () => {
    const sejarahInput: CreateProfilePageInput = {
      page_type: 'sejarah',
      title: 'Sejarah Organisasi',
      content: 'Sejarah panjang organisasi dimulai dari...'
    };

    // Create profile page
    await db.insert(profilePagesTable)
      .values({
        page_type: sejarahInput.page_type,
        title: sejarahInput.title,
        content: sejarahInput.content
      })
      .execute();

    const input: GetProfilePageByTypeInput = {
      page_type: 'sejarah'
    };

    const result = await getProfilePageByType(input);

    expect(result).not.toBeNull();
    expect(result!.page_type).toEqual('sejarah');
    expect(result!.title).toEqual('Sejarah Organisasi');
    expect(result!.content).toEqual('Sejarah panjang organisasi dimulai dari...');
  });
});
