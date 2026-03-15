import React from "react";

import { exportToPDF } from "../../utils/pdfExport";


export default function PDFExportButton({ itinerary }) {
  function handleExport() {
    exportToPDF(itinerary);
  }

  return (
    <button className="secondary-button" onClick={handleExport}>
      Download PDF
    </button>
  );
}

