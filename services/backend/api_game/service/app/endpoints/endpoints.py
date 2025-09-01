from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.http import JsonResponse
from django.views import View
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.decorators import method_decorator
import json
from rest_framework.views import APIView
import re
from itertools import combinations
from django.db import transaction
import random

from .endpoints_utils import *
from ..models import GameModel, PlayerModel, TournamentModel
from ..decorators.decorators import jwt_required

### STATUS #####################################################

@require_GET
def status(request):
    return JsonResponse({'success': 'OK'})

### GAMES ######################################################

## > GAME: CREATE < ############

class GameCreateView(APIView):

    @method_decorator(jwt_required)
    def post(self, request):

        try: data = json.loads(request.body.decode('utf-8'))
        except json.JSONDecodeError: return JsonResponse({'success': False, 'message': 'An error has occurred.'}, status=400)

        user_id = request.user.get('user_id')
        username = request.user.get('username')

        if not user_id or not username:
            return JsonResponse({'success': False,'message': 'Failed to fetch user information.'}, status=400)

        custom_name = data.get('custom_name')
        nickname = data.get('nickname', username)

        if not re.search(r"^[A-Za-z0-9 _.+'\"$#@)(\][)-]{4,24}$", custom_name):
            return JsonResponse({'success': False, 'message': 'Room name can only contain alphanumeric characters and " _-.+$#@\'()[]"" symbols, and be between 5 and 24 characters long.'}, status=400)
        if not re.search(r"^[A-Za-z0-9_#-]{5,16}$", nickname):
            return JsonResponse({'success': False, 'message': 'Nickname can only contain alphanumeric characters and "_#-" symbols, and be between 5 and 16 characters long.'}, status=400)

        type = data.get('type', '1v1')
        game = data.get('game', 'pong')

        if type not in ['1v1'] or game not in ['pong']:
            return JsonResponse({'success': False, 'message': 'An error has occurred.'}, status=400)

        def clamp(value, min_value, max_value):
            return max(min_value, min(value, max_value))

        try: score_to_win = clamp(int(data.get('score_to_win', 3)), 3, 15)
        except: score_to_win = 3

        color_board = data.get('color_board', '#000000')
        color_ball = data.get('color_ball', '#e48d2d')
        color_wall = data.get('color_wall', '#e48d2d')
        color_paddle = data.get('color_paddle', '#ffffff')

        for color in color_board, color_ball, color_wall, color_paddle:
            if not re.search(r"^#[A-Fa-f0-9]{6}$", color):
                return JsonResponse({'success': False, 'message': 'An error has occurred.'}, status=400)

        try: speed = clamp(float(data.get('speed', 1.0)), 0.5, 2.5)
        except: return JsonResponse({'success': False, 'message': 'An error has occurred.'}, status=400)

        try:
            with transaction.atomic():
                game = GameModel.objects.create(
                    creator=nickname,
                    game=game,
                    type=type,
                    custom_name=custom_name,
                    score_to_win=score_to_win,
                    speed=speed,
                    color_board=color_board,
                    color_ball=color_ball,
                    color_wall=color_wall,
                    color_paddle=color_paddle
                )
                players = [PlayerModel(username='...', nickname='...'), PlayerModel(username='...', nickname='...')]
                PlayerModel.objects.bulk_create(players)
                game.players.add(players[0])
                game.players.add(players[1])
                game.player_add(PlayerModel(
                    user_id=user_id,
                    username=username,
                    nickname=nickname,
                    info=request.user,
                ))
        except: return JsonResponse({'success': False, 'message': 'Failed to create the game.'}, status=400)
        return JsonResponse({'success': True, 'message': 'Game created', 'list_id': [game.id]}, status=200)

## > GAME: JOIN < ##############

class GameJoinView(APIView):

    @method_decorator(jwt_required)
    def put(self, request, game_id):

        try: data = json.loads(request.body.decode('utf-8'))
        except json.JSONDecodeError: return JsonResponse({'success': False, 'message': 'An error has occurred.'}, status=400)

        user_id = request.user.get('user_id')
        username = request.user.get('username')

        if not user_id or not username:
            return JsonResponse({'success': False, 'message': 'An error has occurred.'}, status=400)

        data = request.data
        nickname = data.get('nickname', username)

        if not re.search(r"^[A-Za-z0-9_#-]{5,16}$", nickname):
            return JsonResponse({'success': False, 'message': 'Nickname can only contain alphanumeric characters and "_#-" symbols, and be between 5 and 16 characters long.'}, status=400)

        game = GameModel.objects.get(id=game_id)

        if not game:
            return JsonResponse({'success': False, 'message': 'Cannot find the game.'}, status=400)
        if game.players.filter(user_id=user_id).exists():
            return JsonResponse({'success': False, 'message': 'You are already in this game.'}, status=400)
        if game.players_current >= game.players_maximum:
            return JsonResponse({'success': False, 'message': 'This game is full.'}, status=400)
        if game.status in ['finished', 'abandoned']:
            return JsonResponse({'success': False, 'message': 'The game is no longer available.'}, status=400)
        if game.status not in ['waiting']:
            return JsonResponse({'success': False, 'message': 'Game has already started.'}, status=400)

        try:
            with transaction.atomic():
                game.player_add(PlayerModel.objects.create(
                    user_id=user_id,
                    username=username,
                    nickname=nickname,
                    info=request.user,
                ))
        except: return JsonResponse({'success': False, 'message': 'Failed to join the game.'}, status=400)
        return JsonResponse({'success': True, 'message': 'Game joined successfully.', 'list_id': [game_id]}, status=200)

