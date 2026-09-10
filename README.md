# Notes Management App

A full-stack Single Page Application for creating, organizing, and managing notes. Built with React and TypeScript on the frontend and a NestJS REST API with SQLite on the backend.

The project was originally developed as a full-stack technical challenge and later refined with additional improvements focused on accessibility, user experience, and code quality.

## Features
- Create, edit, and delete notes
- Archive and unarchive notes
- View active and archived notes separately
- Add and remove categories from notes
- Filter notes by category
- Search notes by title or content
- Form validation and user feedback
- Keyboard-friendly interactions and focus management
- Screen reader announcements for relevant user actions

## Tech Stack
### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend
- Node.js
- NestJS
- TypeORM
- SQLite
- REST API

### Testing & Tools
- Vitest
- React Testing Library
- Git

## Accessibility
Accessibility was considered throughout the frontend implementation, including:
- Keyboard navigation and interaction
- Focus management after editing, deleting, archiving, and unarchiving notes
- Accessible form labels and validation feedback
- ARIA live regions for screen reader announcements
- Appropriate ARIA attributes and semantic markup

## Project Structure
```text
notes_app/ 
├── backend/       NestJS REST API and database layer 
├── frontend/      React + TypeScript SPA 
├── CHALLENGE.md   Original technical challenge requirements 
├── run.sh         One-command setup and startup script 
└── README.md
```

## Getting Started
### Requirements

Tested with:
- macOS / Linux
- Node.js `v22.21.1`
- npm `10.9.4`

### Run the application
From the repository root:

`./run.sh`

The script:
- Installs frontend and backend dependencies
- Creates the required `.env` files if they are missing
- Starts both the backend and frontend
- Automatically selects available ports if the defaults are already in use
- Opens the frontend in the browser when possible

### Default URLs
- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`

If either port is unavailable, `run.sh` selects another available port and prints the final URLs in the terminal.

### Stop the application

Press `Ctrl+C` in the terminal running `./run.sh`. This stops the frontend and the backend process started by the script.

## Database

The application uses SQLite for persistence.

The database is created automatically when the backend starts, using TypeORM schema synchronization.

## Original Challenge

The original requirements for the technical challenge are available in [`CHALLENGE.md`](./CHALLENGE.md).
