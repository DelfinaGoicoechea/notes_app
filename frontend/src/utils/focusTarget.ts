import type { Note } from "../types/note";

type FocusTarget =
  | { kind: "note", id: number }
  | { kind: "form" }
  | { kind: "nav" };


export function getFocusTargetAfterRemoval(
  notes: Note[],
  removedId: number,
  showForm: boolean
): FocusTarget {
  const index = notes.findIndex((n) => n.id === removedId);
  const remaining = notes.filter((n) => n.id !== removedId);

  if(remaining.length > 0 && index !== -1) {  //when will it be -1? 
    return { kind: "note", id: remaining[Math.min(index, remaining.length - 1)].id };
  };

  if(showForm) return { kind: "form" };

  return { kind: "nav" };
};

function focusNote(id: number) {
  // Next note in 
  // -> View mode: focus Edit button.
  // -> Edit mode: focus title input

  const element = 
    document.getElementById(`edit-btn-${id}`) ??
    document.getElementById(`edit-note-title-${id}`);

  element?.focus();
};

export function focusTarget(target: FocusTarget) {
  requestAnimationFrame(() => {
    if(target.kind === "note") {
      focusNote(target.id);
    } else if(target.kind === "form") {
      document.getElementById("note-title")?.focus();
    } else {
      document.getElementById("nav-active-notes")?.focus();
    };
  });
};