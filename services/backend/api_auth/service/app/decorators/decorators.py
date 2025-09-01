import jwt
import json
import requests
from django.conf import settings
from django.http import JsonResponse
from ..models import CustomUserModel
from django.contrib.auth.models import User
from ..utils.redis_client import r
import time
import os
import time
from django.core.exceptions import ObjectDoesNotExist
import logging

logger = logging.getLogger(__name__)


def handle_refresh_token(request, refresh_token):
    try:
        refresh_payload = jwt.decode(refresh_token, settings.REFRESH_TOKEN_SECRET, algorithms=['HS256'])
        request.user = User.objects.get(id=refresh_payload['user_id'])
    except:
        return JsonResponse({'success': False, 'message': 'decode refresh token error'}, status=404), None, None, None
    if not request.user:
        return JsonResponse({'success': False, 'message': 'Utilisateur non trouvé'}, status=404), None, None, None
    redis_refresh_token = r.get(f'user_{request.user.id}_refresh_token')
    if redis_refresh_token and redis_refresh_token.decode() != refresh_token:
        return JsonResponse({'success': False, 'message': 'Refresh token révoqué'}, status=401), None, None, None
    new_access_token = jwt.encode({'user_id': refresh_payload['user_id'], 'iat': int(time.time()), 'exp': int(time.time()) + 60 * 5}, settings.SECRET_KEY, algorithm='HS256')
    new_refresh_token = jwt.encode({'user_id': refresh_payload['user_id'], 'iat': int(time.time()), 'exp': int(time.time()) + 60 * 60 * 24 * 7}, settings.REFRESH_TOKEN_SECRET, algorithm='HS256')
    r.set(f'user_{request.user.id}_token', new_access_token, ex=60*5)
    r.set(f'user_{request.user.id}_refresh_token', new_refresh_token, ex=60*60*24*7)
    r.set(f'user_{request.user.id}_twoFA_verified{new_refresh_token}', 'True', ex=60 * 60 * 24) 
    r.set(f'user_{request.user.id}_twoFA_verified{new_access_token}', 'True', ex=60 * 60 * 24) 
    return None, new_access_token, new_refresh_token, refresh_payload['user_id']

def jwt_required(view_func):
    def _wrapped_view(request, *args, **kwargs):
        access_token = request.COOKIES.get('token')
        refresh_token = request.COOKIES.get('refresh_token')

        if refresh_token and not access_token:
            response, new_access_token, new_refresh_token, user_id = handle_refresh_token(request, refresh_token)
            if response:
                return response
            user = User.objects.get(id=user_id)
            if not user:
                return JsonResponse({'success': False, 'message': 'Utilisateur non trouvé'}, status=404)
            response = view_func(request, *args, **kwargs)
            response.set_cookie('token', new_access_token, max_age=60*5, httponly=True, secure=True, samesite='Strict')
            response.set_cookie('refresh_token', new_refresh_token, max_age=60*60*24*7, httponly=True, secure=True, samesite='Strict')
            return response


        if access_token:
            new_access_token = None
            new_refresh_token = None
            user_id = None
            user = None
            try:
                payload = jwt.decode(access_token, settings.SECRET_KEY, algorithms=['HS256'])
                user_id = payload['user_id']
            except:
                pass
            if user_id is not None:
                user = User.objects.get(id=user_id)
            if not user and refresh_token:
                response, new_access_token, new_refresh_token, user_id = handle_refresh_token(request, refresh_token)
                if response is not None:
                    return response
                user = User.objects.get(id=user_id)
                if not user:
                    return JsonResponse({'success': False, 'message': 'Utilisateur non trouvé'}, status=404)
            if not refresh_token:
                redis_token = r.get(f'user_{request.user.id}_token')
                if redis_token and redis_token.decode() != access_token:
                    return JsonResponse({'success': False, 'message': 'Access token révoqué'}, status=401)
            if user:
                request.user = user
                response = view_func(request, *args, **kwargs)
                if new_access_token is not None:
                    response.set_cookie('token', new_access_token, max_age=60*5, httponly=True, secure=True, samesite='Strict')
                if new_refresh_token is not None:
                    response.set_cookie('refresh_token', new_refresh_token, max_age=60*60*24*7, httponly=True, secure=True, samesite='Strict')
                return response
        
        return JsonResponse({'success': False, 'message': 'Accès refusé : jetons manquants ou expirés'}, status=401)

    return _wrapped_view


def handle_42_refresh_token(refresh_token):
    token_data = {
        'grant_type': 'refresh_token',
        'client_id': os.getenv('T_API_42_PUBLICKEY'),
        'client_secret': os.getenv('T_API_42_SECRETKEY'),
        'refresh_token': refresh_token
        }
    response = requests.post(url=os.getenv('T_API_42_URL_TOKN'), data=token_data)
    if response.status_code != 200:
        return JsonResponse({'success': False, 'message': 'Refresh token 42 invalid.'}, status=400), None, None, None, None
    token_data = response.json()
    expires_in_seconds = token_data.get('expires_in')
    access_token = token_data.get('access_token')
    refresh_token = token_data.get('refresh_token')
    if access_token is None or refresh_token is None:
        return JsonResponse({'success': False, 'message': 'Access token 42 or refresh token 42 missing.'}, status=400), None, None, None, None
        
    headers = {'Authorization': f'Bearer {access_token}'}
    user_info_response = requests.get(url=os.getenv('T_API_42_URL_USER'), headers=headers)
    user_data = user_info_response.json()
    intra_id = user_data.get('id')
    r.set(f'42_access_token{access_token}', intra_id, ex=expires_in_seconds)
    r.set(f'42_refresh_token{refresh_token}', intra_id, ex=60*60*24*7)

    user = User.objects.filter(custom_user__intra_id=intra_id).first()

    r.set(f'user_{user.id}_twoFA_verified{refresh_token}', 'True', ex=60 * 60 * 24) 
    r.set(f'user_{user.id}_twoFA_verified{access_token}', 'True', ex=60 * 60 * 24)
    
    r.set(f'user{intra_id}_42_access_token', access_token, ex=expires_in_seconds)
    r.set(f'user{intra_id}_42_refresh_token', refresh_token, ex=60*60*24*7)
    return None, intra_id, access_token, refresh_token, expires_in_seconds


