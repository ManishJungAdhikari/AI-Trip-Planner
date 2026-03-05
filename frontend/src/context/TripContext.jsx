import React, { createContext, useContext, useEffect, useMemo, useState } from "react";


const TripContext = createContext(null);
const STORAGE_KEY = "ai-trip-planner-trip-state";

const initialTripState = {
  step: 1,
  destination: "",
  startDate: "",
  durationDays: 3,
  travellers: 1,
  budgetTier: "moderate",
  pace: "moderate",
  interests: ["History", "Food"],
  generatedItinerary: null,
  activeDay: 1,
  darkMode: false,
};


export function TripProvider({ children }) {
  const [tripState, setTripState] = useState(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        return initialTripState;
      }
      const parsed = JSON.parse(saved);
      return {
        ...initialTripState,
        ...parsed,
      };
    } catch {
      return initialTripState;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const {
      generatedItinerary,
      ...persistedState
    } = tripState;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedState));
  }, [tripState]);

  const value = useMemo(
    () => ({
      tripState,
      setTripState,
      loading,
      setLoading,
      error,
      setError,
      resetTrip: () => {
        setTripState(initialTripState);
        setError("");
        window.localStorage.removeItem(STORAGE_KEY);
      },
    }),
    [tripState, loading, error]
  );

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}


export function useTrip() {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error("useTrip must be used within a TripProvider");
  }
  return context;
}
