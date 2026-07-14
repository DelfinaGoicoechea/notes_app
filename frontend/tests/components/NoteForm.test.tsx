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
    const mockCreatedNote = {
      id: 1,
      title: 'Success Title',
      content: 'Success content',
      archived: false,
      categories: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(noteService.createNote).mockResolvedValue(mockCreatedNote);

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

  test('logs errors to console for debugging', async () => {
    // ARRANGE: Spy on console.error
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const mockError = new Error('Network timeout');
    vi.mocked(noteService.createNote).mockRejectedValue(mockError);
    
    render(<NoteForm onCreated={vi.fn()} />);
    
    // ACT: Fill form and submit to trigger error
    const titleInput = screen.getByPlaceholderText('Title');
    fireEvent.change(titleInput, { target: { value: 'Test Note' } });
    fireEvent.click(screen.getByRole('button', { name: /create/i }));
    
    // ASSERT: Verify console.error was called with the error
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'NoteForm - Create note failed.',
        mockError
      );
    });
    
    // Cleanup: Restore console.error
    consoleErrorSpy.mockRestore();
  });
});

describe('NoteForm - Loading States (FE-004)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('disables submit button during note creation', async () => {
    // ARRANGE: Mock API with delay to see loading state
    vi.mocked(noteService.createNote).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        id: 1,
        title: 'Test',
        content: 'Content',
        archived: false,
        categories: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }), 100))
    );

    render(<NoteForm onCreated={vi.fn()} />);

    // ACT: Fill form and submit
    const titleInput = screen.getByPlaceholderText('Title');
    const submitButton = screen.getByRole('button', { name: /create/i });

    fireEvent.change(titleInput, { target: { value: 'Test Note' } });
    fireEvent.click(submitButton);

    // ASSERT: Button should be disabled during creation
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });

    // Wait for completion
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  test('shows "Creating..." text on button during creation', async () => {
    // ARRANGE
    vi.mocked(noteService.createNote).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        id: 1,
        title: 'Test',
        content: 'Content',
        archived: false,
        categories: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }), 100))
    );

    render(<NoteForm onCreated={vi.fn()} />);

    // ACT: Submit form
    const titleInput = screen.getByPlaceholderText('Title');
    fireEvent.change(titleInput, { target: { value: 'Test' } });
    
    const submitButton = screen.getByRole('button', { name: /create/i });
    fireEvent.click(submitButton);

    // ASSERT: Should show "Creating..." text
    await waitFor(() => {
      expect(screen.getByText(/creating\.\.\./i)).toBeInTheDocument();
    });

    // After completion, should show "Create" again
    await waitFor(() => {
      expect(screen.getByText(/^create$/i)).toBeInTheDocument();
    });
  });

  test('disables input fields during note creation', async () => {
    // ARRANGE
    vi.mocked(noteService.createNote).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        id: 1,
        title: 'Test',
        content: 'Content',
        archived: false,
        categories: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }), 100))
    );

    render(<NoteForm onCreated={vi.fn()} />);

    // ACT: Fill and submit
    const titleInput = screen.getByPlaceholderText('Title');
    const contentInput = screen.getByPlaceholderText('Content');

    fireEvent.change(titleInput, { target: { value: 'Test' } });
    fireEvent.change(contentInput, { target: { value: 'Content' } });
    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    // ASSERT: Inputs should be disabled during creation
    await waitFor(() => {
      expect(titleInput).toBeDisabled();
      expect(contentInput).toBeDisabled();
    });

    // After completion, should be enabled again
    await waitFor(() => {
      expect(titleInput).not.toBeDisabled();
      expect(contentInput).not.toBeDisabled();
    });
  });

  test('prevents duplicate submissions while creation is in flight', async () => {
    // ARRANGE
    let resolveCreate: any;
    const createPromise = new Promise<any>((resolve) => {
      resolveCreate = resolve;
    });
    vi.mocked(noteService.createNote).mockReturnValue(createPromise);

    render(<NoteForm onCreated={vi.fn()} />);

    // ACT: Submit form
    const titleInput = screen.getByPlaceholderText('Title');
    fireEvent.change(titleInput, { target: { value: 'Test' } });
    
    const submitButton = screen.getByRole('button', { name: /create/i });
    fireEvent.click(submitButton);

    // Try to click again while first request is pending
    fireEvent.click(submitButton);
    fireEvent.click(submitButton);

    // ASSERT: API should only be called once
    expect(noteService.createNote).toHaveBeenCalledTimes(1);

    // Complete the operation
    resolveCreate({
      id: 1,
      title: 'Test',
      content: '',
      archived: false,
      categories: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  test('shows loading spinner during creation', async () => {
    // ARRANGE
    vi.mocked(noteService.createNote).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        id: 1,
        title: 'Test',
        content: 'Content',
        archived: false,
        categories: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }), 100))
    );

    render(<NoteForm onCreated={vi.fn()} />);

    // ACT: Submit form
    const titleInput = screen.getByPlaceholderText('Title');
    fireEvent.change(titleInput, { target: { value: 'Test' } });
    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    // ASSERT: Spinner should be visible (check for the sr-only "Loading..." text)
    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  test('re-enables form after creation completes', async () => {
    // ARRANGE
    const mockCreatedNote = {
      id: 1,
      title: 'New Note',
      content: 'New Content',
      archived: false,
      categories: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(noteService.createNote).mockResolvedValue(mockCreatedNote);

    const mockOnCreated = vi.fn();
    render(<NoteForm onCreated={mockOnCreated} />);

    // ACT: Submit form
    const titleInput = screen.getByPlaceholderText('Title');
    const contentInput = screen.getByPlaceholderText('Content');
    const submitButton = screen.getByRole('button', { name: /create/i });

    fireEvent.change(titleInput, { target: { value: 'New Note' } });
    fireEvent.change(contentInput, { target: { value: 'New Content' } });
    fireEvent.click(submitButton);

    // ASSERT: After completion, everything should be re-enabled and cleared
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
      expect(titleInput).not.toBeDisabled();
      expect(contentInput).not.toBeDisabled();
      expect(titleInput).toHaveValue('');
      expect(contentInput).toHaveValue('');
      expect(mockOnCreated).toHaveBeenCalledTimes(1);
    });
  });
});
