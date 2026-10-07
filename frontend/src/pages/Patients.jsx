import React from "react";
import { useState } from "react";
import PatientForm from "../components/PatientForm";
import PatientList from "../components/PatientList";
import { api } from "../services/api";

export default function Patients() {
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  async function createPatient(patient) {
    await api.createPatient(patient);
    setRefreshKey((key) => key + 1);
  }

  return (
    <main className="page-shell">
      <div className="page-intro">
        <div>
          <p className="eyebrow">CLINIC OVERVIEW</p>
          <h1>Patients</h1>
          <p className="intro-copy">Manage your patient directory and keep essential details close at hand.</p>
        </div>
        <div className="date-chip"><span aria-hidden="true">▦</span>{new Intl.DateTimeFormat("en", { dateStyle: "full" }).format(new Date())}</div>
      </div>
      <div className="patient-layout">
        <PatientForm onCreate={createPatient} />
        <PatientList search={search} onSearch={setSearch} refreshKey={refreshKey} />
      </div>
    </main>
  );
}
