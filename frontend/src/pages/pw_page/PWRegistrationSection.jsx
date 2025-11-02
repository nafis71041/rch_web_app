// src/frontend/pages/pw_page/PWRegistrationSection.js

import React, { useState, useEffect } from "react";
import axios from "axios";

const PWRegistrationSection = ({ motherId, pregnancyId, data = {}, readOnly = false, onComplete, onError }) => {
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

      // Backend should return updated registration info
      onComplete(res.data);
    } catch (err) {
        onError(err.response?.data?.message || "Failed to save registration data");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="pw-registration-section">
      <h3>Pregnant Woman Registration</h3>

      <label>Mother ID</label>
      <input
        name="mother_id"
        value={form.mother_id}
        onChange={handleChange}
        required
        disabled
      />

      <label>Weight</label>
      <input
        name="weight"
        value={form.weight}
        onChange={handleChange}
        required
        disabled={readOnly}
      />

      <label>Height</label>
      <input
        name="height"
        value={form.height}
        onChange={handleChange}
        required
        disabled={readOnly}
      />

      <label>LMP Date</label>
      <input
        type="date"
        name="lmp_date"
        value={form.lmp_date || ""}
        onChange={handleChange}
        required
        disabled={readOnly}
      />

      <label>EDD Date</label>
      <input
        type="date"
        name="edd_date"
        value={form.edd_date || ""}
        onChange={handleChange}
        required
        disabled={readOnly}
      />

      <label>Blood Group</label>
      <select
        name="blood_group"
        value={form.blood_group}
        onChange={handleChange}
        required
        disabled={readOnly}
      >
        <option value="">Select</option>
        {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>

      <label>Total Pregnancies</label>
      <input
        name="total_no_of_pregnancies"
        value={form.total_no_of_pregnancies}
        onChange={handleChange}
        required
        disabled={readOnly}
      />

      <label>Expected Delivery Place</label>
      <input
        name="expected_delivery_place"
        value={form.expected_delivery_place}
        onChange={handleChange}
        required
        disabled={readOnly}
      />

      {!readOnly && <button type="submit">Save & Continue</button>}
    </form>
  );
};

export default PWRegistrationSection;
