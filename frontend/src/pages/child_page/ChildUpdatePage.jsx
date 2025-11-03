import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const vaccineList = [
  "BCG",
  "DPT_1",
  "DPT_2",
  "DPT_3",
  "DPT_Booster",
  "HepB_0",
  "HepB_1",
  "HepB_2",
  "HepB_3",
  "Measles_1",
  "Measles_2",
  "OPV_0",
  "OPV_1",
  "OPV_2",
  "OPV_3",
  "OPV_Booster",
  "Vitamin_A_1",
  "Vitamin_A_2",
  "Vitamin_A_3",
  "Vitamin_A_4",
  "Vitamin_A_5",
  "Vitamin_A_6",
  "Vitamin_A_7",
  "Vitamin_A_8",
  "Vitamin_A_9",
];

const ChildUpdatePage = () => {
  const { childId } = useParams();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [inlineErrors, setInlineErrors] = useState({});
  const [saveError, setSaveError] = useState(null);

  const parseVaccine = (name) => {
    if (name.endsWith("_Booster"))
      return { group: name.replace(/_Booster$/, ""), order: 999 };
    const match = name.match(/(.*)_(\d+)$/);
    if (match) return { group: match[1], order: parseInt(match[2], 10) };
    return { group: name, order: 0 };
  };

  const groups = useMemo(() => {
    const map = {};
    records.forEach((r, idx) => {
      const { group, order } = parseVaccine(r.vaccine_name);
      if (!map[group]) map[group] = [];
      map[group].push({ idx, order });
    });
    Object.keys(map).forEach((g) => {
      map[g].sort((a, b) => a.order - b.order);
    });
    return map;
  }, [records]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/child/immunization/${childId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const existing = res.data.immunizations || [];

        const merged = vaccineList.map((v) => {
          const found = existing.find((r) => r.vaccine_name === v);
          if (found) {
            return {
              vaccine_name: found.vaccine_name,
              scheduled_date: found.scheduled_date || "",
              actual_date_given: found.actual_date_given || "",
              remarks: found.remarks || "",
              locked: found.scheduled_date && found.actual_date_given ? true : false,
            };
          }
          return {
            vaccine_name: v,
            scheduled_date: "",
            actual_date_given: "",
            remarks: "",
            locked: false,
          };
        });

        setRecords(merged);
      } catch {
        setSaveError("Failed to fetch immunization data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [childId]);

  const setFieldError = (index, field, msg) => {
    setInlineErrors((prev) => ({
      ...prev,
      [index]: { ...(prev[index] || {}), [field]: msg },
    }));
  };

  const clearFieldError = (index, field) => {
    setInlineErrors((prev) => {
      if (!prev[index]) return prev;
      const newObj = { ...prev[index] };
      delete newObj[field];
      if (Object.keys(newObj).length === 0) {
        const copy = { ...prev };
        delete copy[index];
        return copy;
      }
      return { ...prev, [index]: newObj };
    });
  };

  const isEditable = (index) => {
    const rec = records[index];
    if (rec.locked) return false;

    const { group } = parseVaccine(rec.vaccine_name);
    const groupArray = groups[group] || [];
    const pos = groupArray.findIndex((g) => g.idx === index);

    if (pos === 0) return true;

    const prevRec = records[groupArray[pos - 1].idx];
    return prevRec.scheduled_date && prevRec.actual_date_given;
  };

  const handleChange = (index, field, value) => {
    setRecords((prev) => {
      const newData = prev.map((r) => ({ ...r }));
      newData[index][field] = value;

      if (field === "scheduled_date") {
        // If scheduled date cleared, clear its own actual date and remarks too
        if (value === "" || value === null) {
          newData[index].actual_date_given = "";
          newData[index].remarks = "";

          // Also clear all dependent vaccines (future ones in same group)
          const { group } = parseVaccine(newData[index].vaccine_name);
          const groupArr = groups[group] || [];
          const pos = groupArr.findIndex((g) => g.idx === index);
          for (let i = pos + 1; i < groupArr.length; i++) {
            const idx = groupArr[i].idx;
            newData[idx].scheduled_date = "";
            newData[idx].actual_date_given = "";
            newData[idx].remarks = "";
          }
        }
      }

      if (field === "actual_date_given" && (value === "" || value === null)) {
        // If actual date cleared, clear dependent vaccines as well
        const { group } = parseVaccine(newData[index].vaccine_name);
        const groupArr = groups[group] || [];
        const pos = groupArr.findIndex((g) => g.idx === index);
        for (let i = pos + 1; i < groupArr.length; i++) {
          const idx = groupArr[i].idx;
          newData[idx].scheduled_date = "";
          newData[idx].actual_date_given = "";
          newData[idx].remarks = "";
        }
      }



      return newData;
    });
    clearFieldError(index, field);
  };


  const validateBeforeSave = () => {
    let valid = true;
    setInlineErrors({});

    records.forEach((r, i) => {
      if (r.actual_date_given && !r.scheduled_date) {
        setFieldError(i, "actual_date_given", "Select scheduled date first.");
        valid = false;
      }
    });

    return valid;
  };


  const handleSave = async () => {
    if (!validateBeforeSave()) return;

    const payload = records
      .filter((r) => r.scheduled_date)
      .map((r) => ({
        vaccine_name: r.vaccine_name,
        scheduled_date: r.scheduled_date,
        actual_date_given: r.actual_date_given || null,
        remarks: r.remarks || null,
      }));

    if (payload.length === 0) {
      setSaveError("No data to save.");
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/child/immunization/${childId}`,
        { immunizations: payload },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log(payload);

      // After save, mark completed records as locked
      setRecords((prev) =>
        prev.map((r) =>
          r.scheduled_date && r.actual_date_given
            ? { ...r, locked: true }
            : r
        )
      );

      setSaveError(null);
      alert("Details updated successfully.");
    } catch {
      setSaveError("Failed to save updates.");
    } finally {
      setSaving(false);
    }
  };

  const renderError = (i, field) =>
    inlineErrors[i]?.[field] ? (
      <div style={{ color: "crimson", fontSize: "0.8rem" }}>
        {inlineErrors[i][field]}
      </div>
    ) : null;

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>Child Immunization Update</h2>
      <p>Child ID: {childId}</p>

      <div>
        <div style={{ fontWeight: "bold" }}>
          <div>Vaccine | Scheduled Date | Actual Date Given | Remarks</div>
        </div>

        {records.map((rec, i) => {
          const editable = isEditable(i);
          const readonly = rec.locked;
          const disabled = !editable && !readonly;

          return (
            <div key={rec.vaccine_name}>
              <span>{rec.vaccine_name}</span>

              <input
                type="date"
                value={rec.scheduled_date || ""}
                onChange={(e) => handleChange(i, "scheduled_date", e.target.value)}
                readOnly={readonly}
                disabled={disabled}
              />
              
              <input
                type="date"
                value={rec.actual_date_given || ""}
                onChange={(e) =>
                  handleChange(i, "actual_date_given", e.target.value)
                }
                readOnly={readonly}
                disabled={disabled}
              />

              <input
                type="text"
                value={rec.remarks || ""}
                onChange={(e) => handleChange(i, "remarks", e.target.value)}
                readOnly={readonly}
                disabled={disabled}
                placeholder="Remarks"
              />

              {renderError(i, "scheduled_date")}
              {renderError(i, "actual_date_given")}
              {renderError(i, "remarks")}
            </div>
          );
        })}
      </div>

      <div>
        <button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Update Details"}
        </button>
        {saveError && <div style={{ color: "crimson" }}>{saveError}</div>}
      </div>
    </div>
  );
};

export default ChildUpdatePage;
