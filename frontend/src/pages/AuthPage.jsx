import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

export default function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (isRegister && !/^\d{10}$/.test(form.phone)) {
      setError("Enter a 10-digit phone number.");
      return;
    }
    if (isRegister && form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSaving(true);
    try {
      const session = isRegister
        ? await api.registerDoctor(form)
        : await api.loginDoctor({ email: form.email, password: form.password });
      signIn(session);
      navigate("/patients", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="card auth-card">
        <div className="auth-brand">
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
        </div>
        <p className="eyebrow">{isRegister ? "DOCTOR ACCOUNT" : "DOCTOR PORTAL"}</p>
        <h1>{isRegister ? "Create your account" : "Welcome back"}</h1>
        <p className="auth-copy">
          {isRegister ? "Register to securely access the clinic workspace." : "Sign in to continue to your clinic workspace."}
        </p>

        <form className="auth-form" onSubmit={submit}>
          {isRegister && (
            <label className="field">
              <span>Full name</span>
              <input name="name" value={form.name} onChange={update} placeholder="Dr. Asha Desai" autoComplete="name" required />
            </label>
          )}
          <label className="field">
            <span>Email address</span>
            <input name="email" type="email" value={form.email} onChange={update} placeholder="doctor@clinic.com" autoComplete="email" required />
          </label>
          {isRegister && (
            <label className="field">
              <span>Phone number</span>
              <input name="phone" type="tel" inputMode="numeric" maxLength="10" value={form.phone} onChange={update} placeholder="10-digit phone number" autoComplete="tel" required />
            </label>
          )}
          <label className="field">
            <span>Password</span>
            <input name="password" type="password" value={form.password} onChange={update} placeholder={isRegister ? "At least 8 characters" : "Enter your password"} autoComplete={isRegister ? "new-password" : "current-password"} required minLength={isRegister ? 8 : undefined} />
          </label>
          {error && <p className="inline-message error" role="alert">{error}</p>}
          <button className="button button-primary auth-submit" type="submit" disabled={saving}>
            {saving ? "Please wait…" : isRegister ? "Create doctor account" : "Sign in"}
          </button>
        </form>
        <p className="auth-switch">
          {isRegister ? "Already registered?" : "New doctor?"}{" "}
          <Link to={isRegister ? "/login" : "/register"}>{isRegister ? "Sign in" : "Create an account"}</Link>
        </p>
      </section>
      <p className="auth-footer">CarePoint Clinic <span>·</span> Simple care, well managed</p>
    </main>
  );
}
