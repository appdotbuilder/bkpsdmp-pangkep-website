
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { profilePagesTable } from '../db/schema';
import { type CreateProfilePageInput } from '../schema';
import { createProfilePage } from '../handlers/create_profile_page';
import { eq } from 'drizzle-orm';

// Test input for visi_misi page type
const testVisiMisiInput: CreateProfilePageInput = {
  page_type: 'visi_misi',
  title: 'Visi dan Misi Organisasi',
  content: 'Visi: Menjadi organisasi terbaik. Misi: Memberikan pelayanan terbaik kepada masyarakat.'
};

// Test input for struktur_organisasi page type
const testStrukturInput: CreateProfilePageInput = {
  page_type: 'struktur_organisasi',
  title: 'Struktur Organisasi',
  content: 'Struktur organisasi terdiri dari Direktur, Manager, dan Staff.'
};

// Test input for sejarah page type
const testSejarahInput: CreateProfilePageInput = {
  page_type: 'sejarah',
  title: 'Sejarah Organisasi',
  content: 'Organisasi ini didirikan pada tahun 2020 dengan tujuan melayani masyarakat.'
};

describe('createProfilePage', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a visi_misi profile page', async () => {
    const result = await createProfilePage(testVisiMisiInput);

    // Basic field validation
    expect(result.page_type).toEqual('visi_misi');
    expect(result.title).toEqual('Visi dan Misi Organisasi');
    expect(result.content).toEqual(testVisiMisiInput.content);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeNull();
  });

  it('should create a struktur_organisasi profile page', async () => {
    const result = await createProfilePage(testStrukturInput);

    // Basic field validation
    expect(result.page_type).toEqual('struktur_organisasi');
    expect(result.title).toEqual('Struktur Organisasi');
    expect(result.content).toEqual(testStrukturInput.content);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeNull();
  });

  it('should create a sejarah profile page', async () => {
    const result = await createProfilePage(testSejarahInput);

    // Basic field validation
    expect(result.page_type).toEqual('sejarah');
    expect(result.title).toEqual('Sejarah Organisasi');
    expect(result.content).toEqual(testSejarahInput.content);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeNull();
  });

  it('should save profile page to database', async () => {
    const result = await createProfilePage(testVisiMisiInput);

    // Query using proper drizzle syntax
    const profilePages = await db.select()
      .from(profilePagesTable)
      .where(eq(profilePagesTable.id, result.id))
      .execute();

    expect(profilePages).toHaveLength(1);
    expect(profilePages[0].page_type).toEqual('visi_misi');
    expect(profilePages[0].title).toEqual('Visi dan Misi Organisasi');
    expect(profilePages[0].content).toEqual(testVisiMisiInput.content);
    expect(profilePages[0].created_at).toBeInstanceOf(Date);
    expect(profilePages[0].updated_at).toBeNull();
  });

  it('should create multiple profile pages with different types', async () => {
    // Create multiple profile pages
    const visiResult = await createProfilePage(testVisiMisiInput);
    const strukturResult = await createProfilePage(testStrukturInput);
    const sejarahResult = await createProfilePage(testSejarahInput);

    // Verify all pages were created with different IDs
    expect(visiResult.id).not.toEqual(strukturResult.id);
    expect(strukturResult.id).not.toEqual(sejarahResult.id);
    expect(visiResult.id).not.toEqual(sejarahResult.id);

    // Verify all pages exist in database
    const allPages = await db.select()
      .from(profilePagesTable)
      .execute();

    expect(allPages).toHaveLength(3);
    
    // Check each page type exists
    const pageTypes = allPages.map(page => page.page_type);
    expect(pageTypes).toContain('visi_misi');
    expect(pageTypes).toContain('struktur_organisasi');
    expect(pageTypes).toContain('sejarah');
  });
});
