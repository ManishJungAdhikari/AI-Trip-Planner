from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from copy import deepcopy

from apps.trips.models import SavedTrip
from apps.trips.serializers import (
    SaveTripSerializer,
    SavedTripSerializer,
    TripMetadataUpdateSerializer,
)


class TripListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        trips = SavedTrip.objects.filter(user_id=request.user.id).order_by("-created_at")
        return Response(SavedTripSerializer(trips, many=True).data)


class TripSaveView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = SaveTripSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        trip = SavedTrip.objects.create(
            user_id=request.user.id,
            destination=serializer.validated_data["destination"],
            start_date=serializer.validated_data["start_date"],
            duration_days=serializer.validated_data["duration_days"],
            preferences_json=serializer.validated_data["preferences_json"],
            itinerary_json=serializer.validated_data["itinerary_json"],
        )
        return Response(SavedTripSerializer(trip).data, status=status.HTTP_201_CREATED)


class TripDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, trip_id):
        try:
            trip = SavedTrip.objects.get(id=trip_id, user_id=request.user.id)
        except SavedTrip.DoesNotExist:
            return Response({"detail": "Trip not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = TripMetadataUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        itinerary_json = {
            **trip.itinerary_json,
            **serializer.validated_data,
        }
        trip.itinerary_json = itinerary_json
        trip.save(update_fields=["itinerary_json"])
        return Response(SavedTripSerializer(trip).data, status=status.HTTP_200_OK)

    def delete(self, request, trip_id):
        try:
            trip = SavedTrip.objects.get(id=trip_id, user_id=request.user.id)
        except SavedTrip.DoesNotExist:
            return Response({"detail": "Trip not found."}, status=status.HTTP_404_NOT_FOUND)

        trip.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TripDuplicateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, trip_id):
        try:
            trip = SavedTrip.objects.get(id=trip_id, user_id=request.user.id)
        except SavedTrip.DoesNotExist:
            return Response({"detail": "Trip not found."}, status=status.HTTP_404_NOT_FOUND)

        itinerary_json = deepcopy(trip.itinerary_json)
        current_title = itinerary_json.get("custom_title") or trip.destination
        itinerary_json["custom_title"] = f"{current_title} Copy"

        duplicated_trip = SavedTrip.objects.create(
            user_id=request.user.id,
            destination=trip.destination,
            start_date=trip.start_date,
            duration_days=trip.duration_days,
            preferences_json=deepcopy(trip.preferences_json),
            itinerary_json=itinerary_json,
        )
        return Response(SavedTripSerializer(duplicated_trip).data, status=status.HTTP_201_CREATED)
