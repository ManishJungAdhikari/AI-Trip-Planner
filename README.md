# Nepal Trip Planner

A full-stack travel planning application specifically designed for tourism in Nepal. This system generates weather-aware itineraries based on user preferences, budget, and travel pace.

## Features
- **Smart Itinerary Engine:** Rule-based recommendation system that accounts for local weather and traveler interests.
- **Budget Tiering:** Personalized suggestions for Budget, Moderate, and Luxury travelers.
- **Interactive Mapping:** Visualization of daily routes using Leaflet and OpenStreetMap.
- **Weather Integration:** Real-time forecast data via Open-Meteo.
- **User Journal:** Ability to save, edit, and export itineraries to PDF.

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Django, Django REST Framework
- **Database:** SQLite
- **Maps:** Leaflet.js

## Getting Started

### Backend Setup
1. Navigate to the `backend` directory.
2. Install dependencies: `pip install -r requirements.txt`
3. Run migrations: `python manage.py migrate`
4. Start the server: `python manage.py runserver`

### Frontend Setup
1. Navigate to the `frontend` directory.
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

## Data Sources
Activity and accommodation data is sourced from local datasets verified against Nepal Tourism Board (NTB) standards.
