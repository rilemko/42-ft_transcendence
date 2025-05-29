import django
from os import environ
environ.setdefault('DJANGO_SETTINGS_MODULE', 'service.settings')
django.setup()

from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
import json
import asyncio
from .consumers_utils import Game
from django.utils import timezone
from ..endpoints.endpoints_utils import utils_get_info
from channels.db import database_sync_to_async
from django.db import transaction
from ..models import GameModel, TournamentModel

import logging
logger = logging.getLogger(__name__)


class GameConsumer(AsyncWebsocketConsumer):

	## > CONNECT < #################

	@database_sync_to_async
	def get_game(self):

		with transaction.atomic():
			self.game = GameModel.objects.select_for_update().get(id=int(self.scope["url_route"]["kwargs"]["game_id"]))
			if not self.game or self.game is None: return False
		return True

	@database_sync_to_async
	def get_id(self):

		with transaction.atomic():
			return list(self.game.players.select_for_update().order_by('id').values_list('user_id', flat=True))

	async def connect(self):

		await self.accept()

		cookies = {}
		headers = dict(self.scope["headers"])
		if b"cookie" in headers:
			cookiess = headers[b"cookie"].decode()
			cookies = {key: value for key, value in [cookie.split('=') for cookie in cookiess.split('; ')]}
			self.user, new_cookies = utils_get_info(cookies)
		if not self.user or self.user is None: await self.close(); return

		if await self.get_game() is False: await self.close(); return

		#try:
			#async with database_sync_to_async(transaction.atomic)():
		#	self.game = await database_sync_to_async(GameModel.objects.select_for_update().get)(id=int(self.scope["url_route"]["kwargs"]["game_id"]))
		#except: await self.close(); return

		#ids = await database_sync_to_async(lambda: list(self.game.players.order_by('id').values_list('user_id', flat=True)))()
		ids = await self.get_id()
		if self.user['user_id'] not in ids: await self.close(); return
		self.upos = 1 if ids[0] == self.user['user_id'] else 2
		self.user = await database_sync_to_async(lambda: self.game.players.get(user_id=self.user['user_id']))()
		if not self.user or self.user is None: await self.close(); return

		if self.upos == 2: await asyncio.sleep(1)

		self.group_game = f"game_{self.game.id}"
		await self.listen(self.group_game)

		if self.game.status not in ['waiting']:
			await self.dispatch_to(self.group_game, "on_finish", {})
			return
		
		if self.game.tournament_id > 0:
			try:
				self.tournament = await database_sync_to_async(TournamentModel.objects.get)(id=self.game.tournament_id)
				self.group_tournament = f"tournament_{self.game.tournament_id}"
				await self.listen(self.group_tournament)
			except: await self.close(); return

		await database_sync_to_async(self.game.refresh_from_db)()

		await database_sync_to_async(self.game.connect)(self.user)
		await self.dispatch_to(self.group_game, "on_join", {"nickname": self.user.nickname})

		await database_sync_to_async(self.game.refresh_from_db)()
		if self.game.tournament_id > 0: await database_sync_to_async(self.tournament.refresh_from_db)()

		if (self.game.tournament_id == 0 or self.tournament.status in ['playing']) and self.game.players_waiting == self.game.players_maximum:
			self.game.status = 'ready'
			await database_sync_to_async(self.game.save)()
			await self.dispatch_to(self.group_game, "on_ready", {})
		if self.game.tournament_id > 0 and self.tournament.status in ['waiting'] and self.game.tournament_id > 0 and self.tournament.players_current == self.tournament.players_maximum:
			self.tournament.status = 'playing'
			for game in await database_sync_to_async(lambda: list(self.tournament.games.order_by('id')))():
				if game.players_waiting < game.players_maximum: continue
				game.status = 'ready'
				await database_sync_to_async(game.save)()
				await self.dispatch_to(f"game_{game.id}", "on_ready", {})
			await database_sync_to_async(self.tournament.save)()

		await self.dispatch_to(self.group_game, "on_connect", {})

	async def listen(self, group):

		await self.channel_layer.group_add(group, self.channel_name)

	async def discard(self, group):

		await self.channel_layer.group_discard(group, self.channel_name)

	######################

	async def on_join(self, event):

		if self.channel_name == event["from"]: return
		await database_sync_to_async(self.game.refresh_from_db)()
		try: await self.send(text_data=json.dumps({
			'event': 'on_join', 'data': event['data']
		}))
		except: pass

	async def on_connect(self, event):

		if self.channel_name != event["from"]: return
		try: await self.send(text_data=json.dumps({
			'event': 'on_connect', 'data': event['data']
		}))
		except: pass

	async def on_left(self, event):

		if self.channel_name == event["from"]: return
		await database_sync_to_async(self.game.refresh_from_db)()
		try: await self.send(text_data=json.dumps({
			'event': 'on_left', 'data': event['data']
		}))
		except: pass

	async def on_wait(self, event):

		await database_sync_to_async(self.game.refresh_from_db)()
		try: await self.send(text_data=json.dumps({
			'event': 'on_wait', 'data': event['data']
		}))
		except: pass

	async def on_ready(self, event):

		await database_sync_to_async(self.game.refresh_from_db)()
		try: await self.send(text_data=json.dumps({
			'event': 'on_ready', 'data': event['data']
		}))
		except: pass

	async def on_start(self, event):

		await database_sync_to_async(self.game.refresh_from_db)()
		if self.upos != 1 or self.game.status not in ['ready']: return
		self.game.status = 'playing'
		self.game.started_at = timezone.now().isoformat()
		await database_sync_to_async(self.game.save)()
		self.rntm = Game(self)
		asyncio.create_task(self.rntm.gameloop())

	async def on_finish(self, event):

		await database_sync_to_async(self.game.refresh_from_db)()
		try: await self.send(text_data=json.dumps({
			'event': 'on_finish', 'data': event['data']
		}), close=True)
		except: pass

	async def on_abandon(self, event):

		if self.channel_name == event["from"]: return
		await database_sync_to_async(self.game.refresh_from_db)()
		try: await self.send(text_data=json.dumps({
			'event': 'on_abandon', 'data': event['data']
		}), close=True)
		except: pass

	async def on_receive(self, event):

		if self.channel_name == event["from"]: return
		await self.rntm.receive(event['data']['upos'], event['data']['message'])

	async def on_move(self, event):

		try: await self.send(text_data=json.dumps({
			'event': 'on_move', 'data': event['data']
		}))
		except: pass

	async def on_score(self, event):

		if self.upos != 1: await database_sync_to_async(self.game.refresh_from_db)()
		try: await self.send(text_data=json.dumps({
			'event': 'on_score', 'data': event['data']
		}))
		except: pass

	## > DISPATCHERS < #############

	async def dispatch_to(self, group, event, data={}):

		await self.channel_layer.group_send(
			group, {"type": event, "data": data, "from": self.channel_name}
		)

	## > RECEIVE < #################

	async def receive(self, text_data):

		if self.game.status in ['playing']:
			if self.upos == 1: await self.rntm.receive(self.upos, text_data)
			else: await self.dispatch_to(self.group_game, "on_receive", {"upos": self.upos, "message": text_data})
		else:
			await database_sync_to_async(self.game.refresh_from_db)()
			if self.game.status not in ['ready']: return
			await self.dispatch_to(self.group_game, "on_start", {})

	## > DISCONNECT < ##############

	async def disconnect(self, code):

		#await database_sync_to_async(self.game.refresh_from_db)()
		if (self.upos == 0 or self.game.status in ['finished', 'abandoned']): return
		await self.dispatch_to(self.group_game, "on_left", {"nickname": self.user.nickname})


		if self.game.tournament_id == 0:
			await self.disconnect_from_game()
		else:
			await self.disconnect_from_tournament()
			await self.discard(self.group_tournament)
		await self.discard(self.group_game)

	async def disconnect_from_game(self):

		if self.game.status in ['waiting', 'ready']:
			await database_sync_to_async(self.game.player_del)(self.user)
			await self.dispatch_to(self.group_game, "on_wait", {})
		if self.game.players_current <= 0 or self.game.status in ['playing']:
			await database_sync_to_async(self.game.abandon)(self.user)
			await self.dispatch_to(self.group_game, "on_abandon", {})
		await database_sync_to_async(self.game.save)()

	async def disconnect_from_tournament(self):

		await database_sync_to_async(self.tournament.refresh_from_db)()
		if self.tournament.status in ['waiting']:
			await database_sync_to_async(self.tournament.player_del)(self.user)
			if self.tournament.players_current <= 0:
				await database_sync_to_async(self.tournament.abandon)(self.user)
		elif self.tournament.status in ['ready', 'playing']:
			for game in await database_sync_to_async(lambda: list(self.tournament.games.filter(players__user_id=self.user.user_id, status='waiting')))():
				await database_sync_to_async(game.abandon)(self.user)
				await self.dispatch_to(f"game_{game.id}", "on_finish", {})
			await database_sync_to_async(self.game.abandon)(self.user)
			await self.dispatch_to(self.group_game, "on_finish", {})
		database_sync_to_async(self.tournament.save)()
