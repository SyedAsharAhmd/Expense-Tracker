import ExpenseForm from "./components/ExpenseForm";
import ViewExpense from "./components/ViewExpense";
import Summary from "./components/Summary";
import FilterExpense from "./components/FilterExpense";
import GetExpenseById from "./components/GetExpenseById";
import { useState } from "react";
import "./App.css";

function App() {
  const [expenses, setExpenses] = useState([]);
  const [filterMessage, setFilterMessage] = useState("");
  const [error, setError] = useState("");
  const [summaryVersion, setSummaryVersion] = useState(0);

  function refreshSummary() {
    setSummaryVersion((v) => v + 1);
  }

  async function fetchExpenses() {
    setFilterMessage("");
    setError("");
    try {
      const response = await fetch("https://expense-tracker-53ma.onrender.com/expenses/view");
      if (!response.ok) {
        setError("Failed to load expenses");
        return;
      }
      const data = await response.json();
      setExpenses(data);
    } catch {
      setError("Could not reach the server. Is the backend running?");
    }
  }

  async function fetchFilteredExpenses(category, date) {
    setFilterMessage("");
    setError("");
    const params = new URLSearchParams();
    if (category.trim()) params.set("category", category.trim());
    if (date.trim()) params.set("date", date.trim());

    try {
      const response = await fetch(
        `https://expense-tracker-53ma.onrender.com/expenses?${params.toString()}`
      );
      if (!response.ok) {
        setError("Failed to filter expenses");
        return;
      }
      const data = await response.json();

      setExpenses(data);
      setFilterMessage(data.length === 0 ? "No expenses match that filter." : "");
    } catch {
      setError("Could not reach the server. Is the backend running?");
    }
  }

  async function deleteExpense(id) {
    setError("");
    try {
      const response = await fetch(`https://expense-tracker-53ma.onrender.com/expenses/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setError("Failed to delete expense");
        return;
      }

      setExpenses((prev) => prev.filter((expense) => expense.id !== id));
      refreshSummary();
    } catch {
      setError("Could not reach the server. Is the backend running?");
    }
  }

  function handleExpenseAdded() {
    fetchExpenses();
    refreshSummary();
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Expense Tracker</h1>
      </header>

      <Summary refreshKey={summaryVersion} />

      <section className="toolbar">
        <ViewExpense fetchExpenses={fetchExpenses} />
        <FilterExpense onFilter={fetchFilteredExpenses} />
        <GetExpenseById />
      </section>

      <section className="expenses">
        <h2>Expenses</h2>

        {error && <p className="error-text">{error}</p>}
        {filterMessage && <p className="empty-state">{filterMessage}</p>}

        {expenses.length === 0 && !filterMessage ? (
          <p className="empty-state">
            No expenses to show yet. Click "Get Expenses" above, or add one below.
          </p>
        ) : (
          <div className="table-wrap">
            <table className="expense-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th className="amount-col">Amount</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{expense.id}</td>
                    <td className="amount-col">{expense.amount}</td>
                    <td>
                      <span className="badge">{expense.category}</span>
                    </td>
                    <td>{expense.description}</td>
                    <td>{expense.date}</td>
                    <td>
                      <button
                        className="btn-danger"
                        onClick={() => deleteExpense(expense.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ExpenseForm onExpenseAdded={handleExpenseAdded} />
    </div>
  );
}
export default App;
