const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers
      }
    });
  } catch {
    throw new Error("Could not reach the clinic server. Check that the backend is running.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "The request could not be completed.");
  }
  return data;
}

export const api = {
  getPatients: (search = "") =>
    request(`/patients${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  createPatient: (patient) =>
    request("/patients", { method: "POST", body: JSON.stringify(patient) }),
  getTodayAppointments: () => request("/appointments/today"),
  getAppointments: () => request("/appointments"),
  getPendingAppointments: () => request("/appointments/pending"),
  createAppointment: (appointment) =>
    request("/appointments", { method: "POST", body: JSON.stringify(appointment) }),
  getConsultationPatients: () => request("/consultations/patients"),
  getConsultations: (patientId) =>
    request(`/consultations/patient/${encodeURIComponent(patientId)}`),
  createConsultation: (consultation) =>
    request("/consultations", { method: "POST", body: JSON.stringify(consultation) })
};
