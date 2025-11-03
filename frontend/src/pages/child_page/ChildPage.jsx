import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ChildUpdatePage = () => {
  const { childId } = useParams();
  const [immunizations, setImmunizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Fetch immunization records
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/child/immunization/${childId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setImmunizations(res.data.immunizations || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch immunization data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [childId]);

  // Handle change in any field
  const handleChange = (index, field, value) => {
    setImmunizations((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      )
    );
  };

  // Save updates
  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/child/immunization/${childId}`,
        { immunizations },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Immunization data updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save updates");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading immunization data...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="child-update-container">
      <h2>Child Immunization Update</h2>
      <p>
        Child ID: <strong>{childId}</strong>
      </p>

      <div className="immunization-grid">
        <div className="grid-header">
          <div>Vaccine Name</div>
          <div>Scheduled Date</div>
          <div>Actual Date Given</div>
          <div>Status</div>
          <div>Remarks</div>
          <div>Dose #</div>
        </div>

        {immunizations.map((record, index) => (
          <div key={record.immunization_id} className="grid-row">
            <div>{record.vaccine_name}</div>

            <div>
              <input
                type="date"
                value={record.scheduled_date || ""}
                onChange={(e) =>
                  handleChange(index, "scheduled_date", e.target.value)
                }
              />
            </div>

            <div>
              <input
                type="date"
                value={record.actual_date_given || ""}
                onChange={(e) =>
                  handleChange(index, "actual_date_given", e.target.value)
                }
              />
            </div>

            <div>
              <select
                value={record.status}
                onChange={(e) => handleChange(index, "status", e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="given">Given</option>
                <option value="missed">Missed</option>
              </select>
            </div>

            <div>
              <input
                type="text"
                value={record.remarks || ""}
                onChange={(e) => handleChange(index, "remarks", e.target.value)}
                placeholder="Enter remarks"
              />
            </div>

            <div>{record.dose_number}</div>
          </div>
        ))}
      </div>

      <div className="form-actions">
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Updates"}
        </button>
      </div>
    </div>
  );
};

export default ChildUpdatePage;
