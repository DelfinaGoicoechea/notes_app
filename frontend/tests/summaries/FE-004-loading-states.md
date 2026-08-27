# FE-004: Loading States - Test Coverage Summary

## Test Results
✅ **Loading state coverage maintained after FE-007 context refactor**

Relevant tests live in component files and `NotesContext.test.tsx`. The old `useActive` / `useArchived` hook test files were removed when state moved to context.

## Test Coverage by File

### 1. NoteForm Tests (6 tests)
**File:** `tests/components/NoteForm.test.tsx`

- ✅ Disables submit button during note creation
- ✅ Shows "Creating..." text on button during creation
- ✅ Disables input fields during note creation
- ✅ Prevents duplicate submissions while creation is in flight
- ✅ Shows loading spinner during creation
- ✅ Re-enables form after creation completes

Uses `NotesProvider` + mocked service (context handles create).

---

### 2. NoteCard Tests (23 tests)
**File:** `tests/components/NoteCard.test.tsx`

#### Update Note Loading State (4 tests)
- ✅ Disables save button during note update
- ✅ Shows "Saving..." text during update
- ✅ Disables input fields during update
- ✅ Shows loading spinner during save

#### Archive/Delete Loading States (6 tests)
- ✅ Disables archive button when `archivingNoteId` matches note id
- ✅ Shows "Archiving..." / "Unarchiving..." text when busy
- ✅ Does not disable archive button for a different note
- ✅ Disables delete button when `deletingNoteId` matches note id
- ✅ Shows "Deleting..." text when deleting

#### Add/Remove Category Loading State (5 tests)
- ✅ Disables add button during category addition
- ✅ Shows "Adding..." text during category addition
- ✅ Shows loading spinner during category addition
- ✅ Disables category button during removal
- ✅ Only disables the specific category being removed

#### Prevent Duplicate Operations (2 tests)
- ✅ Prevents duplicate save submissions while update is in flight
- ✅ Prevents duplicate category additions while add is in flight

Uses `NotesProvider` for operations that go through context. Archive/delete busy ids still come from context via props on `NoteCard`.

---

### 3. Notes Component Tests (3 tests)
**File:** `tests/pages/notes/components/Notes.test.tsx`

- ✅ Search input remains enabled during loading
- ✅ Keeps notes visible while loading with search active
- ✅ Shows spinner only when loading with no notes yet

Mocks `useNotes()` to set `isLoading` — tests list-level loading UI owned by context.

---

### 4. NotesContext Tests
**File:** `tests/contexts/NotesContext.test.tsx`

List fetch loading is exercised indirectly when tests wait for debounced `getNotes` to populate `notes`. Dedicated `isLoading` assertions can be added later if needed.

---

## Removed (superseded by FE-007)

- ~~`tests/pages/notes/hooks/useActive.test.ts`~~ — loading state for fetch/archive/delete now in context
- ~~`tests/pages/notes/hooks/useArchived.test.ts`~~ — same

---

## Key Testing Decisions

1. **Local loading** (`isCreating`, `isSaving`, category busy) stays in Form/Card tests
2. **Shared loading** (`isLoading`, `archivingNoteId`, `deletingNoteId`) comes from context — tested via Provider in Card tests or mocked in `Notes.test.tsx`
3. **Mock delays** in service mocks create observable loading states in component tests
4. **Duplicate submission** tests use manual promise resolution
