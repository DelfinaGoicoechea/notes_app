import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { Notes } from '../../../../src/pages/notes/components/Notes';
import type { Note } from '../../../../src/types/note';
import type { NotesContextValue } from '../../../../src/contexts/NotesContext';
import { useNotes } from '../../../../src/pages/notes/hooks/useNotes';

vi.mock('../../../../src/pages/notes/hooks/useNotes');

const mockUseNotes = vi.mocked(useNotes);

describe('Notes Component - Search UI (FE-005)', () => {
  const mockNotes: Note[] = [
    {
      id: 1,
      title: 'Meeting Notes',
      content: 'Project discussion',
      archived: false,
      categories: [],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: 2,
      title: 'Budget Report',
      content: 'Financial summary',
      archived: false,
      categories: [],
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    }
  ];

  function createMockUseNotesReturn(
    overrides: Partial<NotesContextValue> = {}
  ): NotesContextValue {
    return {
      notes: mockNotes,
      category: '',
      setCategory: vi.fn(),
      search: '',
      setSearch: vi.fn(),
      isLoading: false,
      archivingNoteId: null,
      deletingNoteId: null,
      getNotes: vi.fn(),
      createNote: vi.fn(),
      updateNote: vi.fn(),
      deleteNote: vi.fn(),
      archiveNote: vi.fn(),
      unarchiveNote: vi.fn(),
      addCategory: vi.fn(),
      removeCategory: vi.fn(),
      ...overrides,
    };
  }

  function renderNotes(
    props: { title?: string; showForm?: boolean } = {},
    contextOverrides: Partial<NotesContextValue> = {}
  ) {
    mockUseNotes.mockReturnValue(createMockUseNotesReturn(contextOverrides));
    return render(
      <Notes
        title={props.title ?? 'Active Notes'}
        showForm={props.showForm ?? true}
      />
    );
  }

  function getSearchInput() {
    return screen.getByLabelText(/search notes/i);
  }

  function getCategoryInput() {
    return screen.getByLabelText(/filter by category/i);
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Search Input UI', () => {
    test('renders search input above category filter', () => {
      renderNotes();

      expect(getSearchInput()).toBeInTheDocument();
    });

    test('search input has correct placeholder text', () => {
      renderNotes();

      expect(getSearchInput()).toHaveAttribute('placeholder', 'e.g. shopping');
    });

    test('search input is prominently placed and easily discoverable', () => {
      const { container } = renderNotes();

      const filterSections = container.querySelectorAll('.flex.gap-2');
      const searchSection = filterSections[0];
      const searchInput = searchSection?.querySelector('input');

      expect(searchInput).toHaveAttribute('placeholder', 'e.g. shopping');
    });

    test('updates search value when user types', () => {
      const mockSetSearch = vi.fn();
      renderNotes({}, { setSearch: mockSetSearch });

      fireEvent.change(getSearchInput(), { target: { value: 'meeting' } });

      expect(mockSetSearch).toHaveBeenCalledWith('meeting');
    });

    test('displays current search value in input', () => {
      renderNotes({}, { search: 'budget' });

      expect(getSearchInput()).toHaveValue('budget');
    });

    test('search input is always a controlled component with string value', () => {
      const { rerender } = renderNotes({}, { search: '' });
      expect(getSearchInput()).toHaveValue('');

      mockUseNotes.mockReturnValue(
        createMockUseNotesReturn({ search: undefined as unknown as string })
      );
      rerender(<Notes title="Active Notes" showForm={true} />);
      expect(getSearchInput()).toHaveValue('');
    });
  });

  describe('Search Clear Button', () => {
    test('renders clear button next to search input', () => {
      renderNotes({}, { search: 'test' });

      expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument();
    });

    test('clear button clears only search, not category', () => {
      const mockSetSearch = vi.fn();
      const mockSetCategory = vi.fn();

      renderNotes({}, {
        search: 'meeting',
        category: 'work',
        setSearch: mockSetSearch,
        setCategory: mockSetCategory,
      });

      fireEvent.click(screen.getByRole('button', { name: /clear search/i }));

      expect(mockSetSearch).toHaveBeenCalledWith('');
      expect(mockSetCategory).not.toHaveBeenCalled();
    });

    test('clear button works when search has value', () => {
      const mockSetSearch = vi.fn();
      renderNotes({}, { search: 'budget report', setSearch: mockSetSearch });

      fireEvent.click(screen.getByRole('button', { name: /clear search/i }));

      expect(mockSetSearch).toHaveBeenCalledWith('');
    });
  });

  describe('Result Count Display', () => {
    test('shows result count when search is active', () => {
      renderNotes({}, { search: 'meeting', notes: [mockNotes[0]] });

      expect(screen.getByText(/1 note found/i)).toBeInTheDocument();
    });

    test('shows result count when category filter is active', () => {
      renderNotes({}, { category: 'work', notes: [mockNotes[0]] });

      expect(screen.getByText(/1 note found/i)).toBeInTheDocument();
    });

    test('shows result count when both filters are active', () => {
      renderNotes({}, { search: 'budget', category: 'finance', notes: mockNotes });

      expect(screen.getByText(/2 notes found/i)).toBeInTheDocument();
    });

    test('does not show result count when no filters are active', () => {
      renderNotes({}, { search: '', category: '', notes: mockNotes });

      expect(screen.queryByText(/notes found/i)).not.toBeInTheDocument();
    });

    test('uses singular "note" for single result', () => {
      renderNotes({}, { search: 'meeting', notes: [mockNotes[0]] });

      expect(screen.getByText(/1 note found/i)).toBeInTheDocument();
      expect(screen.queryByText(/1 notes found/i)).not.toBeInTheDocument();
    });

    test('uses plural "notes" for multiple results', () => {
      renderNotes({}, { search: 'report', notes: mockNotes });

      expect(screen.getByText(/2 notes found/i)).toBeInTheDocument();
    });

    test('hides result count when filters return no results', () => {
      renderNotes({}, { search: 'nonexistent', notes: [] });

      expect(screen.queryByText(/0 notes found/i)).not.toBeInTheDocument();
      expect(screen.getByText(/no notes match your search/i)).toBeInTheDocument();
    });
  });

  describe('Empty State Messages', () => {
    test('shows search-specific empty state when search returns no results', () => {
      renderNotes({}, { search: 'nonexistent', notes: [] });

      expect(screen.getByText(/no notes match your search/i)).toBeInTheDocument();
      expect(screen.getByText(/try something different or clear your search/i)).toBeInTheDocument();
    });

    test('shows category-specific empty state when category filter returns no results', () => {
      renderNotes({}, { category: 'empty-category', notes: [] });

      expect(screen.getByText(/no notes match your filter/i)).toBeInTheDocument();
      expect(screen.getByText(/try a different category or clear your filter/i)).toBeInTheDocument();
    });

    test('shows combined empty state when both search and category return no results', () => {
      renderNotes({}, { search: 'test', category: 'work', notes: [] });

      expect(screen.getByText(/no notes match your search and category filter/i)).toBeInTheDocument();
      expect(screen.getByText(/try searching something else or a different category/i)).toBeInTheDocument();
    });

    test('shows default empty state when no filters and no notes', () => {
      renderNotes({ showForm: true }, { search: '', category: '', notes: [] });

      expect(screen.getByText(/no notes yet/i)).toBeInTheDocument();
      expect(screen.getByText(/create your first note above to get started/i)).toBeInTheDocument();
    });

    test('shows archived empty state for archived page with no filters', () => {
      renderNotes({ showForm: false }, { search: '', category: '', notes: [] });

      expect(screen.getByText(/no archived notes/i)).toBeInTheDocument();
    });

    test('handles whitespace-only search as empty', () => {
      renderNotes({}, { search: '   ', notes: [] });

      expect(screen.queryByText(/no notes match your search/i)).not.toBeInTheDocument();
    });

    test('handles whitespace-only category as empty', () => {
      renderNotes({}, { category: '   ', notes: [] });

      expect(screen.queryByText(/no notes match your filter/i)).not.toBeInTheDocument();
    });
  });

  describe('Search Works with Category Filter', () => {
    test('both search and category inputs can have values simultaneously', () => {
      renderNotes({}, { search: 'meeting', category: 'work' });

      expect(getSearchInput()).toHaveValue('meeting');
      expect(getCategoryInput()).toHaveValue('work');
    });

    test('clearing search does not affect category filter', () => {
      const mockSetSearch = vi.fn();
      const mockSetCategory = vi.fn();

      renderNotes({}, {
        search: 'meeting',
        category: 'work',
        setSearch: mockSetSearch,
        setCategory: mockSetCategory,
      });

      fireEvent.click(screen.getByRole('button', { name: /clear search/i }));

      expect(mockSetSearch).toHaveBeenCalledWith('');
      expect(mockSetCategory).not.toHaveBeenCalled();
    });

    test('clearing category does not affect search filter', () => {
      const mockSetSearch = vi.fn();
      const mockSetCategory = vi.fn();

      renderNotes({}, {
        search: 'meeting',
        category: 'work',
        setSearch: mockSetSearch,
        setCategory: mockSetCategory,
      });

      fireEvent.click(screen.getByRole('button', { name: /clear category filter/i }));

      expect(mockSetCategory).toHaveBeenCalledWith('');
      expect(mockSetSearch).not.toHaveBeenCalled();
    });
  });

  describe('Search UI with Loading State', () => {
    test('search input remains enabled during loading', () => {
      renderNotes({}, { isLoading: true });

      expect(getSearchInput()).not.toBeDisabled();
    });

    test('keeps notes visible while loading with search active', () => {
      renderNotes({}, { isLoading: true, search: 'meeting' });

      expect(screen.getByText('Meeting Notes')).toBeInTheDocument();
      expect(screen.queryByText(/loading\.\.\./i)).not.toBeInTheDocument();
    });

    test('shows spinner only when loading with no notes yet', () => {
      renderNotes({}, { isLoading: true, notes: [], search: 'meeting' });

      expect(screen.getByText(/loading\.\.\./i)).toBeInTheDocument();
    });
  });

  describe('Search Integration with Notes Display', () => {
    test('displays filtered notes when search is active', () => {
      renderNotes({}, { search: 'meeting', notes: [mockNotes[0]] });

      expect(screen.getByText('Meeting Notes')).toBeInTheDocument();
      expect(screen.queryByText('Budget Report')).not.toBeInTheDocument();
    });

    test('shows result count matching displayed notes', () => {
      renderNotes({}, { search: 'budget', notes: [mockNotes[1]] });

      expect(screen.getByText(/1 note found/i)).toBeInTheDocument();
      expect(screen.getByText('Budget Report')).toBeInTheDocument();
    });

    test('all note cards remain interactive when search is active', () => {
      renderNotes({}, { search: 'meeting', notes: [mockNotes[0]] });

      expect(screen.getByRole('button', { name: /archive/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('search input has proper accessible name', () => {
      renderNotes();

      const searchInput = getSearchInput();
      expect(searchInput).toBeInTheDocument();
      expect(searchInput.tagName).toBe('INPUT');
    });

    test('clear buttons have descriptive accessible names', () => {
      renderNotes({}, { search: 'test', category: 'work' });

      expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /clear category filter/i })).toBeInTheDocument();
    });

    test('result count is visible to screen readers', () => {
      renderNotes({}, { search: 'meeting', notes: [mockNotes[0]] });

      const resultText = screen.getByText(/1 note found/i);
      expect(resultText).toBeVisible();
    });
  });
});
