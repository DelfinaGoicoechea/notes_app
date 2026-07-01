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