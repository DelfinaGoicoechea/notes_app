import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { toast } from 'react-hot-toast';
import NoteCard from '../../src/components/NoteCard';
import * as noteService from '../../src/services/notes.service';
import { NotesProvider } from '../../src/contexts/NotesContext';

vi.mock('react-hot-toast');
vi.mock('../../src/services/notes.service');

function renderNoteCard(
  ui: React.ReactElement,
  view: 'active' | 'archived' = "active"
) {
  return render(
    <NotesProvider view={view}>
      {ui}
    </NotesProvider>
  );
}

function getCategoryInput() {
  return screen.getByLabelText(/add category to note/i);
}

function getAddCategoryButton() {
  return screen.getByRole('button', { name: /add category/i });
}

function expectToastError(message: string) {
  expect(toast.error).toHaveBeenCalledWith(message, undefined);
}

describe('NoteCard - Error Handling (FE-003)', () => {
  const mockNote = {
    id: 1,
    title: 'Test Note',
    content: 'Test content',
    archived: false,
    categories: [{ 
      id: 1, 
      name: 'work',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(noteService.getActiveNotes).mockResolvedValue([]);
    vi.mocked(noteService.getArchivedNotes).mockResolvedValue([]);
  });

  describe('Update Note', () => {
    test('shows error toast when update fails', async () => {
      //mocks API to fail, edit and save, should show toast error
      vi.mocked(noteService.updateNote).mockRejectedValue(
        new Error('Connection failed')
      );

      renderNoteCard(<NoteCard note={mockNote} />);

      //ACT: enter edit mode
      fireEvent.click(screen.getByRole('button', { name: /edit/i }));

      const titleInput = screen.getByDisplayValue('Test Note');

      fireEvent.change(titleInput, { target: { value: 'Updated' } });
      fireEvent.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expectToastError('Failed to save note changes. Please try again.');
      });

      expect(titleInput).toHaveValue('Updated');
      //didn't exit edit mode
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    test('preserves form values when update fails and stays in edit mode', async () => {
      //on error, should not exit edit mode, should not modify the changes
      vi.mocked(noteService.updateNote).mockRejectedValue(
        new Error('Connection failed')
      );

      renderNoteCard(<NoteCard note={mockNote} />);

      fireEvent.click(screen.getByRole('button', { name: /edit/i } ));

      const titleInput = screen.getByDisplayValue('Test Note');
      const contentInput = screen.getByDisplayValue('Test content');

      fireEvent.change(titleInput, { target: { value: 'Updated' } });
      fireEvent.change(contentInput, { target: { value: 'Updated content' } });
      fireEvent.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(titleInput).toHaveValue('Updated');
        expect(contentInput).toHaveValue('Updated content');
      });

      //didn't exit edit mode
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    test('logs errors to console for debugging', async () => {
      //verify console.error is called with proper message
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const mockError = new Error('Network timeout');
      vi.mocked(noteService.updateNote).mockRejectedValue(mockError);

      renderNoteCard(<NoteCard note={mockNote} />);

      fireEvent.click(screen.getByRole('button', { name: /edit/i }));

      const titleInput = screen.getByDisplayValue('Test Note');

      fireEvent.change(titleInput, { target: { value: 'Updated' } });
      fireEvent.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'NotesContext - Update note failed.',
          mockError
        );
      });

      consoleErrorSpy.mockRestore();
    });

    test('updates note when update succeeds', async () => {
      //edit title/content, click save, exits edit mode
      const mockUpdatedNote = {
        ...mockNote,
        title: 'Updated Title',
        content: 'Updated content',
      };
      vi.mocked(noteService.updateNote).mockResolvedValue(mockUpdatedNote);

      renderNoteCard(<NoteCard note={mockNote} />);

      fireEvent.click(screen.getByRole('button', { name: /edit/i }));

      const titleInput = screen.getByDisplayValue('Test Note');
      const contentInput = screen.getByDisplayValue('Test content');

      fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
      fireEvent.change(contentInput, { target: { value: 'Updated content' } });
      fireEvent.click(screen.getByRole('button', { name: /save/i } ));

      await waitFor(() => {
        expect(noteService.updateNote).toHaveBeenCalledWith(1, {
          title: 'Updated Title',
          content: 'Updated content',
        });
      });

      //did exit edit mode
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    }); 
  });

  describe('Add Category', () => {
    test('shows error toast when add fails and preserves input', async () => {
      
      vi.mocked(noteService.addCategoryToNote).mockRejectedValue(
        new Error('API error')
      );

      renderNoteCard(<NoteCard note={mockNote} />);

      const categoryInput = getCategoryInput();
      fireEvent.change(categoryInput, { target: { value: 'personal' } });

      fireEvent.click(getAddCategoryButton());

      await waitFor(() => {
        expectToastError('Failed to add category. Please try again.');
      });

      expect(categoryInput).toHaveValue('personal');
    });

    test('logs error to console when add fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockError = new Error('Network error');

      vi.mocked(noteService.addCategoryToNote).mockRejectedValue(mockError);

      renderNoteCard(<NoteCard note={mockNote} />);

      const categoryInput = getCategoryInput();
      fireEvent.change(categoryInput, { target: { value: 'personal' } });
      fireEvent.click(getAddCategoryButton());

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'NotesContext - Add category failed.',
          mockError
        );
      });

      consoleErrorSpy.mockRestore();
    });

    test('adds category successfully', async () => {
      const mockUpdatedNote = {
        ...mockNote,
        categories: [
          ...(mockNote.categories || []),
          {
          id: 2, 
          name: 'personal',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        }],
      };

      vi.mocked(noteService.addCategoryToNote).mockResolvedValue(mockUpdatedNote);

      renderNoteCard(<NoteCard note={mockNote} />);

      const categoryInput = getCategoryInput();
      fireEvent.change(categoryInput, { target: { value: 'personal' } });
      fireEvent.click(getAddCategoryButton());

      await waitFor(() => {
        expect(categoryInput).toHaveValue('');
        expect(noteService.addCategoryToNote).toHaveBeenCalledWith(1, 'personal');
      });
    });
  });

  describe('Remove Category', () => {
    test('shows error toast when remove fails', async () => {
      
      vi.mocked(noteService.removeCategoryFromNote).mockRejectedValue(
        new Error('API error')
      );

      renderNoteCard(<NoteCard note={mockNote} />);

      fireEvent.click(screen.getByRole('button', { name: /remove work category/i }));

      await waitFor(() => {
        expectToastError('Failed to remove category. Please try again.');
      });
    });

    test('logs error to console when remove fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockError = new Error('Network error');

      vi.mocked(noteService.removeCategoryFromNote).mockRejectedValue(mockError);

      renderNoteCard(<NoteCard note={mockNote} />);

      fireEvent.click(screen.getByRole('button', { name: /remove work category/i }));

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'NotesContext - Remove category failed.',
          mockError
        )
      });

      consoleErrorSpy.mockRestore();
    });

    test('removes category successfully', async () => {

      const mockUpdatedNote = {
        ...mockNote,
        categories: []
      };
      vi.mocked(noteService.removeCategoryFromNote).mockResolvedValue(mockUpdatedNote);

      renderNoteCard(<NoteCard note={mockNote} />);

      fireEvent.click(screen.getByRole('button', { name: /remove work category/i }));

      await waitFor(() => {
        expect(noteService.removeCategoryFromNote).toHaveBeenCalledWith(
          1,      //mockNote.id
          'work'  //category name
        );
      });    
    });
  });
});

