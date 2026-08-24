# FE-005: Search Functionality - Test Coverage Summary

## Test Results
✅ **Search coverage maintained after FE-007 context refactor**

Search/filter behavior is tested at the service layer, in `NotesContext`, and in the `Notes` UI component.

## Test Coverage by File

### 1. Service Layer Tests (12 tests)
**File:** `tests/services/notes.service.test.ts`

#### getActiveNotes / getArchivedNotes
- ✅ Sends request without query params when no filters provided
- ✅ Sends search and/or category parameters when provided
- ✅ Returns notes data from API response
- ✅ Handles empty/whitespace search as undefined
- ✅ Allows search with special characters and multiple words

---

### 2. NotesContext Tests (2 search-related tests)
**File:** `tests/contexts/NotesContext.test.tsx`

- ✅ Loads active vs archived notes based on `view`
- ✅ Sends trimmed search and category to the API after debounce

Debouncing (300ms) is covered by waiting for the second fetch after filter changes.

---

### 3. Notes Component Tests (35 tests)
**File:** `tests/pages/notes/components/Notes.test.tsx`

Mocks `useNotes()` to test search UI without full integration:

#### Search Input UI (6 tests)
- ✅ Renders search input above category filter
- ✅ Correct placeholder (`e.g. shopping`)
- ✅ Updates search via `setSearch`
- ✅ Displays current search value
- ✅ Controlled input with string value

#### Search Clear Button (3 tests)
- ✅ Clear search button present
- ✅ Clears only search, not category
- ✅ Works when search has value

#### Result Count Display (7 tests)
- ✅ Shows count when search/category/both active
- ✅ Hides count when no filters
- ✅ Singular/plural wording
- ✅ Hides count when no results (shows empty state instead)

#### Empty State Messages (7 tests)
- ✅ Search-, category-, and combined-filter empty states
- ✅ Default and archived empty states
- ✅ Whitespace-only filters treated as empty

#### Search + Category Interaction (3 tests)
- ✅ Both filters can have values
- ✅ Clearing one filter does not clear the other

#### Loading + Display + Accessibility (9 tests)
- ✅ Search enabled during loading; spinner only on first load
- ✅ Filtered notes display; cards stay interactive
- ✅ Accessible labels for inputs and clear buttons

---

## Removed (superseded by FE-007)

- ~~`tests/pages/notes/hooks/useActive.test.ts`~~ — search state/debounce moved to `NotesContext`
- ~~`tests/pages/notes/hooks/useArchived.test.ts`~~ — same

---

## Acceptance Criteria Coverage

| Acceptance Criteria | Status | Test Location |
|---------------------|--------|---------------|
| Search input above category filter | ✅ Tested | Notes.test.tsx |
| Search matches title/content (case-insensitive) | ✅ Backend | Integration verified |
| Search + category AND logic | ✅ Tested | notes.service.test.ts, NotesContext.test.tsx |
| 300ms debouncing | ✅ Tested | NotesContext.test.tsx |
| Clear button clears only search | ✅ Tested | Notes.test.tsx |
| Result count | ✅ Tested | Notes.test.tsx |
| Contextual empty states | ✅ Tested | Notes.test.tsx |
| Search input discoverable | ✅ Tested | Notes.test.tsx |

---

## Key Testing Decisions

1. **Service tests** verify API params (trimming, combined filters)
2. **Context tests** verify debounced fetch calls the right endpoint with trimmed values
3. **Notes component tests** mock `useNotes` to isolate UI behavior
4. **Placeholder/label updates** reflected current UI (`Search notes`, `e.g. shopping`)
