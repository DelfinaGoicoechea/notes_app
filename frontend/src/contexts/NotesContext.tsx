import React, { createContext } from "react";
import type { Note } from "../types/note"

type NotesContextValue = {
  notes: Note[];
  category: string;
  setCategory: (value: string) => void;
  search: string;
  setSearch: (value: string) => void;
  isLoading: boolean;
  archivingNoteId: number | null;
  deletingNoteId: number | null;
  getNotes: (category?: string, search?: string) => Promise<Note[]>;
  createNote: (data: { title: string, content: string }) => Promise<Note>;
  updateNote: (id: number, data: { title: string, content: string }) => Promise<Note>;
  deleteNote: (id: number) => void;
  archiveNote: (id: number) => Promise<Note>;
  unarchiveNote: (id: number) => Promise<Note>;
  addCategory: (id: number, value: string) => Promise<Note>;
  removeCategory: (id: number, value: string) => Promise<Note>;
};

export const NotesContext = createContext<NotesContextValue | undefined>(undefined);

const mockNote: Note = {
  id: 1,
  title: "title",
  content: "",
  archived: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
};

export function NotesProvider({ children }: { children: React.ReactNode }) {
  return (
    <NotesContext.Provider value={{
      notes: [],
      category: "",
      setCategory: () => {},
      search: "",
      setSearch: () => {},
      isLoading: false,
      archivingNoteId: null,
      deletingNoteId: null,
      getNotes: async () => {return []},
      createNote: async () => {return mockNote},
      updateNote: async () => {return mockNote},
      deleteNote: () => {},
      archiveNote: async () => {return mockNote},
      unarchiveNote: async () => {return mockNote},
      addCategory: async () => {return mockNote},
      removeCategory: async () => {return mockNote}
    }}>
      {children}
    </NotesContext.Provider>
  );
}