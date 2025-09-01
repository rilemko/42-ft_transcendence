from django.contrib.auth.models import User
from django.db import models
import random

class CustomUserModel(models.Model):

    def get_default_profile_picture_url():
        return f"/images/default{random.choice(['1', '2', '3', '4', '5', '6', '7'])}.jpg"

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='custom_user')
    profile_picture_url = models.URLField(default=get_default_profile_picture_url)
    intra_id = models.IntegerField(null=True, blank=True)
    suitColor = models.CharField(max_length=7, default='#ffffff')
    visColor = models.CharField(max_length=7, default='#ffffff')
    ringsColor = models.CharField(max_length=7, default='#ffffff')
    bpColor = models.CharField(max_length=7, default='#ffffff')
    twoFA_enabled = models.BooleanField(default=True)
    friends_list = models.ManyToManyField("self", blank=True)
    flatness = models.FloatField(default=2.8)
    horizontalPosition = models.FloatField(default=7.5)
    verticalPosition = models.FloatField(default=0)
