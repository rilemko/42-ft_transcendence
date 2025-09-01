from django.db import models
from itertools import combinations
from django.db import transaction
import random
from django.utils import timezone

import logging
logger = logging.getLogger(__name__)

class PlayerModel(models.Model):

    status = models.CharField(max_length=12, default="available", db_index=True) # available, taken
    index = models.IntegerField(default=0)
    user_id = models.IntegerField(default=0)
    username = models.CharField(max_length=16, default='...')
    nickname = models.CharField(max_length=16, default='...')
    created_at = models.DateTimeField(auto_now_add=True)
    score = models.IntegerField(default=0)
    info = models.JSONField(default=dict, blank=True)

    def to_array(self):

        return {
            'id': self.id,
            'status': self.status,
            'index': self.index,
            'user_id': self.user_id,
            'username': self.username,
            'score': self.score,
            'nickname': self.nickname,
            'info': self.info
        }

    def update(self, player):

        with transaction.atomic():
            self.status = 'taken'
            self.user_id = player.user_id
            self.username = player.username
            self.nickname = player.nickname
            self.info = player.info
            self.save()

    def reset(self):

        with transaction.atomic():
            self.status = 'available'
            self.user_id = 0
            self.username = '...'
            self.nickname = '...'
            self.info = {}
            self.save()

    def connect(self):

        with transaction.atomic():
            self.status = 'connected'
            self.save()

    def goal(self):

        with transaction.atomic():
            self.score += 1
            self.save()

class GameModel(models.Model):

    status = models.CharField(max_length=12, default="waiting", db_index=True) # waiting, ready, playing, finished, abandoned
    creator = models.CharField(max_length=16, null=True)
    game = models.CharField(max_length=20, default="pong")
    type = models.CharField(max_length=10, default="1v1")
    custom_name = models.CharField(max_length=24, default="New Game")
    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    stopped_at = models.DateTimeField(null=True, blank=True)
    tournament_id = models.IntegerField(default=0, db_index=True)
    players_current = models.IntegerField(default=0)
    players_maximum = models.IntegerField(default=2)
    players_waiting = models.IntegerField(default=0)
    players = models.ManyToManyField(PlayerModel, related_name="games")
    score_to_win = models.IntegerField(default=3)
    speed = models.FloatField(default=1.0)
    color_board = models.CharField(max_length=7, default="#ffffff")
    color_ball = models.CharField(max_length=7, default="#e48d2d")
    color_wall = models.CharField(max_length=7, default="#e48d2d")
    color_paddle = models.CharField(max_length=7, default="#ffffff")

    def to_array(self):

        return {
            'id': self.id,
            'status': self.status,
            "creator": self.creator,
            'game': self.game,
            'type': self.type,
            'custom_name': self.custom_name,
            'created_at': self.created_at,
            'started_at': self.started_at,
            'stopped_at': self.stopped_at,
            'tournament_id': self.tournament_id,
            'players_current': self.players_current,
            'players_maximum': self.players_maximum,
            'players_waiting': self.players_waiting,
            'players': [player.to_array() for player in self.players.order_by('id').all()],
            'score_to_win': self.score_to_win,
            'speed': self.speed,
            'color_board': self.color_board,
            'color_ball': self.color_ball,
            'color_wall': self.color_wall,
            'color_paddle': self.color_paddle
        }

    def init(self):

        with transaction.atomic():
            player1 = PlayerModel(index=0)
            player2 = PlayerModel(index=1)
            PlayerModel.objects.bulk_create([player1, player2])
            self.players.add(player1)
            self.players.add(player2)
            self.save()

    def player_add(self, player):

        with transaction.atomic():
            if self.players_current >= self.players_maximum: return False
            available = self.players.select_for_update().filter(status='available').first()
            if available is None: return False
            available.update(player)
            self.players_current +=  1
            self.save()

    def player_del(self, player):

        with transaction.atomic():
            user = self.players.filter(user_id=player.user_id).first()
            if user.status == 'connected': self.players_waiting -= 1
            self.status = 'waiting'
            user.reset()
            self.players_current -= 1
            self.save()

    def connect(self, player):

        with transaction.atomic():
            self.players.filter(user_id=player.user_id).first().connect()
            self.players_waiting += 1
            self.save()

    def finish(self):

        with transaction.atomic():
            self.status = 'finished'
            self.stopped_at = timezone.now().isoformat()
            if self.started_at is None: self.started_at = self.stopped_at
            self.save()

    def abandon(self, player):

        with transaction.atomic():
            self.status = 'abandoned' if self.tournament_id == 0 else 'finished'
            self.stopped_at = timezone.now().isoformat()
            if self.started_at is None: self.started_at = self.stopped_at
            opponent = self.players.exclude(user_id=player.user_id).first()
            opponent.score = self.score_to_win
            opponent.save()
            self.save()

    def goal(self, index):

        with transaction.atomic():
            self.players.order_by('id')[index].goal()
            self.save()

