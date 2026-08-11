import AppRouter from "./routes/AppRouter";
import './styles.css'
import { ToastBar, Toaster, toast } from "react-hot-toast";
import { AnnounceProvider } from "./a11y/AnnounceProvider";

function App() {
  return (
    <>
      <AnnounceProvider>
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
                <div aria-hidden="true">
                  {icon}
                  {message}
                  {t.type !== 'loading' && (
                    <button 
                      type="button"
                      tabIndex={-1}
                      onClick={() => toast.dismiss(t.id)}
                    >
                      ×
                    </button>
                  )}
                </div>
              )}
            </ToastBar>
          )}
        </Toaster>
      </AnnounceProvider>
    </>
  );
}

export default App;