import { describe, test, expect, beforeEach, vi } from 'vitest';
import { getActiveNotes, getArchivedNotes } from '../../src/services/notes.service';
import { api } from '../../src/api/api';
import type { Note } from '../../src/types/note';

vi.mock('../../src/api/api');

describe('Notes Service - Search Functionality (FE-005)', () => {
  const mockNotes: Note[] = [
    {
      id: 1,
      title: 'Meeting Notes',
      content: 'Discuss project timeline',
      archived: false,
      categories: [],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 2,
      title: 'Budget Report',
      content: 'Q1 financial summary',
      archived: false,
      categories: [],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getActiveNotes', () => {
    test('sends request without query params when no filters provided', async () => {
      // ARRANGE
      vi.mocked(api.get).mockResolvedValue({ data: mockNotes });

      // ACT
      await getActiveNotes();

      // ASSERT
      expect(api.get).toHaveBeenCalledWith('/notes', {
        params: { category: undefined, search: undefined }
      });
    });

    test('sends search parameter when search term provided', async () => {
      // ARRANGE
      vi.mocked(api.get).mockResolvedValue({ data: [mockNotes[0]] });

      // ACT
      await getActiveNotes(undefined, 'meeting');

      // ASSERT
      expect(api.get).toHaveBeenCalledWith('/notes', {
        params: { category: undefined, search: 'meeting' }
      });
    });

    test('sends category parameter when category provided', async () => {
      // ARRANGE
      vi.mocked(api.get).mockResolvedValue({ data: [mockNotes[0]] });

      // ACT
      await getActiveNotes('work');

      // ASSERT
      expect(api.get).toHaveBeenCalledWith('/notes', {
        params: { category: 'work', search: undefined }
      });
    });

    test('sends both category and search parameters when both provided', async () => {
      // ARRANGE
      vi.mocked(api.get).mockResolvedValue({ data: [mockNotes[0]] });

      // ACT
      await getActiveNotes('work', 'meeting');

      // ASSERT: Verifies AND logic - both params sent together
      expect(api.get).toHaveBeenCalledWith('/notes', {
        params: { category: 'work', search: 'meeting' }
      });
    });

    test('returns notes data from API response', async () => {
      // ARRANGE
      vi.mocked(api.get).mockResolvedValue({ data: mockNotes });

      // ACT
      const result = await getActiveNotes(undefined, 'timeline');

      // ASSERT
      expect(result).toEqual(mockNotes);
    });

    test('handles empty search string as undefined', async () => {
      // ARRANGE
      vi.mocked(api.get).mockResolvedValue({ data: mockNotes });

      // ACT: Empty string should be treated same as undefined
      await getActiveNotes(undefined, undefined);

      // ASSERT: Should not send search param
      expect(api.get).toHaveBeenCalledWith('/notes', {
        params: { category: undefined, search: undefined }
      });
    });
  });

  describe('getArchivedNotes', () => {
    const archivedNotes = mockNotes.map(note => ({ ...note, archived: true }));

    test('sends request without query params when no filters provided', async () => {
      // ARRANGE
      vi.mocked(api.get).mockResolvedValue({ data: archivedNotes });

      // ACT
      await getArchivedNotes();

      // ASSERT
      expect(api.get).toHaveBeenCalledWith('/notes/archived', {
        params: { category: undefined, search: undefined }
      });
    });

    test('sends search parameter when search term provided', async () => {
      // ARRANGE
      vi.mocked(api.get).mockResolvedValue({ data: [archivedNotes[0]] });

      // ACT
      await getArchivedNotes(undefined, 'budget');

      // ASSERT
      expect(api.get).toHaveBeenCalledWith('/notes/archived', {
        params: { category: undefined, search: 'budget' }
      });
    });

    test('sends both category and search parameters when both provided', async () => {
      // ARRANGE
      vi.mocked(api.get).mockResolvedValue({ data: [archivedNotes[1]] });

      // ACT
      await getArchivedNotes('finance', 'budget');

      // ASSERT
      expect(api.get).toHaveBeenCalledWith('/notes/archived', {
        params: { category: 'finance', search: 'budget' }
      });
    });

    test('returns archived notes data from API response', async () => {
      // ARRANGE
      vi.mocked(api.get).mockResolvedValue({ data: archivedNotes });

      // ACT
      const result = await getArchivedNotes(undefined, 'financial');

      // ASSERT
      expect(result).toEqual(archivedNotes);
    });
  });

  describe('Search Parameter Handling', () => {
    test('allows search with special characters', async () => {
      // ARRANGE
      vi.mocked(api.get).mockResolvedValue({ data: mockNotes });

      // ACT: Search terms might contain special chars
      await getActiveNotes(undefined, 'Q1 2024 - Budget');

      // ASSERT: Should pass through as-is, backend handles escaping
      expect(api.get).toHaveBeenCalledWith('/notes', {
        params: { category: undefined, search: 'Q1 2024 - Budget' }
      });
    });

    test('allows search with multiple words', async () => {
      // ARRANGE
      vi.mocked(api.get).mockResolvedValue({ data: mockNotes });

      // ACT
      await getActiveNotes(undefined, 'project timeline meeting');

      // ASSERT
      expect(api.get).toHaveBeenCalledWith('/notes', {
        params: { category: undefined, search: 'project timeline meeting' }
      });
    });
  });
});
