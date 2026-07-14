import { renderHook, waitFor } from "@testing-library/react";
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { toast } from 'react-hot-toast';
import { useArchived } from "../../../../src/pages/notes/hooks/useArchived";
import * as notesService from '../../../../src/services/notes.service';

vi.mock('react-hot-toast');
vi.mock('../../../../src/services/notes.service');

describe('useArchived Hook - Error Handling (FE-003)', () => {
  const mockNotes = [
    {
      id: 1,
      title: 'Test Note',
      content: 'Test content',
      archived: true,
      categories: [],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Load (handleFetch)', () => {
    test('loads archived notes successfully on mount', async () => {

      vi.mocked(notesService.getArchivedNotes).mockResolvedValue(mockNotes);

      const { result } = renderHook(() => useArchived());

      await waitFor(() => {
        expect(result.current.notes).toEqual(mockNotes);
      });
    });

    test('shows error toast when loading notes fails', async () => {
      vi.mocked(notesService.getArchivedNotes).mockRejectedValue(
        new Error('Network error')
      );

      renderHook(() => useArchived());

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to load archived notes. Please try again.',
          { id: 'load-archived-notes-error' }
        );
      });
    });

    test('logs error to console when fetch fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockError = new Error('Fetch failed');

      vi.mocked(notesService.getArchivedNotes).mockRejectedValue(mockError);

      renderHook(() => useArchived());

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'useArchived - Get archived notes failed.',
          mockError
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });


  describe('Unarchive Note (handleUnarchive)', () => {
    test('Unarchives note and refetches', async () => {
      const mockUnarchivedNote = { ...mockNotes[0], archived: false}

      vi.mocked(notesService.getArchivedNotes).mockResolvedValue(mockNotes);
      vi.mocked(notesService.unarchiveNote).mockResolvedValue(mockUnarchivedNote);

      const { result } = renderHook(() => useArchived());

      //initial load
      await waitFor(() => {
        expect(result.current.notes).toHaveLength(1);
      });

      //archive note
      await result.current.handleUnarchive(1);

      await waitFor(() => {
        expect(notesService.unarchiveNote).toHaveBeenCalledWith(1);
        expect(notesService.getArchivedNotes).toHaveBeenCalledTimes(2); //initial + refetch
      });
    });

    test('shows error toast when unarchive fails', async () => {
      vi.mocked(notesService.getArchivedNotes).mockResolvedValue(mockNotes);
      vi.mocked(notesService.unarchiveNote).mockRejectedValue(
        new Error('Unarchive failed')
      );

      const { result } = renderHook(() => useArchived());

      await waitFor(() => {
        expect(result.current.notes).toHaveLength(1);
      });

      await result.current.handleUnarchive(1);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to unarchive note. Please try again.'
        );
      });
    });

    test('logs error to console when archive fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockError = new Error('Unarchive failed');

      vi.mocked(notesService.getArchivedNotes).mockResolvedValue(mockNotes);
      vi.mocked(notesService.unarchiveNote).mockRejectedValue(mockError);

      const { result } = renderHook(() => useArchived());

      await waitFor(() => {
        expect(result.current.notes).toHaveLength(1);
      });

      await result.current.handleUnarchive(1);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'useArchived - Unarchive note failed.',
          mockError
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });


  describe('Delete Note (handleDelete)', () => {
    test('deletes note and refetches', async () => {
      vi.mocked(notesService.getArchivedNotes).mockResolvedValue(mockNotes);
      vi.mocked(notesService.deleteNote).mockResolvedValue(undefined);

      const { result } = renderHook(() => useArchived());

      await waitFor(() => {
        expect(result.current.notes).toHaveLength(1);
      });

      await result.current.handleDelete(1);

      await waitFor(() => {
        expect(notesService.deleteNote).toHaveBeenCalledTimes(1);
        expect(notesService.getArchivedNotes).toHaveBeenCalledTimes(2);
      });
    });

    test('shows error toast when delete fails', async () => {
      vi.mocked(notesService.getArchivedNotes).mockResolvedValue(mockNotes);
      vi.mocked(notesService.deleteNote).mockRejectedValue(
        new Error('Delete failed')
      );

      const { result } = renderHook(() => useArchived());

      await waitFor(() => {
        expect(result.current.notes).toHaveLength(1);
      });

      await result.current.handleDelete(1);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to delete note. Please try again.'
        );
      });
    });

    test('logs error to console when delete fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockError = new Error('Delete failed');

      vi.mocked(notesService.getArchivedNotes).mockResolvedValue(mockNotes);
      vi.mocked(notesService.deleteNote).mockRejectedValue(mockError);

      const { result } = renderHook(() => useArchived());

      await waitFor(() => {
        expect(result.current.notes).toHaveLength(1);
      });

      await result.current.handleDelete(1);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'useArchived - Delete note failed.',
          mockError
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });
});

