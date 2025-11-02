// src/frontend/pages/pw_page/PWPage.js

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import PWRegistrationSection from "./PWRegistrationSection";
import DeliverySection from "./DeliverySection";
import InfantSection from "./InfantSection";

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
        // CASE 1: new pregnancy registration
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

        // CASE 2: existing pregnancy
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

        // decide which section to show initially
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

    console.log(updatedData);

    if (updatedData) setPregnancyData((prev) => ({ ...prev, ...updatedData }));

    // Auto-advance to next section
    if (sectionName === "registration") {
      // If backend returned a new pregnancy_id, update the URL
      if (updatedData?.pregnant_woman_id) {
        navigate(`/pw/${motherId}/pregnancy/${updatedData.pregnant_woman_id}`);
      } else {
        setActiveSection("delivery");
      }

    } else if (sectionName === "delivery") {
      setActiveSection("infant");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="pw-page">
      <h2>Pregnant Woman Details</h2>
      <p>
        Mother ID: <strong>{motherId}</strong>{" "}
        {pregnancyId !== "new" && <>| Pregnancy ID: <strong>{pregnancyId}</strong></>}
      </p>

      {/* Inline error display */}
      {error && <p className="inline-error">{error}</p>}

      {/* Section Navigation */}
      <div className="section-navigation">
        <button
          onClick={() => setActiveSection("registration")}
          disabled={activeSection === "loading"}
        >
          Registration
        </button>

        <button
          disabled={!completedSections.includes("registration")}
          onClick={() => setActiveSection("delivery")}
        >
          Delivery
        </button>

        <button
          disabled={!completedSections.includes("delivery")}
          onClick={() => setActiveSection("infant")}
        >
          Infant
        </button>
      </div>

      {/* Render only the selected section */}
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

    </div>
  );
};

export default PWPage;
