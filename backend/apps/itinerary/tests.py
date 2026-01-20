from datetime import date
from unittest import TestCase

from apps.itinerary.engine import (
    build_days,
    order_day_by_proximity,
    score_activity,
    sort_scored_activities,
)


class ItineraryEngineTests(TestCase):
    def test_score_activity_rewards_matching_interest(self):
        activity = {"category": ["History"], "indoor_outdoor": "outdoor"}
        self.assertEqual(score_activity(activity, ["History"], rain_expected=False), 10)

    def test_score_activity_prefers_indoor_when_raining(self):
        indoor = {"category": ["Food"], "indoor_outdoor": "indoor"}
        outdoor = {"category": ["Food"], "indoor_outdoor": "outdoor"}
        self.assertGreater(
            score_activity(indoor, ["Food"], rain_expected=True),
            score_activity(outdoor, ["Food"], rain_expected=True),
        )

    def test_order_day_by_proximity_keeps_closest_next(self):
        ordered = order_day_by_proximity(
            [
                {"name": "A", "latitude": 27.7, "longitude": 85.3},
                {"name": "B", "latitude": 27.7004, "longitude": 85.3003},
                {"name": "C", "latitude": 28.2, "longitude": 83.9},
            ]
        )
        self.assertEqual([item["name"] for item in ordered], ["A", "B", "C"])

    def test_build_days_respects_no_repeats_and_time_window(self):
        sorted_activities = sort_scored_activities(
            [
                {
                    "id": 1,
                    "name": "A",
                    "category": ["History"],
                    "indoor_outdoor": "outdoor",
                    "duration_hours": 2,
                    "cost_usd": 4,
                    "latitude": 27.7,
                    "longitude": 85.3,
                },
                {
                    "id": 2,
                    "name": "B",
                    "category": ["History"],
                    "indoor_outdoor": "outdoor",
                    "duration_hours": 2,
                    "cost_usd": 4,
                    "latitude": 27.8,
                    "longitude": 85.4,
                },
                {
                    "id": 3,
                    "name": "C",
                    "category": ["History"],
                    "indoor_outdoor": "indoor",
                    "duration_hours": 3,
                    "cost_usd": 4,
                    "latitude": 27.9,
                    "longitude": 85.5,
                },
            ],
            ["History"],
            False,
        )
        days = build_days(sorted_activities, date(2025, 1, 5), 2, "relaxed", ["History"])
        scheduled_ids = [activity["id"] for day in days for activity in day["activities"]]
        self.assertEqual(len(scheduled_ids), len(set(scheduled_ids)))
        self.assertTrue(all(activity["time"] >= "09:00" for day in days for activity in day["activities"]))