def handle_42_access_token(access_token):
    intra_id = r.get(f'42_access_token{access_token}')
    if intra_id:
        intra_id = intra_id.decode()
        return None, intra_id, None
    else:
        headers = {'Authorization': f'Bearer {access_token}'}
        response = requests.get(url=os.getenv('T_API_42_URL_INFO'), headers=headers)
        token_data = response.json()
        expires_in_seconds = token_data.get('expires_in_seconds')
        if expires_in_seconds is None or expires_in_seconds <= 0 or response.status_code != 200:
            return JsonResponse({'success': False, 'message': 'Access token 42 expired.'}, status=400), None, None
        user_info_response = requests.get(url=os.getenv('T_API_42_URL_USER'), headers=headers)
        user_data = user_info_response.json()
        intra_id = user_data.get('id')
        r.set(f'42_access_token{access_token}', intra_id, ex=expires_in_seconds)
        return None, intra_id, expires_in_seconds
    

def jwt_42_required(view_func):
    def _wrapped_view(request, *args, **kwargs):
        access_token = request.COOKIES.get('42_access_token')
        refresh_token = request.COOKIES.get('42_refresh_token')

        if refresh_token and not access_token:
            response, intra_id, access_token, refresh_token, expires_in_seconds = handle_42_refresh_token(refresh_token)
            if response is not None:
                return response
            else:
                user = None
                if intra_id is not None:
                    user = User.objects.filter(custom_user__intra_id=intra_id).first()
                if user is None:
                    return JsonResponse({'success': False, 'message': 'User not found.'}, status=404)

                redis_42_refresh_token = r.get(f'user{user.custom_user.intra_id}_42_refresh_token')
                if redis_42_refresh_token and redis_42_refresh_token.decode() != refresh_token:
                    return JsonResponse({'success': False, 'message': 'Refresh token 42 revoked.'}, status=401)
                request.user = user
                response = view_func(request, *args, **kwargs)
                response.set_cookie('42_refresh_token', refresh_token, max_age=60*60*24*7, httponly=True, secure=True, samesite='Strict')
                response.set_cookie('42_access_token', access_token, max_age=expires_in_seconds, httponly=True, secure=True, samesite='Strict')
                return response
        
        elif access_token:
            new_refresh_token = None
            new_access_token = None
            response, intra_id, expires_in_seconds = handle_42_access_token(access_token)
            if response is not None and not refresh_token:
                return response
            else:
                user = None
                if intra_id is not None:
                    user = User.objects.filter(custom_user__intra_id=intra_id).first()
                if user is None and refresh_token:
                    response, intra_id, new_access_token, new_refresh_token, expires_in_seconds = handle_42_refresh_token(refresh_token)
                    if response is not None:
                        return response
                    else:
                        user = User.objects.filter(custom_user__intra_id=intra_id).first()
                        if not user:
                            return JsonResponse({'success': False, 'message': 'User not found.'}, status=404)

                if new_access_token is None:
                    redis_42_access_token = r.get(f'user{user.custom_user.intra_id}_42_access_token')
                    if redis_42_access_token and redis_42_access_token.decode() != access_token:
                        return JsonResponse({'success': False, 'message': 'Access token 42 revoked.'}, status=401)
                request.user = user
                response = view_func(request, *args, **kwargs)
                if new_refresh_token is not None:
                    response.set_cookie('42_refresh_token', new_refresh_token, max_age=60*60*24*7, httponly=True, secure=True, samesite='Strict')
                if new_access_token is not None:
                    response.set_cookie('42_access_token', new_access_token, max_age=expires_in_seconds, httponly=True, secure=True, samesite='Strict')
                return response
        else:
            return JsonResponse({'success': False, 'message': 'Access token 42 missing.'}, status=400)

    return _wrapped_view

def request_from_42_or_regular_user(view_func):
    def _wrapped_view(request, *args, **kwargs):
        if request.COOKIES.get('42_access_token') or request.COOKIES.get('42_refresh_token'):
            return jwt_42_required(view_func)(request, *args, **kwargs)
        else:
            return jwt_required(view_func)(request, *args, **kwargs)

    return _wrapped_view

def twoFA_status_check(view_func):
    def _wrapped_view(request, *args, **kwargs):
        user = request.user
        custom_user = CustomUserModel.objects.get(user=user)
        if custom_user.twoFA_enabled == False:
            return view_func(request, *args, **kwargs)
        twoFA_verified = twoFA_verified = (
            r.get(f'user_{user.id}_twoFA_verified{request.COOKIES.get("42_access_token")}') 
            or r.get(f'user_{user.id}_twoFA_verified{request.COOKIES.get("refresh_token")}') 
            or r.get(f'user_{user.id}_twoFA_verified{request.COOKIES.get("token")}') 
            or r.get(f'user_{user.id}_twoFA_verified{request.COOKIES.get("42_refresh_token")}')
        )
        if custom_user.twoFA_enabled and twoFA_verified and twoFA_verified.decode() == 'True':
            return view_func(request, *args, **kwargs)
        return JsonResponse({'success': False, 'message': '2FA non verifié'}, status=401)

    return _wrapped_view
