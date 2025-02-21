import React from "react";
import { useNavigate } from "react-router-dom";
import { FaUserTie, FaUserGraduate } from "react-icons/fa";
import "./PersonaSelection.css";

const PersonaSelection = () => {
  const navigate = useNavigate();

  const handlePersonaSelect = (persona) => {
    navigate("/login", { state: { persona } });
  };

  return (
    <div className="persona-container">
      <h1 className="persona-title">Who are you?</h1>
      <div className="persona-options">
        <div
          className="persona-box"
          onClick={() => handlePersonaSelect("student")}
        >
          <FaUserGraduate className="persona-icon" />
          <h2 className="persona-label">Student</h2>
        </div>
        <div
          className="persona-box"
          onClick={() => handlePersonaSelect("faculty")}
        >
          <FaUserTie className="persona-icon" />
          <h2 className="persona-label">Faculty</h2>
        </div>
      </div>
    </div>
  );
};

export default PersonaSelection;
