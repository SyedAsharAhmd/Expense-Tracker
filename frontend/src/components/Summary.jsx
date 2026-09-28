import { useState, useEffect } from "react";

function Summary({ refreshKey }) {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSummary() {
      try {
        const response = await fetch("https://expense-tracker-53ma.onrender.com/expenses/summary");
        if (!response.ok) {
          setError("Failed to load summary");
          return;
        }
        const data = await response.json();
        setSummary(data);
        setError("");
      } catch {
        setError("Could not reach the server. Is the backend running?");
      }
    }
    fetchSummary();
  }, [refreshKey]);

  if (!summary) {
    return (
      <section className="summary">
        {error ? (
          <p className="error-text">{error}</p>
        ) : (
          <p className="empty-state">Loading summary...</p>
        )}
      </section>
    );
  }

  return (
    <section className="summary">
      <h2>Summary</h2>
      {error && <p className="error-text">{error}</p>}
      <div className="summary-stats">
        <div className="stat">
          <span className="stat-label">Total spent</span>
          <span className="stat-value">{summary.total?.total_expenses ?? 0}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Highest expense</span>
          <span className="stat-value">{summary.highest?.highest_expense ?? 0}</span>
        </div>
      </div>
      {summary.by_category?.length > 0 && (
        <ul className="summary-categories">
          {summary.by_category.map((item) => (
            <li key={item.category} className="category-stat">
              <span className="category-stat-name">{item.category}</span>
              <span className="category-stat-amount">{item.total_spending}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default Summary;
