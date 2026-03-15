import { formatUsdAsNpr } from "./currency";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


export function exportToPDF(itinerary) {
  const printWindow = window.open("", "_blank", "width=900,height=1200");
  if (!printWindow) {
    return false;
  }

  const daysHtml = itinerary.days
    .map(
      (day) => `
        <section class="day-block">
          <h2>Day ${String(day.day).padStart(2, "0")} · ${escapeHtml(day.weekday)} (${escapeHtml(day.date)})</h2>
          <p class="theme">${escapeHtml(day.theme)}</p>
          ${day.activities
            .map(
              (activity) => `
                <article class="activity">
                  <div class="time">${escapeHtml(activity.time)}</div>
                  <div class="content">
                    <h3>${escapeHtml(activity.name)}</h3>
                    <p>${escapeHtml(activity.description)}</p>
                    <p class="meta">
                      ${escapeHtml(activity.indoor_outdoor)} · ${escapeHtml(activity.duration_hours)} hrs · ${escapeHtml(formatUsdAsNpr(activity.cost_usd))}
                    </p>
                    <p class="meta">${escapeHtml(activity.getting_there)}</p>
                  </div>
                </article>
              `
            )
            .join("")}
        </section>
      `
    )
    .join("");

  printWindow.document.write(`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>${escapeHtml(itinerary.destination)} itinerary</title>
        <style>
          body {
            font-family: "Avenir Next", "Segoe UI", sans-serif;
            margin: 40px;
            color: #1d2a24;
          }
          h1, h2, h3, p {
            margin: 0;
          }
          .header {
            border-bottom: 2px solid #d9c7af;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }
          .summary {
            display: grid;
            gap: 8px;
            margin-top: 12px;
            color: #5a5e56;
          }
          .day-block {
            margin-top: 28px;
            page-break-inside: avoid;
          }
          .theme {
            margin-top: 6px;
            color: #8a3f17;
            font-weight: 700;
          }
          .activity {
            display: grid;
            grid-template-columns: 90px 1fr;
            gap: 12px;
            padding: 12px 0;
            border-bottom: 1px solid #eee3d2;
          }
          .time {
            font-weight: 800;
            color: #8a3f17;
          }
          .content {
            display: grid;
            gap: 6px;
          }
          .meta {
            color: #5a5e56;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <header class="header">
          <h1>${escapeHtml(itinerary.destination)} Trip Plan</h1>
          <p>${escapeHtml(itinerary.summary)}</p>
          <div class="summary">
            <span>Weather: ${escapeHtml(itinerary.weather.description)}${
              itinerary.weather.temp_c == null ? "" : `, ${escapeHtml(itinerary.weather.temp_c)}°C`
            }</span>
            <span>Estimated budget: ${escapeHtml(formatUsdAsNpr(itinerary.estimated_budget_usd))}</span>
            <span>Curator's note: ${escapeHtml(itinerary.curators_note)}</span>
          </div>
        </header>
        ${daysHtml}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  return true;
}
