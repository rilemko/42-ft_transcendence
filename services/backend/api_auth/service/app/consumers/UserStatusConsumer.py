import django
from os import environ
environ.setdefault('DJANGO_SETTINGS_MODULE', 'service.settings')
django.setup()

from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from ..endpoints.endpoints_utils import utils_get_user
from ..utils.redis_client import r

import logging
logger = logging.getLogger(__name__)

class UserStatusConsumer(AsyncWebsocketConsumer):

    async def connect(self):

        cookies = {}
        headers = dict(self.scope["headers"])
        if b"cookie" in headers:
            cookie_header = headers[b"cookie"].decode()
            cookies = {key: value for key, value in [cookie.split('=') for cookie in cookie_header.split('; ')]}
        else :
            await self.close()
            return

        token = cookies.get('token')
        refresh_token = cookies.get('refresh_token')
        token42 = cookies.get('42_access_token')
        refresh_token42 = cookies.get('42_refresh_token')
        self.user = await self.sync_utils_get_user(token, refresh_token, token42, refresh_token42)

        if self.user is None:
            await self.close()
            return
        self.group_name = f'user_{self.user.id}'
        await self.channel_layer.group_add(
        self.group_name,
        self.channel_name
        )
        await self.accept()
        await self.update_user_status('online')

    async def disconnect(self, close_code):
       if hasattr(self, "user"):
            if hasattr(self, "group_name"):
                await self.channel_layer.group_discard(
                    self.group_name,
                    self.channel_name
            )
            await self.update_user_status('offline')

    async def receive(self, text_data):
        pass

    async def send(self, text_data):
        pass

    @sync_to_async
    def update_user_status(self, status):
        if self.user and hasattr(self.user, 'id'):
            r.set(f'user_{self.user.id}_status', status)

    

    @staticmethod
    @sync_to_async
    def sync_utils_get_user(token, refresh_token, token42, refresh_token42):
        return utils_get_user(token, refresh_token, token42, refresh_token42)
