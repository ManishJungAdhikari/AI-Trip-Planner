from copy import deepcopy
from datetime import date, datetime, time, timedelta
from math import atan2, cos, radians, sin, sqrt

from apps.activities.data_access import load_accommodations, load_activities


PACE_RANGES = {
    "relaxed": (2, 3),
    "moderate": (3, 4),
    "fast": (4, 5),
}


def haversine_distance_km(lat1, lon1, lat2, lon2):
    radius_km = 6371
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    return 2 * radius_km * atan2(sqrt(a), sqrt(1 - a))


def score_activity(activity, interests, rain_expected):
    score = 0
    for interest in interests:
        if interest in activity.get("category", []):
            score += 10

    if rain_expected and activity.get("indoor_outdoor") == "outdoor":
        score -= 20
    if rain_expected and activity.get("indoor_outdoor") == "indoor":
        score += 10
    return score


def filter_activities(destination, budget_tier, pace):
    destination_key = destination.strip().lower()
    activities = load_activities()

    city_matches = [item for item in activities if item["city"].lower() == destination_key]
    if city_matches:
        candidates = city_matches
    else:
        candidates = [item for item in activities if item["region"].lower() == destination_key]

    return [
        deepcopy(activity)
        for activity in candidates
        if activity["budget_tier"] in {budget_tier, "all"} and activity["pace_tag"] in {pace, "all"}
    ]


def expand_activity_pool(destination, budget_tier, already_selected):
    destination_key = destination.strip().lower()
    selected_ids = {item["id"] for item in already_selected}
    activities = load_activities()

    city_matches = [item for item in activities if item["city"].lower() == destination_key]
    if city_matches:
        candidates = city_matches
    else:
        candidates = [item for item in activities if item["region"].lower() == destination_key]

    budget_matches = [
        deepcopy(activity)
        for activity in candidates
        if activity["id"] not in selected_ids and activity["budget_tier"] in {budget_tier, "all"}
    ]
    if budget_matches:
        return already_selected + budget_matches

    return already_selected + [
        deepcopy(activity) for activity in candidates if activity["id"] not in selected_ids
    ]


def sort_scored_activities(activities, interests, rain_expected):
    scored = []
    for activity in activities:
        item = deepcopy(activity)
        item["final_score"] = score_activity(item, interests, rain_expected)
        scored.append(item)

    return sorted(scored, key=lambda item: (item["final_score"], -item["cost_usd"]), reverse=True)


def order_day_by_proximity(activities):
    if not activities:
        return []

    remaining = deepcopy(activities)
    ordered = [remaining.pop(0)]

    while remaining:
        current = ordered[-1]
        next_activity = min(
            remaining,
            key=lambda candidate: haversine_distance_km(
                current["latitude"],
                current["longitude"],
                candidate["latitude"],
                candidate["longitude"],
            ),
        )
        ordered.append(next_activity)
        remaining.remove(next_activity)

    return ordered


def schedule_day(activities):
    scheduled = []
    cursor = datetime.combine(date.today(), time(9, 0))

    for index, activity in enumerate(activities):
        duration_minutes = int(float(activity["duration_hours"]) * 60)
        if index > 0:
            cursor += timedelta(minutes=30)

        end_time = cursor + timedelta(minutes=duration_minutes)
        if end_time.time() > time(18, 0):
            break

        item = deepcopy(activity)
        item["time"] = cursor.strftime("%H:%M")
        item["getting_there"] = "Short transfer between planned stops, around 30 mins."
        item["lat"] = item["latitude"]
        item["lng"] = item["longitude"]
        scheduled.append(item)
        cursor = end_time

    return scheduled


