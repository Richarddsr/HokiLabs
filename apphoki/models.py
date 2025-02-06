from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

class User(AbstractUser):
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username

class PlayerScore(models.Model):
    GAME_CHOICES = [
        ('flippy', 'Flippy Hoki'),
        ('pixeldroid', 'PixelDroid'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='scores')
    score = models.IntegerField(default=0)
    game = models.CharField(max_length=20, choices=GAME_CHOICES)
    date = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-score']  # Ordena por pontuação em ordem decrescente

    def __str__(self):
        return f"{self.user.username} - {self.get_game_display()} - {self.score} pontos"
