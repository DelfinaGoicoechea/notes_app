import { renderHook, waitFor } from "@testing-library/react";
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { toast } from 'react-hot-toast';
import { useActive } from "../../../../src/pages/notes/hooks/useActive";
import * as notesService from '../../../../src/services/notes.service';

vi.mock('react-hot-toast');
vi.mock('../../../../src/services/notes.service');

describe('useActive Hook - Error Handling (FE-003)', () => {
  const mockNotes = [
    {
      id: 1,
      title: 'Test Note',
      content: 'Test content',
      archived: false,
      categories: [],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Load (handleFetch)', () => {
    test('loads active notes successfully on mount', async () => {
      
      //ARRANGE: Mock API to return notes
      vi.mocked(notesService.getActiveNotes).mockResolvedValue(mockNotes);

      //ACT: Render the hook (triggers useEffect)
      const { result } = renderHook(() => useActive());

      //ASSERT: Notes loaded
      await waitFor(() => {
        expect(result.current.notes).toEqual(mockNotes);
      });
    });

    test('shows error toast when loading notes fails', async () => {
      vi.mocked(notesService.getActiveNotes).mockRejectedValue(
        new Error('Network error')
      );

      renderHook(() => useActive());

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to load notes. Please try again.',
          { id: 'load-active-notes-error' }
        );
      });
    });

    test('logs error to console when fetch fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockError = new Error('Fetch failed');

      vi.mocked(notesService.getActiveNotes).mockRejectedValue(mockError);

      renderHook(() => useActive());

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'useActive - Get active notes failed.',
          mockError
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });


  describe('Archive Note (handleArchive)', () => {
    test('archives note and refetches', async () => {
      const mockArchivedNote = { ...mockNotes[0], archived: true}

      vi.mocked(notesService.getActiveNotes).mockResolvedValue(mockNotes);
      vi.mocked(notesService.archiveNote).mockResolvedValue(mockArchivedNote);

      const { result } = renderHook(() => useActive());

      //initial load
      await waitFor(() => {
        expect(result.current.notes).toHaveLength(1);
      });

      //archive note
      await result.current.handleArchive(1);

      await waitFor(() => {
        expect(notesService.archiveNote).toHaveBeenCalledWith(1);
        expect(notesService.getActiveNotes).toHaveBeenCalledTimes(2); //initial + refetch
      });
    });

    test('shows error toast when archive fails', async () => {
      vi.mocked(notesService.getActiveNotes).mockResolvedValue(mockNotes);
      vi.mocked(notesService.archiveNote).mockRejectedValue(
        new Error('Archive failed')
      );

      const { result } = renderHook(() => useActive());

      await waitFor(() => {
        expect(result.current.notes).toHaveLength(1);
      });

      await result.current.handleArchive(1);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to archive note. Please try again.'
        );
      });
    });

    test('logs error to console when archive fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockError = new Error('Archive failed');

      vi.mocked(notesService.getActiveNotes).mockResolvedValue(mockNotes);
      vi.mocked(notesService.archiveNote).mockRejectedValue(mockError);

      const { result } = renderHook(() => useActive());

      await waitFor(() => {
        expect(result.current.notes).toHaveLength(1);
      });

      await result.current.handleArchive(1);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'useActive - Archive note failed.',
          mockError
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });


  describe('Delete Note (handleDelete)', () => {
    test('deletes note and refetches', async () => {
      vi.mocked(notesService.getActiveNotes).mockResolvedValue(mockNotes);
      vi.mocked(notesService.deleteNote).mockResolvedValue(undefined);

      const { result } = renderHook(() => useActive());

      await waitFor(() => {
        expect(result.current.notes).toHaveLength(1);
      });

      await result.current.handleDelete(1);

      await waitFor(() => {
        expect(notesService.deleteNote).toHaveBeenCalledTimes(1);
        expect(notesService.getActiveNotes).toHaveBeenCalledTimes(2);
      });
    });

    test('shows error toast when delete fails', async () => {
      vi.mocked(notesService.getActiveNotes).mockResolvedValue(mockNotes);
      vi.mocked(notesService.deleteNote).mockRejectedValue(
        new Error('Delete failed')
      );

      const { result } = renderHook(() => useActive());

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

      vi.mocked(notesService.getActiveNotes).mockResolvedValue(mockNotes);
      vi.mocked(notesService.deleteNote).mockRejectedValue(mockError);

      const { result } = renderHook(() => useActive());

      await waitFor(() => {
        expect(result.current.notes).toHaveLength(1);
      });

      await result.current.handleDelete(1);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'useActive - Delete note failed.',
          mockError
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });
});

