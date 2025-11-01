import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EC1Section from "./EC1Section";
import EC2Section from "./EC2Section";
import "./ecPage.css";

const ECPage = () => {
    const { mother_id: paramMotherId } = useParams();
    const [activeSection, setActiveSection] = useState("EC1");
    const [ec1Completed, setEc1Completed] = useState(false);
    const [motherId, setMotherId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (paramMotherId) {
            setMotherId(paramMotherId);
            setEc1Completed(true);
            setActiveSection("EC2");
        }
    }, [paramMotherId]);


    const handleEC1Complete = (id) => {
        setEc1Completed(true);
        setMotherId(id);
        setActiveSection("EC2");
    };

    const handleCancel = () => {
        if (window.confirm("Are you sure you want to cancel and return to the dashboard? Unsaved data will be lost.")) {
            navigate("/dashboard");
        }
    };

    return (
        <div className="ec-page">
            <div className="section-nav">
                <button
                    className={activeSection === "EC1" ? "active" : ""}
                    disabled={!!paramMotherId || activeSection === "EC2"}
                >
                    EC1 Section
                </button>
                <button
                    className={activeSection === "EC2" ? "active" : ""}
                    disabled={!ec1Completed}
                    onClick={() => setActiveSection("EC2")}
                >
                    EC2 Section
                </button>
                <button className="cancel-btn" onClick={handleCancel}>
                    Cancel
                </button>
            </div>

            <div className="section-content">
                {activeSection === "EC1" && !paramMotherId && (
                    <EC1Section
                        onComplete={handleEC1Complete}
                        ec1Completed={ec1Completed}
                        motherId={motherId}
                    />
                )}
                {activeSection === "EC2" && ec1Completed && (
                    <EC2Section motherId={motherId} />
                )}
            </div>
        </div>
    );
};

export default ECPage;
