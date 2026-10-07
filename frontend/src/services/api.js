const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

async function request(path, options = {}) {
  let response;
  try {
    const token = localStorage.getItem("carepoint_session_token");
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      }
    });
  } catch {
    throw new Error("Could not reach the clinic server. Check that the backend is running.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && !path.startsWith("/auth/")) {
      window.dispatchEvent(new Event("carepoint:unauthorized"));
    }
    throw new Error(data.message || "The request could not be completed.");
  }
  return data;
}

export const api = {
  registerDoctor: (details) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(details) }),
  loginDoctor: (credentials) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
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
