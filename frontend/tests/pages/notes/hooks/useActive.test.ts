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