import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Appointments from "./pages/Appointments";
import Consultation from "./pages/Consultation";
import Patients from "./pages/Patients";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/patients" replace />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/consultation" element={<Consultation />} />
        <Route path="/consultation/:appointmentId" element={<Consultation />} />
        <Route path="*" element={<Navigate to="/patients" replace />} />
      </Routes>
      <footer className="app-footer">CarePoint Clinic <span>·</span> Simple care, well managed</footer>
    </>
  );
}
