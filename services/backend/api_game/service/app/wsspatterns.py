from channels.routing import URLRouter
from django.urls import path, re_path
from os import environ
from .consumers import GameConsumer

wsspatterns = [
    path('wss/' + environ.get('T_SELF_NAME') + '/', URLRouter([
        re_path(r"(?P<game_id>\d+)/$", GameConsumer.GameConsumer.as_asgi()),
    ])),
]

