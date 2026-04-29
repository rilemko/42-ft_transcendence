from asgiref.sync import sync_to_async
import json
import asyncio
from django.utils import timezone
import random
import time
from channels.db import database_sync_to_async

random.seed(time.time())

import logging
logger = logging.getLogger('myapp')

class Game():

	SCREEN_X = 399
	SCREEN_Y = 299

	TICKRATE = 120
	TICKTIME = 1 / TICKRATE
	STOPTIME = 1.5

	SIZE_BALL = 10
	SIZE_PAD_FAKE = 72 # Fake paddles size, used for ball collision
	SIZE_PAD_REAL = 70 # Real paddles size, used for wall collision

	SPEED_DEFAULT = 1.7
	SPEED_INCREASE_RATIO = 1.06

	POSITIONS = {
		'1': [0, (SCREEN_Y - SIZE_PAD_REAL + 1) // 2],
		'2': [SCREEN_X, (SCREEN_Y - SIZE_PAD_REAL + 1) // 2],
		'b': [(SCREEN_X - SIZE_BALL + 1) // 2, (SCREEN_Y - SIZE_BALL + 1) // 2]
	}

	def __init__(self, consumer):

		self.consumer = consumer
		self.SPEED_PADDLE = 2 * (100 / self.TICKRATE) * self.consumer.game.speed
		self.SPEED_BALL_X = random.choice([1.0, -1.0]) * self.consumer.game.speed * (100 / self.TICKRATE) * self.SPEED_DEFAULT
		self.SPEED_BALL_Y = random.choice([1.0, -1.0]) * self.consumer.game.speed * (100 / self.TICKRATE) * self.SPEED_DEFAULT
		self.data = {'1': [self.POSITIONS['1'][0], self.POSITIONS['1'][1]], '2': [self.POSITIONS['2'][0], self.POSITIONS['1'][1]], 'b': [self.POSITIONS['b'][0], self.POSITIONS['b'][1]], 's': [0, 0]}
		self.keys = {'1': {"l": False, "r": False}, '2': {"l": False, "r": False}}

	async def gameloop(self):

		while self.consumer.game.status == "playing":
			await asyncio.sleep(self.TICKTIME)
			await self.update()
			await self.consumer.dispatch_to(self.consumer.group_game, "on_move", {"1": self.data["1"], "2": self.data["2"], "b": self.data["b"]})


	async def receive(self, upos, message):

		data = json.loads(message)
		if data.get('event') != "on_move": return

		direction = data.get('data')['direction']
		upos = str(upos)
		if direction != 'off':
			self.keys[upos][direction] = True
			opposite_key = "r" if direction == "l" else "l"
			self.keys[upos][opposite_key] = False
		else:
			self.keys[upos]['l'] = False
			self.keys[upos]['r'] = False
		#await self.send_game_state(["keys"], upos)


	async def update(self):

		await self.update_players()
		await self.update_ball()

	async def update_players(self):

		for upos, keys in self.keys.items():
			y = self.data[upos][1]
			if keys["l"]: y = min(self.SCREEN_Y - self.SIZE_PAD_REAL - 1, y + self.SPEED_PADDLE)
			elif keys["r"]: y = max(0, y - self.SPEED_PADDLE)
			self.data[upos][1] = y

	async def update_ball(self):
		"""
		ball_x, ball_y = self.data["b"]
		dx, dy = self.SPEED_BALL_X, self.SPEED_BALL_Y
		ball_x += dx
		ball_y += dy
		if ball_y <= 0 or ball_y + self.SIZE_BALL > self.SCREEN_Y:
			dy = -dy
			self.SPEED_BALL_Y = -self.SPEED_BALL_Y
		if ball_y <= 0:
			ball_y = 0
		if ball_y + self.SIZE_BALL > self.SCREEN_Y + 1:
			ball_y = self.SCREEN_Y - self.SIZE_BALL + 1
		"""

		ball_x, ball_y = self.data["b"]
		dx, dy = self.SPEED_BALL_X, self.SPEED_BALL_Y
		ball_x += dx
		ball_y += dy
		if ball_y <= 0 or ball_y + self.SIZE_BALL > self.SCREEN_Y:
			self.SPEED_BALL_Y = -self.SPEED_BALL_Y
			ball_y = max(0, min(ball_y, self.SCREEN_Y - self.SIZE_BALL))

		self.data["b"] = [ball_x, ball_y]
		if ball_x <= 0:
			if await self.is_ball_touched_by_p1():
				self.SPEED_BALL_X *= self.SPEED_INCREASE_RATIO
				self.SPEED_BALL_Y *= self.SPEED_INCREASE_RATIO * random.choice([0.97, 1.03])
				return
			else:
				self.data["s"][1] += 1
				#await sync_to_async(self.game.update_player_one_score)(self.game_data["scores"]['1'])
				#await sync_to_async(self.game.update_player_two_score)(self.game_data["scores"]['2'])
				#await sync_to_async(self.game.save)()
				await database_sync_to_async(self.consumer.game.goal)(1)
				await self.consumer.dispatch_to(self.consumer.group_game, "on_score", {"s": self.data["s"]})
				if self.data["s"][1] >= self.consumer.game.score_to_win:
					#self.game.status = "finished"
					#self.game_data['status'] = "finished"
					await database_sync_to_async(self.consumer.game.finish)()
					await asyncio.sleep(self.STOPTIME)
					await self.consumer.dispatch_to(self.consumer.group_game, "on_finish", {})
				else:
					await self.reset_ball()
				#await self.send_game_state(["ball_position", "status"])
				#await asyncio.sleep(1)
				return
		elif ball_x + self.SIZE_BALL - 1 >= self.SCREEN_X:
			if await self.is_ball_touched_by_p2():
				self.SPEED_BALL_X *= self.SPEED_INCREASE_RATIO
				self.SPEED_BALL_Y *= self.SPEED_INCREASE_RATIO * random.choice([0.97, 1.03])
				return
			else:
				self.data["s"][0] += 1
				#await sync_to_async(self.game.update_player_one_score)(self.game_data["scores"]['1'])
				#await sync_to_async(self.game.update_player_two_score)(self.game_data["scores"]['2'])
				#await sync_to_async(self.game.save)()
				#await self.send_game_state(["scores"])
				await database_sync_to_async(self.consumer.game.goal)(0)
				await self.consumer.dispatch_to(self.consumer.group_game, "on_score", {"s": self.data["s"]})
				if self.data["s"][0] >= self.consumer.game.score_to_win:
					#self.game.status = "finished"
					#self.game_data['status'] = "finished"
					await database_sync_to_async(self.consumer.game.finish)()
					await asyncio.sleep(self.STOPTIME)
					await self.consumer.dispatch_to(self.consumer.group_game, "on_finish", {})
				else:
					await self.reset_ball()
				#await self.send_game_state(["ball_position", "status"])
				#await asyncio.sleep(1)
				return
		#self.data["ball"] = [ball_x, ball_y]

	async def is_ball_touched_by_p1(self):
		bx, by = self.data["b"]
		px, py = self.data['1']
		if py <= by + self.SIZE_BALL - 1 and py + self.SIZE_PAD_FAKE - 1 >= by and px >= bx:
			self.SPEED_BALL_X = -self.SPEED_BALL_X
			return True
		return False

	async def is_ball_touched_by_p2(self):
		bx, by = self.data["b"]
		px, py = self.data['2']
		if py <= by + self.SIZE_BALL - 1 and py + self.SIZE_PAD_FAKE - 1 >= by and px <= bx + self.SIZE_BALL - 1:
			self.SPEED_BALL_X = -self.SPEED_BALL_X
			return True
		return False

	async def reset_ball(self):
		self.data["b"] = [self.POSITIONS['b'][0], self.POSITIONS['b'][1]]
		self.SPEED_BALL_X = random.choice([1.0, -1.0]) * self.consumer.game.speed * (100 / self.TICKRATE) * self.SPEED_DEFAULT
		self.SPEED_BALL_Y = random.choice([1.0, -1.0]) * self.consumer.game.speed * (100 / self.TICKRATE) * self.SPEED_DEFAULT
		await self.consumer.dispatch_to(self.consumer.group_game, "on_move", {"1": self.data["1"], "2": self.data["2"], "b": self.data["b"]})
		await asyncio.sleep(self.STOPTIME)





	"""
	# Playing screen dimensions
	SCREEN_X = 399 # 0 to 399 => 400 units
	SCREEN_Y = 299
	# Paddle dimensions
	PADDLE_DIM_X = 0
	PADDLE_DIM_Y = 70
	# Ball dimensions
	BALL_SIZE = 10
	# Speed control by how many times the game refreshes per second
	REFRESH_PER_SEC = 100
	# Initial positions
	bx = (SCREEN_X - BALL_SIZE + 1) // 2 # ball position
	by = (SCREEN_Y - BALL_SIZE + 1) // 2
	p1x = 0 # first player on the left
	p1y = (SCREEN_Y - PADDLE_DIM_Y + 1) // 2
	p2x = SCREEN_X # first player on the right
	p2y = (SCREEN_Y - PADDLE_DIM_Y + 1) // 2
	# p3x = 0 # second player on the left
	# p3y = p1y // 2
	# p4x = SCREEN_X # second player on the right
	# p4y = p2y // 2
	INITIAL_POSITIONS = {
		"ball": {"x": bx, "y": by},
		"player1": {"x": p1x, "y": p1y},
		"player2": {"x": p2x, "y": p2y},
		# "player3": {"x": p3x, "y": p3y},
		# "player4": {"x": p4x, "y": p4y},
	}

	def __init__(self, consumer):
		self.consumer = consumer
		self.game = consumer.game
		# Paddle and ball speed
		self.PADDLE_SPEED = 2 * (100 / self.REFRESH_PER_SEC) * self.game.speed
		self.BALL_SPEED_X = random.choice([1.0, -1.0]) * self.game.speed * (100 / self.REFRESH_PER_SEC) * 1.4
		self.BALL_SPEED_Y = random.choice([1.0, -1.0]) * self.game.speed * (100 / self.REFRESH_PER_SEC) * 1.4
		# Initialize positions and scores based on match type
		self.game_data = {
			"game_id": self.game.id,
			"ball_position": [
				self.INITIAL_POSITIONS["ball"]["x"],
				self.INITIAL_POSITIONS["ball"]["y"]
			],
			"keys": {'1': {"left": False, "right": False}, '2': {"left": False, "right": False}},
			"player_positions": {},
			"status": self.game.status,
		}
		# Configuration for 1v1 match type
		# if self.game.type == "1v1":
		self.game_data["player_positions"] = {
			'1': [self.INITIAL_POSITIONS["player1"]["x"], self.INITIAL_POSITIONS["player1"]["y"]],
			'2': [self.INITIAL_POSITIONS["player2"]["x"], self.INITIAL_POSITIONS["player2"]["y"]],
		}
		self.game_data["scores"] = {'1': 0, '2': 0}
		# Configuration for 2v2 match type
		# elif self.game.type == "2v2":
		# 	self.game_data["player_positions"] = {
		# 		'1': [self.INITIAL_POSITIONS["player1"]["x"], self.INITIAL_POSITIONS["player1"]["y"]],
		# 		'2': [self.INITIAL_POSITIONS["player2"]["x"], self.INITIAL_POSITIONS["player2"]["y"]],
		# 		'3': [self.INITIAL_POSITIONS["player3"]["x"], self.INITIAL_POSITIONS["player3"]["y"]],
		# 		'4': [self.INITIAL_POSITIONS["player4"]["x"], self.INITIAL_POSITIONS["player4"]["y"]],
		# 	}
		# 	self.game_data["scores"] = {'1': 0, '2': 0, '3': 0, '4': 0}

	# async def on_connect(self):
	# 	self.consumer.send(json.dumps({
	# 		"action": "initialize",
	# 		"game_data": self.game_data
	# 	}))


	async def on_receiving_data(self, text_data):
		data_json = json.loads(text_data)
		action = data_json.get('action')
		if action == "move":
			if self.consumer.player == None:
				return
			direction = data_json.get('direction')
			player_index = str(self.consumer.player.player_index)
			if direction != 'off':
				self.game_data['keys'][player_index][direction] = True
				opposite_key = "right" if direction == "left" else "left"
				self.game_data['keys'][player_index][opposite_key] = False
			else:
				self.game_data['keys'][player_index]['left'] = False
				self.game_data['keys'][player_index]['right'] = False
			await self.send_game_state(["keys"], player_index)
		elif action == "ping":
			await self.consumer.send(json.dumps({"action": "pong"}))
		else:
			await self.consumer.send(json.dumps({
				"action": "error",
				"message": "Unknown action"
			}))

	async def update_player_positions(self):
		for player_index, keys in self.game_data['keys'].items():
			player_index = str(player_index)
			if player_index not in self.game_data["player_positions"]:
				continue
			x, y = self.game_data["player_positions"][player_index]
			new_y = y
			if keys["left"]:
				new_y = min(self.SCREEN_Y - self.PADDLE_DIM_Y - 1, y + self.PADDLE_SPEED)
			if keys["right"]:
				new_y = max(0, y - self.PADDLE_SPEED)
			if new_y != y:
				self.game_data["player_positions"][player_index][1] = new_y

	async def send_game_state(self, fields, player_index = None):
		message = json.dumps({
			"fields": fields,
			"player_index": player_index,
			"game_data": self.game_data
		})
		try:
			if hasattr(self.consumer, 'room_group_name'):
				await self.consumer.channel_layer.group_send(
					self.consumer.room_group_name, {
						"type": "game_onchange",
						"message": message
					}
				)
		except Exception as e:
			logger.error("Error while sending message to group_send")
			logger.error(f"Error while sending message to group_send: {e}", exc_info=True)

	async def start_game_loop(self):
		while self.game.status == "playing":
			await asyncio.sleep(1 / self.REFRESH_PER_SEC)
			await self.update_player_positions()
			await self.update_ball_position()
			await self.send_game_state(["ball_position", "player_positions"])

	def is_ball_touched_by_player_right(self):
		ball_x, ball_y = self.game_data["ball_position"]
		p2_x, p2_y = self.game_data["player_positions"]['2']
		if p2_y <= ball_y + self.BALL_SIZE - 1 and p2_y + self.PADDLE_DIM_Y - 1 >= ball_y and p2_x <= ball_x + self.BALL_SIZE - 1:
			self.BALL_SPEED_X = -self.BALL_SPEED_X
			return True
		return False

	def is_ball_touched_by_player_left(self):
		ball_x, ball_y = self.game_data["ball_position"]
		p1_x, p1_y = self.game_data["player_positions"]['1']
		if p1_y <= ball_y + self.BALL_SIZE - 1 and p1_y + self.PADDLE_DIM_Y - 1 >= ball_y and p1_x >= ball_x:
			self.BALL_SPEED_X = -self.BALL_SPEED_X
			return True
		return False

	async def update_ball_position(self):
		ball_x, ball_y = self.game_data["ball_position"]
		dx, dy = self.BALL_SPEED_X, self.BALL_SPEED_Y
		ball_x += dx
		ball_y += dy
		if ball_y <= 0 or ball_y + self.BALL_SIZE > self.SCREEN_Y:
			dy = -dy
			self.BALL_SPEED_Y = -self.BALL_SPEED_Y
		if ball_y <= 0:
			ball_y = 0
		if ball_y + self.BALL_SIZE > self.SCREEN_Y + 1:
			ball_y = self.SCREEN_Y - self.BALL_SIZE + 1
		self.game_data["ball_position"] = [ball_x, ball_y]
		if ball_x <= 0:
			if self.is_ball_touched_by_player_left():
				self.BALL_SPEED_X = self.BALL_SPEED_X * 1.03
				self.BALL_SPEED_Y = self.BALL_SPEED_Y * 1.03 * random.choice([0.97, 1.03])
				return
			else:
				self.game_data["scores"]['2'] += 1
				await sync_to_async(self.game.update_player_one_score)(self.game_data["scores"]['1'])
				await sync_to_async(self.game.update_player_two_score)(self.game_data["scores"]['2'])
				await sync_to_async(self.game.save)()
				await self.send_game_state(["scores"])
				if self.game_data["scores"]['2'] >= self.game.score_to_win:
					self.game.status = "finished"
					self.game_data['status'] = "finished"
					await asyncio.sleep(1)
				await self.reset_ball_position()
				await self.send_game_state(["ball_position", "status"])
				await asyncio.sleep(1)
				return
		elif ball_x + self.BALL_SIZE - 1 >= self.SCREEN_X:
			if self.is_ball_touched_by_player_right():
				self.BALL_SPEED_X = self.BALL_SPEED_X * 1.03
				self.BALL_SPEED_Y = self.BALL_SPEED_Y * 1.03 * random.choice([0.97, 1.03])
				return
			else:
				self.game_data["scores"]['1'] += 1
				await sync_to_async(self.game.update_player_one_score)(self.game_data["scores"]['1'])
				await sync_to_async(self.game.update_player_two_score)(self.game_data["scores"]['2'])
				await sync_to_async(self.game.save)()
				await self.send_game_state(["scores"])
				if self.game_data["scores"]['1'] >= self.game.score_to_win:
					self.game.status = "finished"
					self.game_data['status'] = "finished"
					await asyncio.sleep(1)
				await self.reset_ball_position()
				await self.send_game_state(["ball_position", "status"])
				await asyncio.sleep(1)
				return
		self.game_data["ball_position"] = [ball_x, ball_y]

	async def reset_ball_position(self):
		self.game_data["ball_position"] = [
			self.INITIAL_POSITIONS["ball"]["x"],
			self.INITIAL_POSITIONS["ball"]["y"]
		]
		self.BALL_SPEED_X = random.choice([1.0, -1.0]) * self.game.speed * (100 / self.REFRESH_PER_SEC) * 1.4
		self.BALL_SPEED_Y = random.choice([1.0, -1.0]) * self.game.speed * (100 / self.REFRESH_PER_SEC) * 1.4
	"""
