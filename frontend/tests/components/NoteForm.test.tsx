import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { toast } from 'react-hot-toast';
import NoteForm from '../../src/components/NoteForm';
import * as noteService from '../../src/services/notes.service';

vi.mock('react-hot-toast');
vi.mock('../../src/services/notes.service');

describe('NoteForm - Error Handling (FE-003)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('shows error toast when note creation fails', async () => {
    // ===== ARRANGE: Set up the test conditions =====
    const fakeError = new Error('Network connection failed');
    vi.mocked(noteService.createNote).mockRejectedValue(fakeError);
    
    const mockOnCreated = vi.fn();
    render(<NoteForm onCreated={mockOnCreated} />);

    // ===== ACT: Simulate what the user does =====
    const titleInput = screen.getByPlaceholderText('Title');
    const contentInput = screen.getByPlaceholderText('Content');
    const submitButton = screen.getByRole('button', { name: /create/i});

    fireEvent.change(titleInput, { target: { value: 'Test Note' } });
    fireEvent.change(contentInput, { target: { value: 'Test content' } });
    fireEvent.click(submitButton);

    // ===== ASSERT: Verify what happened =====
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Failed to create note. Please try again.'
      );
    });

    expect(mockOnCreated).not.toHaveBeenCalled();
  });

  test('preserves form values when creation fails', async () => {
    // ARRANGE: Mock the API to fail
    vi.mocked(noteService.createNote).mockRejectedValue(
      new Error('API error')
    );

    render(<NoteForm onCreated={vi.fn()} />);

    // ACT: Fill and submit form
    const titleInput = screen.getByPlaceholderText('Title');
    const contentInput = screen.getByPlaceholderText('Content');

    fireEvent.change(titleInput, { target: { value: 'Important Note' } });
    fireEvent.change(contentInput, { target: { value: 'Important content' } });
    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    // ASSERT: Form values should still be there after error
    await waitFor(() => {
      expect(titleInput).toHaveValue('Important Note');
      expect(contentInput).toHaveValue('Important content');
    });
  });

  test('clears form and calls onCreated when creation succeeds', async () => {

    vi.mocked(noteService.createNote).mockResolvedValue(undefined);

    const mockOnCreated = vi.fn();
    render(<NoteForm onCreated={mockOnCreated} />);

    const titleInput = screen.getByPlaceholderText('Title');
    const contentInput = screen.getByPlaceholderText('Content');

    fireEvent.change(titleInput, { target: { value: 'Success Title' } });
    fireEvent.change(contentInput, { target: { value: 'Success content' } });
    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(titleInput).toHaveValue('');
      expect(contentInput).toHaveValue('');
      expect(mockOnCreated).toHaveBeenCalledTimes(1);
    });
  });
});
