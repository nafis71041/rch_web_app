// src/frontend/pages/pw_page/PWSearchPage.js

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./PWSearchPage.css";

const PWSearchPage = () => {
  const [motherId, setMotherId] = useState("");
  const [pregnancies, setPregnancies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!motherId.trim()) return;

    setLoading(true);
    setError("");
    setPregnancies([]);
    setSearched(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/pw/pregnancies/${motherId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPregnancies(res.data.pregnancies || []);
    } catch (err) {
      setError(err.response?.data?.message || "Could not fetch pregnancy data");
    } finally {
      setLoading(false);
    }
  };

  const hasActivePregnancy = pregnancies.some((p) => p.is_active);

  return (
    <div className="page--pw">
      {/* Navigation */}
      <nav className="nav--pw">
        <div className="nav-container">
          <a href="/" className="nav-logo">HealthTrack</a>
          <div className="nav-links">
            <button className="nav-btn" onClick={() => navigate("/")}>
              Home
            </button>
            <button className="nav-btn nav-btn--cancel" onClick={() => navigate(-1)}>
              Back
            </button>
          </div>
        </div>
      </nav>

      {/* Page Header */}
      <header className="pw-header">
        <h2 className="section-title">Pregnant Woman Search</h2>
        <p className="section-subtitle">
          Search an existing mother using her ID to view or register pregnancies.
        </p>
      </header>

      {/* Search Form */}
      <section className="pw-search">
        <div className="pw-search-container">
          <form className="pw-search-form" onSubmit={handleSearch}>
            <div className="form-group">
              <label htmlFor="motherId" className="form-label">
                Mother ID
              </label>
              <input
                type="text"
                id="motherId"
                name="motherId"
                className="form-input"
                placeholder="Enter valid Mother ID"
                value={motherId}
                onChange={(e) => setMotherId(e.target.value)}
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn" disabled={loading}>
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
          </form>

          {error && <div className="form-error">{error}</div>}
        </div>
      </section>

      {/* Search Results */}
      {searched && !loading && (
        <section className="pw-results">
          {pregnancies.length === 0 ? (
            <p className="no-results">No pregnancy records found for this mother.</p>
          ) : (
            <div className="pw-history">
              <h3 className="section-title">
                Pregnancy History — <span>{motherId}</span>
              </h3>

              <ul className="pw-list">
                {pregnancies.map((p) => (
                  <li
                    key={p.pregnancy_id}
                    className={`pw-item ${
                      p.is_active ? "pw-item--active" : "pw-item--closed"
                    }`}
                  >
                    <div className="pw-item-content">
                      <p className="pw-line">
                        <strong>Pregnancy ID:</strong> {p.pregnancy_id}
                      </p>
                      <p className="pw-line">
                        <strong>Status:</strong>{" "}
                        <span className="pw-status">
                          {p.is_active ? "Active" : "Closed"}
                        </span>
                      </p>
                      <p className="pw-line">
                        <strong>LMP:</strong> {p.lmp_date || "-"} |{" "}
                        <strong>EDD:</strong> {p.edd_date || "-"}
                      </p>
                    </div>

                    <div className="pw-item-actions">
                      <button
                        className="btn btn-secondary"
                        onClick={() =>
                          navigate(`/pw/${motherId}/pregnancy/${p.pregnancy_id}`)
                        }
                      >
                        View Details
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Register New Pregnancy */}
          <div className="pw-new">
            <button
              className="btn btn-success"
              onClick={() => navigate(`/pw/${motherId}/pregnancy/new`)}
              disabled={hasActivePregnancy}
            >
              Register New Pregnancy
            </button>

            {hasActivePregnancy && (
              <p className="pw-info">
                There is already an active pregnancy. Please close it before
                registering a new one.
              </p>
            )}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="footer--pw">
        <p>© 2025 HealthTrack | All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default PWSearchPage;
