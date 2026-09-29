# Expense Tracker

A full-stack expense tracker built with a FastAPI + SQLite backend and a React (Vite) frontend.

## Features

- Add an expense (amount, category, description, date)
- View all expenses
- Filter expenses by category and/or date
- Look up a single expense by ID
- Delete an expense
- Spending summary: total spent, highest expense, totals by category

## Tech Stack

- Backend: FastAPI, SQLite (sqlite3), Pydantic
- Frontend: React 19, Vite
- Deployment: Render

## Project Structure

```text
Expense Tracker/
├── main.py              # FastAPI app and routes
├── database.py          # Creates the SQLite expenses table
├── pyproject.toml       # Backend dependencies (uv)
└── frontend/            # React + Vite app
    └── src/
        ├── App.jsx
        └── components/
```

## Getting Started

### Backend

Requires Python 3.14+ and uv.

```bash
uv sync
uv run uvicorn main:app --reload --port 8000
```

The API is served at:

- http://localhost:8000

Swagger API documentation:

- http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app is served at:

- http://localhost:5173

## API

| Method | Path | Description |
| --- | --- | --- |
| GET | /expenses/view | List all expenses |
| GET | /expenses/summary | Total, highest, and per-category totals |
| GET | /expenses/{id} | Get a single expense by ID |
| GET | /expenses?category=&date= | Filter expenses |
| POST | /expenses | Add an expense |
| DELETE | /expenses/{id} | Delete an expense |

Dates are expected in DD/MM/YYYY format.

## Deployment

The application is deployed on Render.

- Live frontend: https://expense-tracker-1-3td8.onrender.com/
- Backend API: https://expense-tracker-53ma.onrender.com/
- API documentation: https://expense-tracker-53ma.onrender.com/docs

## Notes

- CORS is configured for the local Vite development server and the deployed frontend.
- expenses.db is gitignored and is created automatically when the API starts.
- The deployed version currently uses SQLite. Since SQLite stores the database as a local file, data on the deployed service is not guaranteed to persist across service replacements or redeployments.
- The deployed application does not currently have authentication, so expenses are shared between users.
