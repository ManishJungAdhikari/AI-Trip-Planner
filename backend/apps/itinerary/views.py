from .engine import generate_itinerary
from .serializers import GenerateItinerarySerializer
from apps.weather.client import fetch_weather_bundle
from rest_framework.response import Response
from rest_framework.views import APIView


class GenerateItineraryView(APIView):
    def post(self, request):
        serializer = GenerateItinerarySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        weather = fetch_weather_bundle(serializer.validated_data["destination"])

        itinerary = generate_itinerary(serializer.validated_data, weather)
        if not itinerary["days"]:
            return Response(
                {"detail": "No activities matched the selected destination and preferences."},
                status=404,
            )

        return Response(itinerary)
