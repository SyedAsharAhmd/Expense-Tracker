from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field
from contextlib import asynccontextmanager
from datetime import datetime
import sqlite3
from database import init_db

DATE_FORMAT = "%d/%m/%Y"


class CreateExpenses(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    amount: float
    category: str = Field(min_length=1)
    description: str = Field(min_length=1)
    date: str


def normalize_date(value: str) -> str:
    try:
        return datetime.strptime(value.strip(), DATE_FORMAT).strftime(DATE_FORMAT)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Date format"
        )


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(lifespan=lifespan)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://expense-tracker-1-3td8.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/expenses/summary")
def expenses_summary():
    connection = sqlite3.connect("expenses.db")
    connection.row_factory = sqlite3.Row
    cursor = connection.cursor()

    cursor.execute("SELECT SUM(amount) AS total_expenses FROM expenses;")
    total = cursor.fetchone()

    cursor.execute("SELECT MAX(amount) AS highest_expense FROM expenses;")
    highest = cursor.fetchone()

    cursor.execute(
        "SELECT category, SUM(amount) AS total_spending "
        "FROM expenses GROUP BY category;"
    )
    category_total = cursor.fetchall()

    connection.close()

    return {
        "total": total,
        "highest": highest,
        "by_category": category_total
    }


@app.get("/expenses/view")
def view_expenses():
    connection = sqlite3.connect("expenses.db")
    connection.row_factory = sqlite3.Row
    cursor = connection.cursor()

    cursor.execute("SELECT * FROM expenses;")
    expenses = cursor.fetchall()

    connection.close()

    return expenses


@app.get("/expenses/{id}")
def get_expenses(id: int):
    connection = sqlite3.connect("expenses.db")
    connection.row_factory = sqlite3.Row
    cursor = connection.cursor()

    cursor.execute("SELECT * FROM expenses WHERE id = ?", (id,))
    expense = cursor.fetchone()

    connection.close()

    if expense is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="id not found"
        )

    return expense


@app.post("/expenses")
def post_expenses(expense_data: CreateExpenses):
    if expense_data.amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="expense must be greater than zero"
        )

    date = normalize_date(expense_data.date)

    connection = sqlite3.connect("expenses.db")
    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO expenses
        (amount, category, description, date)
        VALUES (?, ?, ?, ?)
        """,
        (
            expense_data.amount,
            expense_data.category,
            expense_data.description,
            date
        )
    )

    connection.commit()

    new_expense = {
        "amount": expense_data.amount,
        "category": expense_data.category,
        "description": expense_data.description,
        "date": date,
    }

    connection.close()

    return new_expense


@app.get("/expenses")
def filter_expenses(
    category: str | None = None,
    date: str | None = None
):
    if date:
        date = normalize_date(date)

    connection = sqlite3.connect("expenses.db")
    connection.row_factory = sqlite3.Row
    cursor = connection.cursor()

    query = """
        SELECT * FROM expenses
        WHERE (? IS NULL OR LOWER(category) = LOWER(?))
        AND (? IS NULL OR date = ?)
    """

    cursor.execute(
        query,
        (category, category, date, date)
    )

    filtered_expenses = cursor.fetchall()

    connection.close()

    return filtered_expenses


@app.delete("/expenses/{id}")
def delete_expenses(id: int):
    connection = sqlite3.connect("expenses.db")
    connection.row_factory = sqlite3.Row
    cursor = connection.cursor()

    cursor.execute(
        "DELETE FROM expenses WHERE id = ?",
        (id,)
    )

    connection.commit()

    if cursor.rowcount == 0:
        connection.close()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="id not found"
        )

    connection.close()

    return {"message": "Expense deleted successfully"}