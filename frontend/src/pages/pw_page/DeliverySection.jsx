// src/frontend/pages/pw_page/DeliverySection.js

import React, { useState, useEffect } from "react";
import axios from "axios";

const DeliverySection = ({ pregnancyId, data = {}, readOnly = false, onComplete, onError }) => {
  const [form, setForm] = useState({
    place_of_delivery: "",
    location_of_delivery: "",
    delivery_complication: "no",
    delivery_complication_details: "",
    number_of_children_born: "",
    live_birth_count: "",
    still_birth_count: "",
  });

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
    if (!readOnly) setForm((prev) => ({ ...prev, [name]: value }));
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
      onComplete(res.data);
    } catch (err) {
      onError(err.response?.data?.message || "Error saving delivery details:");
    }
  };

  return (
    <section className="section--pw section--delivery">
      <div>
        <h3 className="form-title">Delivery Details</h3>

        <form onSubmit={handleSubmit} className="form--pw">
          <div className="form-grid--pw">

            <div className="form-group">
              <label className="form-label">Place of Delivery</label>
              <select
                className="form-select"
                name="place_of_delivery"
                value={form.place_of_delivery}
                onChange={handleChange}
                required
                disabled={readOnly}
              >
                <option value="">Select</option>
                <option value="hospital">Hospital</option>
                <option value="home">Home</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Location of Delivery</label>
              <input
                className="form-input"
                name="location_of_delivery"
                value={form.location_of_delivery}
                onChange={handleChange}
                required
                disabled={readOnly}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Delivery Complication</label>
              <select
                className="form-select"
                name="delivery_complication"
                value={form.delivery_complication}
                onChange={handleChange}
                disabled={readOnly}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>

            {form.delivery_complication === "yes" && (
              <div className="form-group">
                <label className="form-label">Complication Details</label>
                <input
                  className="form-input"
                  name="delivery_complication_details"
                  value={form.delivery_complication_details}
                  onChange={handleChange}
                  required
                  disabled={readOnly}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Number of Children Born</label>
              <input
                className="form-input"
                name="number_of_children_born"
                value={form.number_of_children_born}
                onChange={handleChange}
                required
                disabled={readOnly}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Live Birth Count</label>
              <input
                className="form-input"
                name="live_birth_count"
                value={form.live_birth_count}
                onChange={handleChange}
                required
                disabled={readOnly}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Still Birth Count</label>
              <input
                className="form-input"
                name="still_birth_count"
                value={form.still_birth_count}
                onChange={handleChange}
                required
                disabled={readOnly}
              />
            </div>
          </div>

          {!readOnly && (
            <div className="form-actions">
              <button type="submit" className="btn">Save & Continue</button>
            </div>
          )}
        </form>
      </div>
    </section>
  );
};

export default DeliverySection;
