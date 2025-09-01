from channels.routing import URLRouter
from django.urls import path
from os import environ
from .consumers import UserStatusConsumer

wsspatterns = [
    path('wss/' + environ.get('T_SELF_NAME') + '/', URLRouter([
        path('status/', UserStatusConsumer.UserStatusConsumer.as_asgi()),
    ])),
]

