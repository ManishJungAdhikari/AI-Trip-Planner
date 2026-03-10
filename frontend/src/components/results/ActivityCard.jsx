import React from "react";

import { formatUsdAsNpr } from "../../utils/currency";


export default function ActivityCard({
  activity,
  index,
  isFirst,
  isLast,
  onMove,
  onDelete,
  onToggleComplete,
  onNoteChange,
}) {
  return (
    <article className={`activity-card ${activity.completed ? "completed" : ""}`}>
      <div className="activity-time">{activity.time}</div>
      <div className="activity-content">
        <div className="activity-topline">
          <h3>{activity.name}</h3>
          <div className="activity-actions">
            <span className="indoor-tag">{activity.indoor_outdoor}</span>
            <button
              className={`icon-button ${activity.completed ? "success-button" : ""}`}
              onClick={() => onToggleComplete(index)}
              aria-label={`Mark ${activity.name} as ${activity.completed ? "not done" : "done"}`}
            >
              {activity.completed ? "Done" : "Mark Done"}
            </button>
            <button
              className="icon-button"
              onClick={() => onMove(index, "up")}
              disabled={isFirst}
              aria-label={`Move ${activity.name} up`}
            >
              Up
            </button>
            <button
              className="icon-button"
              onClick={() => onMove(index, "down")}
              disabled={isLast}
              aria-label={`Move ${activity.name} down`}
            >
              Down
            </button>
            <button
              className="icon-button"
              onClick={() => onDelete(index)}
              aria-label={`Delete ${activity.name}`}
            >
              Delete
            </button>
          </div>
        </div>
        <p>{activity.description}</p>
        <div className="activity-meta">
          <span>{activity.duration_hours} hrs</span>
          <span>{formatUsdAsNpr(activity.cost_usd)}</span>
          <span>{activity.getting_there}</span>
        </div>
        <label className="activity-note">
          <span>Personal note</span>
          <textarea
            value={activity.personal_note || ""}
            onChange={(event) => onNoteChange(index, event.target.value)}
            placeholder="Add a reminder, meeting point, food spot, or anything you want to remember."
            rows={3}
          />
        </label>
      </div>
    </article>
  );
}
