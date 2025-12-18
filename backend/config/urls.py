from django.contrib import admin
from django.urls import include, path


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.auth.urls")),
    path("api/activities/", include("apps.activities.urls")),
    path("api/itinerary/", include("apps.itinerary.urls")),
    path("api/weather/", include("apps.weather.urls")),
    path("api/trips/", include("apps.trips.urls")),
]

