import { useState } from "react";

function ExpenseForm({ onExpenseAdded }) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const parsedAmount = Number(amount);
    if (amount.trim() === "" || !Number.isFinite(parsedAmount)) {
      setError("Amount must be a number");
      return;
    }
    if (parsedAmount <= 0) {
      setError("Amount must be greater than zero");
      return;
    }
    if (!category.trim() || !description.trim() || !date.trim()) {
      setError("Category, description and date are required");
      return;
    }

    let response;
    try {
      response = await fetch("https://expense-tracker-53ma.onrender.com/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parsedAmount,
          category: category.trim(),
          description: description.trim(),
          date: date.trim(),
        }),
      });
    } catch {
      setError("Could not reach the server. Is the backend running?");
      return;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      setError(
        typeof errorData.detail === "string"
          ? errorData.detail
          : "Failed to add expense"
      );
      return;
    }

    setAmount("");
    setCategory("");
    setDescription("");
    setDate("");

    if (onExpenseAdded) {
      onExpenseAdded();
    }
  }

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <h2>Add Expense</h2>
      {error && <p className="error-text">{error}</p>}
      <div className="form-grid">
        <input
          className="input"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <input
          className="input"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <input
          className="input"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          className="input"
          placeholder="Date (DD/MM/YYYY)"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <button type="submit" className="btn btn-primary">
        Add Expense
      </button>
    </form>
  );
}

export default ExpenseForm;
