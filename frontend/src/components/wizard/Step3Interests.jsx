import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useTrip } from "../../context/TripContext";
import { generateItinerary } from "../../services/api";
import LoadingSpinner from "../shared/LoadingSpinner";


const interestOptions = [
  "History",
  "Art",
  "Food",
  "Nature",
  "Shopping",
  "Nightlife",
  "Adventure",
  "Relaxation",
  "Family Friendly",
];


export default function Step3Interests({ onRequireAuth, resumeGenerateToken, onResumeHandled }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { tripState, setTripState, loading, setLoading, error, setError } = useTrip();

  function toggleInterest(interest) {
    setTripState((current) => {
      const exists = current.interests.includes(interest);
      return {
        ...current,
        interests: exists
          ? current.interests.filter((item) => item !== interest)
          : [...current.interests, interest],
      };
    });
  }

  async function handleGenerate() {
    if (tripState.interests.length === 0) {
      setError("Select at least one interest before generating the itinerary.");
      return;
    }

    if (!isAuthenticated) {
      setError("");
      if (onRequireAuth) {
        onRequireAuth();
      }
      return;
    }

    setError("");
    setLoading(true);

    try {
      const itinerary = await generateItinerary({
        destination: tripState.destination,
        start_date: tripState.startDate,
        duration_days: tripState.durationDays,
        travellers: tripState.travellers,
        budget_tier: tripState.budgetTier,
        pace: tripState.pace,
        interests: tripState.interests,
      });

      setTripState((current) => ({
        ...current,
        generatedItinerary: itinerary,
        activeDay: 1,
      }));
      navigate("/itinerary");
    } catch (requestError) {
      const message =
        requestError?.response?.data?.detail ||
        "The itinerary request failed. Make sure the Django server is running on port 8000.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!resumeGenerateToken || !isAuthenticated || loading) {
      return;
    }
    handleGenerate();
    if (onResumeHandled) {
      onResumeHandled();
    }
  }, [resumeGenerateToken, isAuthenticated]);

  return (
    <section className="wizard-panel">
      <p className="eyebrow">Step 3</p>
      <h1>Tell the planner what kind of journey you want.</h1>
      <p className="section-lead">
        Pick multiple interests. The backend will score matching places and shape the daily flow.
      </p>

      <div className="tag-grid">
        {interestOptions.map((interest) => {
          const active = tripState.interests.includes(interest);
          return (
            <button
              key={interest}
              type="button"
              className={active ? "tag-button active" : "tag-button"}
              onClick={() => toggleInterest(interest)}
            >
              {interest}
            </button>
          );
        })}
      </div>

      {error ? <div className="error-banner">{error}</div> : null}
      {loading ? <LoadingSpinner /> : null}

      <div className="button-row">
        <button
          className="secondary-button"
          onClick={() => setTripState((current) => ({ ...current, step: 2 }))}
          disabled={loading}
        >
          Back
        </button>
        <button className="primary-button" onClick={handleGenerate} disabled={loading}>
          Generate Itinerary
        </button>
      </div>
    </section>
  );
}
