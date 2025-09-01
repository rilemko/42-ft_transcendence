from django.http import JsonResponse
from django.contrib.auth.models import User
from ..models import CustomUserModel
from ..utils.redis_client import r
import random
from django.core.mail import send_mail
from django.conf import settings
from os import path, makedirs
import requests, jwt, os

def utils_send_twoFA_code(user):
    twoFA_code = random.randint(100000, 999999)
    r.setex(f'user_{user.id}_twoFA_code', 300, twoFA_code)
    send_mail(
        'Transcendence',
        f'Your verification code is: {twoFA_code}',
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )

def utils_upload_file(file, new_name):
    if not path.exists(settings.MEDIA_ROOT):
        makedirs(settings.MEDIA_ROOT)
    file_path = path.join(settings.MEDIA_ROOT, new_name)
    with open(file_path, 'wb+') as destination:
        for chunk in file.chunks():
            destination.write(chunk)

def utils_get_user(token, refresh_token, token42, refresh_token42):
    if token:
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user_id = payload.get('user_id')
            if user_id:
                user = User.objects.get(id=user_id)
                redis_token = r.get(f'user_{user.id}_token')
                if redis_token and redis_token.decode() != token:
                    return None
                return user
            else:
                return None
        except jwt.ExpiredSignatureError:
            pass
        except jwt.InvalidTokenError:
            return None
        except User.DoesNotExist:
            return None

    if refresh_token:
        try:
            refresh_payload = jwt.decode(refresh_token, settings.REFRESH_TOKEN_SECRET, algorithms=['HS256'])
            user_id = refresh_payload.get('user_id')
            if user_id:
                user = User.objects.get(id=user_id)
                redis_refresh_token = r.get(f'user_{user.id}_refresh_token')
                if redis_refresh_token and redis_refresh_token.decode() != refresh_token:
                    return None
                return user
            else:
                return None
        except jwt.ExpiredSignatureError:
            return None
        
    if refresh_token42 and not token42:
        try:
            token_data = {
                'grant_type': 'refresh_token',
                'client_id': os.getenv('T_API_42_PUBLICKEY'),
                'client_secret': os.getenv('T_API_42_SECRETKEY'),
                'refresh_token': refresh_token
                }
            response = requests.post(url=os.getenv('T_API_42_URL_TOKN'), data=token_data)
            if response.status_code != 200:
                return None
            token_data = response.json()
            expires_in_seconds = token_data.get('expires_in')
            token42 = token_data.get('access_token')
            if token42 is None:
                return None
            headers = {'Authorization': f'Bearer {token42}'}
            user_info_response = requests.get(url=os.getenv('T_API_42_URL_INFO'), headers=headers)
            user_data = user_info_response.json()
            intra_id = user_data.get('id')
            r.set(f'42_access_token{token42}', intra_id, expires_in_seconds)
            user = User.objects.filter(custom_user__intra_id=intra_id).first()
            if not user:
                return None
            redis_42_refresh_token = r.get(f'user_{user.custom_user.intra_id}_42_refresh_token')
            if redis_42_refresh_token and redis_42_refresh_token.decode() != refresh_token42:
                return None
            return user
        except requests.RequestException:
            return None

    if token42:
        try:
            headers = {'Authorization': f'Bearer {token42}'}
            response = requests.get(url=os.getenv('T_API_42_URL_INFO'), headers=headers)
            token_data = response.json()
            expires_in_seconds = token_data.get('expires_in_seconds')
            if expires_in_seconds is None or expires_in_seconds <= 0:
                return None
            user_info_response = requests.get(url=os.getenv('T_API_42_URL_USER'), headers=headers)
            user_data = user_info_response.json()
            intra_id = user_data.get('id')
            user = User.objects.filter(custom_user__intra_id=intra_id).first()
            if not user:
                return None
            redis_42_token = r.get(f'user_{user.custom_user.intra_id}_42_access_token')
            if redis_42_token and redis_42_token.decode() != token42:
                return None
            return user
        except requests.RequestException:
            return None
    return None

