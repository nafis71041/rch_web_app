// src/frontend/pages/pw_page/InfantSection.js

import React, { useState, useEffect } from "react";
import axios from "axios";

const InfantSection = ({ motherId, pregnancyId, data = [], readOnly = false, onComplete, onError }) => {
  const initialInfant =
    data && data.length > 0
      ? data[0]
      : {
          sex: "",
          weight_at_birth: "",
          head_circumference: "",
          cried_after_birth: "yes",
          yellow_milk_given: "yes",
          yellow_milk_not_given_reason: "",
          opv_0: "",
          bcg_0: "",
          hepb_0: "",
        };

  const [form, setForm] = useState(initialInfant);

  useEffect(() => {
    if (data && data.length > 0) {
      const d = data[0];
      setForm({
        sex: d.sex || "",
        weight_at_birth: d.weight_at_birth || "",
        head_circumference: d.head_circumference || "",
        cried_after_birth: d.cried_after_birth ? "yes" : "no",
        yellow_milk_given: d.yellow_milk_given ? "yes" : "no",
        yellow_milk_not_given_reason: d.yellow_milk_not_given_reason || "",
        opv_0: d.opv_0 || "",
        bcg_0: d.bcg_0 || "",
        hepb_0: d.hepb_0 || "",
      });
    }
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (!readOnly) setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (readOnly) return;

    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...form,
        cried_after_birth: form.cried_after_birth === "yes",
        yellow_milk_given: form.yellow_milk_given === "yes",
        pregnant_woman_id: pregnancyId,
        mother_id: motherId,
      };

      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/pw/infant`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onComplete(res.data);
    } catch (err) {
      onError(err.response?.data?.message || "Error saving infant data:");
    }
  };

  return (
    <section className="section--pw section--infant">
      <div>
        <h3 className="form-title">Infant Details</h3>

        <form onSubmit={handleSubmit} className="form--pw">
          <div className="form-grid--pw">
            <div className="form-group">
              <label className="form-label">Sex</label>
              <select
                className="form-select"
                name="sex"
                value={form.sex}
                onChange={handleChange}
                required
                disabled={readOnly}
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Weight at Birth (kg)</label>
              <input
                className="form-input"
                name="weight_at_birth"
                value={form.weight_at_birth}
                onChange={handleChange}
                required
                disabled={readOnly}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Head Circumference (cm)</label>
              <input
                className="form-input"
                name="head_circumference"
                value={form.head_circumference}
                onChange={handleChange}
                required
                disabled={readOnly}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Cried After Birth</label>
              <select
                className="form-select"
                name="cried_after_birth"
                value={form.cried_after_birth}
                onChange={handleChange}
                disabled={readOnly}
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Yellow Milk Given</label>
              <select
                className="form-select"
                name="yellow_milk_given"
                value={form.yellow_milk_given}
                onChange={handleChange}
                disabled={readOnly}
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            {form.yellow_milk_given === "no" && (
              <div className="form-group">
                <label className="form-label">Reason (if not given)</label>
                <input
                  className="form-input"
                  name="yellow_milk_not_given_reason"
                  value={form.yellow_milk_not_given_reason}
                  onChange={handleChange}
                  required
                  disabled={readOnly}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">OPV 0 Date</label>
              <input
                type="date"
                className="form-input"
                name="opv_0"
                value={form.opv_0 || ""}
                onChange={handleChange}
                required
                disabled={readOnly}
              />
            </div>

            <div className="form-group">
              <label className="form-label">BCG 0 Date</label>
              <input
                type="date"
                className="form-input"
                name="bcg_0"
                value={form.bcg_0 || ""}
                onChange={handleChange}
                required
                disabled={readOnly}
              />
            </div>

            <div className="form-group">
              <label className="form-label">HepB 0 Date</label>
              <input
                type="date"
                className="form-input"
                name="hepb_0"
                value={form.hepb_0 || ""}
                onChange={handleChange}
                required
                disabled={readOnly}
              />
            </div>
          </div>

          {!readOnly && (
            <div className="form-actions">
              <button type="submit" className="btn">Save & Exit</button>
            </div>
          )}
        </form>
      </div>
    </section>
  );
};

export default InfantSection;
