import React from "react";
import "./StudentVisualization.css";
import { BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import axios from "axios";
import { useState } from "react";
import { useEffect } from "react";

const StudentVisualizer = () => {
    const[studentData,setStudentData] = useState([]);
    useEffect(() => {
        const fetchStudentData = async () => {
          try {
            const response = await axios.get(
              "http://localhost:5002/api/data/induvi/?id=66e2806a252f71e12fbaf77b"
            );
            setStudentData(response.data.data);
            console.log(response.data);
          } catch (error) {
            console.error("Error fetching student data:", error);
          }
        };
    
        fetchStudentData();
      }, []);
      
  return (
    <div className="dashboard-container">
      <h2>Student Dashboard - {studentData.studentname}</h2>

      {/* GRID Layout for Visualizations */}
      <div className="dashboard-grid">

        {/* Academic Performance */}
        <div className="dashboard-card">
          <h2>Academic Performance</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={[
              { name: "10th", score: studentData["10thmark"] },
              { name: "12th", score: studentData["12thmark"] }, // Ensure the key matches exactly
              { name: "Cutoff", score: studentData["cutoff"] }
              
            ]}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="score" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Competitive Exam Scores */}
        <div className="dashboard-card">
          <h2>Competitive Exam Scores</h2>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
              { subject: "GRE", score: studentData.score?.grescore },
              { subject: "IELTS", score: studentData.score?.ieltsscore },
              { subject: "SAT", score: studentData.score?.satscore },
              { subject: "CAT", score: studentData.score?.catscore },
              { subject: "TOEFL", score: studentData.score?.toeflscore },
              { subject: "GMAT", score: studentData.score?.gmatscore },
              { subject: "GATE", score: studentData.score?.gatescore },
            ]}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis />
              <Radar name="Score" dataKey="score" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Extracurricular Activities */}
        <div className="dashboard-card">
          <h2>Extracurricular & Projects</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[
              { name: "Projects", value: studentData.numberofprojects },
              { name: "Research Papers", value: studentData.numberofresearchpapers },
            ]}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#ff7300" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

export default StudentVisualizer;