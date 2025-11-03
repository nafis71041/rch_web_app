import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ChildSearchPage = () => {
    const [searchType, setSearchType] = useState("child"); // "child" or "mother"
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
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            let data = [];

            if (searchType === "child" && res.data) {
                data = [res.data]; // single infant object
            } else if (searchType === "mother" && Array.isArray(res.data.infants)) {
                data = res.data.infants; // list of infants for a mother
            }

            setChildren(data);
        } catch (err) {
            setError(err.response?.data?.message || "Could not fetch child data");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="child-search-container">
            {/* Header Section */}
            <header className="child-search-header">
                <h2 className="page-title">Child Search</h2>
                <p className="page-subtitle">
                    Search by Child ID or Mother ID (from Eligible Couple table) to view or update child records.
                </p>
            </header>

            {/* Search Form */}
            <section className="child-search-form-section">
                <form className="child-search-form" onSubmit={handleSearch}>
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
                            {searchType === "child" ? "Enter Child (Infant) ID" : "Enter Mother ID"}
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

                {error && <p className="error-message">{error}</p>}
            </section>

            {/* Results Section */}
            {searched && !loading && (
                <section className="child-results-section">
                    {children.length === 0 ? (
                        <p className="no-results-text">
                            No child (infant) records found for this ID.
                        </p>
                    ) : (
                        <div className="child-results">
                            <h3 className="section-title">
                                {searchType === "child"
                                    ? `Infant Details for ID: ${searchId}`
                                    : `Infants linked to Mother ID: ${searchId}`}
                            </h3>

                            <ul className="child-list">
                                {children.map((c) => (
                                    <li key={c.infant_id} className="child-item">
                                        <div className="child-details">
                                            <p className="detail-line">
                                                <strong>Infant ID:</strong> {c.infant_id}
                                            </p>
                                            <p className="detail-line">
                                                <strong>Pregnant Woman ID:</strong> {c.pregnant_woman_id}
                                            </p>
                                            <p className="detail-line">
                                                <strong>Sex:</strong> {c.sex || "-"}
                                            </p>
                                            <p className="detail-line">
                                                <strong>Weight at Birth:</strong> {c.weight_at_birth || "-"}
                                            </p>
                                            <p className="detail-line">
                                                <strong>Head Circumference:</strong> {c.head_circumference || "-"}
                                            </p>
                                            <p className="detail-line">
                                                <strong>Cried After Birth:</strong>{" "}
                                                {c.cried_after_birth ? "Yes" : "No"}
                                            </p>
                                            <p className="detail-line">
                                                <strong>Yellow Milk Given:</strong>{" "}
                                                {c.yellow_milk_given ? "Yes" : "No"}
                                            </p>
                                            {c.yellow_milk_not_given_reason && (
                                                <p className="detail-line">
                                                    <strong>Reason (if not given):</strong>{" "}
                                                    {c.yellow_milk_not_given_reason}
                                                </p>
                                            )}
                                            <p className="detail-line">
                                                <strong>Created At:</strong>{" "}
                                                {new Date(c.created_at).toLocaleDateString()}
                                            </p>
                                        </div>

                                        <div className="child-actions">
                                            <button
                                                className="btn btn-secondary"
                                                onClick={() =>
                                                    navigate(`/child/update/${c.infant_id}`)
                                                }
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
        </div>
    );

};

export default ChildSearchPage;
