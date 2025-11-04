import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import EC1Section from "./EC1Section";
import EC2Section from "./EC2Section";
import "./ecPage.css";

const ECPage = () => {
    const { mother_id: paramMotherId } = useParams();
    const [activeSection, setActiveSection] = useState("EC1");
    const [ec1Completed, setEc1Completed] = useState(false);
    const [motherId, setMotherId] = useState(null);
    const [searchInput, setSearchInput] = useState("");
    const [searchError, setSearchError] = useState("");

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // If navigated with an error message, show it
        if (location.state?.searchErr) {
            setSearchError(location.state.searchErr);
            navigate(location.pathname, { replace: true });
        }
    }, [location, navigate]);

    useEffect(() => {
        if (searchError) {
            const timer = setTimeout(() => setSearchError(""), 4000);
            return () => clearTimeout(timer);
        }
    }, [searchError]);


    useEffect(() => {
        // Determine which section to show based on route
        if (!paramMotherId) {
            setActiveSection("EC1");
            setEc1Completed(false);
            setMotherId(null);
        } else if (paramMotherId === "search") {
            setActiveSection("EC Search");
            setEc1Completed(false);
            setMotherId(null);
        } else if (!isNaN(paramMotherId)) {
            setMotherId(paramMotherId);
            setEc1Completed(true);
            setActiveSection("EC2");
        }
    }, [paramMotherId]);

    const handleEC1Complete = (id) => {
        setEc1Completed(true);
        setMotherId(id);
        setActiveSection("EC2");
    };

    const handleCancel = () => {
        if (
            window.confirm(
                "Are you sure you want to cancel and return to the dashboard? Unsaved data will be lost."
            )
        ) {
            navigate("/dashboard");
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setSearchError("");
        if (!searchInput.trim()) {
            setSearchError("Please enter a valid Mother ID.");
            return;
        }
        navigate(`/ec-registration/${searchInput}`);
    };



    return (
        <div className="page--ec">
            <nav className="nav--ec">
                <div className="nav-container">
                    <a href="/" className="nav-logo">EC Module</a>
                    <div className="nav-links">
                        <button
                            className={`nav-btn ${activeSection === "EC Search" ? "active" : ""}`}
                            onClick={() => navigate("/ec-registration/search")}
                        >
                            EC Search
                        </button>
                        <button
                            className={`nav-btn ${activeSection === "EC1" ? "active" : ""}`}
                            onClick={() => navigate("/ec-registration")}
                            disabled={!!paramMotherId && paramMotherId !== "search"}
                        >
                            EC1 Section
                        </button>
                        <button
                            className={`nav-btn ${activeSection === "EC2" ? "active" : ""}`}
                            disabled={!ec1Completed}
                            onClick={() =>
                                motherId && navigate(`/ec-registration/${motherId}`)
                            }
                        >
                            EC2 Section
                        </button>
                        <button className="nav-btn nav-btn--cancel" onClick={handleCancel}>
                            Cancel
                        </button>
                    </div>
                </div>
            </nav>

            <main className="section--ec">
                {activeSection === "EC Search" && (
                    <div className="ec-search">
                        <div className="ec-search-container">
                            <h3 className="section-title">Go to Eligible Couple Record</h3>
                            <form onSubmit={handleSearch} className="ec-search-form">
                                <div className="form-group">
                                    <label htmlFor="motherId" className="form-label">Mother ID</label>
                                    <input
                                        id="motherId"
                                        type="text"
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        placeholder="Enter Mother ID"
                                        className="form-input"
                                    />
                                    {searchError && <div className="form-error">{searchError}</div>}
                                </div>
                                <button type="submit" className="btn">Go</button>
                            </form>
                        </div>
                    </div>
                )}

                {activeSection === "EC1" && !paramMotherId && (
                    <EC1Section
                        onComplete={handleEC1Complete}
                        ec1Completed={ec1Completed}
                        motherId={motherId}
                    />
                )}

                {activeSection === "EC2" && ec1Completed && (
                    <EC2Section motherId={motherId} />
                )}
            </main>

            <footer className="footer--ec">
                <p>© 2025 Matrima</p>
            </footer>
        </div>
    );

};

export default ECPage;
