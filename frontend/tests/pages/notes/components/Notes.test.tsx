import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { Notes } from '../../../../src/pages/notes/components/Notes';
import type { Note } from '../../../../src/types/note';

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

  const defaultProps = {
    title: 'Active Notes',
    showForm: true,
    notes: mockNotes,
    handleArchive: vi.fn(),
    handleDelete: vi.fn(),
    handleRefetch: vi.fn(),
    category: '',
    setCategory: vi.fn(),
    isLoading: false,
    archivingNoteId: null,
    deletingNoteId: null,
    search: '',
    setSearch: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Search Input UI', () => {
    test('renders search input above category filter', () => {
      // ACT
      render(<Notes {...defaultProps} />);

      // ASSERT: Search input should exist
      const searchInput = screen.getByPlaceholderText(/search notes by title or content/i);
      expect(searchInput).toBeInTheDocument();
    });

    test('search input has correct placeholder text', () => {
      // ACT
      render(<Notes {...defaultProps} />);

      // ASSERT
      const searchInput = screen.getByPlaceholderText(/search notes by title or content/i);
      expect(searchInput).toHaveAttribute('placeholder', 'Search notes by title or content...');
    });

    test('search input is prominently placed and easily discoverable', () => {
      // ACT
      const { container } = render(<Notes {...defaultProps} />);

      // ASSERT: Search should be in the first filter section (before category)
      const filterSections = container.querySelectorAll('.flex.gap-2');
      const searchSection = filterSections[0]; // First filter section
      const searchInput = searchSection?.querySelector('input');
      
      expect(searchInput).toHaveAttribute('placeholder', 'Search notes by title or content...');
    });

    test('updates search value when user types', () => {
      // ARRANGE
      const mockSetSearch = vi.fn();
      render(<Notes {...defaultProps} setSearch={mockSetSearch} />);

      const searchInput = screen.getByPlaceholderText(/search notes by title or content/i);

      // ACT
      fireEvent.change(searchInput, { target: { value: 'meeting' } });

      // ASSERT
      expect(mockSetSearch).toHaveBeenCalledWith('meeting');
    });

    test('displays current search value in input', () => {
      // ACT
      render(<Notes {...defaultProps} search="budget" />);

      // ASSERT
      const searchInput = screen.getByPlaceholderText(/search notes by title or content/i);
      expect(searchInput).toHaveValue('budget');
    });

    test('search input is always a controlled component with string value', () => {
      // ACT: Test with empty string
      const { rerender } = render(<Notes {...defaultProps} search="" />);
      let searchInput = screen.getByPlaceholderText(/search notes by title or content/i);
      expect(searchInput).toHaveValue('');

      // ACT: Test with undefined (should default to empty string)
      rerender(<Notes {...defaultProps} search={undefined as any} />);
      searchInput = screen.getByPlaceholderText(/search notes by title or content/i);
      expect(searchInput).toHaveValue('');
    });
  });

  describe('Search Clear Button', () => {
    test('renders clear button next to search input', () => {
      // ACT
      render(<Notes {...defaultProps} search="test" />);

      // ASSERT: Should have a Clear button in the search section
      const clearButtons = screen.getAllByRole('button', { name: /clear/i });
      expect(clearButtons.length).toBeGreaterThanOrEqual(1);
    });

    test('clear button clears only search, not category', () => {
      // ARRANGE
      const mockSetSearch = vi.fn();
      const mockSetCategory = vi.fn();
      
      render(<Notes 
        {...defaultProps} 
        search="meeting" 
        category="work"
        setSearch={mockSetSearch}
        setCategory={mockSetCategory}
      />);

      // Find the search input's clear button (first one)
      const searchSection = screen.getByPlaceholderText(/search notes by title or content/i).closest('.flex.gap-2');
      const clearButton = searchSection?.querySelector('button');

      // ACT
      if (clearButton) {
        fireEvent.click(clearButton);
      }

      // ASSERT: Only search should be cleared
      expect(mockSetSearch).toHaveBeenCalledWith('');
      expect(mockSetCategory).not.toHaveBeenCalled();
    });

    test('clear button works when search has value', () => {
      // ARRANGE
      const mockSetSearch = vi.fn();
      render(<Notes {...defaultProps} search="budget report" setSearch={mockSetSearch} />);

      const searchInput = screen.getByPlaceholderText(/search notes by title or content/i);
      const searchSection = searchInput.closest('.flex.gap-2');
      const clearButton = searchSection?.querySelector('button');

      // ACT
      if (clearButton) {
        fireEvent.click(clearButton);
      }

      // ASSERT
      expect(mockSetSearch).toHaveBeenCalledWith('');
    });
  });

  describe('Result Count Display', () => {
    test('shows result count when search is active', () => {
      // ACT
      render(<Notes {...defaultProps} search="meeting" notes={[mockNotes[0]]} />);

      // ASSERT
      expect(screen.getByText(/1 note found/i)).toBeInTheDocument();
    });

    test('shows result count when category filter is active', () => {
      // ACT
      render(<Notes {...defaultProps} category="work" notes={[mockNotes[0]]} />);

      // ASSERT
      expect(screen.getByText(/1 note found/i)).toBeInTheDocument();
    });

    test('shows result count when both filters are active', () => {
      // ACT
      render(<Notes {...defaultProps} search="budget" category="finance" notes={mockNotes} />);

      // ASSERT
      expect(screen.getByText(/2 notes found/i)).toBeInTheDocument();
    });

    test('does not show result count when no filters are active', () => {
      // ACT
      render(<Notes {...defaultProps} search="" category="" notes={mockNotes} />);

      // ASSERT
      expect(screen.queryByText(/notes found/i)).not.toBeInTheDocument();
    });

    test('uses singular "note" for single result', () => {
      // ACT
      render(<Notes {...defaultProps} search="meeting" notes={[mockNotes[0]]} />);

      // ASSERT
      expect(screen.getByText(/1 note found/i)).toBeInTheDocument();
      expect(screen.queryByText(/1 notes found/i)).not.toBeInTheDocument();
    });

    test('uses plural "notes" for multiple results', () => {
      // ACT
      render(<Notes {...defaultProps} search="report" notes={mockNotes} />);

      // ASSERT
      expect(screen.getByText(/2 notes found/i)).toBeInTheDocument();
    });

    test('shows "0 notes found" when filters return no results', () => {
      // ACT
      render(<Notes {...defaultProps} search="nonexistent" notes={[]} />);

      // ASSERT: Should show count as "0 notes found"
      expect(screen.getByText(/0 notes found/i)).toBeInTheDocument();
      // And also show empty state message
      expect(screen.getByText(/no notes match your search/i)).toBeInTheDocument();
    });
  });

  describe('Empty State Messages', () => {
    test('shows search-specific empty state when search returns no results', () => {
      // ACT
      render(<Notes {...defaultProps} search="nonexistent" notes={[]} />);

      // ASSERT
      expect(screen.getByText(/no notes match your search/i)).toBeInTheDocument();
      expect(screen.getByText(/try something different or clear your search/i)).toBeInTheDocument();
    });

    test('shows category-specific empty state when category filter returns no results', () => {
      // ACT
      render(<Notes {...defaultProps} category="empty-category" notes={[]} />);

      // ASSERT
      expect(screen.getByText(/no notes match your filter/i)).toBeInTheDocument();
      expect(screen.getByText(/try a different category or clear your filter/i)).toBeInTheDocument();
    });

    test('shows combined empty state when both search and category return no results', () => {
      // ACT
      render(<Notes {...defaultProps} search="test" category="work" notes={[]} />);

      // ASSERT
      expect(screen.getByText(/no notes match your search and category filter/i)).toBeInTheDocument();
      expect(screen.getByText(/try searching something else or a different category/i)).toBeInTheDocument();
    });

    test('shows default empty state when no filters and no notes', () => {
      // ACT
      render(<Notes {...defaultProps} search="" category="" notes={[]} showForm={true} />);

      // ASSERT
      expect(screen.getByText(/no notes yet/i)).toBeInTheDocument();
      expect(screen.getByText(/create your first note above to get started/i)).toBeInTheDocument();
    });

    test('shows archived empty state for archived page with no filters', () => {
      // ACT
      render(<Notes {...defaultProps} search="" category="" notes={[]} showForm={false} />);

      // ASSERT
      expect(screen.getByText(/no archived notes/i)).toBeInTheDocument();
    });

    test('handles whitespace-only search as empty', () => {
      // ACT
      render(<Notes {...defaultProps} search="   " notes={[]} />);

      // ASSERT: Should show default empty state, not search empty state
      expect(screen.queryByText(/no notes match your search/i)).not.toBeInTheDocument();
    });

    test('handles whitespace-only category as empty', () => {
      // ACT
      render(<Notes {...defaultProps} category="   " notes={[]} />);

      // ASSERT: Should show default empty state, not filter empty state
      expect(screen.queryByText(/no notes match your filter/i)).not.toBeInTheDocument();
    });
  });

  describe('Search Works with Category Filter', () => {
    test('both search and category inputs can have values simultaneously', () => {
      // ACT
      render(<Notes {...defaultProps} search="meeting" category="work" />);

      // ASSERT
      const searchInput = screen.getByPlaceholderText(/search notes by title or content/i);
      const categoryInput = screen.getByPlaceholderText(/filter by category/i);

      expect(searchInput).toHaveValue('meeting');
      expect(categoryInput).toHaveValue('work');
    });

    test('clearing search does not affect category filter', () => {
      // ARRANGE
      const mockSetSearch = vi.fn();
      const mockSetCategory = vi.fn();

      render(<Notes 
        {...defaultProps} 
        search="meeting" 
        category="work"
        setSearch={mockSetSearch}
        setCategory={mockSetCategory}
      />);

      const searchInput = screen.getByPlaceholderText(/search notes by title or content/i);
      const searchSection = searchInput.closest('.flex.gap-2');
      const searchClearButton = searchSection?.querySelector('button');

      // ACT
      if (searchClearButton) {
        fireEvent.click(searchClearButton);
      }

      // ASSERT
      expect(mockSetSearch).toHaveBeenCalledWith('');
      expect(mockSetCategory).not.toHaveBeenCalled();
    });

    test('clearing category does not affect search filter', () => {
      // ARRANGE
      const mockSetSearch = vi.fn();
      const mockSetCategory = vi.fn();

      render(<Notes 
        {...defaultProps} 
        search="meeting" 
        category="work"
        setSearch={mockSetSearch}
        setCategory={mockSetCategory}
      />);

      const categoryInput = screen.getByPlaceholderText(/filter by category/i);
      const categorySection = categoryInput.closest('.flex.gap-2');
      const categoryClearButton = categorySection?.querySelector('button');

      // ACT
      if (categoryClearButton) {
        fireEvent.click(categoryClearButton);
      }

      // ASSERT
      expect(mockSetCategory).toHaveBeenCalledWith('');
      expect(mockSetSearch).not.toHaveBeenCalled();
    });
  });

  describe('Search UI with Loading State', () => {
    test('search input remains enabled during loading', () => {
      // ACT
      render(<Notes {...defaultProps} isLoading={true} />);

      // ASSERT: User should still be able to type while results load
      const searchInput = screen.getByPlaceholderText(/search notes by title or content/i);
      expect(searchInput).not.toBeDisabled();
    });

    test('shows spinner when loading with search active', () => {
      // ACT
      render(<Notes {...defaultProps} isLoading={true} search="meeting" />);

      // ASSERT
      expect(screen.getByText(/loading\.\.\./i)).toBeInTheDocument();
    });
  });

  describe('Search Integration with Notes Display', () => {
    test('displays filtered notes when search is active', () => {
      // ACT
      render(<Notes {...defaultProps} search="meeting" notes={[mockNotes[0]]} />);

      // ASSERT
      expect(screen.getByText('Meeting Notes')).toBeInTheDocument();
      expect(screen.queryByText('Budget Report')).not.toBeInTheDocument();
    });

    test('shows result count matching displayed notes', () => {
      // ACT
      render(<Notes {...defaultProps} search="budget" notes={[mockNotes[1]]} />);

      // ASSERT
      expect(screen.getByText(/1 note found/i)).toBeInTheDocument();
      expect(screen.getByText('Budget Report')).toBeInTheDocument();
    });

    test('all note cards remain interactive when search is active', () => {
      // ARRANGE
      const mockHandleArchive = vi.fn();
      const mockHandleDelete = vi.fn();

      // ACT
      render(<Notes 
        {...defaultProps} 
        search="meeting" 
        notes={[mockNotes[0]]}
        handleArchive={mockHandleArchive}
        handleDelete={mockHandleDelete}
      />);

      // ASSERT: Note card buttons should be present and functional
      expect(screen.getByRole('button', { name: /archive/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('search input has proper accessible name', () => {
      // ACT
      render(<Notes {...defaultProps} />);

      // ASSERT
      const searchInput = screen.getByPlaceholderText(/search notes by title or content/i);
      expect(searchInput).toBeInTheDocument();
      expect(searchInput.tagName).toBe('INPUT');
    });

    test('clear buttons have descriptive accessible names', () => {
      // ACT
      render(<Notes {...defaultProps} search="test" category="work" />);

      // ASSERT
      const clearButtons = screen.getAllByRole('button', { name: /clear/i });
      expect(clearButtons.length).toBe(2); // One for search, one for category
    });

    test('result count is visible to screen readers', () => {
      // ACT
      render(<Notes {...defaultProps} search="meeting" notes={[mockNotes[0]]} />);

      // ASSERT: Text should be in the DOM for screen readers
      const resultText = screen.getByText(/1 note found/i);
      expect(resultText).toBeVisible();
    });
  });
});
