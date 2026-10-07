import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);
const SESSION_KEY = "carepoint_session";
const TOKEN_KEY = "carepoint_session_token";

function getSavedSession() {
  try {
    const saved = localStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(getSavedSession);

  useEffect(() => {
    function handleUnauthorized() {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(TOKEN_KEY);
      setSession(null);
    }
    window.addEventListener("carepoint:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("carepoint:unauthorized", handleUnauthorized);
  }, []);

  const value = useMemo(() => ({
    doctor: session?.doctor || null,
    isAuthenticated: Boolean(session?.token && session?.doctor),
    signIn(nextSession) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
      localStorage.setItem(TOKEN_KEY, nextSession.token);
      setSession(nextSession);
    },
    signOut() {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(TOKEN_KEY);
      setSession(null);
    }
  }), [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider.");
  return context;
}
