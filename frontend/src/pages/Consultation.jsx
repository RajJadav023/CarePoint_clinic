import React from "react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";

export default function Consultation() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [historyPatients, setHistoryPatients] = useState([]);
  const [selectedId, setSelectedId] = useState(appointmentId || "");
  const [historyPatientId, setHistoryPatientId] = useState("");
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({ bloodPressure: "", temperature: "", notes: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState("");
  const [historyError, setHistoryError] = useState("");
  const [notice, setNotice] = useState("");

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [data, pending] = await Promise.all([
        api.getAppointments(),
        api.getPendingAppointments()
      ]);
      setAppointments(data);
      setPendingAppointments(pending);
      const initial = pending.find((item) => item._id === appointmentId);
      setSelectedId(initial?._id || "");
      if (appointmentId && !initial) {
        navigate("/consultation", { replace: true });
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [appointmentId, navigate]);

  useEffect(() => { loadAppointments(); }, [loadAppointments]);

  const selectedAppointment = appointments.find((item) => item._id === selectedId);

  const loadHistoryPatients = useCallback(async () => {
    setHistoryError("");
    try {
      setHistoryPatients(await api.getConsultationPatients());
    } catch (requestError) {
      setHistoryError(requestError.message);
    }
  }, []);

  useEffect(() => { loadHistoryPatients(); }, [loadHistoryPatients]);

  useEffect(() => {
    let active = true;
    if (!historyPatientId) {
      setHistory([]);
      setHistoryError("");
      return () => { active = false; };
    }
    setHistoryLoading(true);
    setHistoryError("");
    api.getConsultations(historyPatientId)
      .then((data) => { if (active) setHistory(data); })
      .catch((requestError) => { if (active) setHistoryError(requestError.message); })
      .finally(() => { if (active) setHistoryLoading(false); });
    return () => { active = false; };
  }, [historyPatientId]);

  function chooseAppointment(event) {
    const nextId = event.target.value;
    setSelectedId(nextId);
    setForm({ bloodPressure: "", temperature: "", notes: "" });
    setNotice("");
    setError("");
    navigate(nextId ? `/consultation/${nextId}` : "/consultation", { replace: true });
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!selectedAppointment || selectedAppointment.status !== "Scheduled") {
      setError("Choose an appointment that is still scheduled.");
      return;
    }
    if (!form.bloodPressure.trim() || !form.temperature || Number(form.temperature) <= 0 || !form.notes.trim()) {
      setError("Enter blood pressure, a positive temperature, and consultation notes.");
      return;
    }

    setSaving(true);
    try {
      await api.createConsultation({
        appointment: selectedAppointment._id,
        bloodPressure: form.bloodPressure.trim(),
        temperature: Number(form.temperature),
        notes: form.notes.trim()
      });
      const completedPatientId = selectedAppointment.patient?._id;
      setNotice("Consultation completed. The appointment is now marked as completed.");
      setForm({ bloodPressure: "", temperature: "", notes: "" });
      setSelectedId("");
      if (completedPatientId) setHistoryPatientId(completedPatientId);
      await loadHistoryPatients();
      await loadAppointments();
      navigate("/consultation", { replace: true });
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
          <p className="eyebrow">PATIENT CARE</p>
          <h1>Consultation</h1>
          <p className="intro-copy">Record today’s visit and review a patient’s previous consultations.</p>
        </div>
      </div>

      <section className="card consult-card">
        <div className="card-heading">
          <div>
            <p className="eyebrow">ACTIVE VISIT</p>
            <h2>Consultation details <span className="count-pill">{pendingAppointments.length} pending</span></h2>
          </div>
          <button className="button button-small button-outline" type="button" onClick={loadAppointments} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh appointments"}
          </button>
        </div>
        {loading ? (
          <div className="loading-state"><span className="spinner" /> Loading appointment details…</div>
        ) : error && appointments.length === 0 ? (
          <p className="inline-message error" role="alert">{error}</p>
        ) : (
          <>
            <label className="field appointment-picker">
              <span>Choose a pending appointment</span>
              <select value={selectedId} onChange={chooseAppointment}>
                <option value="">Select a pending appointment</option>
                {pendingAppointments.map((appointment) => (
                  <option key={appointment._id} value={appointment._id}>
                    {appointment.patient?.name || "Unknown patient"} · {appointment.date} {appointment.time} · {appointment.doctor} · Scheduled
                  </option>
                ))}
              </select>
            </label>
            {pendingAppointments.length === 0 && (
              <p className="helper-text">There are no pending appointments. Book one from the Appointments page.</p>
            )}
            {selectedAppointment ? (
              <>
                <div className="visit-summary">
                  <div className="visit-patient">
                    <span className="avatar avatar-large">{selectedAppointment.patient?.name?.charAt(0).toUpperCase() || "?"}</span>
                    <div><span className="summary-label">PATIENT</span><strong>{selectedAppointment.patient?.name || "Unknown patient"}</strong><span className="muted-text">{selectedAppointment.patient?.gender || "—"} · {selectedAppointment.patient?.age ?? "—"} years · {selectedAppointment.patient?.phone || "—"}</span></div>
                  </div>
                  <div className="visit-meta"><span className="summary-label">DOCTOR</span><strong>{selectedAppointment.doctor}</strong></div>
                  <div className="visit-meta"><span className="summary-label">VISIT</span><strong>{selectedAppointment.date}</strong><span className="muted-text">{selectedAppointment.time}</span></div>
                  <div className="visit-meta"><span className="summary-label">STATUS</span><span className={`badge ${selectedAppointment.status === "Completed" ? "badge-completed" : "badge-scheduled"}`}>{selectedAppointment.status}</span></div>
                </div>
                {selectedAppointment.status === "Scheduled" ? (
                  <form className="consult-form" onSubmit={submit}>
                    <div className="section-divider"><span>Clinical notes</span></div>
                    <div className="consult-fields">
                      <label className="field">
                        <span>Blood pressure</span>
                        <input value={form.bloodPressure} onChange={(event) => setForm({ ...form, bloodPressure: event.target.value })} placeholder="e.g. 120/80 mmHg" required />
                      </label>
                      <label className="field">
                        <span>Temperature (°C)</span>
                        <input type="number" min="1" step="0.1" value={form.temperature} onChange={(event) => setForm({ ...form, temperature: event.target.value })} placeholder="e.g. 36.8" required />
                      </label>
                      <label className="field field-wide">
                        <span>Consultation notes</span>
                        <textarea rows="4" maxLength="1000" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Add a brief summary of the consultation…" required />
                      </label>
                    </div>
                    {notice && <p className="inline-message success" role="status">{notice}</p>}
                    {error && <p className="inline-message error" role="alert">{error}</p>}
                    <button className="button button-primary" type="submit" disabled={saving}>
                      {saving ? "Completing consultation…" : "Complete consultation"}
                    </button>
                  </form>
                ) : (
                  <>
                    {notice && <p className="inline-message success" role="status">{notice}</p>}
                    {error && <p className="inline-message error" role="alert">{error}</p>}
                    <p className="completed-note">This visit is complete. Its record is available in the consultation history below.</p>
                  </>
                )}
              </>
            ) : (
              <div className="empty-state compact-empty">
                <span className="empty-icon">♡</span>
                <strong>No appointment selected</strong>
                <span>Choose an appointment above, or book one from the Appointments page.</span>
              </div>
            )}
          </>
        )}
      </section>

      <section className="card history-card">
        <div className="card-heading history-heading">
          <div>
            <p className="eyebrow">PATIENT RECORD</p>
            <h2>Consultation history</h2>
          </div>
          <label className="field history-picker">
            <span className="sr-only">Select a patient with completed consultations</span>
            <select
              value={historyPatientId}
              onChange={(event) => setHistoryPatientId(event.target.value)}
              disabled={historyPatients.length === 0}
            >
              <option value="">Select a patient with completed consultations</option>
              {historyPatients.map((patient) => (
                <option key={patient._id} value={patient._id}>{patient.name}</option>
              ))}
            </select>
          </label>
        </div>
        {historyError ? (
          <p className="inline-message error" role="alert">{historyError}</p>
        ) : historyLoading ? (
          <div className="loading-state"><span className="spinner" /> Loading consultation history…</div>
        ) : !historyPatientId ? (
          <div className="empty-state compact-empty">
            <strong>{historyPatients.length ? "Select a patient" : "No completed consultations yet"}</strong>
            <span>{historyPatients.length ? "Choose a patient above to view their completed consultations." : "Completed consultation records will appear here."}</span>
          </div>
        ) : history.length === 0 ? (
          <div className="empty-state compact-empty"><strong>No previous consultations</strong><span>Completed visit records will appear here.</span></div>
        ) : (
          <div className="history-list">
            {history.map((item) => (
              <article className="history-item" key={item._id}>
                <div className="history-item-heading">
                  <div><strong>{item.doctor}</strong><span>{item.appointment?.date || "Visit"}{item.appointment?.time ? ` · ${item.appointment.time}` : ""}</span></div>
                  <span className="badge badge-completed">Completed</span>
                </div>
                <div className="vitals-row"><span><b>Blood pressure</b>{item.bloodPressure}</span><span><b>Temperature</b>{item.temperature} °C</span></div>
                <p className="history-notes">{item.notes}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
