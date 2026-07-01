import { useState } from "react";
import type { Note } from "../types/note";
import { addCategoryToNote, removeCategoryFromNote, updateNote } from "../services/notes.service";
import toast from "react-hot-toast";

interface NoteCardProps {
  note: Note;
  onArchive?: (id: number) => void;
  onDelete?: (id: number) => void;
  onUpdated?: () => void;
}

export default function NoteCard({
  note,
  onArchive,
  onDelete,
  onUpdated,
}: NoteCardProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [title, setTitle] = useState<string>(note.title);
  const [content, setContent] = useState<string>(note.content);
  const [newCategory, setNewCategory] = useState<string>("");

  const handleSave: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    try {
      await updateNote(note.id, { title, content });

      setIsEditing(false);
      onUpdated?.();
    } catch(error) {
      console.error("NoteCard - Update note failed.", error);
      toast.error("Failed to save note changes. Please try again.");
    };
  };

  if (isEditing) {
    return (
      <form
        onSubmit={handleSave}
        className="border rounded-md p-4 flex flex-col gap-3"
      >
        <input
          className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="border rounded-md px-3 py-2 text-sm min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-gray-300"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-gray-900 text-white px-3 py-1.5 rounded-md text-sm hover:bg-gray-800 transition"
          >
            Save
          </button>

          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="border px-3 py-1.5 rounded-md text-sm hover:bg-gray-100 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  const categories = note.categories ?? [];

  return (
    <div className="border rounded-md p-4 flex flex-col gap-3">
      <div>
        <h3 className="font-medium">{note.title}</h3>
        <p className="text-sm text-gray-700 whitespace-pre-wrap">
          {note.content}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={async () => {
                  try {
                    await removeCategoryFromNote(note.id, c.name);
                    onUpdated?.();
                  } catch(error) {
                    console.error("NoteCard - Remove category failed.", error);
                    toast.error("Failed to remove category. Please try again.");
                  };
                }}
                className="border rounded-full px-2 py-0.5 text-xs hover:bg-gray-100 transition"
                title="Remove category"
              >
                {c.name} ×
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const trimmed = newCategory.trim();
            if (!trimmed) return;

            try {
              await addCategoryToNote(note.id, trimmed);
              setNewCategory("");
              onUpdated?.();
            } catch(error) {
              console.error("NoteCard - Add category failed.", error);
              toast.error("Failed to add category. Please try again.");
            };
          }}
          className="flex gap-2"
        >
          <input
            className="border rounded-md px-3 py-1.5 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-gray-300"
            placeholder="Add category (e.g. work)"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <button
            type="submit"
            className="border px-3 py-1.5 rounded-md text-sm hover:bg-gray-100 transition"
          >
            Add
          </button>
        </form>
      </div>

      <div className="flex gap-2 text-sm">
        <button
          onClick={() => setIsEditing(true)}
          className="border px-3 py-1.5 rounded-md hover:bg-gray-100 transition"
        >
          Edit
        </button>

        {onArchive && (
          <button
            onClick={() => onArchive(note.id)}
            className="border px-3 py-1.5 rounded-md hover:bg-gray-100 transition"
          >
            {note.archived ? "Unarchive" : "Archive"}
          </button>
        )}

        {onDelete && (
          <button
            onClick={() => onDelete(note.id)}
            className="border px-3 py-1.5 rounded-md hover:bg-red-50 transition"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}