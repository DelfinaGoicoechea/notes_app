import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { toast } from 'react-hot-toast';
import NoteForm from '../../src/components/NoteForm';
import * as noteService from '../../src/services/notes.service';
import React from 'react';

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
});
