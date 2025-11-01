import React, { useState, useEffect } from "react";
import axios from "axios";

const EC1Section = ({ onComplete, ec1Completed }) => {
    const [form, setForm] = useState({
        mother_name: "",
        father_name: "",
        phone_no: "",
        aadhaar_id: "",
        account_number: "",
        bank_name: "",
        branch_name: "",
        ifsc_code: "",
        occupation_mother: "",
        occupation_father: "",
        dob_mother: "",
        dob_father: "",
        date_of_registration: new Date().toISOString().split("T")[0],
        village: "",
        asha_id: "",
    });

    const [villages, setVillages] = useState([]);
    const [ashas, setAshas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Example: Retrieve auth token (adjust based on your actual storage)
    const token = localStorage.getItem("token");

    const axiosConfig = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    // ---- Fetch accessible villages on mount ----
    useEffect(() => {
        const fetchVillages = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/ec/villages`, axiosConfig);
                setVillages(res.data || []);
            } catch (err){
                setError(err.response?.data?.message || 'Failed to load villages');
            }
        };
        fetchVillages();
    }, []);

    // ---- Fetch ASHAs filtered by village ----
    useEffect(() => {
        if (!form.village) return;
        const fetchAshas = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/ec/asha-by-village/${form.village}`, axiosConfig);
                setAshas(res.data || []);
            } catch (err){
                setError(err.response?.data?.message || "Failed to load ASHA list.");
            }
        };
        fetchAshas();
    }, [form.village]);

    // ---- Handle input change ----
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // ---- Submit handler ----
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/ec/register`, form, axiosConfig);
            onComplete(res.data.mother_id);
        } catch (err) {
            setError(err.response?.data?.message || "Network or server error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="ec1-form" onSubmit={handleSubmit}>
            <h2>Eligible Couple Registration (EC1)</h2>
            {error && <p className="error">{error}</p>}

            <div className="form-grid">
                <label>Mother Name*</label>
                <input name="mother_name" required value={form.mother_name} onChange={handleChange} disabled={ec1Completed} />

                <label>Father Name*</label>
                <input name="father_name" required value={form.father_name} onChange={handleChange} disabled={ec1Completed} />

                <label>Phone Number*</label>
                <input name="phone_no" required value={form.phone_no} onChange={handleChange} disabled={ec1Completed} />

                <label>Aadhaar ID</label>
                <input name="aadhaar_id" value={form.aadhaar_id} onChange={handleChange} disabled={ec1Completed} />

                <label>Account Number</label>
                <input name="account_number" value={form.account_number} onChange={handleChange} disabled={ec1Completed} />

                <label>Bank Name</label>
                <input name="bank_name" value={form.bank_name} onChange={handleChange} disabled={ec1Completed} />

                <label>Branch Name</label>
                <input name="branch_name" value={form.branch_name} onChange={handleChange} disabled={ec1Completed} />

                <label>IFSC Code</label>
                <input name="ifsc_code" value={form.ifsc_code} onChange={handleChange} disabled={ec1Completed} />

                <label>Occupation (Mother)</label>
                <input name="occupation_mother" value={form.occupation_mother} onChange={handleChange} disabled={ec1Completed} />

                <label>Occupation (Father)</label>
                <input name="occupation_father" value={form.occupation_father} onChange={handleChange} disabled={ec1Completed} />

                <label>Date of Birth (Mother)*</label>
                <input type="date" name="dob_mother" required value={form.dob_mother} onChange={handleChange} disabled={ec1Completed} />

                <label>Date of Birth (Father)*</label>
                <input type="date" name="dob_father" required value={form.dob_father} onChange={handleChange} disabled={ec1Completed} />

                <label>Village*</label>
                <select name="village" required value={form.village} onChange={handleChange} disabled={ec1Completed}>
                    <option value="">Select Village</option>
                    {villages.map((v) => (
                        <option key={v.village_id} value={v.village_id}>
                            {v.village_name}
                        </option>
                    ))}
                </select>

                <label>ASHA Name*</label>
                <select name="asha_id" required value={form.asha_id} onChange={handleChange} disabled={ec1Completed || !form.village}>
                    <option value="">Select ASHA</option>
                    {ashas.map((a) => (
                        <option key={a.asha_id} value={a.asha_id}>
                            {a.name}
                        </option>
                    ))}
                </select>

                <label>Date of Registration</label>
                <input
                    type="date"
                    name="date_of_registration"
                    value={form.date_of_registration}
                    onChange={handleChange}
                    disabled={ec1Completed}
                />
            </div>

            {!ec1Completed && (
                <button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Submit EC1"}
                </button>
            )}
        </form>
    );
};

export default EC1Section;
