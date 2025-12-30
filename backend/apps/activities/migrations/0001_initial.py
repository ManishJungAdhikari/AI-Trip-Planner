from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Activity",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=255)),
                ("city", models.CharField(max_length=120)),
                ("region", models.CharField(max_length=120)),
                ("description", models.TextField()),
                ("category", models.JSONField(default=list)),
                ("indoor_outdoor", models.CharField(max_length=20)),
                ("duration_hours", models.DecimalField(decimal_places=1, max_digits=4)),
                ("cost_usd", models.DecimalField(decimal_places=2, max_digits=8)),
                ("budget_tier", models.CharField(max_length=20)),
                ("latitude", models.DecimalField(decimal_places=6, max_digits=9)),
                ("longitude", models.DecimalField(decimal_places=6, max_digits=9)),
                ("opening_hour", models.PositiveSmallIntegerField()),
                ("closing_hour", models.PositiveSmallIntegerField()),
                ("pace_tag", models.CharField(max_length=20)),
                ("image_url", models.URLField(blank=True)),
            ],
        ),
        migrations.CreateModel(
            name="Accommodation",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=255)),
                ("city", models.CharField(max_length=120)),
                ("budget_tier", models.CharField(max_length=20)),
                ("price_per_night_usd", models.DecimalField(decimal_places=2, max_digits=8)),
                ("description", models.TextField()),
                ("rating", models.DecimalField(decimal_places=1, max_digits=3)),
                ("latitude", models.DecimalField(decimal_places=6, max_digits=9)),
                ("longitude", models.DecimalField(decimal_places=6, max_digits=9)),
            ],
        ),
    ]

