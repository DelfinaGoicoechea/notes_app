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
      // ARRANGE: Mock getArchivedNotes with delayed response
      vi.mocked(notesService.getArchivedNotes).mockImplementation(
        async (...args) => {
          // First call (no params) - initial load, return quickly
          if (!args[0] && !args[1]) {
            return mockNotes;
          }
          // Second call (with category) - simulate slow network
          await new Promise(resolve => setTimeout(resolve, 300));
          return [mockNotes[0]];
        }
      );

      // ACT: Render hook
      const { result } = renderHook(() => useArchived());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.notes).toHaveLength(2);
      });

      // Change category to trigger filtered fetch
      result.current.setCategory('work');

      // ASSERT: Should show loading after debounce triggers
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      }, { timeout: 1500 });

      // Should complete and show filtered results
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.notes).toEqual([mockNotes[0]]);
      });
    });
  });

  describe('Unarchive Loading State', () => {
    test('sets unarchivingNoteId during unarchive operation', async () => {
      // ARRANGE
      vi.mocked(notesService.getArchivedNotes).mockImplementation(async () => mockNotes);
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

describe('useArchived Hook - Search Functionality (FE-005)', () => {
  const mockNotes = [
    {
      id: 1,
      title: 'Old Meeting Notes',
      content: 'Past project discussion',
      archived: true,
      categories: [],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: 2,
      title: 'Archived Budget',
      content: 'Last year financial data',
      archived: true,
      categories: [],
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Search State Management', () => {
    test('initializes with empty search string', () => {
      // ACT
      const { result } = renderHook(() => useArchived());

      // ASSERT
      expect(result.current.search).toBe('');
    });

    test('updates search state when setSearch is called', async () => {
      // ARRANGE
      vi.mocked(notesService.getArchivedNotes).mockResolvedValue(mockNotes);
      const { result } = renderHook(() => useArchived());

      await waitFor(() => {
        expect(result.current.notes).toBeDefined();
      });

      // ACT
      result.current.setSearch('budget');

      // ASSERT
      await waitFor(() => {
        expect(result.current.search).toBe('budget');
      });
    });

    test('exports search and setSearch in return object', () => {
      // ARRANGE
      vi.mocked(notesService.getArchivedNotes).mockResolvedValue(mockNotes);
      const { result } = renderHook(() => useArchived());

      // ASSERT
      expect(result.current).toHaveProperty('search');
      expect(result.current).toHaveProperty('setSearch');
      expect(typeof result.current.setSearch).toBe('function');
    });
  });

  describe('Search Filtering', () => {
    test('fetches archived notes with search parameter when search is set', async () => {
      // ARRANGE
      vi.mocked(notesService.getArchivedNotes).mockResolvedValue([mockNotes[0]]);

      const { result } = renderHook(() => useArchived());

      await waitFor(() => {
        expect(result.current.notes).toBeDefined();
      });

      // ACT: Set search
      result.current.setSearch('meeting');

      // ASSERT: Should call API with search parameter after debounce
      await waitFor(() => {
        expect(notesService.getArchivedNotes).toHaveBeenCalledWith(
          undefined, // category
          'meeting'  // search
        );
      }, { timeout: 1000 });
    });

    test('trims search value before sending to API', async () => {
      // ARRANGE
      vi.mocked(notesService.getArchivedNotes).mockResolvedValue(mockNotes);

      const { result } = renderHook(() => useArchived());

      await waitFor(() => {
        expect(result.current.notes).toBeDefined();
      });

      // ACT: Set search with leading/trailing spaces
      result.current.setSearch('  financial  ');

      // ASSERT: Should trim before calling API
      await waitFor(() => {
        expect(notesService.getArchivedNotes).toHaveBeenCalledWith(
          undefined,
          'financial'
        );
      }, { timeout: 1000 });
    });

    test('sends undefined when search is empty string', async () => {
      // ARRANGE
      vi.mocked(notesService.getArchivedNotes).mockResolvedValue(mockNotes);

      const { result } = renderHook(() => useArchived());

      await waitFor(() => {
        expect(result.current.notes).toBeDefined();
      });

      // ACT: Set search to empty
      result.current.setSearch('');

      // ASSERT: Should send undefined, not empty string
      await waitFor(() => {
        expect(notesService.getArchivedNotes).toHaveBeenCalledWith(
          undefined,
          undefined
        );
      }, { timeout: 1000 });
    });

    test('sends undefined when search is only whitespace', async () => {
      // ARRANGE
      vi.mocked(notesService.getArchivedNotes).mockResolvedValue(mockNotes);

      const { result } = renderHook(() => useArchived());

      await waitFor(() => {
        expect(result.current.notes).toBeDefined();
      });

      // ACT: Set search to whitespace only
      result.current.setSearch('   ');

      // ASSERT: Should trim to empty and send undefined
      await waitFor(() => {
        expect(notesService.getArchivedNotes).toHaveBeenCalledWith(
          undefined,
          undefined
        );
      }, { timeout: 1000 });
    });
  });

  describe('Combined Search and Category Filtering', () => {
    test('sends both category and search parameters when both are set', async () => {
      // ARRANGE
      vi.mocked(notesService.getArchivedNotes).mockResolvedValue([mockNotes[1]]);

      const { result } = renderHook(() => useArchived());

      await waitFor(() => {
        expect(result.current.notes).toBeDefined();
      });

      // ACT: Set both filters
      result.current.setCategory('finance');
      result.current.setSearch('budget');

      // ASSERT: Should call API with both parameters (AND logic)
      await waitFor(() => {
        expect(notesService.getArchivedNotes).toHaveBeenCalledWith(
          'finance',
          'budget'
        );
      }, { timeout: 1000 });
    });

    test('category filter continues working with empty search', async () => {
      // ARRANGE
      vi.mocked(notesService.getArchivedNotes).mockResolvedValue([mockNotes[0]]);

      const { result } = renderHook(() => useArchived());

      await waitFor(() => {
        expect(result.current.notes).toBeDefined();
      });

      // ACT: Set only category
      result.current.setCategory('project');

      // ASSERT: Should call API with category only
      await waitFor(() => {
        expect(notesService.getArchivedNotes).toHaveBeenCalledWith(
          'project',
          undefined
        );
      }, { timeout: 1000 });
    });

    test('clearing search while category is set maintains category filter', async () => {
      // ARRANGE
      vi.mocked(notesService.getArchivedNotes).mockResolvedValue(mockNotes);

      const { result } = renderHook(() => useArchived());

      await waitFor(() => {
        expect(result.current.notes).toBeDefined();
      });

      // Set both
      result.current.setCategory('finance');
      result.current.setSearch('budget');

      await waitFor(() => {
        expect(notesService.getArchivedNotes).toHaveBeenCalledWith('finance', 'budget');
      }, { timeout: 1000 });

      vi.clearAllMocks();

      // ACT: Clear search
      result.current.setSearch('');

      // ASSERT: Should still have category
      await waitFor(() => {
        expect(notesService.getArchivedNotes).toHaveBeenCalledWith(
          'finance',
          undefined
        );
      }, { timeout: 1000 });
    });
  });

  describe('Search Debouncing', () => {
    test('debounces search input with 300ms delay', async () => {
      // ARRANGE
      vi.mocked(notesService.getArchivedNotes).mockResolvedValue(mockNotes);

      const { result } = renderHook(() => useArchived());

      await waitFor(() => {
        expect(result.current.notes).toBeDefined();
      });

      vi.clearAllMocks();

      // ACT: Type search quickly (simulate user typing)
      result.current.setSearch('b');
      result.current.setSearch('bu');
      result.current.setSearch('bud');
      result.current.setSearch('budg');
      result.current.setSearch('budge');
      result.current.setSearch('budget');

      // ASSERT: Should not call API immediately
      expect(notesService.getArchivedNotes).not.toHaveBeenCalled();

      // Wait for debounce
      await waitFor(() => {
        expect(notesService.getArchivedNotes).toHaveBeenCalledTimes(1);
        expect(notesService.getArchivedNotes).toHaveBeenCalledWith(
          undefined,
          'budget'
        );
      }, { timeout: 1000 });
    });

    test('debounces both category and search changes together', async () => {
      // ARRANGE
      vi.mocked(notesService.getArchivedNotes).mockResolvedValue(mockNotes);

      const { result } = renderHook(() => useArchived());

      await waitFor(() => {
        expect(result.current.notes).toBeDefined();
      });

      vi.clearAllMocks();

      // ACT: Change both quickly
      result.current.setCategory('finance');
      result.current.setSearch('budget');

      // ASSERT: Should debounce and call once with final values
      await waitFor(() => {
        expect(notesService.getArchivedNotes).toHaveBeenCalledTimes(1);
        expect(notesService.getArchivedNotes).toHaveBeenCalledWith(
          'finance',
          'budget'
        );
      }, { timeout: 1000 });
    });
  });

  describe('Search with Loading States', () => {
    test('shows loading state when search triggers fetch', async () => {
      // ARRANGE
      vi.mocked(notesService.getArchivedNotes).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockNotes), 100))
      );

      const { result } = renderHook(() => useArchived());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // ACT: Set search
      result.current.setSearch('financial');

      // ASSERT: Should show loading during fetch
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      }, { timeout: 1000 });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      }, { timeout: 1500 });
    });
  });
});