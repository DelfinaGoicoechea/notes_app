import { renderHook } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { useNotes } from '../../src/hooks/useNotes';
import { NotesProvider } from '../../src/contexts/NotesContext';

describe('useNotes', () => {
  test('throws when used outside NotesProvider', () => {
    expect(() => renderHook(() => useNotes())).toThrow(
      'useNotes must be used with a NotesProvider'
    );
  });

  test('returns context value when used inside NotesProvider', () => {
    const { result } = renderHook(() => useNotes(), {
      wrapper: ({ children }) => (
        <NotesProvider view="active">{children}</NotesProvider>
      ),
    });

    expect(result.current.notes).toEqual([]);
    expect(result.current.search).toBe('');
    expect(typeof result.current.createNote).toBe('function');
  });
});
