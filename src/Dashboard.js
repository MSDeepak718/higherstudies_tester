import React, { useState } from "react";
import "./Dashboard.css";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { useEffect } from "react";

const Dashboard = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [cgpaDistribution, setcgpaDistribution] = useState([]);
  const [testScoreCorrelation, setTestScoreCorrelation] = useState([]);
  const [overAllTestScore, setAllTestScore] = useState([]);

  useEffect(() => {
    const fetchDepartmentStats = async () => {
      try {
        const response = await fetch("http://localhost:5002/api/allcgpa");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setDepartments(data.stats);
        setcgpaDistribution(data.cgpaDistribution);
        setTestScoreCorrelation(data.testScoreCorrelation);
        setAllTestScore(data.overAllTestScore[0]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchDepartmentStats();
  }, []);

  const calculateOverallStats = () => {
    if (departments.length === 0)
      return { avgCGPA: 0, avgGRE: 0, totalStudents: 0, cgpaDistribution: [] };

    const totalCGPA = departments.reduce(
      (sum, dept) => sum + dept.avgCGPA * dept.totalStudents,
      0
    );
    const totalGRE = departments.reduce(
      (sum, dept) => sum + dept.avgGRE * dept.totalStudents,
      0
    );
    const totalStudents = departments.reduce(
      (sum, dept) => sum + dept.totalStudents,
      0
    );

    const maleStudents = departments.reduce(
      (sum, dept) => sum + dept.maleStudents,
      0
    );
    const femaleStudents = departments.reduce(
      (sum, dept) => sum + dept.femaleStudents,
      0
    );

    const departmentBreakdown = departments.map((dept) => ({
      name: dept._id,
      students: dept.totalStudents,
      maleStudents: dept.maleStudents,
      femaleStudents: dept.femaleStudents,
    }));

    const overallCGPADistribution = {};

    cgpaDistribution.forEach((dept) => {
      dept.ranges.forEach(({ range, students }) => {
        overallCGPADistribution[range] =
          (overallCGPADistribution[range] || 0) + students;
      });
    });

    const cgpaDistributionArray = Object.entries(overallCGPADistribution).map(
      ([range, students]) => ({ range, students })
    );

    return {
      avgCGPA: totalStudents ? totalCGPA / totalStudents : 0,
      avgGRE: totalStudents ? totalGRE / totalStudents : 0,
      totalStudents,
      maleStudents,
      femaleStudents,
      departmentBreakdown,
      cgpaDistribution: cgpaDistributionArray,
    };
  };
  const currentData =
    selectedDepartment === "all"
      ? calculateOverallStats()
      : (() => {
          const dept = departments.find((d) => d._id === selectedDepartment);
          return dept
            ? {
                avgCGPA: dept.avgCGPA,
                avgGRE: dept.avgGRE,
                totalStudents: dept.totalStudents || 0,

                maleStudents: dept.maleStudents || 0,
                femaleStudents: dept.femaleStudents || 0,
                departmentBreakdown: [
                  {
                    name: dept._id,
                    students: dept.totalStudents || 0,
                    maleStudents: dept.maleStudents || 0,
                    femaleStudents: dept.femaleStudents || 0,
                  },
                ],
              }
            : null;
        })();
  const currentcgpa =
    selectedDepartment === "all"
      ? calculateOverallStats().cgpaDistribution
      : (() => {
          const dept = cgpaDistribution.find(
            (d) => d._id === selectedDepartment
          );
          return dept ? dept.ranges : [];
        })();

  const genderDistribution = [
    { name: "Male Students", value: currentData.maleStudents, fill: "#3498db" }, // Blue
    {
      name: "Female Students",
      value: currentData.femaleStudents,
      fill: "#e74c3c",
    },
  ];
  const formattedData = [];

  testScoreCorrelation.forEach((dept) => {
    const departmentData = { department: dept._id };

    dept.testScoreCorrelation.forEach((test) => {
      departmentData[test.test] = test.score;
    });

    formattedData.push(departmentData);
  });
  const currentTestScore =
    selectedDepartment === "all"
      ? overAllTestScore
      : formattedData.find((dept) => dept.department === selectedDepartment);
  
  return (
    <div className="dashboard-container">
      {/* Interactive Filters */}
      <div className="dashboard-tabs">
        <button
          className={`tab-trigger ${
            selectedDepartment === "all" ? "active" : ""
          }`}
          onClick={() => setSelectedDepartment("all")}
        >
          All Students
        </button>
        {departments.map((dept) => (
          <button
            key={dept._id}
            className={`tab-trigger ${
              selectedDepartment === dept._id ? "active" : ""
            }`}
            onClick={() => setSelectedDepartment(dept._id)}
          >
            {dept._id}
          </button>
        ))}
      </div>

      {/* Overview Metrics */}
      <div className="overview-metrics">
        <div className="dashboard-card">
          <h2>Total Students</h2>
          <p>{currentData.totalStudents}</p>
        </div>
        <div className="dashboard-card">
          <h2>Average CGPA</h2>
          <p>{currentData.avgCGPA.toFixed(2)}</p>
        </div>
        <div className="dashboard-card">
          <h2>Avg GRE Score</h2>
          <p>{currentData.avgGRE.toFixed(2)}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-container">
        {/* Gender Distribution */}
        <div className="dashboard-card">
          <h2>Gender Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={genderDistribution}
                dataKey="value"
                nameKey="name"
                fill="#8884d8"
                label
              />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Department Breakdown */}
        <div className="dashboard-card">
          <h2>Department Breakdown</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={currentData?.departmentBreakdown || []}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="students" fill="#82ca9d" />
              <Bar dataKey="maleStudents" fill="#8884d8" />
              <Bar dataKey="femaleStudents" fill="#ff69b4" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* CGPA Distribution */}
        <div className="dashboard-card">
          <h2>CGPA Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={currentcgpa}>
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="students" stroke="#ff7300" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Test Score Correlation */}
        <div className="dashboard-card">
          <h2>Test Score Correlation</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={[currentTestScore]} barSize={40}>
              <XAxis dataKey={(data) => data.department || "all"} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="GRE" name="GRE Avg" fill="#8884d8" />
              <Bar dataKey="IELTS" name="IELTS Avg" fill="#82ca9d" />
              <Bar dataKey="TOEFL" name="TOEFL Avg" fill="#ffc658" />
              <Bar dataKey="GMAT" name="GMAT Avg" fill="#ff7300" />
              <Bar dataKey="SAT" name="SAT Avg" fill="#ff0000" />
              <Bar dataKey="CAT" name="CAT Avg" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
