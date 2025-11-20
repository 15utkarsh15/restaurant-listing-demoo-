# Swiggy-style Restaurant Listing (Web)

This is a small full-stack demo to satisfy the assignment requirements:
- Frontend: React + TypeScript (Vite)
- Backend: Node.js + Express + TypeScript
- Database: sample in-memory dataset (optional MongoDB wiring explained)

What it implements:
- Restaurant listing page with live search and filtering (cuisine, min rating)
- Simple REST API: GET /api/restaurants

Folders:
- `frontend/` — React + TypeScript app (Vite)
- `backend/` — Express API (TypeScript)

Quick setup (Windows PowerShell):

1) Backend

cd C:\\Users\\singh\\OneDrive\\Desktop\\utkarsh\\swiggy-web\\backend
npm install
npm run dev

This starts the backend on http://localhost:4000

2) Frontend

cd C:\\Users\\singh\\OneDrive\\Desktop\\utkarsh\\swiggy-web\\frontend
npm install
npm run dev

This starts the frontend on http://localhost:5173 (Vite default)

Notes:
- The backend serves sample data from `backend/src/data/restaurants.json`. If you want to connect MongoDB, see notes in `backend/src/index.ts`.


- Ensure both backend and frontend are running. Frontend: Vite (default http://localhost:5173). Backend: (http://localhost:4000).


