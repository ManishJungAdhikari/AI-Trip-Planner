from django.conf import settings
from django.core.cache import cache
import requests

CACHE_TTL_SECONDS = 60 * 30

def fallback_weather(city):
    return {
        "description": "Partly Cloudy",
        "temp_c": 22,
        "rain_expected": False,
        "note": f"Live weather API key missing or unreachable. Using seasonal fallback forecast for {city}.",
        "forecast": [
            {"label": "Next Day", "description": "Sunny", "temp_c": 24, "rain_expected": False},
            {"label": "Day 2", "description": "Clear Sky", "temp_c": 23, "rain_expected": False},
            {"label": "Day 3", "description": "Light Showers", "temp_c": 19, "rain_expected": True},
            {"label": "Day 4", "description": "Overcast", "temp_c": 20, "rain_expected": False},
        ],
    }

def get_wmo_description(code):
    mapping = {
        0: ("Clear Sky", False),
        1: ("Mainly Clear", False),
        2: ("Partly Cloudy", False),
        3: ("Overcast", False),
        45: ("Fog", False),
        48: ("Depositing Rime Fog", False),
        51: ("Light Drizzle", True),
        53: ("Moderate Drizzle", True),
        55: ("Dense Drizzle", True),
        56: ("Light Freezing Drizzle", True),
        57: ("Dense Freezing Drizzle", True),
        61: ("Slight Rain", True),
        63: ("Moderate Rain", True),
        65: ("Heavy Rain", True),
        66: ("Light Freezing Rain", True),
        67: ("Heavy Freezing Rain", True),
        71: ("Slight Snow", True),
        73: ("Moderate Snow", True),
        75: ("Heavy Snow", True),
        77: ("Snow Grains", True),
        80: ("Slight Rain Showers", True),
        81: ("Moderate Rain Showers", True),
        82: ("Violent Rain Showers", True),
        85: ("Slight Snow Showers", True),
        86: ("Heavy Snow Showers", True),
        95: ("Thunderstorm", True),
        96: ("Thunderstorm with Slight Hail", True),
        99: ("Thunderstorm with Heavy Hail", True),
    }
    return mapping.get(code, ("Unknown", False))


def fetch_weather_bundle(city):
    city_key = city.strip().lower()
    cache_key = f"weather-openmeteo:{city_key}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    try:
        # Step 1: Geocoding
        geo_res = requests.get(
            f"https://geocoding-api.open-meteo.com/v1/search",
            params={"name": city, "count": 1, "language": "en", "format": "json"},
            timeout=8
        )
        geo_res.raise_for_status()
        geo_data = geo_res.json()
        
        if not geo_data.get("results"):
            raise ValueError("City not found in geocoding")

        lat = geo_data["results"][0]["latitude"]
        lng = geo_data["results"][0]["longitude"]

        # Step 2: Weather Data
        weather_res = requests.get(
            f"https://api.open-meteo.com/v1/forecast",
            params={
                "latitude": lat,
                "longitude": lng,
                "current": "temperature_2m,weather_code",
                "daily": "weather_code,temperature_2m_max",
                "timezone": "auto"
            },
            timeout=8
        )
        weather_res.raise_for_status()
        data = weather_res.json()

        current_code = data["current"]["weather_code"]
        current_desc, current_rain = get_wmo_description(current_code)
        
        forecast = []
        daily = data.get("daily", {})
        times = daily.get("time", [])
        codes = daily.get("weather_code", [])
        temps = daily.get("temperature_2m_max", [])

        # Skip the first day (today) for the forecast chips
        for i in range(1, min(6, len(times))):
            f_code = codes[i]
            f_desc, f_rain = get_wmo_description(f_code)
            forecast.append({
                "label": f"Day {i}",
                "description": f_desc,
                "temp_c": temps[i],
                "rain_expected": f_rain,
            })

        bundle = {
            "description": current_desc,
            "temp_c": data["current"]["temperature_2m"],
            "rain_expected": current_rain,
            "note": f"Carry a flexible layer in {city} and re-check conditions before long outdoor plans.",
            "forecast": forecast
        }

    except Exception:
        bundle = fallback_weather(city)

    cache.set(cache_key, bundle, CACHE_TTL_SECONDS)
    return bundle

def fetch_weather_for_city(city):
    # Backward compatibility stub if anything calls this directly
    return fetch_weather_bundle(city)

