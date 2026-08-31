import { Notes } from "./components/Notes"
import { NotesProvider } from "../../contexts/NotesContext"

export const ArchivedNotesPage = () => {

  return (
    <NotesProvider view="archived">
      <Notes 
        title="Archived Notes" 
        showForm={false}
      />
    </NotesProvider>
  )
}
