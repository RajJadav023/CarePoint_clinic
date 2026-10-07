import React from "react";
import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function PatientList({ search, onSearch, refreshKey }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    const timer = window.setTimeout(async () => {
      try {
        const data = await api.getPatients(search);
        if (active) setPatients(data);
      } catch (requestError) {
        if (active) setError(requestError.message || "Unable to load patients.");
      } finally {
        if (active) setLoading(false);
      }
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [search, refreshKey]);

  return (
    <section className="card patient-directory">
      <div className="card-heading">
        <div>
          <p className="eyebrow">DIRECTORY</p>
          <h2>Patients <span className="count-pill">{patients.length}</span></h2>
        </div>
      </div>
      <label className="search-box">
        <span className="search-icon" aria-hidden="true">⌕</span>
        <input
          type="search"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Search by name or phone"
          aria-label="Search patients by name or phone"
        />
      </label>
      {loading ? (
        <div className="loading-state"><span className="spinner" /> Loading patients…</div>
      ) : error ? (
        <p className="empty-state error-text">{error}</p>
      ) : patients.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">◌</span>
          <strong>{search ? "No matching patients" : "No patients yet"}</strong>
          <span>{search ? "Try a different name or phone number." : "Register your first patient to get started."}</span>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Patient</th><th>Gender</th><th>Age</th><th>Phone</th></tr></thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient._id}>
                  <td>
                    <div className="patient-cell">
                      <span className="avatar">{patient.name.charAt(0).toUpperCase()}</span>
                      <span className="patient-name">{patient.name}</span>
                    </div>
                  </td>
                  <td>{patient.gender}</td>
                  <td>{patient.age}</td>
                  <td className="phone-cell">{patient.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
