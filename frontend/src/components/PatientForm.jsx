import React from "react";
import { useState } from "react";

const initialForm = { name: "", gender: "", age: "", phone: "" };

export default function PatientForm({ onCreate }) {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    const age = Number(form.age);
    if (!form.name.trim() || !form.gender || !Number.isInteger(age) || age < 1 || !/^\d{10}$/.test(form.phone)) {
      setError("Enter a name, gender, positive whole-number age, and 10-digit phone number.");
      return;
    }

    setSaving(true);
    try {
      await onCreate({ ...form, age });
      setForm(initialForm);
      setMessage("Patient registered successfully.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card">
      <div className="card-heading">
        <div>
          <p className="eyebrow">PATIENT DETAILS</p>
          <h2>Register a patient</h2>
        </div>
        <span className="icon-tile" aria-hidden="true">＋</span>
      </div>
      <form className="form-grid" onSubmit={submit}>
        <label className="field field-wide">
          <span>Full name</span>
          <input name="name" value={form.name} onChange={updateField} placeholder="e.g. Asha Desai" required />
        </label>
        <label className="field">
          <span>Gender</span>
          <select name="gender" value={form.gender} onChange={updateField} required>
            <option value="">Select gender</option>
            <option>Female</option>
            <option>Male</option>
            <option>Other</option>
          </select>
        </label>
        <label className="field">
          <span>Age</span>
          <input name="age" type="number" min="1" step="1" value={form.age} onChange={updateField} placeholder="Age in years" required />
        </label>
        <label className="field field-wide">
          <span>Phone number</span>
          <input name="phone" type="tel" inputMode="numeric" maxLength="10" value={form.phone} onChange={updateField} placeholder="10-digit phone number" required />
        </label>
        {message && <p className="inline-message success field-wide" role="status">{message}</p>}
        {error && <p className="inline-message error field-wide" role="alert">{error}</p>}
        <button className="button button-primary field-wide" type="submit" disabled={saving}>
          {saving ? "Saving patient…" : "Add patient"}
        </button>
      </form>
    </section>
  );
}
