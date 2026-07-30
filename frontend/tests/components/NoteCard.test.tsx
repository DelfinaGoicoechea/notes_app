import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { toast } from 'react-hot-toast';
import NoteCard from '../../src/components/NoteCard';
import * as noteService from '../../src/services/notes.service';

vi.mock('react-hot-toast');
vi.mock('../../src/services/notes.service');

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
  });

  describe('Update Note', () => {
    test('shows error toast when update fails', async () => {
      //mocks API to fail, edit and save, should show toast error
      vi.mocked(noteService.updateNote).mockRejectedValue(
        new Error('Connection failed')
      );

      const mockOnUpdate = vi.fn();
      render(<NoteCard note={mockNote} onUpdated={mockOnUpdate} />);

      //ACT: enter edit mode
      fireEvent.click(screen.getByRole('button', { name: /edit/i }));

      const titleInput = screen.getByDisplayValue('Test Note');

      fireEvent.change(titleInput, { target: { value: 'Updated' } });
      fireEvent.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to save note changes. Please try again.'
        );
      });

      expect(mockOnUpdate).not.toHaveBeenCalled();
      //didn't exit edit mode
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    test('preserves form values when update fails and stays in edit mode', async () => {
      //on error, should not exit edit mode, should not modify the changes
      vi.mocked(noteService.updateNote).mockRejectedValue(
        new Error('Connection failed')
      );

      render(<NoteCard note={mockNote} onUpdated={vi.fn()} />);

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

      render(<NoteCard note={mockNote} onUpdated={vi.fn()} />);

      fireEvent.click(screen.getByRole('button', { name: /edit/i }));

      const titleInput = screen.getByDisplayValue('Test Note');

      fireEvent.change(titleInput, { target: { value: 'Updated' } });
      fireEvent.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'NoteCard - Update note failed.',
          mockError
        );
      });

      consoleErrorSpy.mockRestore();
    });

    test('updates note and calls onUpdated when update succeeds', async () => {
      //edit title/content, click save, exits edit mode, calls onUpdated
      const mockUpdatedNote = {
        ...mockNote,
        title: 'Updated Title',
        content: 'Updated content',
      };
      vi.mocked(noteService.updateNote).mockResolvedValue(mockUpdatedNote);

      const mockOnUpdate = vi.fn();
      render(<NoteCard note={mockNote} onUpdated={mockOnUpdate} />);

      fireEvent.click(screen.getByRole('button', { name: /edit/i }));

      const titleInput = screen.getByDisplayValue('Test Note');
      const contentInput = screen.getByDisplayValue('Test content');

      fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
      fireEvent.change(contentInput, { target: { value: 'Updated content' } });
      fireEvent.click(screen.getByRole('button', { name: /save/i } ));

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledTimes(1);
        expect(mockOnUpdate).toHaveBeenCalledWith(mockUpdatedNote);
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

      const mockOnUpdate = vi.fn();
      render(<NoteCard note={mockNote} onUpdated={mockOnUpdate} />);

      const categoryInput = screen.getByPlaceholderText(/add category/i);
      fireEvent.change(categoryInput, { target: { value: 'personal' } });

      //uses ^ and $ to match ONLY Add button (not for e.g. "Add category")
      fireEvent.click(screen.getByRole('button', { name: /^add$/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to add category. Please try again.'
        );
      });

      expect(categoryInput).toHaveValue('personal');
      expect(mockOnUpdate).not.toHaveBeenCalled();
    });

    test('logs error to console when add fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockError = new Error('Network error');

      vi.mocked(noteService.addCategoryToNote).mockRejectedValue(mockError);

      render(<NoteCard note={mockNote} onUpdated={vi.fn()} />);

      const categoryInput = screen.getByPlaceholderText(/add category/i);
      fireEvent.change(categoryInput, { target: { value: 'personal' } });
      fireEvent.click(screen.getByRole('button', { name: /^add$/i }));

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'NoteCard - Add category failed.',
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

      const mockOnUpdate = vi.fn();
      render(<NoteCard note={mockNote} onUpdated={mockOnUpdate} />);

      const categoryInput = screen.getByPlaceholderText(/add category/i);
      fireEvent.change(categoryInput, { target: { value: 'personal' } });
      fireEvent.click(screen.getByRole('button', { name: /^add$/i } ));

      await waitFor(() => {
        expect(categoryInput).toHaveValue('');
        expect(mockOnUpdate).toHaveBeenCalledTimes(1);
        expect(mockOnUpdate).toHaveBeenCalledWith(mockUpdatedNote);
      });
    });
  });

  describe('Remove Category', () => {
    test('shows error toast when remove fails', async () => {
      
      vi.mocked(noteService.removeCategoryFromNote).mockRejectedValue(
        new Error('API error')
      );

      const mockOnUpdate = vi.fn();
      render(<NoteCard note={mockNote} onUpdated={mockOnUpdate} />);

      fireEvent.click(screen.getByRole('button', { name: /remove work category/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to remove category. Please try again.'
        );
      });

      expect(mockOnUpdate).not.toHaveBeenCalled();
    });

    test('logs error to console when remove fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockError = new Error('Network error');

      vi.mocked(noteService.removeCategoryFromNote).mockRejectedValue(mockError);

      render(<NoteCard note={mockNote} onUpdated={vi.fn()} />);

      fireEvent.click(screen.getByRole('button', { name: /remove work category/i }));

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'NoteCard - Remove category failed.',
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

      const mockOnUpdate = vi.fn();
      render(<NoteCard note={mockNote} onUpdated={mockOnUpdate} />);

      fireEvent.click(screen.getByRole('button', { name: /remove work category/i }));

      await waitFor(() => {
        expect(noteService.removeCategoryFromNote).toHaveBeenCalledWith(
          1,      //mockNote.id
          'work'  //category name
        );
        expect(mockOnUpdate).toHaveBeenCalledTimes(1);
        expect(mockOnUpdate).toHaveBeenCalledWith(mockUpdatedNote);
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

      render(<NoteCard note={mockNote} onUpdated={vi.fn()} />);

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

      render(<NoteCard note={mockNote} onUpdated={vi.fn()} />);

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

      render(<NoteCard note={mockNote} onUpdated={vi.fn()} />);

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

      render(<NoteCard note={mockNote} onUpdated={vi.fn()} />);

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
      render(
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
      render(
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
      render(
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
      render(
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
      render(
        <NoteCard 
          note={mockNote} 
          onDelete={vi.fn()} 
          deletingNoteId={1} 
        />
      );

      // ASSERT: Button shows "Deleting..." and is disabled
      const deleteButton = screen.getByRole('button', { name: /deleting\.\.\./i });
      expect(deleteButton).toBeDisabled();
    });

    test('shows "Deleting..." text when deletingNoteId matches', () => {
      // ARRANGE & ACT
      render(
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

      render(<NoteCard note={mockNote} onUpdated={vi.fn()} />);

      // ACT
      const categoryInput = screen.getByPlaceholderText(/add category/i);
      const addButton = screen.getByRole('button', { name: /^add$/i });

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

      render(<NoteCard note={mockNote} onUpdated={vi.fn()} />);

      // ACT
      const categoryInput = screen.getByPlaceholderText(/add category/i);
      fireEvent.change(categoryInput, { target: { value: 'personal' } });
      fireEvent.click(screen.getByRole('button', { name: /^add$/i }));

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

      render(<NoteCard note={mockNote} onUpdated={vi.fn()} />);

      // ACT
      const categoryInput = screen.getByPlaceholderText(/add category/i);
      fireEvent.change(categoryInput, { target: { value: 'personal' } });
      fireEvent.click(screen.getByRole('button', { name: /^add$/i }));

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

      render(<NoteCard note={mockNote} onUpdated={vi.fn()} />);

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

      render(<NoteCard note={multiCategoryNote} onUpdated={vi.fn()} />);

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

      render(<NoteCard note={mockNote} onUpdated={vi.fn()} />);

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

      render(<NoteCard note={mockNote} onUpdated={vi.fn()} />);

      // ACT: Try to add category multiple times
      const categoryInput = screen.getByPlaceholderText(/add category/i);
      const addButton = screen.getByRole('button', { name: /^add$/i });

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