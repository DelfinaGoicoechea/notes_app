import type { Note } from "../../../types/note";
import NoteCard from "../../../components/NoteCard";
import NoteForm from "../../../components/NoteForm";
import Spinner from "../../../components/Spinner";

interface NotesT {
  title: string;
  showForm: boolean;
  notes: Note[];
  handleArchive: (id: number) => void;
  handleDelete: (id: number) => void;
  handleRefetch: () => void;
  category: string;
  setCategory: (value: string) => void;
  isLoading: boolean;
  archivingNoteId: number | null;
  deletingNoteId: number | null;
}

export function Notes({
  title,
  showForm,
  notes,
  handleArchive,
  handleDelete,
  handleRefetch,
  category,
  setCategory,
  isLoading,
  archivingNoteId,
  deletingNoteId,
}: NotesT) {
  const getEmptyStateMessage = () => {
    if (category !== "") {
      return {
        headline: "No notes match your filter",
        subtext: "Try a different category or clear your filter."
      };
    }

    if (showForm) {
      return {
        headline: "No notes yet",
        subtext: "Create your first note above to get started."
      };
    }

    return {
      headline: "No archived notes",
      subtext: "Notes you archive will appear here. Archive a note to keep your workspace clean without deleting it."
    };
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Spinner />
        </div>
      );
    }

    if (notes.length === 0) {
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
      <div className="flex flex-col gap-4">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onArchive={handleArchive}
            onDelete={handleDelete}
            onUpdated={handleRefetch}
            archivingNoteId={archivingNoteId}
            deletingNoteId={deletingNoteId}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 flex flex-col gap-6">
      <h1 className="text-xl font-semibold">{title}</h1>

      {showForm && <NoteForm onCreated={handleRefetch} />}

      <div className="flex gap-2">
        <input
          className="border rounded-md px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="Filter by category (prefix, case-insensitive)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={() => setCategory("")}
          disabled={isLoading}
          className="border px-3 py-2 rounded-md text-sm hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear
        </button>
      </div>

      {renderContent()}
    </div>
  );
}