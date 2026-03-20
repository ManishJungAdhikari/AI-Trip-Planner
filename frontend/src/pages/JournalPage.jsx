import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AuthModal from "../components/shared/AuthModal";
import Navbar from "../components/shared/Navbar";
import { useAuth } from "../context/AuthContext";
import { useTrip } from "../context/TripContext";
import { deleteTrip, duplicateTrip, fetchTrips, updateTripMetadata } from "../services/api";


export default function JournalPage() {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const { setTripState } = useTrip();
  const [authOpen, setAuthOpen] = useState(false);
  const [trips, setTrips] = useState([]);
  const [status, setStatus] = useState("Loading your saved journeys...");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [editingTripId, setEditingTripId] = useState(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftNote, setDraftNote] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let active = true;

    fetchTrips(token)
      .then((items) => {
        if (!active) {
          return;
        }
        setTrips(items);
        setStatus(items.length ? "" : "No saved trips yet.");
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setStatus("Could not load saved trips.");
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated, token]);

  if (!isAuthenticated) {
    return (
      <main className="page-shell">
        <Navbar onOpenAuth={() => setAuthOpen(true)} />
        <section className="wizard-panel">
          <p className="eyebrow">Journal</p>
          <h1>Your saved journeys live here.</h1>
          <p className="section-lead">
            Log in to view trips saved in the local app database and reopen them anytime.
          </p>
          <button className="primary-button" onClick={() => setAuthOpen(true)}>
            Log In To View Journal
          </button>
        </section>
        <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      </main>
    );
  }

  async function handleDelete(tripId) {
    try {
      await deleteTrip(tripId, token);
      const nextTrips = trips.filter((trip) => trip.id !== tripId);
      setTrips(nextTrips);
      setStatus(nextTrips.length ? "" : "No saved trips yet.");
    } catch {
      setStatus("Delete failed. Try again.");
    }
  }

  async function handleDuplicate(tripId) {
    try {
      const duplicatedTrip = await duplicateTrip(tripId, token);
      setTrips((current) => [duplicatedTrip, ...current]);
      setStatus("Saved trip duplicated.");
    } catch {
      setStatus("Could not duplicate that trip.");
    }
  }

  function startEditing(trip) {
    setEditingTripId(trip.id);
    setDraftTitle(trip.itinerary_json?.custom_title || "");
    setDraftNote(trip.itinerary_json?.trip_note || "");
    setStatus("");
  }

  function cancelEditing() {
    setEditingTripId(null);
    setDraftTitle("");
    setDraftNote("");
  }

  async function handleSaveMetadata(tripId) {
    try {
      const updatedTrip = await updateTripMetadata(
        tripId,
        { custom_title: draftTitle.trim(), trip_note: draftNote.trim() },
        token
      );
      setTrips((current) =>
        current.map((trip) => (trip.id === tripId ? updatedTrip : trip))
      );
      setStatus("Saved trip details updated.");
      cancelEditing();
    } catch {
      setStatus("Could not update that saved trip.");
    }
  }

  function handleView(trip) {
    setTripState((current) => ({
      ...current,
      generatedItinerary: trip.itinerary_json,
      activeDay: 1,
      destination: trip.destination,
      startDate: trip.start_date,
      durationDays: trip.duration_days,
      interests: trip.preferences_json?.interests || current.interests,
      travellers: trip.preferences_json?.travellers || current.travellers,
      budgetTier: trip.preferences_json?.budgetTier || current.budgetTier,
      pace: trip.preferences_json?.pace || current.pace,
    }));
    navigate("/itinerary");
  }

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredTrips = trips
    .filter((trip) => trip.destination.toLowerCase().includes(normalizedQuery))
    .sort((left, right) => {
      if (sortOrder === "longest") {
        return right.duration_days - left.duration_days;
      }
      if (sortOrder === "shortest") {
        return left.duration_days - right.duration_days;
      }

      const leftDate = new Date(left.created_at).getTime();
      const rightDate = new Date(right.created_at).getTime();
      return sortOrder === "oldest" ? leftDate - rightDate : rightDate - leftDate;
    });

  const totalDaysPlanned = trips.reduce((sum, trip) => sum + trip.duration_days, 0);
  const uniqueDestinations = new Set(
    trips.map((trip) => trip.destination.toLowerCase()),
  ).size;

  return (
    <main className="page-shell">
      <Navbar onOpenAuth={() => setAuthOpen(true)} />
      <section className="results-hero">
        <p className="eyebrow">Journal</p>
        <h1>Saved trips</h1>
        <p>These are stored in your local app database and tied to your logged-in account.</p>
      </section>

      <section className="summary-grid">
        <article className="summary-card">
          <span>Saved plans</span>
          <strong>{trips.length}</strong>
          <small>Trips currently in your journal</small>
        </article>
        <article className="summary-card">
          <span>Destinations</span>
          <strong>{uniqueDestinations}</strong>
          <small>Unique places across all saved plans</small>
        </article>
        <article className="summary-card">
          <span>Total days</span>
          <strong>{totalDaysPlanned}</strong>
          <small>Combined trip length saved so far</small>
        </article>
      </section>

      <section className="journal-toolbar">
        <label className="field">
          <span>Search destination</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Try Kathmandu or Pokhara"
          />
        </label>
        <label className="field">
          <span>Sort by</span>
          <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
            <option value="newest">Newest saved</option>
            <option value="oldest">Oldest saved</option>
            <option value="longest">Longest trip</option>
            <option value="shortest">Shortest trip</option>
          </select>
        </label>
      </section>

      {status ? <div className="info-banner">{status}</div> : null}

      <section className="journal-grid">
        {!status && filteredTrips.length === 0 ? (
          <article className="journal-card journal-empty">
            <div>
              <h2>No matching trips</h2>
              <p className="status-note">Try a different destination search or sort option.</p>
            </div>
          </article>
        ) : null}

        {filteredTrips.map((trip) => (
          <article key={trip.id} className="journal-card">
            <div>
              {editingTripId === trip.id ? (
                <div className="journal-editor">
                  <label className="field">
                    <span>Trip title</span>
                    <input
                      type="text"
                      value={draftTitle}
                      onChange={(event) => setDraftTitle(event.target.value)}
                      placeholder="Give this saved trip a memorable title"
                    />
                  </label>
                  <label className="field">
                    <span>Trip note</span>
                    <textarea
                      value={draftNote}
                      onChange={(event) => setDraftNote(event.target.value)}
                      placeholder="Add a reminder or note for this saved plan"
                      rows={3}
                    />
                  </label>
                </div>
              ) : (
                <>
                  <h2>{trip.itinerary_json?.custom_title || trip.destination}</h2>
                  <p>
                    {trip.start_date} · {trip.duration_days} day(s)
                  </p>
                  {trip.itinerary_json?.custom_title ? (
                    <p className="status-note journal-meta">Destination: {trip.destination}</p>
                  ) : null}
                  {trip.itinerary_json?.trip_note ? (
                    <p className="status-note journal-meta">{trip.itinerary_json.trip_note}</p>
                  ) : null}
                  <p className="status-note journal-meta">
                    Saved {new Date(trip.created_at).toLocaleDateString()}
                  </p>
                </>
              )}
            </div>
            <div className="journal-actions">
              {editingTripId === trip.id ? (
                <>
                  <button className="primary-button" onClick={() => handleSaveMetadata(trip.id)}>
                    Save Changes
                  </button>
                  <button className="secondary-button" onClick={cancelEditing}>
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button className="primary-button" onClick={() => handleView(trip)}>
                    View
                  </button>
                  <button className="secondary-button" onClick={() => handleDuplicate(trip.id)}>
                    Duplicate
                  </button>
                  <button className="secondary-button" onClick={() => startEditing(trip)}>
                    Edit
                  </button>
                  <button className="secondary-button" onClick={() => handleDelete(trip.id)}>
                    Delete
                  </button>
                </>
              )}
            </div>
          </article>
        ))}
      </section>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </main>
  );
}