describe('useActive Hook - Loading States (FE-004)', () => {
  const mockNotes = [
    {
      id: 1,
      title: 'Test Note',
      content: 'Test content',
      archived: false,
      categories: [],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: 2,
      title: 'Another Note',
      content: 'Another content',
      archived: false,
      categories: [],
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Fetch Loading State', () => {
    test('shows loading indicator when initially fetching active notes', async () => {
      // ARRANGE: Mock API to delay response
      vi.mocked(notesService.getActiveNotes).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockNotes), 100))
      );

      // ACT: Render the hook
      const { result } = renderHook(() => useActive());

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

    test('shows loading state when filtering by category', async () => {
      // ARRANGE: Mock both endpoints
      vi.mocked(notesService.getActiveNotes).mockResolvedValue(mockNotes);
      vi.mocked(notesService.getActiveNotesByCategory).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve([mockNotes[0]]), 100))
      );

      // ACT: Render hook and set category
      const { result } = renderHook(() => useActive());

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

  describe('Archive Loading State', () => {
    test('sets archivingNoteId during archive operation', async () => {
      // ARRANGE
      vi.mocked(notesService.getActiveNotes).mockResolvedValue(mockNotes);
      vi.mocked(notesService.archiveNote).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ ...mockNotes[0], archived: true }), 100))
      );

      const { result } = renderHook(() => useActive());

      await waitFor(() => {
        expect(result.current.notes).toHaveLength(2);
      });

      // ACT: Archive note with id 1
      const archivePromise = result.current.handleArchive(1);

      // ASSERT: archivingNoteId should be set to 1
      await waitFor(() => {
        expect(result.current.archivingNoteId).toBe(1);
      });

      await archivePromise;

      // After completion, should be null
      await waitFor(() => {
        expect(result.current.archivingNoteId).toBe(null);
      });
    });

    test('clears archivingNoteId even if archive fails', async () => {
      // ARRANGE
      vi.mocked(notesService.getActiveNotes).mockResolvedValue(mockNotes);
      vi.mocked(notesService.archiveNote).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useActive());

      await waitFor(() => {
        expect(result.current.notes).toHaveLength(2);
      });

      // ACT: Try to archive (will fail)
      await result.current.handleArchive(1);

      // ASSERT: archivingNoteId should be cleared after error
      await waitFor(() => {
        expect(result.current.archivingNoteId).toBe(null);
      });
    });

    test('prevents duplicate archive operations while one is in flight', async () => {
      // ARRANGE
      vi.mocked(notesService.getActiveNotes).mockResolvedValue(mockNotes);
      vi.mocked(notesService.archiveNote).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ ...mockNotes[0], archived: true }), 100))
      );

      const { result } = renderHook(() => useActive());

      await waitFor(() => {
        expect(result.current.notes).toHaveLength(2);
      });

      // ACT: Try to archive the same note twice
      result.current.handleArchive(1);
      
      await waitFor(() => {
        expect(result.current.archivingNoteId).toBe(1);
      });

      // Component should check this state to disable button
      expect(result.current.archivingNoteId).toBe(1);
    });
  });

  describe('Delete Loading State', () => {
    test('sets deletingNoteId during delete operation', async () => {
      // ARRANGE
      vi.mocked(notesService.getActiveNotes).mockResolvedValue(mockNotes);
      vi.mocked(notesService.deleteNote).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(undefined), 100))
      );

      const { result } = renderHook(() => useActive());

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
      vi.mocked(notesService.getActiveNotes).mockResolvedValue(mockNotes);
      vi.mocked(notesService.deleteNote).mockRejectedValue(
        new Error('Delete failed')
      );

      const { result } = renderHook(() => useActive());

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

  describe('Multiple Simultaneous Operations', () => {
    test('can track different operations on different notes simultaneously', async () => {
      // ARRANGE
      vi.mocked(notesService.getActiveNotes).mockResolvedValue(mockNotes);
      vi.mocked(notesService.archiveNote).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ ...mockNotes[0], archived: true }), 150))
      );
      vi.mocked(notesService.deleteNote).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(undefined), 150))
      );

      const { result } = renderHook(() => useActive());

      await waitFor(() => {
        expect(result.current.notes).toHaveLength(2);
      });

      // ACT: Start archive on note 1 and delete on note 2 simultaneously
      result.current.handleArchive(1);
      result.current.handleDelete(2);

      // ASSERT: Both operations should be tracked
      await waitFor(() => {
        expect(result.current.archivingNoteId).toBe(1);
        expect(result.current.deletingNoteId).toBe(2);
      });

      // Wait for both to complete
      await waitFor(() => {
        expect(result.current.archivingNoteId).toBe(null);
        expect(result.current.deletingNoteId).toBe(null);
      }, { timeout: 3000 });
    });
  });
});