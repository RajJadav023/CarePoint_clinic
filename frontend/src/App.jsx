import React from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import { useAuth } from "./context/AuthContext";
import Appointments from "./pages/Appointments";
import AuthPage from "./pages/AuthPage";
import Consultation from "./pages/Consultation";
import Patients from "./pages/Patients";

function ProtectedLayout() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <>
      <Navbar />
      <Outlet />
      <footer className="app-footer">CarePoint Clinic <span>·</span> Simple care, well managed</footer>
    </>
  );
}

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/patients" replace /> : <AuthPage mode="login" />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/patients" replace /> : <AuthPage mode="register" />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Navigate to="/patients" replace />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/consultation" element={<Consultation />} />
        <Route path="/consultation/:appointmentId" element={<Consultation />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
