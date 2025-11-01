import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const EC2Section = ({ motherId }) => {
  const [form, setForm] = useState({
    visit_date: new Date().toISOString().split("T")[0],
    family_planning_method: false,
    method_used: "",
    period_missed: false,
    pregnancy: false,
  });

  const [lastVisit, setLastVisit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token"); // assumed JWT stored on login

  const navigate = useNavigate();

  // Fetch last visit details
  useEffect(() => {
    if (!motherId) return;
    const fetchLastVisit = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/ec/last-visit/${motherId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLastVisit(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load last visit data.");
        setLastVisit(null);
      }
    };
    fetchLastVisit();
  }, [motherId, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let parsedValue = value;
    if (name === "family_planning_method" || name === "period_missed" || name === "pregnancy") {
      parsedValue = value === "yes";
    }
    setForm((prev) => ({ ...prev, [name]: parsedValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/ec/register-visit/${motherId}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Redirect logic after success

      if (form.pregnancy) {
        navigate("/pw");
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message); // show backend custom error
      } else {
        setError("Network or server error while saving visit.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ec2-section">
      <h2>Eligible Couple Follow-Up (EC2)</h2>

      {error && <p className="error">{error}</p>}

      {lastVisit && (
        <div className="last-visit-summary">
          <h4>Last Visit Summary</h4>
          <p>Date: {lastVisit.visit_date}</p>
          <p>Family Planning: {lastVisit.family_planning_method ? "Yes" : "No"}</p>
          <p>Method Used: {lastVisit.method_used || "—"}</p>
          <p>Period Missed: {lastVisit.period_missed ? "Yes" : "No"}</p>
          <p>Pregnancy: {lastVisit.pregnancy ? "Yes" : "No"}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label>Visit Date*</label>
        <input
          type="date"
          name="visit_date"
          required
          value={form.visit_date}
          onChange={handleChange}
        />

        <label>Using Family Planning Method?*</label>
        <select
          name="family_planning_method"
          value={form.family_planning_method ? "yes" : "no"}
          onChange={handleChange}
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>

        {form.family_planning_method && (
          <>
            <label>Method Used*</label>
            <select
              name="method_used"
              required
              value={form.method_used}
              onChange={handleChange}
            >
              <option value="">Select</option>
              <option value="condom">Condom</option>
              <option value="pills">Pills</option>
              <option value="copper_t">Copper T</option>
              <option value="iud">IUD</option>
              <option value="others">Others</option>
            </select>
          </>
        )}

        <label>Period Missed?*</label>
        <select
          name="period_missed"
          value={form.period_missed ? "yes" : "no"}
          onChange={handleChange}
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>

        <label>Pregnant?*</label>
        <select
          name="pregnancy"
          value={form.pregnancy ? "yes" : "no"}
          onChange={handleChange}
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Submit Visit"}
        </button>
      </form>
    </div>
  );
};

export default EC2Section;
