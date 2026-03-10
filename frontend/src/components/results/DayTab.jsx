import React from "react";


export default function DayTab({ day, active, onClick }) {
  return (
    <button className={active ? "day-tab active" : "day-tab"} onClick={onClick}>
      Day {String(day.day).padStart(2, "0")}
    </button>
  );
}

