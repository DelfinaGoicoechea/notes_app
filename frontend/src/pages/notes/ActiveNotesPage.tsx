import { Notes } from "./components/Notes"
import { NotesProvider } from "../../contexts/NotesContext"

export const ActiveNotesPage = () => {

  return (
    <NotesProvider view="active">
      <Notes 
        title="Active Notes" 
        showForm={true}
      />
    </NotesProvider>
  )
}
