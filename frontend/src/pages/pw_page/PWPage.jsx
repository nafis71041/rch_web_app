// src/frontend/pages/pw_page/PWPage.js

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import PWRegistrationSection from "./PWRegistrationSection";
import DeliverySection from "./DeliverySection";
import InfantSection from "./InfantSection";
import "./PWPage.css";


const PWPage = () => {
  const { motherId, pregnancyId } = useParams();
  const [activeSection, setActiveSection] = useState("loading");
  const [pregnancyData, setPregnancyData] = useState(null);
  const [completedSections, setCompletedSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    const initPage = async () => {
      try {
        if (pregnancyId === "new") {
          const res = await axios.get(
            `${process.env.REACT_APP_BACKEND_URL}/api/pw/pregnancies/${motherId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const pregnancies = res.data.pregnancies || [];
          const activePregnancy = pregnancies.find((p) => p.is_active);

          if (activePregnancy) {
            alert("Active pregnancy already exists. Redirecting...");
            navigate(`/pw/${motherId}/pregnancy/${activePregnancy.pregnancy_id}`);
            return;
          }

          setActiveSection("registration");
          setLoading(false);
          return;
        }

        const res = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/pw/pregnancy/${pregnancyId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = res.data;
        setPregnancyData(data);

        const completed = [];
        if (data.registration_completed) completed.push("registration");
        if (data.delivery_completed) completed.push("delivery");
        if (data.infant_completed) completed.push("infant");
        setCompletedSections(completed);

        if (!data.registration_completed) setActiveSection("registration");
        else if (!data.delivery_completed) setActiveSection("delivery");
        else if (!data.infant_completed) setActiveSection("infant");
        else setActiveSection("registration");
      } catch (err) {
        setError(err.response?.data?.message || "Could not load pregnancy data");
      } finally {
        setLoading(false);
      }
    };

    initPage();
  }, [motherId, pregnancyId, navigate]);

  const handleSectionComplete = (sectionName, updatedData = null) => {
    setCompletedSections((prev) =>
      prev.includes(sectionName) ? prev : [...prev, sectionName]
    );

    if (updatedData) setPregnancyData((prev) => ({ ...prev, ...updatedData }));

    if (sectionName === "registration") {
      if (updatedData?.pregnant_woman_id) {
        navigate(`/pw/${motherId}/pregnancy/${updatedData.pregnant_woman_id}`);
      } else {
        setActiveSection("delivery");
      }
    } else if (sectionName === "delivery") {
      setActiveSection("infant");
    }

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

  if (loading) return <p className="page-loading">Loading...</p>;

  return (
    <div className="page--pw">
      <nav className="nav--pw">
        <div className="nav-container">
          <a href="/" className="nav-logo">PW Module</a>
          <div className="nav-links">
            <button
              className={`nav-btn ${activeSection === "registration" ? "active" : ""}`}
              onClick={() => setActiveSection("registration")}
              disabled={activeSection === "loading"}
            >
              Registration
            </button>
            <button
              className={`nav-btn ${activeSection === "delivery" ? "active" : ""}`}
              onClick={() => setActiveSection("delivery")}
              disabled={!completedSections.includes("registration")}
            >
              Delivery
            </button>
            <button
              className={`nav-btn ${activeSection === "infant" ? "active" : ""}`}
              onClick={() => setActiveSection("infant")}
              disabled={!completedSections.includes("delivery")}
            >
              Infant
            </button>
            {/* <button
              className={`nav-btn ${activeSection === "infant" ? "active" : ""}`}
              onClick={() => setActiveSection("infant")}
              disabled={!completedSections.includes("delivery")}
            >
              Cancel
            </button> */}
            <button className="nav-btn nav-btn--cancel" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      </nav>

      <main className="section--pw">
        <header className="section-header">
          <h2 className="section-title">Pregnant Woman Details</h2>
          <p className="section-subtitle">
            Mother ID: <strong>{motherId}</strong>{" "}
            {pregnancyId !== "new" && (
              <>
                | Pregnancy ID: <strong>{pregnancyId}</strong>
              </>
            )}
          </p>
        </header>

        {error && <p className="form-error">{error}</p>}

        <section>
          {activeSection === "registration" && (
            <PWRegistrationSection
              motherId={motherId}
              pregnancyId={pregnancyId}
              data={pregnancyData?.registration_data || {}}
              readOnly={completedSections.includes("registration") && pregnancyId !== "new"}
              onComplete={(data) => handleSectionComplete("registration", data)}
              onError={(msg) => setError(msg)}
            />
          )}

          {activeSection === "delivery" && (
            <DeliverySection
              pregnancyId={pregnancyId}
              data={pregnancyData?.delivery_data || {}}
              readOnly={completedSections.includes("delivery")}
              onComplete={(data) => handleSectionComplete("delivery", data)}
              onError={(msg) => setError(msg)}
            />
          )}

          {activeSection === "infant" && (
            <InfantSection
              pregnancyId={pregnancyId}
              data={pregnancyData?.infant_data || {}}
              readOnly={completedSections.includes("infant")}
              onComplete={(data) => handleSectionComplete("infant", data)}
              onError={(msg) => setError(msg)}
            />
          )}
        </section>
      </main>

      <footer className="footer--pw">
        <p>© 2025 Matrima</p>
      </footer>
    </div>
  );
};

export default PWPage;
