import React, { useMemo, useState } from "react";

import { useTrip } from "../../context/TripContext";


export default function Step1Destination() {
  const { tripState, setTripState } = useTrip();
  const [errors, setErrors] = useState({});

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  function handleContinue() {
    const nextErrors = {};

    if (!tripState.destination.trim()) {
      nextErrors.destination = "Please choose a Nepal destination.";
    }
    if (tripState.durationDays < 1 || tripState.durationDays > 30) {
      nextErrors.durationDays = "Duration must be between 1 and 30 days.";
    }
    if (!tripState.startDate) {
      nextErrors.startDate = "Please choose a trip start date.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setTripState((current) => ({ ...current, step: 2 }));
  }

  return (
    <section className="wizard-panel wizard-grid">
      <div className="story-copy">
        <p className="eyebrow">Step 1</p>
        <h1>Which part of Nepal is calling you?</h1>
        <p>
          Start with the destination and trip timing. The planner will use this to shape pacing,
          weather context, and the first draft itinerary.
        </p>
        <div className="highlight-card">
          <strong>Good test destinations</strong>
          <span>Kathmandu, Pokhara, Chitwan, Lumbini, Bhaktapur, Patan, Mustang</span>
        </div>
      </div>

      <div className="form-card">
        <label className="field">
          <span>Destination</span>
          <input
            type="text"
            placeholder="Kathmandu"
            value={tripState.destination}
            onChange={(event) =>
              setTripState((current) => ({ ...current, destination: event.target.value }))
            }
          />
          {errors.destination ? <small className="field-error">{errors.destination}</small> : null}
        </label>

        <label className="field">
          <span>Start date</span>
          <input
            type="date"
            min={today}
            value={tripState.startDate}
            onChange={(event) =>
              setTripState((current) => ({ ...current, startDate: event.target.value }))
            }
          />
          {errors.startDate ? <small className="field-error">{errors.startDate}</small> : null}
        </label>

        <div className="field-row">
          <label className="field">
            <span>Duration (days)</span>
            <input
              type="number"
              min="1"
              max="30"
              value={tripState.durationDays}
              onChange={(event) =>
                setTripState((current) => ({
                  ...current,
                  durationDays: Number(event.target.value),
                }))
              }
            />
            {errors.durationDays ? (
              <small className="field-error">{errors.durationDays}</small>
            ) : null}
          </label>

          <label className="field">
            <span>Travellers</span>
            <input
              type="number"
              min="1"
              max="20"
              value={tripState.travellers}
              onChange={(event) =>
                setTripState((current) => ({
                  ...current,
                  travellers: Number(event.target.value),
                }))
              }
            />
          </label>
        </div>

        <button className="primary-button" onClick={handleContinue}>
          Continue Journey
        </button>
      </div>
    </section>
  );
}
