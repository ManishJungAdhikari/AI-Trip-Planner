from rest_framework import serializers

from apps.trips.models import SavedTrip


class SavedTripSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedTrip
        fields = [
            "id",
            "destination",
            "start_date",
            "duration_days",
            "preferences_json",
            "itinerary_json",
            "created_at",
        ]


class SaveTripSerializer(serializers.Serializer):
    destination = serializers.CharField(max_length=120)
    start_date = serializers.DateField()
    duration_days = serializers.IntegerField(min_value=1, max_value=30)
    preferences_json = serializers.JSONField()
    itinerary_json = serializers.JSONField()


class TripMetadataUpdateSerializer(serializers.Serializer):
    custom_title = serializers.CharField(max_length=160, allow_blank=True, required=False)
    trip_note = serializers.CharField(allow_blank=True, required=False)
