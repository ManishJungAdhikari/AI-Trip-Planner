import React from "react";

import { formatUsdAsNpr } from "../../utils/currency";


function SpendBar({ label, value, total, tone }) {
  const width = total ? `${Math.max((value / total) * 100, 8)}%` : "8%";
  return (
    <div className="metric-row">
      <div className="metric-label">
        <span>{label}</span>
        <strong>{formatUsdAsNpr(value)}</strong>
      </div>
      <div className="metric-bar-shell">
        <div className={`metric-bar ${tone}`} style={{ width }} />
      </div>
    </div>
  );
}


export default function AnalyticsSection({ itinerary }) {
  const activitySpend = itinerary.days.reduce(
    (sum, day) => sum + day.activities.reduce((inner, activity) => inner + Number(activity.cost_usd || 0), 0),
    0
  );
  const staySpend = itinerary.accommodation[0]
    ? Number(itinerary.accommodation[0].price_per_night || 0) * Math.max(itinerary.days.length - 1, 1)
    : 0;
  const total = activitySpend + staySpend || 1;
  const maxActivities = Math.max(...itinerary.days.map((day) => day.activities.length), 1);

  return (
    <section className="info-section">
      <div className="section-heading">
        <h2>Trip Analytics</h2>
        <p className="section-lead">A quick look at spend balance and day-by-day activity rhythm.</p>
      </div>

      <div className="analytics-grid">
        <article className="analytics-card">
          <h3>Estimated Spend Mix</h3>
          <SpendBar label="Activities" value={activitySpend} total={total} tone="activities" />
          <SpendBar label="Stay" value={staySpend} total={total} tone="stay" />
        </article>

        <article className="analytics-card">
          <h3>Daily Rhythm</h3>
          <div className="rhythm-list">
            {itinerary.days.map((day) => (
              <div key={day.day} className="rhythm-row">
                <span>Day {String(day.day).padStart(2, "0")}</span>
                <div className="rhythm-bar-shell">
                  <div
                    className="rhythm-bar"
                    style={{ width: `${Math.max((day.activities.length / maxActivities) * 100, 10)}%` }}
                  />
                </div>
                <strong>{day.activities.length}</strong>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
