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

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!motherId) return;
    const fetchLastVisit = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/ec/last-visit/${motherId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setLastVisit(res.data);
      } catch (err) {
        if (err.response?.data?.message === "No such eligible couple (mother) found") {
          navigate("/ec-registration/search", {
            state: { searchErr: err.response?.data?.message },
          });
          return;
        }
        setError(err.response?.data?.message || "Failed to load last visit data.");
        setLastVisit(null);
      }
    };
    fetchLastVisit();
  }, [motherId, token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let parsedValue = value;
    if (["family_planning_method", "period_missed", "pregnancy"].includes(name)) {
      parsedValue = value === "yes";
    }
    setForm((prev) => ({ ...prev, [name]: parsedValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/ec/register-visit/${motherId}`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (form.pregnancy) {
        navigate(`/pw/${motherId}/pregnancy/new`);
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Network or server error while saving visit.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="ec-section ec-section--ec2">
        <h2 className="form-title">Eligible Couple Follow-Up (EC2)</h2>

        {error && <div className="form-error">{error}</div>}

        {lastVisit && (
          <div className="last-visit">
            <h3 className="last-visit__title">Last Visit Summary</h3>
            <div className="last-visit__content">
              <p><strong>Date:</strong> {lastVisit.visit_date}</p>
              <p><strong>Family Planning:</strong> {lastVisit.family_planning_method ? "Yes" : "No"}</p>
              <p><strong>Method Used:</strong> {lastVisit.method_used || "—"}</p>
              <p><strong>Period Missed:</strong> {lastVisit.period_missed ? "Yes" : "No"}</p>
              <p><strong>Pregnancy:</strong> {lastVisit.pregnancy ? "Yes" : "No"}</p>
            </div>
          </div>
        )}

        <form className="form-grid--ec2" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Visit Date*</label>
            <input
              type="date"
              name="visit_date"
              required
              className="form-input"
              value={form.visit_date}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Using Family Planning Method?*</label>
            <select
              name="family_planning_method"
              className="form-select"
              value={form.family_planning_method ? "yes" : "no"}
              onChange={handleChange}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>

          {form.family_planning_method && (
            <div className="form-group">
              <label className="form-label">Method Used*</label>
              <select
                name="method_used"
                required
                className="form-select"
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
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Period Missed?*</label>
            <select
              name="period_missed"
              className="form-select"
              value={form.period_missed ? "yes" : "no"}
              onChange={handleChange}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Pregnant?*</label>
            <select
              name="pregnancy"
              className="form-select"
              value={form.pregnancy ? "yes" : "no"}
              onChange={handleChange}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Saving..." : "Submit Visit"}
            </button>
          </div>
        </form>
    </section>
  );
};

export default EC2Section;
