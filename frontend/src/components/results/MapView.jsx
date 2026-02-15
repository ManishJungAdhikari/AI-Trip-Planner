import React from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix leaflet default icon issues with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// A component to automatically fit the map bounds to all markers
function ChangeMapBounds({ bounds }) {
  const map = useMap();
  React.useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [bounds, map]);
  return null;
}

function getValidStops(stops) {
  if (!stops?.length) return [];
  return stops
    .filter((stop) => Number.isFinite(Number(stop.lat)) && Number.isFinite(Number(stop.lng)))
    .map((stop, index) => ({ ...stop, index }));
}

function buildGoogleMapEmbed(points) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
  if (!apiKey || !points.length) {
    return "";
  }
  if (points.length === 1) {
    const point = points[0];
    const query = encodeURIComponent(`${point.lat},${point.lng}`);
    return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${query}`;
  }
  const origin = encodeURIComponent(`${points[0].lat},${points[0].lng}`);
  const destination = encodeURIComponent(`${points[points.length - 1].lat},${points[points.length - 1].lng}`);
  const waypointPoints = points.slice(1, -1).map((point) => `${point.lat},${point.lng}`);
  const waypoints = waypointPoints.length ? `&waypoints=${encodeURIComponent(waypointPoints.join("|"))}` : "";
  return `https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${origin}&destination=${destination}${waypoints}&mode=driving`;
}

export default function MapView({ activities }) {
  const points = getValidStops(activities);
  const googleMapUrl = buildGoogleMapEmbed(points);

  let center = [27.7172, 85.324]; // default Kathmandu
  let bounds = null;
  
  if (points.length > 0) {
    center = [points[0].lat, points[0].lng];
    const lats = points.map(p => p.lat);
    const lngs = points.map(p => p.lng);
    bounds = [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)]
    ];
  }

  const polylinePositions = points.map(p => [p.lat, p.lng]);

  const createNumberedIcon = (number) => {
    return L.divIcon({
      className: 'custom-leaflet-icon',
      html: `<div style="background-color: #d97746; color: white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${number}</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
  };

  return (
    <section className="map-card">
      <div className="map-header">
        <div>
          <h2>Day Route Map</h2>
          <p className="section-lead">
            {googleMapUrl
              ? "Google Maps route view for the selected day."
              : "Interactive street map outlining your path for the day."}
          </p>
        </div>
      </div>

      {googleMapUrl ? (
        <div className="map-embed-shell">
          <iframe
            title="Google Maps day route"
            className="map-embed"
            src={googleMapUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      ) : (
        <div className="map-embed-shell" style={{ height: "400px", borderRadius: "12px", overflow: "hidden", zIndex: 0 }}>
          {points.length > 0 ? (
            <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%", zIndex: 0 }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {bounds && <ChangeMapBounds bounds={bounds} />}
              <Polyline positions={polylinePositions} color="#2f5a47" weight={4} opacity={0.6} />
              
              {points.map((point) => (
                <Marker 
                  key={`${point.name}-${point.time}`} 
                  position={[point.lat, point.lng]}
                  icon={createNumberedIcon(point.index + 1)}
                >
                  <Popup>
                    <strong>{point.name}</strong><br />
                    {point.time}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          ) : (
             <div className="map-empty" style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#f5f5f5" }}>
              <strong>No mapped stops</strong>
              <span>This day is empty or missing coordinates.</span>
            </div>
          )}
        </div>
      )}

      <div className="map-legend">
        {points.map((point) => (
          <div key={`${point.name}-${point.time}-legend`} className="map-legend-item">
            <span className="route-index">{point.index + 1}</span>
            <div>
              <strong>{point.name}</strong>
              <small>
                {point.time} · {point.indoor_outdoor}
              </small>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
