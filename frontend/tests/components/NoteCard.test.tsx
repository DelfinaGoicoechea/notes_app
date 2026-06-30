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
          'NoteCard - Update note failed:',
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
        expect(titleInput).toHaveValue('Updated Title');
        expect(contentInput).toHaveValue('Updated content');
        expect(mockOnUpdate).toHaveBeenCalledTimes(1);
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
          'NoteCard - Add category failed:',
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

      fireEvent.click(screen.getByRole('button', { name: /work ×/i }));

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

      fireEvent.click(screen.getByRole('button', { name: /work ×/i }));

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'NoteCard - Remove category failed:',
          mockError
        )
      });

      consoleErrorSpy.mockRestore();
    });

    test('removes category successfully', async () => {

      vi.mocked(noteService.removeCategoryFromNote).mockResolvedValue({
        ...mockNote,
        categories: []
      });

      const mockOnUpdate = vi.fn();
      render(<NoteCard note={mockNote} onUpdated={mockOnUpdate} />);

      fireEvent.click(screen.getByRole('button', { name: /work ×/i }));

      await waitFor(() => {
        expect(noteService.removeCategoryFromNote).toHaveBeenCalledWith(
          1,      //mockNote.id
          'work'  //category name
        );
        expect(mockOnUpdate).toHaveBeenCalledTimes(1);
      });    
    });
  });
});