## > GAME: DETAIL < ############

class GameDetailView(APIView):

    @method_decorator(jwt_required)
    def get(self, request, game_id):

        game = get_object_or_404(GameModel, id=game_id)
        return JsonResponse({'success': True, 'game': game.to_array()})

## > GAME: LIST < ##############

class ListView(APIView):

    def get(self, request):

        from django.db.models import Q
        games = GameModel.objects.filter(tournament_id=0).filter(Q(status='waiting') | Q(status='ready'))
        games_data = [
            game.to_array() for game in games
        ]

        tournaments = TournamentModel.objects.filter(Q(status='waiting') | Q(status='ready'))
        tournaments_data = [
            tournament.to_array()
            for tournament in tournaments
        ]

        combined_data = games_data + tournaments_data

        response_data = {
            'success': True,
            'games': combined_data
        }

        return JsonResponse(response_data, safe=False)

### TOURNAMENTS ################################################

## > TOURNAMENT: CREATE < ######

class TournamentCreateView(APIView):

    @method_decorator(jwt_required)
    def post(self, request):

        try: data = json.loads(request.body.decode('utf-8'))
        except json.JSONDecodeError: return JsonResponse({'success': False, 'message': 'An error has occurred.'}, status=400)

        user_id = request.user.get('user_id')
        username = request.user.get('username')

        if not user_id or not username:
            return JsonResponse({'success': False,'message': 'Failed to fetch user information.'}, status=400)

        custom_name = data.get('custom_name')
        nickname = data.get('nickname', username)

        if not re.search(r"^[A-Za-z0-9 _.+'\"$#@)(\][)-]{4,24}$", custom_name):
            return JsonResponse({'success': False, 'message': 'Room name can only contain alphanumeric characters and " _-.+$#@\'()[]"" symbols, and be between 5 and 24 characters long.'}, status=400)
        if not re.search(r"^[A-Za-z0-9_#-]{5,16}$", nickname):
            return JsonResponse({'success': False, 'message': 'Nickname can only contain alphanumeric characters and "_#-" symbols, and be between 5 and 16 characters long.'}, status=400)

        type = data.get('type', '1v1')
        game = data.get('game', 'pong')

        if type not in ['1v1'] or game not in ['pong']:
            return JsonResponse({'success': False, 'message': 'An error has occurred.'}, status=400)

        def clamp(value, min_value, max_value):
            return max(min_value, min(value, max_value))

        try: score_to_win = clamp(int(data.get('score_to_win', 3)), 3, 15)
        except: score_to_win = 3

        try: players_maximum = clamp(int(data.get('players_maximum')), 3, 10)
        except: players_maximum = 4

        color_board = data.get('color_board', '#000000')
        color_ball = data.get('color_ball', '#e48d2d')
        color_wall = data.get('color_wall', '#e48d2d')
        color_paddle = data.get('color_paddle', '#ffffff')

        for color in color_board, color_ball, color_wall, color_paddle:
            if not re.search(r"^#[A-Fa-f0-9]{6}$", color):
                return JsonResponse({'success': False, 'message': 'An error has occurred.'}, status=400)

        try: speed = clamp(float(data.get('speed', 1.0)), 0.5, 2.5)
        except: return JsonResponse({'success': False, 'message': 'An error has occurred.'}, status=400)

        try:
            with transaction.atomic():
                tournament = TournamentModel.objects.create(
                    creator=nickname,
                    game=game,
                    type=type,
                    custom_name=custom_name,
                    created_at=timezone.now(),
                    players_maximum=players_maximum,
                    score_to_win=score_to_win,
                    speed=speed,
                    color_board=color_board,
                    color_ball=color_ball,
                    color_wall=color_wall,
                    color_paddle=color_paddle
                )
                tournament.init()
                tournament.player_add(PlayerModel(
                    user_id=user_id,
                    username=username,
                    nickname=nickname,
                    info=request.user
                ))
        except: return JsonResponse({'success': False, 'message': 'Failed to create tournament.'}, status=400)
        list_id = list(tournament.games.filter(players__user_id=user_id, status='waiting').order_by('id').values_list('id', flat=True))
        return JsonResponse({'success': True, 'message': 'Tournament created successfully.', 'list_id': list_id}, status=200)

## > TOURNAMENT: JOIN < ########

