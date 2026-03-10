import React from "react";


export default function WeatherCard({ weather }) {
  return (
    <div className="summary-card">
      <span>Weather</span>
      <strong>{weather.description}</strong>
      <small>
        {weather.temp_c == null ? weather.note : `${weather.temp_c}°C · ${weather.note}`}
      </small>
      {weather.forecast?.length ? (
        <div className="forecast-grid">
          {weather.forecast.map((day) => (
            <div key={`${day.label}-${day.description}`} className="forecast-chip">
              <strong>{day.label}</strong>
              <span>{day.description}</span>
              <small>{day.temp_c == null ? "No temp" : `${day.temp_c}°C`}</small>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