class TournamentModel(models.Model):

    status = models.CharField(max_length=12, default="waiting", db_index=True) # waiting, playing, finished, abandoned
    custom_name = models.CharField(max_length=24, default="New Game")
    creator = models.CharField(max_length=16, default='...')
    game = models.CharField(max_length=20, default="pong")
    type = models.CharField(max_length=10, default="1v1")
    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    stopped_at = models.DateTimeField(null=True, blank=True)
    players_current = models.IntegerField(default=0)
    players_maximum = models.IntegerField(default=4)
    players = models.ManyToManyField(PlayerModel, related_name="tournaments")
    score_to_win = models.IntegerField(default=3)
    games = models.ManyToManyField(GameModel, related_name="tournaments")
    speed = models.FloatField(default=1.0)
    color_board = models.CharField(max_length=7, default="#ffffff")
    color_ball = models.CharField(max_length=7, default="#e48d2d")
    color_wall = models.CharField(max_length=7, default="#e48d2d")
    color_paddle = models.CharField(max_length=7, default="#ffffff")

    def to_array(self):

        return {
            "id": self.id,
            "status": self.status,
            "creator": self.creator,
            "game": self.game,
            "type": self.type,
            "custom_name": self.custom_name,
            "created_at": self.created_at,
            "started_at": self.started_at,
            "stopped_at": self.stopped_at,
            "players_current": self.players_current,
            "players_maximum": self.players_maximum,
            "players": [player.to_array() for player in self.players.order_by('id').all()],
            "score_to_win": self.score_to_win,
            "games": [game.to_array() for game in self.games.order_by('id').all()],
            'speed': self.speed,
            'color_board': self.color_board,
            'color_ball': self.color_ball,
            'color_wall': self.color_wall,
            'color_paddle': self.color_paddle
        }

    def init(self):
        players = [PlayerModel(index=i) for i in range(self.players_maximum)]
        random.shuffle(players)
        with transaction.atomic():
            for player1, player2 in combinations(players, 2):
                game = GameModel.objects.create(
                    creator=self.creator,
                    game=self.game,
                    type=self.type,
                    custom_name=self.custom_name,
                    tournament_id=self.id,
                    score_to_win=self.score_to_win,
                    speed=self.speed,
                    color_board=self.color_board,
                    color_ball=self.color_ball,
                    color_wall=self.color_wall,
                    color_paddle=self.color_paddle
                )
                game.players.add(PlayerModel.objects.create(index=player1.index))
                game.players.add(PlayerModel.objects.create(index=player2.index))
                self.games.add(game)
            self.save()

    def player_add(self, player):

        with transaction.atomic():
            if self.players_current >= self.players_maximum: return False
            first = self.games.select_for_update().filter(players__status='available').first()
            if first is None: return False
            index = first.players.filter(status='available').first().index
            games = self.games.filter(players__index=index)
            for game in games:
                game.player_add(player)
            self.players_current += 1
            self.save()

    def player_del(self, player):

        with transaction.atomic():
            games = self.games.filter(players__user_id=player.user_id)
            for game in games:
                game.player_del(player)
            self.players_current -= 1
            self.save()

    def abandon(self, player):

        with transaction.atomic():
            self.status = 'abandoned'
            self.save()
