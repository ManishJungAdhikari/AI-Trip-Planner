import React from "react";


export default function CuratorsNote({ note }) {
  return (
    <section className="info-section">
      <div className="section-heading">
        <h2>Curator's Note</h2>
      </div>
      <div className="curator-card">
        <p>{note}</p>
      </div>
    </section>
  );
}

