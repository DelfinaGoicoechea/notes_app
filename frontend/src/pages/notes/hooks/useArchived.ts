import { useCallback, useEffect, useState } from "react";
import type { Note } from "../../../types/note";
import {
  deleteNote,
  getArchivedNotes,
  unarchiveNote,
} from "../../../services/notes.service";
import toast from "react-hot-toast";


export function useArchived(){
  const [notes, setNotes] = useState<Note[]>([]);
  const [category, setCategory] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [unarchivingNoteId, setUnarchivingNoteId] = useState<number | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<number | null>(null);
  const [search, setSearch] = useState<string>("");

  const handleFetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const trimmedCategory = category.trim() || undefined;
      const trimmedSearch = search.trim() || undefined;

      const response = await getArchivedNotes(trimmedCategory, trimmedSearch);
      setNotes(response);
    } catch (error) {
      console.error("useArchived - Get archived notes failed.", error);
      toast.error("Failed to load archived notes. Please try again.", { 
        id: 'load-archived-notes-error' 
      });
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

  const handleUnarchive = async (id: number) => {
    setUnarchivingNoteId(id);
    try {
      await unarchiveNote(id);
      await handleFetch();
    } catch(error) {
      console.error("useArchived - Unarchive note failed.", error);
      toast.error("Failed to unarchive note. Please try again.");
    } finally {
      setUnarchivingNoteId(null);
    };
  };

  const handleDelete = async (id: number) => {
    setDeletingNoteId(id);
    try {
      await deleteNote(id);
      await handleFetch();
    } catch(error) {
      console.error("useArchived - Delete note failed.", error);
      toast.error("Failed to delete note. Please try again.");
    } finally {
      setDeletingNoteId(null);
    };
  };

  const handleRefetch = () => {
    handleFetch();
  }

  return {
    notes,
    handleUnarchive,
    handleDelete,
    handleRefetch,
    category,
    setCategory,
    isLoading,
    unarchivingNoteId,
    deletingNoteId,
    search,
    setSearch,
  };
}