import React from "react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

const doctors = ["Dr. Rahul Shah", "Dr. Priya Patel", "Dr. Amit Mehta"];

function todayString() {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
}

export default function Appointments() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState({ patient: "", doctor: "", date: todayString(), time: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadPage = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [patientData, appointmentData] = await Promise.all([
        api.getPatients(),
        api.getTodayAppointments()
      ]);
      setPatients(patientData);
      setAppointments(appointmentData);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPage(); }, [loadPage]);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSaving(true);
    try {
      await api.createAppointment(form);
      setForm((current) => ({ ...current, patient: "", doctor: "", time: "" }));
      setNotice("Appointment booked successfully.");
      await loadPage();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="page-shell">
      <div className="page-intro">
        <div>
          <p className="eyebrow">SCHEDULE & VISITS</p>
          <h1>Appointments</h1>
          <p className="intro-copy">Book a visit and see what’s on the clinic schedule today.</p>
        </div>
        <div className="date-chip"><span aria-hidden="true">▦</span>{new Intl.DateTimeFormat("en", { dateStyle: "full" }).format(new Date())}</div>
      </div>

      <section className="card booking-card">
        <div className="card-heading">
          <div><p className="eyebrow">NEW VISIT</p><h2>Book an appointment</h2></div>
          <span className="icon-tile" aria-hidden="true">◷</span>
        </div>
        <form className="appointment-form" onSubmit={submit}>
          <label className="field">
            <span>Patient</span>
            <select name="patient" value={form.patient} onChange={updateField} required>
              <option value="">Select a patient</option>
              {patients.map((patient) => <option key={patient._id} value={patient._id}>{patient.name} · {patient.phone}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Doctor</span>
            <select name="doctor" value={form.doctor} onChange={updateField} required>
              <option value="">Select a doctor</option>
              {doctors.map((doctor) => <option key={doctor}>{doctor}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Date</span>
            <input name="date" type="date" value={form.date} onChange={updateField} required />
          </label>
          <label className="field">
            <span>Time</span>
            <input name="time" type="time" value={form.time} onChange={updateField} required />
          </label>
          <button className="button button-primary booking-submit" type="submit" disabled={saving || patients.length === 0}>
            {saving ? "Booking…" : "Book appointment"}
          </button>
        </form>
        {patients.length === 0 && !loading && <p className="helper-text">Add a patient before booking an appointment.</p>}
        {notice && <p className="inline-message success" role="status">{notice}</p>}
        {error && <p className="inline-message error" role="alert">{error}</p>}
      </section>

      <section className="card schedule-card">
        <div className="card-heading schedule-heading">
          <div><p className="eyebrow">DAILY SCHEDULE</p><h2>Today’s appointments <span className="count-pill">{appointments.length}</span></h2></div>
          <span className="today-tag"><span className="status-dot" /> Today</span>
        </div>
        {loading ? (
          <div className="loading-state"><span className="spinner" /> Loading today’s appointments…</div>
        ) : error && appointments.length === 0 ? (
          <p className="empty-state error-text">{error}</p>
        ) : appointments.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">◷</span>
            <strong>Your schedule is clear</strong>
            <span>Appointments booked for today will appear here.</span>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment._id}>
                    <td>
                      <div className="patient-cell">
                        <span className="avatar">{appointment.patient?.name?.charAt(0).toUpperCase() || "?"}</span>
                        <span className="patient-name">{appointment.patient?.name || "Unknown patient"}</span>
                      </div>
                    </td>
                    <td>{appointment.doctor}</td>
                    <td>{appointment.date}</td>
                    <td>{appointment.time}</td>
                    <td><span className={`badge ${appointment.status === "Completed" ? "badge-completed" : "badge-scheduled"}`}>{appointment.status}</span></td>
                    <td>
                      {appointment.status === "Scheduled"
                        ? <button className="button button-small button-outline" onClick={() => navigate(`/consultation/${appointment._id}`)}>Consult <span aria-hidden="true">→</span></button>
                        : <span className="muted-text">Visit complete</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
