import React from "react";

import { useTrip } from "../../context/TripContext";


const budgetOptions = [
  { value: "budget", label: "Budget", detail: "Guesthouses and local-value stays." },
  { value: "moderate", label: "Moderate", detail: "Balanced comfort and flexibility." },
  { value: "luxury", label: "Luxury", detail: "Premium stays and higher-spend picks." },
];

const paceOptions = [
  { value: "relaxed", label: "Relaxed", detail: "Leisure, culture, and breathing room." },
  { value: "moderate", label: "Moderate", detail: "Active but comfortable sightseeing." },
  { value: "fast", label: "Fast", detail: "Packed days and adventure-heavy routing." },
];


function OptionGroup({ title, options, selected, onSelect }) {
  return (
    <div className="option-group">
      <h2>{title}</h2>
      <div className="option-grid">
        {options.map((option) => (
          <button
            key={option.value}
            className={selected === option.value ? "option-card active" : "option-card"}
            onClick={() => onSelect(option.value)}
            type="button"
          >
            <strong>{option.label}</strong>
            <span>{option.detail}</span>
          </button>
        ))}
      </div>
    </div>
  );
}


export default function Step2Budget() {
  const { tripState, setTripState } = useTrip();

  return (
    <section className="wizard-panel">
      <p className="eyebrow">Step 2</p>
      <h1>Choose your comfort level and travel rhythm.</h1>
      <p className="section-lead">
        These settings influence daily activity load, accommodation picks, and itinerary scoring.
      </p>

      <OptionGroup
        title="Budget tier"
        options={budgetOptions}
        selected={tripState.budgetTier}
        onSelect={(value) => setTripState((current) => ({ ...current, budgetTier: value }))}
      />

      <OptionGroup
        title="Travel pace"
        options={paceOptions}
        selected={tripState.pace}
        onSelect={(value) => setTripState((current) => ({ ...current, pace: value }))}
      />

      <div className="button-row">
        <button
          className="secondary-button"
          onClick={() => setTripState((current) => ({ ...current, step: 1 }))}
        >
          Back
        </button>
        <button
          className="primary-button"
          onClick={() => setTripState((current) => ({ ...current, step: 3 }))}
        >
          Next Step
        </button>
      </div>
    </section>
  );
}