describe('useArchived Hook - Loading States (FE-004)', () => {
  const mockNotes = [
    {
      id: 1,
      title: 'Archived Note 1',
      content: 'Content 1',
      archived: true,
      categories: [],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: 2,
      title: 'Archived Note 2',
      content: 'Content 2',
      archived: true,
      categories: [],
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Fetch Loading State', () => {
    test('shows loading indicator when initially fetching archived notes', async () => {
      // ARRANGE: Mock API to delay response
      vi.mocked(notesService.getArchivedNotes).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockNotes), 100))
      );

      // ACT: Render the hook
      const { result } = renderHook(() => useArchived());

      // ASSERT: isLoading should become true during fetch
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      // Wait for fetch to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.notes).toEqual(mockNotes);
      });
    });

    test('shows loading state when filtering archived notes by category', async () => {
      // ARRANGE: Mock both endpoints
      vi.mocked(notesService.getArchivedNotes).mockResolvedValue(mockNotes);
      vi.mocked(notesService.getArchivedNotesByCategory).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve([mockNotes[0]]), 100))
      );

      // ACT: Render hook and set category
      const { result } = renderHook(() => useArchived());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Change category to trigger filtered fetch
      result.current.setCategory('work');

      // ASSERT: Should show loading during debounce and fetch
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.notes).toEqual([mockNotes[0]]);
      });
    });
  });

  describe('Unarchive Loading State', () => {
    test('sets unarchivingNoteId during unarchive operation', async () => {
      // ARRANGE
      vi.mocked(notesService.getArchivedNotes).mockResolvedValue(mockNotes);
      vi.mocked(notesService.unarchiveNote).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ ...mockNotes[0], archived: false }), 100))
      );

      const { result } = renderHook(() => useArchived());

      await waitFor(() => {
        expect(result.current.notes).toHaveLength(2);
      });

      // ACT: Unarchive note with id 1
      const unarchivePromise = result.current.handleUnarchive(1);

      // ASSERT: unarchivingNoteId should be set to 1
      await waitFor(() => {
        expect(result.current.unarchivingNoteId).toBe(1);
      });

      await unarchivePromise;

      // After completion, should be null
      await waitFor(() => {
        expect(result.current.unarchivingNoteId).toBe(null);
      });
    });

    test('clears unarchivingNoteId even if unarchive fails', async () => {
      // ARRANGE
      vi.mocked(notesService.getArchivedNotes).mockResolvedValue(mockNotes);
      vi.mocked(notesService.unarchiveNote).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useArchived());

      await waitFor(() => {
        expect(result.current.notes).toHaveLength(2);
      });

      // ACT: Try to unarchive (will fail)
      await result.current.handleUnarchive(1);

      // ASSERT: unarchivingNoteId should be cleared after error
      await waitFor(() => {
        expect(result.current.unarchivingNoteId).toBe(null);
      });
    });
  });

  describe('Delete Loading State', () => {
    test('sets deletingNoteId during delete operation', async () => {
      // ARRANGE
      vi.mocked(notesService.getArchivedNotes).mockResolvedValue(mockNotes);
      vi.mocked(notesService.deleteNote).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(undefined), 100))
      );

      const { result } = renderHook(() => useArchived());

      await waitFor(() => {
        expect(result.current.notes).toHaveLength(2);
      });

      // ACT: Delete note with id 2
      const deletePromise = result.current.handleDelete(2);

      // ASSERT: deletingNoteId should be set to 2
      await waitFor(() => {
        expect(result.current.deletingNoteId).toBe(2);
      });

      await deletePromise;

      // After completion, should be null
      await waitFor(() => {
        expect(result.current.deletingNoteId).toBe(null);
      });
    });

    test('clears deletingNoteId even if delete fails', async () => {
      // ARRANGE
      vi.mocked(notesService.getArchivedNotes).mockResolvedValue(mockNotes);
      vi.mocked(notesService.deleteNote).mockRejectedValue(
        new Error('Delete failed')
      );

      const { result } = renderHook(() => useArchived());

      await waitFor(() => {
        expect(result.current.notes).toHaveLength(2);
      });

      // ACT: Try to delete (will fail)
      await result.current.handleDelete(2);

      // ASSERT: deletingNoteId should be cleared after error
      await waitFor(() => {
        expect(result.current.deletingNoteId).toBe(null);
      });
    });
  });
});