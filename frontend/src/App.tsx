import AppRouter from "./routes/AppRouter";
import './styles.css'
import { ToastBar, Toaster, toast } from "react-hot-toast";

function App() {
  return (
    <>
      <AppRouter />
      <Toaster 
        position="top-center"
        toastOptions={{
          error: {
            duration: 5000,
            className: "bg-red-600 text-white px-4 py-3 rounded-md border border-red-700 text-sm font-medium shadow-md flex items-center gap-2",
            iconTheme: {
              primary: '#dc2626',
              secondary: 'white',
            },
          },
        }}
      >
        {(t) => (
          <ToastBar toast={t}>
            {({ icon, message }) => (
              <>
                {icon}
                {message}
                {t.type !== 'loading' && (
                  <button onClick={() => toast.dismiss(t.id)}>×</button>
                )}
              </>
            )}
          </ToastBar>
        )}
      </Toaster>
    </>
  );
}

export default App;