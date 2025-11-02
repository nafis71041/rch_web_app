// src/frontend/pages/pw_page/PWSearchPage.js

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
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
        <div className="pw-search-container">
            {/* Header Section */}
            <header className="pw-search-header">
                <h2 className="page-title">Pregnant Woman Search</h2>
                <p className="page-subtitle">
                    Search for an existing mother using her ID to view or register pregnancies.
                </p>
            </header>

            {/* Search Form */}
            <section className="pw-search-form-section">
                <form className="pw-search-form" onSubmit={handleSearch}>
                    <div className="form-group">
                        <label htmlFor="motherId" className="form-label">
                            Enter Mother ID
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
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? "Searching..." : "Search"}
                        </button>
                    </div>
                </form>

                {error && <p className="error-message">{error}</p>}
            </section>

            {/* Results Section */}
            {searched && !loading && (
                <section className="pw-results-section">
                    {pregnancies.length === 0 ? (
                        <p className="no-results-text">
                            No pregnancy records found for this mother.
                        </p>
                    ) : (
                        <div className="pregnancy-history">
                            <h3 className="section-title">
                                Pregnancy History for Mother ID: <span>{motherId}</span>
                            </h3>

                            <ul className="pregnancy-list">
                                {pregnancies.map((p) => (
                                    <li
                                        key={p.pregnancy_id}
                                        className={`pregnancy-item ${p.is_active ? "active-pregnancy" : "closed-pregnancy"
                                            }`}
                                    >
                                        <div className="pregnancy-details">
                                            <p className="detail-line">
                                                <strong>Pregnancy ID:</strong> {p.pregnancy_id}
                                            </p>
                                            <p className="detail-line">
                                                <strong>Status:</strong>{" "}
                                                <span className="status-text">
                                                    {p.is_active ? "Active" : "Closed"}
                                                </span>
                                            </p>
                                            <p className="detail-line">
                                                <strong>LMP:</strong> {p.lmp_date || "-"} |{" "}
                                                <strong>EDD:</strong> {p.edd_date || "-"}
                                            </p>
                                        </div>

                                        <div className="pregnancy-actions">
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

                    {/* New Pregnancy Registration */}
                    <div className="new-pregnancy-container">
                        <button
                            className="btn btn-success"
                            onClick={() => navigate(`/pw/${motherId}/pregnancy/new`)}
                            disabled={hasActivePregnancy}
                        >
                            Register New Pregnancy
                        </button>

                        {hasActivePregnancy && (
                            <p className="info-text">
                                There is already an active pregnancy. Please close it before
                                registering a new one.
                            </p>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
};

export default PWSearchPage;