def build_light_day(day_number, current_date, interests, pace):
    import random
    lead_interest = interests[int(day_number) % len(interests)] if interests else "Discovery"
    
    ideas = {
        "Food": [("Self-Guided Street Food Walk", "Wander through the local markets and try street food snacks.", 10), ("Cafe & Culinary Afternoon", "Find a quiet local cafe to relax and enjoy the city's food culture.", 5)],
        "History": [("Historical Neighborhood Stroll", "Walk through old squares and alleys to appreciate the local architecture.", 0), ("Heritage Photo Walk", "Take your time capturing the intricate details of ancient shrines.", 0)],
        "Relaxation": [("Rest & Spa Time", "Take it easy with a massage or a long, leisurely morning break.", 20), ("Riverside/Lakeside Relaxing", "Spend a few hours just sitting by the water, sketching or reading.", 0)],
        "Nature": [("Urban Green Space Walk", "Find the largest park in the city and enjoy a calm natural escape.", 0), ("Sunset Viewpoint Stroll", "Head to a nearby hill or open space to watch the evening sky.", 0)],
        "Shopping": [("Local Artisan Market", "Browse local handicrafts, textiles, and souvenirs at your own pace.", 15), ("Boutique Hopping", "Explore the vibrant streets dedicated to local boutique shops.", 10)],
        "Adventure": [("Spontaneous City Exploration", "Rent a bicycle and ride around the less touristy parts of the city.", 10), ("Active Discovery Walk", "Set out on foot without a map and see where the winding alleys take you.", 0)]
    }
    
    # Pick a random idea or fallback
    category_ideas = ideas.get(lead_interest, [("Flexible Local Discovery", f"A lighter {pace} day reserved for cafe time and neighborhood wandering.", 0)])
    idea = category_ideas[int(day_number) % len(category_ideas)]
    
    return {
        "day": day_number,
        "date": current_date.isoformat(),
        "weekday": current_date.strftime("%A"),
        "theme": lead_interest,
        "activities": [
            {
                "id": -day_number,
                "time": "10:00",
                "name": idea[0],
                "description": idea[1],
                "category": [lead_interest],
                "indoor_outdoor": "outdoor",
                "duration_hours": 3,
                "cost_usd": idea[2],
                "getting_there": "Walk or short local ride based on your hotel area.",
                "lat": 0,
                "lng": 0,
            }
        ],
    }


def build_days(sorted_activities, start_date, duration_days, pace, interests):
    min_per_day, max_per_day = PACE_RANGES[pace]
    remaining = deepcopy(sorted_activities)
    days = []

    for offset in range(duration_days):
        current_date = start_date + timedelta(days=offset)
        if not remaining:
            days.append(build_light_day(offset + 1, current_date, interests, pace))
            continue

        selected = []
        total_hours = 0.0
        target_count = min(max_per_day, len(remaining))

        for activity in list(remaining):
            duration = float(activity["duration_hours"])
            if total_hours + duration > 8:
                continue
            selected.append(activity)
            remaining.remove(activity)
            total_hours += duration
            if len(selected) >= target_count:
                break

        if len(selected) < min_per_day and remaining:
            for activity in list(remaining):
                if len(selected) >= min_per_day:
                    break
                duration = float(activity["duration_hours"])
                if total_hours + duration > 8:
                    continue
                selected.append(activity)
                remaining.remove(activity)
                total_hours += duration

        ordered = order_day_by_proximity(selected)
        scheduled = schedule_day(ordered)
        if not scheduled:
            days.append(build_light_day(offset + 1, current_date, interests, pace))
            continue

        theme = scheduled[0]["category"][0] if scheduled[0].get("category") else "Explore"
        days.append(
            {
                "day": offset + 1,
                "date": current_date.isoformat(),
                "weekday": current_date.strftime("%A"),
                "theme": theme,
                "activities": scheduled,
            }
        )

    return days


def pick_accommodations(destination, budget_tier, limit=3):
    destination_key = destination.strip().lower()
    accommodations = [
        item
        for item in load_accommodations()
        if item["city"].lower() == destination_key and item["budget_tier"] == budget_tier
    ]
    return [
        {
            "name": item["name"],
            "price_per_night": item["price_per_night_usd"],
            "rating": item["rating"],
            "description": item["description"],
            "lat": item["latitude"],
            "lng": item["longitude"],
        }
        for item in accommodations[:limit]
    ]


def build_curators_note(interests, pace):
    lead_interest = interests[0] if interests else "discovery"
    return (
        f"This itinerary prioritises {lead_interest} while maintaining a {pace} rhythm. "
        "Don't miss the hidden transitions between activities."
    )


def generate_itinerary(payload, weather):
    destination = payload["destination"]
    budget_tier = payload["budget_tier"]
    pace = payload["pace"]
    interests = payload["interests"]
    duration_days = payload["duration_days"]
    start_date = payload["start_date"]

    filtered = filter_activities(destination, budget_tier, pace)
    required_activities = duration_days * PACE_RANGES[pace][0]
    if len(filtered) < required_activities:
        filtered = expand_activity_pool(destination, budget_tier, filtered)
    sorted_activities = sort_scored_activities(filtered, interests, weather["rain_expected"])
    days = build_days(sorted_activities, start_date, duration_days, pace, interests)
    accommodations = pick_accommodations(destination, budget_tier)
    estimated_budget = sum(
        activity["cost_usd"] for day in days for activity in day["activities"]
    ) * payload["travellers"]
    estimated_budget += sum(item["price_per_night"] for item in accommodations[:1]) * max(duration_days - 1, 1)

    return {
        "destination": destination,
        "summary": (
            f"{duration_days}-day {pace} journey through {destination} focusing on "
            f"{', '.join(interests)}"
        ),
        "weather": weather,
        "accommodation": accommodations,
        "estimated_budget_usd": round(estimated_budget, 2),
        "days": days,
        "curators_note": build_curators_note(interests, pace),
    }
