import React, { createContext, useCallback, useEffect, useState } from "react";
import type { Note } from "../types/note"
import { notifyError } from "../utils/notifyError";
import { announce } from "../a11y/announce";
import { 
  getActiveNotes,
  createNote as createNoteRequest,
  updateNote as updateNoteRequest,
  deleteNote as deleteNoteRequest,
  archiveNote as archiveNoteRequest,
  unarchiveNote as unarchiveNoteRequest,
  addCategoryToNote,
  removeCategoryFromNote
} from "../services/notes.service";

type NotesContextValue = {
  notes: Note[];
  category: string;
  setCategory: (value: string) => void;
  search: string;
  setSearch: (value: string) => void;
  isLoading: boolean;
  archivingNoteId: number | null;
  deletingNoteId: number | null;
  getNotes: () => Promise<void>;
  createNote: (data: { title: string, content: string }) => Promise<Note>;
  updateNote: (id: number, data: { title: string, content: string }) => Promise<Note>;
  deleteNote: (id: number) => Promise<boolean>;
  archiveNote: (id: number) => Promise<boolean>;
  unarchiveNote: (id: number) => Promise<boolean>;
  addCategory: (id: number, name: string) => Promise<Note>;
  removeCategory: (id: number, name: string) => Promise<Note>;
};

export const NotesContext = createContext<NotesContextValue | undefined>(undefined);

export function NotesProvider({ children }: { children: React.ReactNode }) {
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
          
      const response = await getActiveNotes(trimmedCategory, trimmedSearch);
      setNotes(response);
    } catch (error) {
      console.error("NotesContext - Get notes failed.", error);
      const message = "Failed to load notes.";
      notifyError(`${message}` + " Please try again.", { id: "load-active-notes-error" });
      announce(message, "assertive");
    } finally {
      setIsLoading(false);
    };
  }, [category, search]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      getNotes();
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [getNotes]);

  
  const createNote = async (data: { title: string, content: string }) => {
    try {   
      const createdNote = await createNoteRequest({
        title: data.title,
        content: data.content 
      });      
      setNotes((prev) => [createdNote, ...prev]);
      return createdNote;
    } catch(error) {
      console.error("NotesContext - Create note failed.", error);
      const message = "Failed to create note.";
      notifyError(`${message}` + " Please try again.");
      announce(message, "assertive");
      throw error;
    };
  };

  const updateNote = async (id: number, data: { title: string, content: string}) => {
    try {
      const updatedNote = await updateNoteRequest(id, { 
        title: data.title, 
        content: data.content 
      });
      setNotes((prev) =>
        prev.map((note) => (note.id === updatedNote.id ? updatedNote : note))
      );
      return updatedNote;
    } catch(error) {
      console.error("NotesContext - Update note failed.", error);
      const message = "Failed to save note changes.";
      notifyError(`${message}` + " Please try again.");
      announce(message, "assertive");
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
      console.error("NotesContext - Delete note failed.", error);
      const message = "Failed to delete note.";
      notifyError(`${message}` + " Please try again.");
      announce(message, "assertive");
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
      console.error("NotesContext - Archive note failed.", error);
      const message = "Failed to archive note.";
      notifyError(`${message}` + " Please try again.");
      announce(message, "assertive");
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
      console.error("NotesContext - Unarchive note failed.", error);
      const message = "Failed to unarchive note.";
      notifyError(`${message}` + " Please try again.");
      announce(message, "assertive");
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
      console.error("NotesContext - Add category failed.", error);
      const message = "Failed to add category.";
      notifyError(`${message}` + " Please try again.");
      announce(message, "assertive");
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
      console.error("NotesContext - Remove category failed.", error);
      const message = "Failed to remove category.";
      notifyError(`${message}` + " Please try again.");
      announce(message, "assertive");
      throw error;
    };
  };


  return (
    <NotesContext.Provider value={{
      notes,
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
