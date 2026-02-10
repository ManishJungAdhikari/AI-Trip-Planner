import React, { createContext, useContext, useEffect, useMemo, useState } from "react";


const AuthContext = createContext(null);
const STORAGE_KEY = "ai-trip-planner-auth";


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return;
    }
    try {
      const parsed = JSON.parse(saved);
      setUser(parsed.user || null);
      setToken(parsed.token || "");
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  function persistAuth(nextUser, nextToken) {
    setUser(nextUser);
    setToken(nextToken);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: nextUser, token: nextToken }));
  }

  function updateUser(nextUser) {
    setUser(nextUser);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: nextUser, token }));
  }

  function logout() {
    setUser(null);
    setToken("");
    window.localStorage.removeItem(STORAGE_KEY);
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      persistAuth,
      updateUser,
      logout,
    }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