class TournamentJoinView(APIView):

    @method_decorator(jwt_required)
    def put(self, request, tournament_id):

        try: data = json.loads(request.body.decode('utf-8'))
        except json.JSONDecodeError: return JsonResponse({'success': False, 'message': 'An error has occurred.'}, status=400)

        user_id = request.user.get('user_id')
        username = request.user.get('username')

        if not user_id or not username:
            return JsonResponse({'success': False, 'message': 'An error has occurred.'}, status=400)

        data = request.data
        nickname = data.get('nickname', username)

        if not re.search(r"^[A-Za-z0-9_#-]{5,16}$", nickname):
            return JsonResponse({'success': False, 'message': 'Nickname can only contain alphanumeric characters and "_#-" symbols, and be between 5 and 16 characters long.'}, status=400)

        tournament = TournamentModel.objects.get(id=tournament_id)

        if not tournament:
            return JsonResponse({'success': False, 'message': 'Cannot find the tournament.'}, status=400)
        if tournament.games.filter(players__user_id=user_id).exists():
            return JsonResponse({'success': False, 'message': 'You are already in this tournament.'}, status=400)
        if tournament.players_current >= tournament.players_maximum:
            return JsonResponse({'success': False, 'message': 'This tournament is full.'}, status=400)
        if tournament.status in ['finished', 'abandoned']:
            return JsonResponse({'success': False, 'message': 'The tournament is no longer available.'}, status=400)
        if tournament.status not in ['waiting']:
            return JsonResponse({'success': False, 'message': 'Tournament has already started.'}, status=400)

        try:
            with transaction.atomic():
                tournament.player_add(PlayerModel(
                    user_id=user_id,
                    username=username,
                    nickname=nickname,
                    info=request.user,
                ))
        except: return JsonResponse({'success': False, 'message': 'Failed to join the tournament.'}, status=400)
        list_id = list(tournament.games.filter(players__user_id=user_id, status='waiting').order_by('id').values_list('id', flat=True))
        return JsonResponse({'success': True, 'message': 'Tournament joined successfully.', 'list_id': list_id}, status=200)

        tournament = get_object_or_404(TournamentModel, id=tournament_id)
        joined_players_count = tournament.get_joined_players_count()

        if joined_players_count >= tournament.players_maximum:
            return JsonResponse({'success': False, 'message': 'Tournament is full.'}, status=400)

        if tournament.status != 'waiting':
            return JsonResponse({'success': False, 'message': 'Tournament has already started.'}, status=400)

        user_id = request.user.get('user_id')
        username = request.user.get('username')

        if not user_id or not username:
            return JsonResponse({'success': False, 'message': 'An error has occurred.'}, status=400)

        data = request.data
        nickname = data.get('nickname', username)

        if not re.search(r"^[A-Za-z0-9_#-]{5,16}$", nickname):
            return JsonResponse({'success': False, 'message': 'Nickname can only contain alphanumeric characters and "_#-" symbols, and be between 5 and 16 characters long.'}, status=400)

        if tournament.players.filter(user_id=user_id).exists():
            return JsonResponse({'success': False, 'message': 'You can\'t join the tournament twice.'}, status=400)
        placeholder_player_user_id = tournament.get_placeholder_user_id(joined_players_count)
        players_with_placeholder_user_id = PlayerModel.objects.filter(user_id=placeholder_player_user_id)
        for player in players_with_placeholder_user_id:
            player.user_id = user_id
            player.username = username
            player.nickname = nickname
            player.info = request.user
            player.save()
        joined_players_count += 1
        if joined_players_count == tournament.players_maximum:
            tournament.status = 'tournament_full'
            tournament.started_at = timezone.now()
            tournament.save()
        list_id = list(tournament.games.filter(players__user_id=user_id, status='waiting').order_by('id').values_list('id', flat=True))
        return JsonResponse({'success': True, 'message': 'Tournament joined successfully.', 'list_id': list_id}, status=200)


## > TOURNAMENT: DETAIL < ######

class TournamentDetailView(APIView):

    @method_decorator(jwt_required)
    def get(self, request, tournament_id):

        tournament = get_object_or_404(TournamentModel, id=tournament_id)
        return JsonResponse({
            'success': True,
            'data': tournament.to_array()
        }, status=200)

### HISTORY ####################################################

## > HISTORY < #################

class GameUserHistoryView(APIView):

    def get(self, request, user_id):

        try: user_id = int(user_id)
        except: return JsonResponse({'success': False, 'message': 'Invalid user id.'}, status=400)

        games = GameModel.objects.filter(players__user_id=user_id, status='finished').order_by('-stopped_at')
        game_details_list = []
        for game in games:
            players = game.players.all()
            has_won = False
            user_score = None
            opponent_score = None
            for player in players:
                if player.user_id == user_id:
                    user_score = player.score
                else:
                    opponent_score = player.score
            if user_score is not None and opponent_score is not None:
                has_won = user_score >= opponent_score
            # Build the game details
            game_details = {**game.to_array(), "has_won": has_won}
            game_details_list.append(game_details)
        return JsonResponse({'success': True, 'games': game_details_list}, safe=False)
