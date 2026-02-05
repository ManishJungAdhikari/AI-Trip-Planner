import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { TripProvider } from "./context/TripContext";
import { useTrip } from "./context/TripContext";
import HomePage from "./pages/HomePage";
import ItineraryPage from "./pages/ItineraryPage";
import JournalPage from "./pages/JournalPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AccountPage from "./pages/AccountPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

function AppRoutes() {
  const { tripState } = useTrip();

  return (
    <div className={tripState.darkMode ? "app-theme dark" : "app-theme"}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/itinerary" element={<ItineraryPage />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TripProvider>
        <AppRoutes />
      </TripProvider>
    </AuthProvider>
  );
}
