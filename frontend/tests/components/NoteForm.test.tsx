import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { toast } from 'react-hot-toast';
import NoteForm from '../../src/components/NoteForm';
import * as noteService from '../../src/services/notes.service';
import { NotesProvider } from '../../src/contexts/NotesContext';

vi.mock('react-hot-toast');
vi.mock('../../src/services/notes.service');

function renderNoteForm() {
  return render(
    <NotesProvider view="active">
      <NoteForm />
    </NotesProvider>
  );
}

function getTitleInput() {
  return screen.getByLabelText(/note title/i);
}

function getContentInput() {
  return screen.getByLabelText(/note content/i);
}

function getCreateButton() {
  return screen.getByRole('button', { name: /create/i });
}

function expectToastError(message: string) {
  expect(toast.error).toHaveBeenCalledWith(message, undefined);
}

describe('NoteForm - Error Handling (FE-003)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(noteService.getActiveNotes).mockResolvedValue([]);
    vi.mocked(noteService.getArchivedNotes).mockResolvedValue([]);
  });

  test('shows error toast when note creation fails', async () => {
    const fakeError = new Error('Network connection failed');
    vi.mocked(noteService.createNote).mockRejectedValue(fakeError);

    renderNoteForm();

    const titleInput = getTitleInput();
    const contentInput = getContentInput();
    const submitButton = getCreateButton();

    fireEvent.change(titleInput, { target: { value: 'Test Note' } });
    fireEvent.change(contentInput, { target: { value: 'Test content' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expectToastError('Failed to create note. Please try again.');
    });
  });

  test('preserves form values when creation fails', async () => {
    vi.mocked(noteService.createNote).mockRejectedValue(
      new Error('API error')
    );

    renderNoteForm();

    const titleInput = getTitleInput();
    const contentInput = getContentInput();

    fireEvent.change(titleInput, { target: { value: 'Important Note' } });
    fireEvent.change(contentInput, { target: { value: 'Important content' } });
    fireEvent.click(getCreateButton());

    await waitFor(() => {
      expect(titleInput).toHaveValue('Important Note');
      expect(contentInput).toHaveValue('Important content');
    });
  });

  test('clears form when creation succeeds', async () => {
    const mockCreatedNote = {
      id: 1,
      title: 'Success Title',
      content: 'Success content',
      archived: false,
      categories: [],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };
    vi.mocked(noteService.createNote).mockResolvedValue(mockCreatedNote);

    renderNoteForm();

    const titleInput = getTitleInput();
    const contentInput = getContentInput();

    fireEvent.change(titleInput, { target: { value: 'Success Title' } });
    fireEvent.change(contentInput, { target: { value: 'Success content' } });
    fireEvent.click(getCreateButton());

    await waitFor(() => {
      expect(noteService.createNote).toHaveBeenCalledWith({
        title: 'Success Title',
        content: 'Success content',
      });
      expect(titleInput).toHaveValue('');
      expect(contentInput).toHaveValue('');
    });
  });

  test('logs errors to console for debugging', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const mockError = new Error('Network timeout');
    vi.mocked(noteService.createNote).mockRejectedValue(mockError);

    renderNoteForm();

    const titleInput = getTitleInput();
    fireEvent.change(titleInput, { target: { value: 'Test Note' } });
    fireEvent.click(getCreateButton());

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'NotesContext - Create note failed.',
        mockError
      );
    });

    consoleErrorSpy.mockRestore();
  });
});

describe('NoteForm - Loading States (FE-004)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(noteService.getActiveNotes).mockResolvedValue([]);
    vi.mocked(noteService.getArchivedNotes).mockResolvedValue([]);
  });

  test('disables submit button during note creation', async () => {
    vi.mocked(noteService.createNote).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        id: 1,
        title: 'Test',
        content: 'Content',
        archived: false,
        categories: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }), 100))
    );

    renderNoteForm();

    const titleInput = getTitleInput();
    const submitButton = getCreateButton();

    fireEvent.change(titleInput, { target: { value: 'Test Note' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  test('shows "Creating..." text on button during creation', async () => {
    vi.mocked(noteService.createNote).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        id: 1,
        title: 'Test',
        content: 'Content',
        archived: false,
        categories: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }), 100))
    );

    renderNoteForm();

    const titleInput = getTitleInput();
    fireEvent.change(titleInput, { target: { value: 'Test' } });

    const submitButton = getCreateButton();
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/creating\.\.\./i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/^create$/i)).toBeInTheDocument();
    });
  });

  test('disables input fields during note creation', async () => {
    vi.mocked(noteService.createNote).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        id: 1,
        title: 'Test',
        content: 'Content',
        archived: false,
        categories: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }), 100))
    );

    renderNoteForm();

    const titleInput = getTitleInput();
    const contentInput = getContentInput();

    fireEvent.change(titleInput, { target: { value: 'Test' } });
    fireEvent.change(contentInput, { target: { value: 'Content' } });
    fireEvent.click(getCreateButton());

    await waitFor(() => {
      expect(titleInput).toBeDisabled();
      expect(contentInput).toBeDisabled();
    });

    await waitFor(() => {
      expect(titleInput).not.toBeDisabled();
      expect(contentInput).not.toBeDisabled();
    });
  });

  test('prevents duplicate submissions while creation is in flight', async () => {
    let resolveCreate: (value: unknown) => void = () => {};
    const createPromise = new Promise((resolve) => {
      resolveCreate = resolve;
    });
    vi.mocked(noteService.createNote).mockReturnValue(createPromise as Promise<never>);

    renderNoteForm();

    const titleInput = getTitleInput();
    fireEvent.change(titleInput, { target: { value: 'Test' } });

    const submitButton = getCreateButton();
    fireEvent.click(submitButton);
    fireEvent.click(submitButton);
    fireEvent.click(submitButton);

    expect(noteService.createNote).toHaveBeenCalledTimes(1);

    resolveCreate({
      id: 1,
      title: 'Test',
      content: '',
      archived: false,
      categories: [],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    });

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  test('shows loading spinner during creation', async () => {
    vi.mocked(noteService.createNote).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        id: 1,
        title: 'Test',
        content: 'Content',
        archived: false,
        categories: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }), 100))
    );

    renderNoteForm();

    const titleInput = getTitleInput();
    fireEvent.change(titleInput, { target: { value: 'Test' } });
    fireEvent.click(getCreateButton());

    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  test('re-enables form after creation completes', async () => {
    const mockCreatedNote = {
      id: 1,
      title: 'New Note',
      content: 'New Content',
      archived: false,
      categories: [],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };
    vi.mocked(noteService.createNote).mockResolvedValue(mockCreatedNote);

    renderNoteForm();

    const titleInput = getTitleInput();
    const contentInput = getContentInput();
    const submitButton = getCreateButton();

    fireEvent.change(titleInput, { target: { value: 'New Note' } });
    fireEvent.change(contentInput, { target: { value: 'New Content' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
      expect(titleInput).not.toBeDisabled();
      expect(contentInput).not.toBeDisabled();
      expect(titleInput).toHaveValue('');
      expect(contentInput).toHaveValue('');
    });
  });
});
