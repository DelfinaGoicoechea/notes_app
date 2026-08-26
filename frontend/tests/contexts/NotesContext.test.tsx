import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import type { ReactNode } from 'react';
import { NotesProvider } from '../../src/contexts/NotesContext';
import { useNotes } from '../../src/hooks/useNotes';
import * as noteService from '../../src/services/notes.service';
import type { Note } from '../../src/types/note';

vi.mock('../../src/services/notes.service');
vi.mock('react-hot-toast');

const mockNote: Note = {
  id: 1,
  title: 'Test Note',
  content: 'Test content',
  archived: false,
  categories: [],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

function createWrapper(view: 'active' | 'archived' = 'active') {
  return ({ children }: { children: ReactNode }) => (
    <NotesProvider view={view}>{children}</NotesProvider>
  );
}

describe('NotesContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(noteService.getActiveNotes).mockResolvedValue([]);
    vi.mocked(noteService.getArchivedNotes).mockResolvedValue([]);
  });

  test('loads active notes after debounce', async () => {
    vi.mocked(noteService.getActiveNotes).mockResolvedValue([mockNote]);

    const { result } = renderHook(() => useNotes(), {
      wrapper: createWrapper('active'),
    });

    await waitFor(
      () => {
        expect(result.current.notes).toEqual([mockNote]);
      },
      { timeout: 1000 }
    );

    expect(noteService.getActiveNotes).toHaveBeenCalledWith(undefined, undefined);
    expect(noteService.getArchivedNotes).not.toHaveBeenCalled();
  });

  test('loads archived notes when view is archived', async () => {
    vi.mocked(noteService.getArchivedNotes).mockResolvedValue([mockNote]);

    const { result } = renderHook(() => useNotes(), {
      wrapper: createWrapper('archived'),
    });

    await waitFor(
      () => {
        expect(result.current.notes).toEqual([mockNote]);
      },
      { timeout: 1000 }
    );

    expect(noteService.getArchivedNotes).toHaveBeenCalledWith(undefined, undefined);
  });

  test('sends trimmed search and category to the API', async () => {
    const { result } = renderHook(() => useNotes(), {
      wrapper: createWrapper('active'),
    });

    await waitFor(() => {
      expect(noteService.getActiveNotes).toHaveBeenCalled();
    });

    act(() => {
      result.current.setSearch('  meeting  ');
      result.current.setCategory('  work  ');
    });

    await waitFor(
      () => {
        expect(noteService.getActiveNotes).toHaveBeenLastCalledWith('work', 'meeting');
      },
      { timeout: 1000 }
    );
  });

  test('createNote prepends the created note', async () => {
    const createdNote = { ...mockNote, id: 2, title: 'New Note' };
    vi.mocked(noteService.createNote).mockResolvedValue(createdNote);

    const { result } = renderHook(() => useNotes(), {
      wrapper: createWrapper('active'),
    });

    await act(async () => {
      await result.current.createNote({ title: 'New Note', content: 'Content' });
    });

    expect(noteService.createNote).toHaveBeenCalledWith({
      title: 'New Note',
      content: 'Content',
    });
    expect(result.current.notes[0]).toEqual(createdNote);
  });

  test('deleteNote returns false when the service fails', async () => {
    vi.mocked(noteService.getActiveNotes).mockResolvedValue([mockNote]);
    vi.mocked(noteService.deleteNote).mockRejectedValue(new Error('Delete failed'));

    const { result } = renderHook(() => useNotes(), {
      wrapper: createWrapper('active'),
    });

    await waitFor(() => {
      expect(result.current.notes).toEqual([mockNote]);
    });

    let deleteResult = true;
    await act(async () => {
      deleteResult = await result.current.deleteNote(1);
    });

    expect(deleteResult).toBe(false);
    expect(result.current.notes).toEqual([mockNote]);
  });

  test('archiveNote removes the note from the list on success', async () => {
    vi.mocked(noteService.getActiveNotes).mockResolvedValue([mockNote]);
    vi.mocked(noteService.archiveNote).mockResolvedValue({ ...mockNote, archived: true });

    const { result } = renderHook(() => useNotes(), {
      wrapper: createWrapper('active'),
    });

    await waitFor(() => {
      expect(result.current.notes).toEqual([mockNote]);
    });

    let archiveResult = false;
    await act(async () => {
      archiveResult = await result.current.archiveNote(1);
    });

    expect(archiveResult).toBe(true);
    expect(result.current.notes).toEqual([]);
  });
});
