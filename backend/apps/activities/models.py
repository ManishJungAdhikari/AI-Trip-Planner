from django.db import models


class Activity(models.Model):
    name = models.CharField(max_length=255)
    city = models.CharField(max_length=120)
    region = models.CharField(max_length=120)
    description = models.TextField()
    category = models.JSONField(default=list)
    indoor_outdoor = models.CharField(max_length=20)
    duration_hours = models.DecimalField(max_digits=4, decimal_places=1)
    cost_usd = models.DecimalField(max_digits=8, decimal_places=2)
    budget_tier = models.CharField(max_length=20)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    opening_hour = models.PositiveSmallIntegerField()
    closing_hour = models.PositiveSmallIntegerField()
    pace_tag = models.CharField(max_length=20)
    image_url = models.URLField(blank=True)


class Accommodation(models.Model):
    name = models.CharField(max_length=255)
    city = models.CharField(max_length=120)
    budget_tier = models.CharField(max_length=20)
    price_per_night_usd = models.DecimalField(max_digits=8, decimal_places=2)
    description = models.TextField()
    rating = models.DecimalField(max_digits=3, decimal_places=1)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)

