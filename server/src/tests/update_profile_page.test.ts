
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { profilePagesTable } from '../db/schema';
import { type UpdateProfilePageInput, type CreateProfilePageInput } from '../schema';
import { updateProfilePage } from '../handlers/update_profile_page';
import { eq } from 'drizzle-orm';

// Helper function to create test profile page
const createTestProfilePage = async (input: CreateProfilePageInput) => {
  const result = await db.insert(profilePagesTable)
    .values({
      page_type: input.page_type,
      title: input.title,
      content: input.content
    })
    .returning()
    .execute();
  
  return result[0];
};

describe('updateProfilePage', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update all fields of a profile page', async () => {
    // Create initial profile page
    const initialPage = await createTestProfilePage({
      page_type: 'visi_misi',
      title: 'Original Title',
      content: 'Original Content'
    });

    const updateInput: UpdateProfilePageInput = {
      id: initialPage.id,
      page_type: 'struktur_organisasi',
      title: 'Updated Title',
      content: 'Updated Content'
    };

    const result = await updateProfilePage(updateInput);

    expect(result.id).toEqual(initialPage.id);
    expect(result.page_type).toEqual('struktur_organisasi');
    expect(result.title).toEqual('Updated Title');
    expect(result.content).toEqual('Updated Content');
    expect(result.created_at).toEqual(initialPage.created_at);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at).not.toEqual(initialPage.updated_at);
  });

  it('should update only specified fields', async () => {
    // Create initial profile page
    const initialPage = await createTestProfilePage({
      page_type: 'visi_misi',
      title: 'Original Title',
      content: 'Original Content'
    });

    const updateInput: UpdateProfilePageInput = {
      id: initialPage.id,
      title: 'Updated Title Only'
    };

    const result = await updateProfilePage(updateInput);

    expect(result.id).toEqual(initialPage.id);
    expect(result.page_type).toEqual('visi_misi'); // Unchanged
    expect(result.title).toEqual('Updated Title Only');
    expect(result.content).toEqual('Original Content'); // Unchanged
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save changes to database', async () => {
    // Create initial profile page
    const initialPage = await createTestProfilePage({
      page_type: 'sejarah',
      title: 'History Title',
      content: 'History Content'
    });

    const updateInput: UpdateProfilePageInput = {
      id: initialPage.id,
      title: 'Updated History Title',
      content: 'Updated History Content'
    };

    await updateProfilePage(updateInput);

    // Verify changes in database
    const updatedPages = await db.select()
      .from(profilePagesTable)
      .where(eq(profilePagesTable.id, initialPage.id))
      .execute();

    expect(updatedPages).toHaveLength(1);
    expect(updatedPages[0].title).toEqual('Updated History Title');
    expect(updatedPages[0].content).toEqual('Updated History Content');
    expect(updatedPages[0].page_type).toEqual('sejarah');
    expect(updatedPages[0].updated_at).toBeInstanceOf(Date);
  });

  it('should throw error when profile page does not exist', async () => {
    const updateInput: UpdateProfilePageInput = {
      id: 999, // Non-existent ID
      title: 'Updated Title'
    };

    await expect(updateProfilePage(updateInput))
      .rejects
      .toThrow(/Profile page with id 999 not found/i);
  });

  it('should update page_type correctly', async () => {
    // Create initial profile page
    const initialPage = await createTestProfilePage({
      page_type: 'visi_misi',
      title: 'Vision Mission',
      content: 'Our vision and mission'
    });

    const updateInput: UpdateProfilePageInput = {
      id: initialPage.id,
      page_type: 'struktur_organisasi'
    };

    const result = await updateProfilePage(updateInput);

    expect(result.page_type).toEqual('struktur_organisasi');
    expect(result.title).toEqual('Vision Mission'); // Unchanged
    expect(result.content).toEqual('Our vision and mission'); // Unchanged
  });

  it('should always update updated_at timestamp', async () => {
    // Create initial profile page
    const initialPage = await createTestProfilePage({
      page_type: 'visi_misi',
      title: 'Test Title',
      content: 'Test Content'
    });

    // Wait a moment to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateProfilePageInput = {
      id: initialPage.id,
      content: 'Slightly Updated Content'
    };

    const result = await updateProfilePage(updateInput);

    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at!.getTime()).toBeGreaterThan(initialPage.created_at.getTime());
  });
});
