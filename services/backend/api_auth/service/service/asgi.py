from app import wsspatterns
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application
from os import environ

environ.setdefault('DJANGO_SETTINGS_MODULE', 'service.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AllowedHostsOriginValidator(
        URLRouter(
            wsspatterns.wsspatterns
        )
    ),
})
