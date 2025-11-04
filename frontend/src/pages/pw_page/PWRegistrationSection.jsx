// src/frontend/pages/pw_page/PWRegistrationSection.js

import React, { useState, useEffect } from "react";
import axios from "axios";

const PWRegistrationSection = ({
  motherId,
  pregnancyId,
  data = {},
  readOnly = false,
  onComplete,
  onError,
}) => {
  const [form, setForm] = useState({
    mother_id: motherId || "",
    weight: "",
    height: "",
    lmp_date: "",
    edd_date: "",
    blood_group: "",
    total_no_of_pregnancies: "",
    expected_delivery_place: "",
  });

  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      setForm((prev) => ({
        ...prev,
        ...data,
        mother_id: data.mother_id || motherId || "",
      }));
    }
  }, [data, motherId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (!readOnly) {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (readOnly) return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/pw/registration`,
        { ...form },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onComplete(res.data);
    } catch (err) {
      onError(err.response?.data?.message || "Failed to save registration data");
    }
  };

  return (
    <section className="section--pw-registration">
      <div>
        <h3 className="form-title">Pregnant Woman Registration</h3>

        <form onSubmit={handleSubmit} className="form--pw">
          <div className="form-grid--pw">
            <div className="form-group">
              <label className="form-label">Mother ID</label>
              <input
                className="form-input"
                name="mother_id"
                value={form.mother_id}
                onChange={handleChange}
                required
                disabled
              />
            </div>

            <div className="form-group">
              <label className="form-label">Weight</label>
              <input
                className="form-input"
                name="weight"
                value={form.weight}
                onChange={handleChange}
                required
                disabled={readOnly}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Height</label>
              <input
                className="form-input"
                name="height"
                value={form.height}
                onChange={handleChange}
                required
                disabled={readOnly}
              />
            </div>

            <div className="form-group">
              <label className="form-label">LMP Date</label>
              <input
                className="form-input"
                type="date"
                name="lmp_date"
                value={form.lmp_date || ""}
                onChange={handleChange}
                required
                disabled={readOnly}
              />
            </div>

            <div className="form-group">
              <label className="form-label">EDD Date</label>
              <input
                className="form-input"
                type="date"
                name="edd_date"
                value={form.edd_date || ""}
                onChange={handleChange}
                required
                disabled={readOnly}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <select
                className="form-select"
                name="blood_group"
                value={form.blood_group}
                onChange={handleChange}
                required
                disabled={readOnly}
              >
                <option value="">Select</option>
                {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(
                  (g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Total Pregnancies</label>
              <input
                className="form-input"
                name="total_no_of_pregnancies"
                value={form.total_no_of_pregnancies}
                onChange={handleChange}
                required
                disabled={readOnly}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Expected Delivery Place</label>
              <input
                className="form-input"
                name="expected_delivery_place"
                value={form.expected_delivery_place}
                onChange={handleChange}
                required
                disabled={readOnly}
              />
            </div>
          </div>

          {!readOnly && (
            <div className="form-actions">
              <button type="submit" className="btn">
                Save & Continue
              </button>
            </div>
          )}
        </form>
      </div>
    </section>
  );
};

export default PWRegistrationSection;
