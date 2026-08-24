import NoteCard from "../../../components/NoteCard";
import NoteForm from "../../../components/NoteForm";
import Spinner from "../../../components/Spinner";
import { announce } from "../../../a11y/announce";
import { focusTarget, getFocusTargetAfterRemoval } from "../../../utils/focusTarget";
import { useNotes } from "../hooks/useNotes";


interface NotesProps {
  title: string;
  showForm: boolean;
}

export function Notes({ title, showForm }: NotesProps) {
  const {
    notes,
    category,
    setCategory,
    search,
    setSearch,
    isLoading,
    archivingNoteId,
    deletingNoteId,
    deleteNote,
    archiveNote,
    unarchiveNote,
  } = useNotes();

  const handleDeleteWithFocus = async (id: number) => {
    const target = getFocusTargetAfterRemoval(notes, id, showForm);

    const isOk = await deleteNote(id);    
    if(!isOk) return;

    focusTarget(target);
    announce("Note deleted", "assertive");
  };

  const handleArchiveWithFocus = async (id: number) => {
    const note = notes.find((n) => n.id === id);
    const isCurrentlyArchived = note?.archived ?? false;
    const target = getFocusTargetAfterRemoval(notes, id, showForm);

    const isOk = showForm
      ? await archiveNote(id)
      : await unarchiveNote(id);
    if(!isOk) return;

    focusTarget(target);
    announce(
      isCurrentlyArchived ? "Note unarchived" : "Note archived",
      "assertive"
    );
  };

  const getEmptyStateMessage = () => {
    const hasCategory = category && category.trim() !== "";
    const hasSearch = search && search.trim() !== "";

    if (hasCategory && hasSearch) {
      return {
        headline: "No notes match your search and category filter",
        subtext: "Try searching something else or a different category"
      };
    } else if (hasCategory) {
      return {
        headline: "No notes match your filter",
        subtext: "Try a different category or clear your filter"
      };
    } else if (hasSearch) {
      return {
        headline: "No notes match your search",
        subtext: "Try something different or clear your search"
      };
    }

    if (showForm) {
      return {
        headline: "No notes yet",
        subtext: "Create your first note above to get started"
      };
    };

    return {
      headline: "No archived notes",
      subtext: "Notes you archive will appear here. Archive a note to keep your workspace clean without deleting it"
    };
  };

  const renderContent = () => {
    // Only replace the list with a spinner on the first load (no notes yet).
    if (isLoading && notes.length === 0) {
      return (
        <div className="flex justify-center items-center py-12">
          <Spinner />
        </div>
      );
    }

    if (!isLoading && notes.length === 0) {
      const emptyState = getEmptyStateMessage();
      return (
        <div className="bg-gray-50 border border-gray-200 rounded-md py-12 px-6 text-center">
          <p className="text-gray-900 text-base font-medium">
            {emptyState.headline}
          </p>
          <p className="text-gray-600 text-sm mt-2">
            {emptyState.subtext}
          </p>
        </div>
      );
    }

    return (
      <div className={`flex flex-col gap-4 ${isLoading ? "opacity-60" : ""}`}>
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onArchive={handleArchiveWithFocus}
            onDelete={handleDeleteWithFocus}
            archivingNoteId={archivingNoteId}
            deletingNoteId={deletingNoteId}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 flex flex-col gap-6">
      <h1 className="text-xl font-semibold">
        {title}
      </h1>

      {showForm && <NoteForm />}

      <div className="flex flex-col gap-1">
          <label htmlFor="search-input" className="text-base font-medium text-gray-700">Search notes</label>
          <div className="flex gap-2">
            <input
              id="search-input"
              className="border rounded-md px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-gray-300 focus-visible:ring-gray-400"
              placeholder="e.g. shopping"
              value={search || ""}
              onChange={(e) => setSearch(e.target.value)}
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setSearch("")}
              className="border rounded-md px-3 py-2 text-sm hover:bg-gray-100 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
              aria-label="Clear search"
            >
              Clear
            </button>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="category-input" className="text-base font-medium text-gray-700">Filter by category</label>
        <div className="flex gap-2">
          <input
            id="category-input"
            className="border rounded-md px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-gray-300 focus-visible:ring-gray-400"
            placeholder="e.g. work"
            value={category || ""}
            onChange={(e) => setCategory(e.target.value)}
            autoComplete="off"
          />
          <button
            type="button"
            onClick={() => setCategory("")}
            className="border px-3 py-2 rounded-md text-sm hover:bg-gray-100 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
            aria-label="Clear category filter"
          >
            Clear
          </button>
        </div>
      </div>

      {(search || category) && notes.length > 0 && (
        <div className="flex gap-2 text-sm">
          {notes.length} {notes.length === 1 ? 'note' : 'notes'} found
        </div>
      )} 

      {renderContent()}
    </div>
  );
}
