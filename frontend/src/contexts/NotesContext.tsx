import React, { createContext, useCallback, useEffect, useState } from "react";
import type { Note, NoteInput } from "../types/note"
import { notifyError } from "../utils/notifyError";
import { announce } from "../a11y/announce";
import { 
  getActiveNotes,
  getArchivedNotes,
  createNote as createNoteRequest,
  updateNote as updateNoteRequest,
  deleteNote as deleteNoteRequest,
  archiveNote as archiveNoteRequest,
  unarchiveNote as unarchiveNoteRequest,
  addCategoryToNote,
  removeCategoryFromNote
} from "../services/notes.service";
import type { ToastOptions } from "react-hot-toast";

export type NotesContextValue = {
  notes: Note[];
  view: NotesView;
  category: string;
  setCategory: (value: string) => void;
  search: string;
  setSearch: (value: string) => void;
  isLoading: boolean;
  archivingNoteId: number | null;
  deletingNoteId: number | null;
  getNotes: () => Promise<void>;
  createNote: (data: NoteInput) => Promise<Note>;
  updateNote: (id: number, data: NoteInput) => Promise<Note>;
  deleteNote: (id: number) => Promise<boolean>;
  archiveNote: (id: number) => Promise<boolean>;
  unarchiveNote: (id: number) => Promise<boolean>;
  addCategory: (id: number, name: string) => Promise<Note>;
  removeCategory: (id: number, name: string) => Promise<Note>;
};

export type NotesView = "active" | "archived";

export const NotesContext = createContext<NotesContextValue | undefined>(undefined);

function reportFailure(logLabel: string, userMessage: string, error: unknown, toastOptions?: ToastOptions) {
  console.error(logLabel, error);
  notifyError(`${userMessage} Please try again.`, toastOptions);
  announce(userMessage, "assertive");
};

export function NotesProvider({ children, view }: { children: React.ReactNode; view: NotesView }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [category, setCategory] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [archivingNoteId, setArchivingNoteId] = useState<number | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<number | null>(null);
  
  const getNotes = useCallback(async () => {
    setIsLoading(true);
    try {
      const trimmedCategory = category.trim() || undefined;
      const trimmedSearch = search.trim() || undefined;
          
      const response = await (
        view === "active" 
        ? getActiveNotes(trimmedCategory, trimmedSearch) 
        : getArchivedNotes(trimmedCategory, trimmedSearch)
      );
      setNotes(response);
    } catch (error) {
      reportFailure(
        `NotesContext - Get ${view} notes failed.`,
        "Failed to load notes.",
        error,
        { id: `load-${view}-notes-error` }
      );
    } finally {
      setIsLoading(false);
    };
  }, [category, search, view]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      getNotes();
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [getNotes]);

  
  const createNote = async (data: NoteInput) => {
    try {   
      const createdNote = await createNoteRequest(data);    
      setNotes((prev) => [createdNote, ...prev]);
      return createdNote;
    } catch(error) {
      reportFailure(
        "NotesContext - Create note failed.",
        "Failed to create note.",
        error
      );
      throw error;
    };
  };

  const updateNote = async (id: number, data: NoteInput) => {
    try {
      const updatedNote = await updateNoteRequest(id, data);
      setNotes((prev) =>
        prev.map((note) => (note.id === updatedNote.id ? updatedNote : note))
      );
      return updatedNote;
    } catch(error) {
      reportFailure(
        "NotesContext - Update note failed.",
        "Failed to save note changes.",
        error
      );
      throw error;
    };
  };

  const deleteNote = async (id: number) => {
    setDeletingNoteId(id);
    try {
      await deleteNoteRequest(id);
      setNotes((prev) => prev.filter((note) => note.id !== id));
      return true;
    } catch(error) {
      reportFailure(
        "NotesContext - Delete note failed.",
        "Failed to delete note.",
        error
      );
      return false;
    } finally {
      setDeletingNoteId(null);
    };
  };

  const archiveNote = async (id: number) => {
    setArchivingNoteId(id);
    try {
      await archiveNoteRequest(id);
      setNotes((prev) => prev.filter((note) => note.id !== id));
      return true;
    } catch(error) {
      reportFailure(
        "NotesContext - Archive note failed.",
        "Failed to archive note.",
        error
      );
      return false;
    } finally {
      setArchivingNoteId(null);
    };
  };

  const unarchiveNote = async (id: number) => {
    setArchivingNoteId(id);
    try {
      await unarchiveNoteRequest(id);
      setNotes((prev) => prev.filter((note) => note.id !== id));
      return true;
    } catch(error) {
      reportFailure(
        "NotesContext - Unarchive note failed.",
        "Failed to unarchive note.",
        error
      );
      return false;
    } finally {
      setArchivingNoteId(null);
    };
  };

  const addCategory = async (id: number, name: string) => {
    try {
      const updatedNote = await addCategoryToNote(id, name);
      setNotes((prev) =>
        prev.map((note) => (note.id === updatedNote.id ? updatedNote : note))
      );
      return updatedNote;
    } catch(error) {
      reportFailure(
        "NotesContext - Add category failed.",
        "Failed to add category.",
        error
      );
      throw error;
    };
  };

  const removeCategory = async (id: number, name: string) => {
    try {
      const updatedNote = await removeCategoryFromNote(id, name);
      setNotes((prev) =>
        prev.map((note) => (note.id === updatedNote.id ? updatedNote : note))
      );
      return updatedNote;
    } catch(error) {
      reportFailure(
        "NotesContext - Remove category failed.",
        "Failed to remove category.",
        error
      );
      throw error;
    };
  };


  return (
    <NotesContext.Provider value={{
      notes,
      view,
      category,
      setCategory,
      search,
      setSearch,
      isLoading,
      archivingNoteId,
      deletingNoteId,
      getNotes,
      createNote,
      updateNote,
      deleteNote,
      archiveNote,
      unarchiveNote,
      addCategory,
      removeCategory
    }}>
      {children}
    </NotesContext.Provider>
  );
}
