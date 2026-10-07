import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/patients", label: "Patients" },
  { to: "/appointments", label: "Appointments" },
  { to: "/consultation", label: "Consultation" }
];

export default function Navbar() {
  const { doctor, signOut } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <NavLink className="brand" to="/patients" aria-label="CarePoint home">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M6 4.75v5.1a4.25 4.25 0 0 0 8.5 0v-5.1" />
              <path d="M4.25 4.75h3.5M12.75 4.75h3.5M16.25 4.75v8.5a3.5 3.5 0 0 0 7 0v-1" />
              <circle cx="19.75" cy="10.25" r="1.5" />
              <path d="M8.5 14.25v1a4.75 4.75 0 0 0 9.5 0v-1" />
              <circle cx="18" cy="14.25" r="1.5" />
            </svg>
          </span>
          <span>CarePoint<span className="brand-light"> Clinic</span></span>
        </NavLink>
        <nav className="nav-links" aria-label="Main navigation">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="account-actions">
          <span className="clinic-label"><span className="status-dot" />{doctor?.name || "Doctor"}</span>
          <button className="signout-button" type="button" onClick={signOut}>Sign out</button>
        </div>
      </div>
    </header>
  );
}
