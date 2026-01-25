import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.weather.client import fetch_weather_bundle
print(fetch_weather_bundle("Kathmandu"))
