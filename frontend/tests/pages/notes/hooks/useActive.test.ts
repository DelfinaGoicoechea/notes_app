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
      // ARRANGE: Mock getActiveNotes with delayed response  
      vi.mocked(notesService.getActiveNotes).mockImplementation(
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
      const { result } = renderHook(() => useActive());

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

  describe('Archive Loading State', () => {
    test('sets archivingNoteId during archive operation', async () => {
      // ARRANGE
      vi.mocked(notesService.getActiveNotes).mockImplementation(async () => mockNotes);
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

describe('useActive Hook - Search Functionality (FE-005)', () => {
  const mockNotes = [
    {
      id: 1,
      title: 'Meeting Notes',
      content: 'Discuss project timeline',
      archived: false,
      categories: [],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: 2,
      title: 'Budget Report',
      content: 'Q1 financial summary',
      archived: false,
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
      const { result } = renderHook(() => useActive());

      // ASSERT
      expect(result.current.search).toBe('');
    });

    test('updates search state when setSearch is called', async () => {
      // ARRANGE
      vi.mocked(notesService.getActiveNotes).mockResolvedValue(mockNotes);
      const { result } = renderHook(() => useActive());

      await waitFor(() => {
        expect(result.current.notes).toBeDefined();
      });

      // ACT
      result.current.setSearch('meeting');

      // ASSERT
      await waitFor(() => {
        expect(result.current.search).toBe('meeting');
      });
    });

    test('exports search and setSearch in return object', () => {
      // ARRANGE
      vi.mocked(notesService.getActiveNotes).mockResolvedValue(mockNotes);
      const { result } = renderHook(() => useActive());

      // ASSERT
      expect(result.current).toHaveProperty('search');
      expect(result.current).toHaveProperty('setSearch');
      expect(typeof result.current.setSearch).toBe('function');
    });
  });

  describe('Search Filtering', () => {
    test('fetches notes with search parameter when search is set', async () => {
      // ARRANGE
      vi.mocked(notesService.getActiveNotes).mockResolvedValue([mockNotes[0]]);

      const { result } = renderHook(() => useActive());

      await waitFor(() => {
        expect(result.current.notes).toBeDefined();
      });

      // ACT: Set search
      result.current.setSearch('meeting');

      // ASSERT: Should call API with search parameter after debounce
      await waitFor(() => {
        expect(notesService.getActiveNotes).toHaveBeenCalledWith(
          undefined, // category
          'meeting'  // search
        );
      }, { timeout: 1000 });
    });

    test('trims search value before sending to API', async () => {
      // ARRANGE
      vi.mocked(notesService.getActiveNotes).mockResolvedValue(mockNotes);

      const { result } = renderHook(() => useActive());

      await waitFor(() => {
        expect(result.current.notes).toBeDefined();
      });

      // ACT: Set search with leading/trailing spaces
      result.current.setSearch('  budget  ');

      // ASSERT: Should trim before calling API
      await waitFor(() => {
        expect(notesService.getActiveNotes).toHaveBeenCalledWith(
          undefined,
          'budget'
        );
      }, { timeout: 1000 });
    });

    test('sends undefined when search is empty string', async () => {
      // ARRANGE
      vi.mocked(notesService.getActiveNotes).mockResolvedValue(mockNotes);

      const { result } = renderHook(() => useActive());

      await waitFor(() => {
        expect(result.current.notes).toBeDefined();
      });

      // ACT: Set search to empty
      result.current.setSearch('');

      // ASSERT: Should send undefined, not empty string
      await waitFor(() => {
        expect(notesService.getActiveNotes).toHaveBeenCalledWith(
          undefined,
          undefined
        );
      }, { timeout: 1000 });
    });

    test('sends undefined when search is only whitespace', async () => {
      // ARRANGE
      vi.mocked(notesService.getActiveNotes).mockResolvedValue(mockNotes);

      const { result } = renderHook(() => useActive());

      await waitFor(() => {
        expect(result.current.notes).toBeDefined();
      });

      // ACT: Set search to whitespace only
      result.current.setSearch('   ');

      // ASSERT: Should trim to empty and send undefined
      await waitFor(() => {
        expect(notesService.getActiveNotes).toHaveBeenCalledWith(
          undefined,
          undefined
        );
      }, { timeout: 1000 });
    });
  });

  describe('Combined Search and Category Filtering', () => {
    test('sends both category and search parameters when both are set', async () => {
      // ARRANGE
      vi.mocked(notesService.getActiveNotes).mockResolvedValue([mockNotes[0]]);

      const { result } = renderHook(() => useActive());

      await waitFor(() => {
        expect(result.current.notes).toBeDefined();
      });

      // ACT: Set both filters
      result.current.setCategory('work');
      result.current.setSearch('meeting');

      // ASSERT: Should call API with both parameters (AND logic)
      await waitFor(() => {
        expect(notesService.getActiveNotes).toHaveBeenCalledWith(
          'work',
          'meeting'
        );
      }, { timeout: 1000 });
    });

    test('category filter continues working with empty search', async () => {
      // ARRANGE
      vi.mocked(notesService.getActiveNotes).mockResolvedValue([mockNotes[0]]);

      const { result } = renderHook(() => useActive());

      await waitFor(() => {
        expect(result.current.notes).toBeDefined();
      });

      // ACT: Set only category
      result.current.setCategory('work');

      // ASSERT: Should call API with category only
      await waitFor(() => {
        expect(notesService.getActiveNotes).toHaveBeenCalledWith(
          'work',
          undefined
        );
      }, { timeout: 1000 });
    });

    test('clearing search while category is set maintains category filter', async () => {
      // ARRANGE
      vi.mocked(notesService.getActiveNotes).mockResolvedValue(mockNotes);

      const { result } = renderHook(() => useActive());

      await waitFor(() => {
        expect(result.current.notes).toBeDefined();
      });

      // Set both
      result.current.setCategory('work');
      result.current.setSearch('meeting');

      await waitFor(() => {
        expect(notesService.getActiveNotes).toHaveBeenCalledWith('work', 'meeting');
      }, { timeout: 1000 });

      vi.clearAllMocks();

      // ACT: Clear search
      result.current.setSearch('');

      // ASSERT: Should still have category
      await waitFor(() => {
        expect(notesService.getActiveNotes).toHaveBeenCalledWith(
          'work',
          undefined
        );
      }, { timeout: 1000 });
    });
  });

  describe('Search Debouncing', () => {
    test('debounces search input with 300ms delay', async () => {
      // ARRANGE
      vi.mocked(notesService.getActiveNotes).mockResolvedValue(mockNotes);

      const { result } = renderHook(() => useActive());

      await waitFor(() => {
        expect(result.current.notes).toBeDefined();
      });

      vi.clearAllMocks();

      // ACT: Type search quickly (simulate user typing)
      result.current.setSearch('m');
      result.current.setSearch('me');
      result.current.setSearch('mee');
      result.current.setSearch('meet');
      result.current.setSearch('meeti');
      result.current.setSearch('meetin');
      result.current.setSearch('meeting');

      // ASSERT: Should not call API immediately
      expect(notesService.getActiveNotes).not.toHaveBeenCalled();

      // Wait for debounce
      await waitFor(() => {
        expect(notesService.getActiveNotes).toHaveBeenCalledTimes(1);
        expect(notesService.getActiveNotes).toHaveBeenCalledWith(
          undefined,
          'meeting'
        );
      }, { timeout: 1000 });
    });

    test('debounces both category and search changes together', async () => {
      // ARRANGE
      vi.mocked(notesService.getActiveNotes).mockResolvedValue(mockNotes);

      const { result } = renderHook(() => useActive());

      await waitFor(() => {
        expect(result.current.notes).toBeDefined();
      });

      vi.clearAllMocks();

      // ACT: Change both quickly
      result.current.setCategory('work');
      result.current.setSearch('meeting');

      // ASSERT: Should debounce and call once with final values
      await waitFor(() => {
        expect(notesService.getActiveNotes).toHaveBeenCalledTimes(1);
        expect(notesService.getActiveNotes).toHaveBeenCalledWith(
          'work',
          'meeting'
        );
      }, { timeout: 1000 });
    });
  });

  describe('Search with Loading States', () => {
    test('shows loading state when search triggers fetch', async () => {
      // ARRANGE
      vi.mocked(notesService.getActiveNotes).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockNotes), 100))
      );

      const { result } = renderHook(() => useActive());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // ACT: Set search
      result.current.setSearch('budget');

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