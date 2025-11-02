// src/frontend/pages/pw_page/DeliverySection.js

import React, { useState, useEffect } from "react";
import axios from "axios";

const DeliverySection = ({ pregnancyId, data = {}, readOnly = false, onComplete, onError}) => {
  const [form, setForm] = useState({
    place_of_delivery: "",
    location_of_delivery: "",
    delivery_complication: "no",
    delivery_complication_details: "",
    number_of_children_born: "",
    live_birth_count: "",
    still_birth_count: "",
  });

  // Load backend data into form when received
  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      setForm((prev) => ({
        ...prev,
        ...data,
        delivery_complication: data.delivery_complication || "no",
      }));
    }
  }, [data]);

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
        `${process.env.REACT_APP_BACKEND_URL}/api/pw/delivery`,
        { ...form, pregnancy_id: pregnancyId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onComplete(res.data); // send updated data up
    } catch (err) {
        onError(err.response?.data?.message || "Error saving delivery details:");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="delivery-section">
      <h3>Delivery Details</h3>

      <label>Place of Delivery</label>
      <select
        name="place_of_delivery"
        value={form.place_of_delivery}
        onChange={handleChange}
        required
        disabled={readOnly}
      >
        <option value="">Select</option>
        <option value="hospital">hospital</option>
        <option value="home">home</option>
        <option value="other">other</option>
      </select>

      <label>Location of Delivery</label>
      <input
        name="location_of_delivery"
        value={form.location_of_delivery}
        onChange={handleChange}
        required
        disabled={readOnly}
      />

      <label>Delivery Complication</label>
      <select
        name="delivery_complication"
        value={form.delivery_complication}
        onChange={handleChange}
        disabled={readOnly}
      >
        <option value="no">No</option>
        <option value="yes">Yes</option>
      </select>

      {form.delivery_complication === "yes" && (
        <>
          <label>Complication Details</label>
          <input
            name="delivery_complication_details"
            value={form.delivery_complication_details}
            onChange={handleChange}
            required
            disabled={readOnly}
          />
        </>
      )}

      <label>Number of Children Born</label>
      <input
        name="number_of_children_born"
        value={form.number_of_children_born}
        onChange={handleChange}
        required
        disabled={readOnly}
      />

      <label>Live Birth Count</label>
      <input
        name="live_birth_count"
        value={form.live_birth_count}
        onChange={handleChange}
        required
        disabled={readOnly}
      />

      <label>Still Birth Count</label>
      <input
        name="still_birth_count"
        value={form.still_birth_count}
        onChange={handleChange}
        required
        disabled={readOnly}
      />

      {!readOnly && <button type="submit">Save & Continue</button>}
    </form>
  );
};

export default DeliverySection;
