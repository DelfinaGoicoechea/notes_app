import type { Note } from "../../../types/note";
import NoteCard from "../../../components/NoteCard";
import NoteForm from "../../../components/NoteForm";

interface NotesT {
  title: string;
  showForm: boolean;
  notes: Note[];
  handleArchive: (id: number) => void;
  handleDelete: (id: number) => void;
  handleRefetch: () => void;
  category: string;
  setCategory: (value: string) => void;
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
}: NotesT) {
  return (
    <div className="max-w-xl mx-auto px-4 py-6 flex flex-col gap-6">
      <h1 className="text-xl font-semibold">{title}</h1>

      {showForm && <NoteForm onCreated={handleRefetch} />}

      <div className="flex gap-2">
        <input
          className="border rounded-md px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-gray-300"
          placeholder="Filter by category (prefix, case-insensitive)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setCategory("")}
          className="border px-3 py-2 rounded-md text-sm hover:bg-gray-100 transition"
        >
          Clear
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onArchive={handleArchive}
            onDelete={handleDelete}
            onUpdated={handleRefetch}
          />
        ))}
      </div>
    </div>
  );
}