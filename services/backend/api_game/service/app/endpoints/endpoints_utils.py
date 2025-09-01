from django.http import JsonResponse
import os
import requests
from ..models import PlayerModel, GameModel, TournamentModel
from django.utils import timezone

import logging
logger = logging.getLogger(__name__)

def utils_get_info(current_request_cookies):
    headers = {'Content-Type': 'application/json', 'X-api-key': os.environ.get('T_ENCRYPTION_PASSKEY_5')}
    try:
        response = requests.get(
            'http://auth:' + os.environ.get('T_PORT_INTERN_BACKEND') + '/api/auth/me/',
            headers=headers,
            cookies=current_request_cookies
        )
        result = response.json()
        if (result.get('success') != True):
            return None, response.cookies
        result.pop('email', None)
        result.pop('twofa_enabled', None)
        return result, response.cookies
    except requests.exceptions.RequestException as e:
        return {
            'message': 'An error occurred while connecting to the authentication service.',
            'details': str(e)
        }, None
"""
def create_round_robin_matches_old(tournament):
    # get data to create the tournament
    players = list(tournament.players.all().order_by('user_id'))
    custom_name = "Game in " + tournament.custom_name
    tournament_id = tournament.id
    score_to_win = tournament.score_to_win
    type = tournament.type
    game = tournament.game
    speed = tournament.speed
    color_board = tournament.color_board
    color_ball = tournament.color_ball
    color_wall = tournament.color_wall
    color_paddle = tournament.color_paddle
    games = []

    def organize_matches(matches):
        scheduled_matches = []
        while matches:
            block = []
            used_players = set()
            remaining_matches = []
            for match in matches:
                if not used_players.intersection(match):
                    block.append(match)
                    used_players.update(match)
                else:
                    remaining_matches.append(match)
            scheduled_matches.append(block)
            matches = remaining_matches
        return scheduled_matches

    if type == '1v1':
        # Mode 1v1 : each player will play against each other players
        matches = [(players[i], players[j]) for i in range(len(players)) for j in range(i + 1, len(players))]
        # Organise les matchs en blocs indépendants
        organized_matches = organize_matches(matches)

        for block in organized_matches:
            for player1, player2 in block:
                game = GameModel(
                    custom_name=custom_name,
                    type=type,
                    game=game,
                    score_to_win=score_to_win,
                    players_maximum=2,
                    tournament_id=tournament_id,
                    speed=speed,
                    color_board=color_board,
                    color_ball=color_ball,
                    color_wall=color_wall,
                    color_paddle=color_paddle,
                    status='waiting'
                )
                game.save()
                # Clone les joueurs pour le jeu
                player1_clone = PlayerModel.objects.create(
                    user_id=player1.user_id,
                    username=player1.username,
                    score=0,
                    nickname=player1.nickname,
                    player_index=player1.player_index,
                    info=player1.info
                )
                player2_clone = PlayerModel.objects.create(
                    user_id=player2.user_id,
                    username=player2.username,
                    score=0,
                    nickname=player2.nickname,
                    player_index=player2.player_index,
                    info=player2.info
                )
                game.players.add(player1_clone, player2_clone)
                games.append(game)
    elif type == '2v2':
        # Mode 2v2 : création d'équipes et affrontements entre équipes
        if len(players) % 2 != 0:
            raise ValueError("The number of players must be even for 2v2 matches.")
        teams = [(players[i], players[i + 1]) for i in range(0, len(players), 2)]
        matches = [(teams[i], teams[j]) for i in range(len(teams)) for j in range(i + 1, len(teams))]
        # Organise les matchs en blocs indépendants
        organized_matches = organize_matches(matches)

        for block in organized_matches:
            for (team1_player1, team1_player2), (team2_player1, team2_player2) in block:
                game = GameModel(
                    custom_name=custom_name,
                    type=type,
                    game=game,
                    score_to_win=score_to_win,
                    players_maximum=2,
                    tournament_id=tournament_id,
                    speed=speed,
                    color_board=color_board,
                    color_ball=color_ball,
                    color_wall=color_wall,
                    color_paddle=color_paddle,
                    status='waiting'
                )
                game.save()
                # Clone les joueurs pour le jeu
                t1p1_clone = PlayerModel.objects.create(
                    user_id=team1_player1.user_id,
                    username=team1_player1.username,
                    score=0,
                    nickname=team1_player1.nickname,
                    player_index=team1_player1.player_index,
                    info=team1_player1.info
                )
                t1p2_clone = PlayerModel.objects.create(
                    user_id=team1_player2.user_id,
                    username=team1_player2.username,
                    score=0,
                    nickname=team1_player2.nickname,
                    player_index=team1_player2.player_index,
                    info=team1_player2.info
                )
                t2p1_clone = PlayerModel.objects.create(
                    user_id=team2_player1.user_id,
                    username=team2_player1.username,
                    score=0,
                    nickname=team2_player1.nickname,
                    player_index=team2_player1.player_index,
                    info=team2_player1.info
                )
                t2p2_clone = PlayerModel.objects.create(
                    user_id=team2_player2.user_id,
                    username=team2_player2.username,
                    score=0,
                    nickname=team2_player2.nickname,
                    player_index=team2_player2.player_index,
                    info=team2_player2.info
                )
                game.players.add(t1p1_clone, t1p2_clone, t2p1_clone, t2p2_clone)
                games.append(game)

    # Ajoute tous les jeux au tournoi
    tournament.games.set(games)
    tournament.save()

def create_round_robin_matches(tournament):
    # get info to create tournament
    #players = list(tournament.players.all())
    players = list(tournament.players.all().order_by('user_id'))
    custom_name = "Game in " + tournament.custom_name
    creator = tournament.creator
    tournament_id = tournament.id
    score_to_win = tournament.score_to_win
    type = tournament.type
    game = tournament.game
    speed = tournament.speed
    color_board = tournament.color_board
    color_ball = tournament.color_ball
    color_wall = tournament.color_wall
    color_paddle = tournament.color_paddle
    games = []

    if type == '1v1':
        # Mode 1v1 : everyone plays against everyone
        for i in range(len(players)):
            for j in range(i + 1, len(players)):
                game = GameModel(
                    custom_name=custom_name,
                    creator=creator,
                    type=type,
                    game=game,
                    score_to_win=score_to_win,
                    players_maximum=2,
                    tournament_id=tournament_id,
                    speed=speed,
                    color_board=color_board,
                    color_ball=color_ball,
                    color_wall=color_wall,
                    color_paddle=color_paddle,
                    status='waiting'
                )
                game.save()
                # Clone the players for the game instance
                player1 = PlayerModel(
                    user_id=players[i].user_id,
                    username=players[i].username,
                    score=0,
                    nickname=players[i].nickname,
                    player_index=players[i].player_index,
                    info=players[i].info
                )
                player2 = PlayerModel(
                    user_id=players[j].user_id,
                    username=players[j].username,
                    score=0,
                    nickname=players[j].nickname,
                    player_index=players[j].player_index,
                    info=players[j].info
                )
                player1.save()
                player2.save()
                game.players.add(player1, player2)
                games.append(game)
    elif type == '2v2':
        # Mode 2v2 : each team plays against each team
        if len(players) % 2 != 0:
            raise ValueError("The number of players must be even for 2v2 matches.")
        # Create teams of 2
        teams = [(players[i], players[i + 1]) for i in range(0, len(players), 2)]
        # each team plays each other team
        for i in range(len(teams)):
            for j in range(i + 1, len(teams)):
                game = GameModel(
                    custom_name=custom_name,
                    type=type,
                    game=game,
                    score_to_win=score_to_win,
                    players_maximum=2,
                    tournament_id=tournament_id,
                    speed=speed,
                    color_board=color_board,
                    color_ball=color_ball,
                    color_wall=color_wall,
                    color_paddle=color_paddle,
                    status='waiting'
                )
                game.save()
                # Clone the players for the game instance
                team1_player1 = PlayerModel.objects.create(
                    user_id=teams[i][0].user_id,
                    username=teams[i][0].username,
                    score=0,
                    nickname=teams[i][0].nickname,
                    player_index=teams[i][0].player_index,
                    info=teams[i][0].info
                )
                team1_player2 = PlayerModel.objects.create(
                    user_id=teams[i][1].user_id,
                    username=teams[i][1].username,
                    score=0,
                    nickname=teams[i][1].nickname,
                    player_index=teams[i][1].player_index,
                    info=teams[i][1].info
                )
                team2_player1 = PlayerModel.objects.create(
                    user_id=teams[j][0].user_id,
                    username=teams[j][0].username,
                    score=0,
                    nickname=teams[j][0].nickname,
                    player_index=teams[j][0].player_index,
                    info=teams[j][0].info
                )
                team2_player2 = PlayerModel.objects.create(
                    user_id=teams[j][1].user_id,
                    username=teams[j][1].username,
                    score=0,
                    nickname=teams[j][1].nickname,
                    player_index=teams[j][1].player_index,
                    info=teams[j][1].info
                )
                game.players.add(team1_player1, team1_player2, team2_player1, team2_player2)
                games.append(game)
    # Add the games to the tournament
    tournament.games.set(games)
    tournament.save()
    """
