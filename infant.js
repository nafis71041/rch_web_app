import axios from "axios";

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzYyMTQzMDMyLCJleHAiOjE3NjIxNjgyMzJ9.mnqzArohZ_AY8uDPp2hcj5Ri_qttxagSOPhp0zvKXh4'; // or paste your token directly for testing
const BASE_URL = `http://localhost:5000/api/pw/infant`;

const payloads = [
  {
    pregnant_woman_id: 1,
    sex: "male",
    weight_at_birth: 3.2,
    head_circumference: 34.5,
    cried_after_birth: true,
    yellow_milk_given: true,
    opv_0: "2024-10-18",
    bcg_0: "2024-10-18",
    hepb_0: "2024-10-18",
  },
  {
    pregnant_woman_id: 7,
    sex: "male",
    weight_at_birth: 3.0,
    head_circumference: 3.0,
    cried_after_birth: true,
    yellow_milk_given: true,
    opv_0: "2025-11-02",
    bcg_0: "2025-11-02",
    hepb_0: "2025-11-02",
  },
  {
    pregnant_woman_id: 15,
    sex: "female",
    weight_at_birth: 2.6,
    head_circumference: 32.0,
    cried_after_birth: true,
    yellow_milk_given: true,
    opv_0: "2025-11-02",
    bcg_0: "2025-11-02",
    hepb_0: "2025-11-02",
  },
  {
    pregnant_woman_id: 16,
    sex: "male",
    weight_at_birth: 3.4,
    head_circumference: 34.0,
    cried_after_birth: true,
    yellow_milk_given: true,
    opv_0: "2025-11-26",
    bcg_0: "2025-11-07",
    hepb_0: "2025-11-21",
  },
];

// Run all requests
const createInfants = async () => {
  try {
    const results = await Promise.all(
      payloads.map((payload) =>
        axios.post(BASE_URL, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
    );

    console.log("✅ All infants created successfully:");
    results.forEach((res, i) => {
      console.log(`Infant ${i + 1}:`, res.data);
    });
  } catch (err) {
    console.error("❌ Error creating infants:", err.response?.data || err.message);
  }
};

createInfants();
