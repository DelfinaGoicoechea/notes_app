import { useCallback, useEffect, useState } from "react";
import type { Note } from "../../../types/note";
import { archiveNote, deleteNote, getActiveNotes } from "../../../services/notes.service";
import { announce } from "../../../a11y/announce";
import { notifyError } from "../../../utils/notifyError";

export function useActive(){
  const [notes, setNotes] = useState<Note[]>([]);
  const [category, setCategory] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [archivingNoteId, setArchivingNoteId] = useState<number | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<number | null>(null); 
  const [search, setSearch] = useState<string>("");

  const handleFetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const trimmedCategory = category.trim() || undefined;
      const trimmedSearch = search.trim() || undefined;
          
      const response = await getActiveNotes(trimmedCategory, trimmedSearch);
      setNotes(response);
    } catch (error) {
      console.error("useActive - Get active notes failed.", error);
      const message = "Failed to load notes.";
      notifyError(`${message}` + " Please try again.", { id: "load-active-notes-error" });
      announce(message, "assertive");
    } finally {
      setIsLoading(false);
    };
  }, [category, search]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      handleFetch();
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [handleFetch]);

  const handleArchive = async (id: number): Promise<boolean> => {
    setArchivingNoteId(id);
    try {
      await archiveNote(id);
      setNotes((prev) => prev.filter((note) => note.id !== id));
      return true;
    } catch(error) {
      console.error("useActive - Archive note failed.", error);
      const message = "Failed to archive note.";
      notifyError(`${message}` + " Please try again.");
      announce(message, "assertive");
      return false;
    } finally {
      setArchivingNoteId(null);
    };
  };

  const handleDelete = async (id: number): Promise<boolean> => {
    setDeletingNoteId(id);
    try {
      await deleteNote(id);
      setNotes((prev) => prev.filter((note) => note.id !== id));
      return true;
    } catch(error) {
      console.error("useActive - Delete note failed.", error);
      const message = "Failed to delete note.";
      notifyError(`${message}` + " Please try again.");
      announce(message, "assertive");
      return false;
    } finally {
      setDeletingNoteId(null);
    };
  };

  const handleNoteUpdated = (updatedNote: Note) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === updatedNote.id ? updatedNote : note))
    );
  };

  const handleNoteCreated = (createdNote: Note) => {
    setNotes((prev) => [createdNote, ...prev]);
  };

  return {
    notes,
    handleArchive,
    handleDelete,
    handleNoteUpdated,
    handleNoteCreated,
    category,
    setCategory,
    isLoading,
    archivingNoteId,
    deletingNoteId,
    search,
    setSearch,
  };
}
