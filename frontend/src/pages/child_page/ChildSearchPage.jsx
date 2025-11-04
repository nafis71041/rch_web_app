import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./child.css";

const ChildSearchPage = () => {
  const [searchType, setSearchType] = useState("child");
  const [searchId, setSearchId] = useState("");
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setLoading(true);
    setError("");
    setChildren([]);
    setSearched(true);

    try {
      const token = localStorage.getItem("token");
      const endpoint =
        searchType === "child"
          ? `${process.env.REACT_APP_BACKEND_URL}/api/child/by-id/${searchId}`
          : `${process.env.REACT_APP_BACKEND_URL}/api/child/by-mother/${searchId}`;

      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let data = [];

      if (searchType === "child" && res.data) {
        data = [res.data];
      } else if (searchType === "mother" && Array.isArray(res.data.infants)) {
        data = res.data.infants;
      }

      setChildren(data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not fetch child data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page page--child-search">
      <nav className="nav nav--child-search">
        <div className="nav-container">
          <a href="/" className="nav-logo">
            Immunization
          </a>
          <div className="nav-links">
            <button
              className="nav-btn active"
              onClick={() => navigate("/child/search")}
            >
              Search
            </button>
            <button className="nav-btn" onClick={() => navigate("/")}>
              Home
            </button>
          </div>
        </div>
      </nav>

      <main className="section section--child-search">
        <header className="section-header">
          <h2 className="section-title">Child Search</h2>
          <p className="section-subtitle">
            Search by Child ID or Mother ID (from Eligible Couple table) to view
            or update child records.
          </p>
        </header>

        <section className="search-form-section">
          <form className="search-form" onSubmit={handleSearch}>
            <div className="form-group">
              <label className="form-label">Search By</label>
              <select
                value={searchType}
                onChange={(e) => {
                  setSearchType(e.target.value);
                  setSearchId("");
                  setChildren([]);
                  setSearched(false);
                }}
                className="form-input"
                disabled={loading}
              >
                <option value="child">Child ID</option>
                <option value="mother">Mother ID</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="searchId" className="form-label">
                {searchType === "child"
                  ? "Enter Child (Infant) ID"
                  : "Enter Mother ID"}
              </label>
              <input
                type="text"
                id="searchId"
                name="searchId"
                className="form-input"
                placeholder={
                  searchType === "child"
                    ? "Enter valid Infant ID"
                    : "Enter valid Mother ID"
                }
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
          </form>

          {error && <p className="form-error">{error}</p>}
        </section>

        {searched && !loading && (
          <section className="results-section">
            {children.length === 0 ? (
              <p className="no-results">No child (infant) records found.</p>
            ) : (
              <div className="results-container">
                <h3 className="section-subtitle results-title">
                  {searchType === "child"
                    ? `Infant Details for ID: ${searchId}`
                    : `Infants linked to Mother ID: ${searchId}`}
                </h3>

                <ul className="results-list">
                  {children.map((c) => (
                    <li key={c.infant_id} className="result-card">
                      <div className="result-details">
                        <p>
                          <strong>Infant ID:</strong> {c.infant_id}
                        </p>
                        <p>
                          <strong>Pregnant Woman ID:</strong>{" "}
                          {c.pregnant_woman_id}
                        </p>
                        <p>
                          <strong>Sex:</strong> {c.sex || "-"}
                        </p>
                        <p>
                          <strong>Weight at Birth:</strong>{" "}
                          {c.weight_at_birth || "-"}
                        </p>
                        <p>
                          <strong>Head Circumference:</strong>{" "}
                          {c.head_circumference || "-"}
                        </p>
                        <p>
                          <strong>Cried After Birth:</strong>{" "}
                          {c.cried_after_birth ? "Yes" : "No"}
                        </p>
                        <p>
                          <strong>Yellow Milk Given:</strong>{" "}
                          {c.yellow_milk_given ? "Yes" : "No"}
                        </p>
                        {c.yellow_milk_not_given_reason && (
                          <p>
                            <strong>Reason (if not given):</strong>{" "}
                            {c.yellow_milk_not_given_reason}
                          </p>
                        )}
                        <p>
                          <strong>Created At:</strong>{" "}
                          {new Date(c.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="result-actions">
                        <button
                          className="btn btn-secondary"
                          onClick={() => navigate(`/child/update/${c.infant_id}`)}
                        >
                          Update Details
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="footer footer--child-search">
        <p>© 2025 Child Immunization Tracker</p>
      </footer>
    </div>
  );
};

export default ChildSearchPage;