describe('NoteCard - Loading States (FE-004)', () => {
  const mockNote = {
    id: 1,
    title: 'Test Note',
    content: 'Test content',
    archived: false,
    categories: [{ 
      id: 1, 
      name: 'work',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(noteService.getActiveNotes).mockResolvedValue([]);
    vi.mocked(noteService.getArchivedNotes).mockResolvedValue([]);
  });

  describe('Update Note Loading State', () => {
    test('disables save button during note update', async () => {
      // ARRANGE
      vi.mocked(noteService.updateNote).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          ...mockNote,
          title: 'Updated',
        }), 100))
      );

      renderNoteCard(<NoteCard note={mockNote} />);

      // ACT: Enter edit mode and save
      fireEvent.click(screen.getByRole('button', { name: /edit/i }));
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      // ASSERT: Save button should be disabled
      await waitFor(() => {
        expect(saveButton).toBeDisabled();
      });

      await waitFor(() => {
        expect(saveButton).not.toBeInTheDocument(); // Exits edit mode
      });
    });

    test('shows "Saving..." text during update', async () => {
      // ARRANGE
      vi.mocked(noteService.updateNote).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          ...mockNote,
          title: 'Updated',
        }), 100))
      );

      renderNoteCard(<NoteCard note={mockNote} />);

      // ACT
      fireEvent.click(screen.getByRole('button', { name: /edit/i }));
      fireEvent.click(screen.getByRole('button', { name: /save/i }));

      // ASSERT
      await waitFor(() => {
        expect(screen.getByText(/saving\.\.\./i)).toBeInTheDocument();
      });
    });

    test('disables input fields during update', async () => {
      // ARRANGE
      vi.mocked(noteService.updateNote).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          ...mockNote,
          title: 'Updated',
        }), 100))
      );

      renderNoteCard(<NoteCard note={mockNote} />);

      // ACT
      fireEvent.click(screen.getByRole('button', { name: /edit/i }));
      
      const titleInput = screen.getByDisplayValue('Test Note');
      const contentInput = screen.getByDisplayValue('Test content');
      const saveButton = screen.getByRole('button', { name: /save/i });

      fireEvent.click(saveButton);

      // ASSERT
      await waitFor(() => {
        expect(titleInput).toBeDisabled();
        expect(contentInput).toBeDisabled();
      });
    });

    test('shows loading spinner during save', async () => {
      // ARRANGE
      vi.mocked(noteService.updateNote).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          ...mockNote,
          title: 'Updated',
        }), 100))
      );

      renderNoteCard(<NoteCard note={mockNote} />);

      // ACT
      fireEvent.click(screen.getByRole('button', { name: /edit/i }));
      fireEvent.click(screen.getByRole('button', { name: /save/i }));

      // ASSERT: Spinner's sr-only text should be present
      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument();
      });
    });
  });

  describe('Archive/Delete Loading States (from hooks)', () => {
    test('disables archive button when archivingNoteId matches note id', () => {
      // ARRANGE & ACT
      renderNoteCard(
        <NoteCard 
          note={mockNote} 
          onArchive={vi.fn()} 
          archivingNoteId={1} 
        />
      );

      // ASSERT
      const archiveButton = screen.getByRole('button', { name: /archiv/i });
      expect(archiveButton).toBeDisabled();
    });

    test('shows "Archiving..." text when archivingNoteId matches', () => {
      // ARRANGE & ACT
      renderNoteCard(
        <NoteCard 
          note={mockNote} 
          onArchive={vi.fn()} 
          archivingNoteId={1} 
        />
      );

      // ASSERT
      expect(screen.getByText(/archiving\.\.\./i)).toBeInTheDocument();
    });

    test('shows "Unarchiving..." text for archived note being unarchived', () => {
      // ARRANGE & ACT
      const archivedNote = { ...mockNote, archived: true };
      renderNoteCard(
        <NoteCard 
          note={archivedNote} 
          onArchive={vi.fn()} 
          archivingNoteId={1} 
        />
      );

      // ASSERT
      expect(screen.getByText(/unarchiving\.\.\./i)).toBeInTheDocument();
    });

    test('does not disable archive button for different note', () => {
      // ARRANGE & ACT: archivingNoteId is 2, but this note is 1
      renderNoteCard(
        <NoteCard 
          note={mockNote} 
          onArchive={vi.fn()} 
          archivingNoteId={2} 
        />
      );

      // ASSERT
      const archiveButton = screen.getByRole('button', { name: /archive/i });
      expect(archiveButton).not.toBeDisabled();
    });

    test('disables delete button when deletingNoteId matches note id', () => {
      // ARRANGE & ACT
      renderNoteCard(
        <NoteCard 
          note={mockNote} 
          onDelete={vi.fn()} 
          deletingNoteId={1} 
        />
      );

      // ASSERT: Accessible name stays "Delete"; busy state is via aria-busy + visible text
      const deleteButton = screen.getByRole('button', { name: /^delete$/i });
      expect(deleteButton).toBeDisabled();
      expect(deleteButton).toHaveAttribute('aria-busy', 'true');
      expect(screen.getByText(/deleting\.\.\./i)).toBeInTheDocument();
    });

    test('shows "Deleting..." text when deletingNoteId matches', () => {
      // ARRANGE & ACT
      renderNoteCard(
        <NoteCard 
          note={mockNote} 
          onDelete={vi.fn()} 
          deletingNoteId={1} 
        />
      );

      // ASSERT
      expect(screen.getByText(/deleting\.\.\./i)).toBeInTheDocument();
    });
  });

  describe('Add Category Loading State', () => {
    test('disables add button during category addition', async () => {
      // ARRANGE
      vi.mocked(noteService.addCategoryToNote).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          ...mockNote,
          categories: [...mockNote.categories, { 
            id: 2, 
            name: 'personal',
            createdAt: new Date(),
            updatedAt: new Date(),
          }],
        }), 100))
      );

      renderNoteCard(<NoteCard note={mockNote} />);

      // ACT
      const categoryInput = getCategoryInput();
      const addButton = getAddCategoryButton();

      fireEvent.change(categoryInput, { target: { value: 'personal' } });
      fireEvent.click(addButton);

      // ASSERT
      await waitFor(() => {
        expect(addButton).toBeDisabled();
      });

      await waitFor(() => {
        expect(addButton).not.toBeDisabled();
      });
    });

    test('shows "Adding..." text during category addition', async () => {
      // ARRANGE
      vi.mocked(noteService.addCategoryToNote).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          ...mockNote,
          categories: [...mockNote.categories, { 
            id: 2, 
            name: 'personal',
            createdAt: new Date(),
            updatedAt: new Date(),
          }],
        }), 100))
      );

      renderNoteCard(<NoteCard note={mockNote} />);

      // ACT
      const categoryInput = getCategoryInput();
      fireEvent.change(categoryInput, { target: { value: 'personal' } });
      fireEvent.click(getAddCategoryButton());

      // ASSERT
      await waitFor(() => {
        expect(screen.getByText(/adding\.\.\./i)).toBeInTheDocument();
      });
    });

    test('shows loading spinner during category addition', async () => {
      // ARRANGE
      vi.mocked(noteService.addCategoryToNote).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          ...mockNote,
          categories: [...mockNote.categories, { 
            id: 2, 
            name: 'personal',
            createdAt: new Date(),
            updatedAt: new Date(),
          }],
        }), 100))
      );

      renderNoteCard(<NoteCard note={mockNote} />);

      // ACT
      const categoryInput = getCategoryInput();
      fireEvent.change(categoryInput, { target: { value: 'personal' } });
      fireEvent.click(getAddCategoryButton());

      // ASSERT: Check for multiple "Loading..." (one for spinner)
      await waitFor(() => {
        const loadingTexts = screen.getAllByText('Loading...');
        expect(loadingTexts.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Remove Category Loading State', () => {
    test('disables category button during removal', async () => {
      // ARRANGE
      vi.mocked(noteService.removeCategoryFromNote).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          ...mockNote,
          categories: [],
        }), 100))
      );

      renderNoteCard(<NoteCard note={mockNote} />);

      // ACT
      const categoryButton = screen.getByRole('button', { name: /remove work category/i });
      fireEvent.click(categoryButton);

      // ASSERT
      await waitFor(() => {
        expect(categoryButton).toBeDisabled();
      });
    });

    test('only disables the specific category being removed', async () => {
      // ARRANGE: Note with multiple categories
      const multiCategoryNote = {
        ...mockNote,
        categories: [
          { id: 1, name: 'work', createdAt: new Date(), updatedAt: new Date() },
          { id: 2, name: 'personal', createdAt: new Date(), updatedAt: new Date() },
        ],
      };

      vi.mocked(noteService.removeCategoryFromNote).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          ...multiCategoryNote,
          categories: [multiCategoryNote.categories[1]],
        }), 100))
      );

      renderNoteCard(<NoteCard note={multiCategoryNote} />);

      // ACT: Remove 'work' category
      const workButton = screen.getByRole('button', { name: /remove work category/i });
      const personalButton = screen.getByRole('button', { name: /remove personal category/i });
      
      fireEvent.click(workButton);

      // ASSERT: Only work button should be disabled
      await waitFor(() => {
        expect(workButton).toBeDisabled();
        expect(personalButton).not.toBeDisabled();
      });
    });
  });

  describe('Prevent Duplicate Operations', () => {
    test('prevents duplicate save submissions while update is in flight', async () => {
      // ARRANGE
      let resolveUpdate: any;
      const updatePromise = new Promise<any>((resolve) => {
        resolveUpdate = resolve;
      });
      vi.mocked(noteService.updateNote).mockReturnValue(updatePromise);

      renderNoteCard(<NoteCard note={mockNote} />);

      // ACT: Click save multiple times
      fireEvent.click(screen.getByRole('button', { name: /edit/i }));
      const saveButton = screen.getByRole('button', { name: /save/i });
      
      fireEvent.click(saveButton);
      fireEvent.click(saveButton);
      fireEvent.click(saveButton);

      // ASSERT: API should only be called once
      expect(noteService.updateNote).toHaveBeenCalledTimes(1);

      // Complete the operation
      resolveUpdate({
        ...mockNote,
        title: 'Updated',
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      });
    });

    test('prevents duplicate category additions while add is in flight', async () => {
      // ARRANGE
      let resolveAdd: any;
      const addPromise = new Promise<any>((resolve) => {
        resolveAdd = resolve;
      });
      vi.mocked(noteService.addCategoryToNote).mockReturnValue(addPromise);

      renderNoteCard(<NoteCard note={mockNote} />);

      // ACT: Try to add category multiple times
      const categoryInput = getCategoryInput();
      const addButton = getAddCategoryButton();

      fireEvent.change(categoryInput, { target: { value: 'test' } });
      fireEvent.click(addButton);
      fireEvent.click(addButton);
      fireEvent.click(addButton);

      // ASSERT: API should only be called once
      expect(noteService.addCategoryToNote).toHaveBeenCalledTimes(1);

      // Complete the operation
      resolveAdd({
        ...mockNote,
        categories: [...mockNote.categories, {
          id: 2,
          name: 'test',
          createdAt: new Date(),
          updatedAt: new Date(),
        }],
      });

      await waitFor(() => {
        expect(addButton).not.toBeDisabled();
      });
    });
  });
});