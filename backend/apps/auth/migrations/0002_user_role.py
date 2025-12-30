from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("trip_auth", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="role",
            field=models.CharField(
                choices=[("admin", "Admin"), ("user", "User")],
                default="user",
                max_length=20,
            ),
        ),
    ]
