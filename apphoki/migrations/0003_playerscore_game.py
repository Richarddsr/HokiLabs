# Generated by Django 4.2.18 on 2025-02-06 18:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('apphoki', '0002_playerscore'),
    ]

    operations = [
        migrations.AddField(
            model_name='playerscore',
            name='game',
            field=models.CharField(default='flippy', max_length=50),
        ),
    ]
