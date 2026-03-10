import React from "react";

import { formatUsdAsNpr } from "../../utils/currency";


export default function AccommodationSection({ accommodations }) {
  return (
    <section className="info-section">
      <div className="section-heading">
        <h2>Accommodation Picks</h2>
        <p className="section-lead">Curated to match the current budget tier and destination.</p>
      </div>

      <div className="accommodation-grid">
        {accommodations.map((stay) => (
          <article key={stay.name} className="stay-card rich">
            <div className="stay-topline">
              <strong>{stay.name}</strong>
              <span>{formatUsdAsNpr(stay.price_per_night)}/night</span>
            </div>
            <small>{stay.description}</small>
            <div className="stay-meta">
              <span>{stay.rating}/5 rating</span>
              <span>
                {stay.lat}, {stay.lng}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
