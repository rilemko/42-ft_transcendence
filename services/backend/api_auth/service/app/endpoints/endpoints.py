from django.http import JsonResponse
import json
from django.views.decorators.http import require_POST, require_GET
from django.contrib.auth import authenticate
from ..models import CustomUserModel
from django.contrib.auth.models import User
from ..decorators.decorators import jwt_required
import jwt, time, requests
from django.conf import settings
from django.shortcuts import redirect
from ..decorators.decorators import request_from_42_or_regular_user, twoFA_status_check
from .endpoints_utils import *
import os
from ..utils.redis_client import r
import re
import uuid

### STATUS #####################################################

@require_GET
def status(request):
    return JsonResponse({'status': 'OK'})

### ACCOUNT ####################################################

## > LOGIN < ###################

@require_POST
def login(request):

    try: data = json.loads(request.body.decode('utf-8'))
    except (json.JSONDecodeError, KeyError): return JsonResponse({'success': False, 'message': 'An error has occurred.'}, status=400)

    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return JsonResponse({'success': False, 'message': 'An error has occurred.'}, status=400)

    if re.search(r"^[A-Za-z0-9+._-]{3,}@[A-Za-z0-9+._-]{3,}\.[A-Za-z0-9+._-]{2,}$", username):
        user = User.objects.filter(email=username).first()
        if user:
            user = authenticate(request, username=user.username, password=password)
    else:
        user = authenticate(request, username=username, password=password)
    if user is not None:
        token = jwt.encode({'user_id': user.id, 'iat': int(time.time()), 'exp': int(time.time()) + 60 * 5}, settings.SECRET_KEY, algorithm='HS256')
        refresh_token = jwt.encode({'user_id': user.id, 'iat': int(time.time()), 'exp': int(time.time()) + 60 * 60 * 24 * 7}, settings.REFRESH_TOKEN_SECRET, algorithm='HS256')
        r.setex(f'user_{user.id}_token', 60 * 5, token)
        r.setex(f'user_{user.id}_refresh_token', 60 * 60 * 24 * 7, refresh_token)

        response = JsonResponse({'success': True, 'user_id': user.id, 'twoFA_enabled': user.custom_user.twoFA_enabled, 'profile_picture_url': user.custom_user.profile_picture_url}, status=200)
        response.set_cookie(key='token', value=token, httponly=True, secure=True, samesite='Strict', max_age=60 * 5)
        response.set_cookie(key='refresh_token', value=refresh_token, httponly=True, secure=True, samesite='Strict', max_age=60 * 60 * 24 * 7)

        if user.custom_user.twoFA_enabled:
            utils_send_twoFA_code(user)
        response.delete_cookie('42_access_token')
        response.delete_cookie('42_refresh_token')
        return response
    else:
        return JsonResponse({'success': False, 'message': 'Invalid username or password.'}, status=400)

## > LOGOUT < ##################

@request_from_42_or_regular_user
@require_GET
@twoFA_status_check
def logout(request):

    user = request.user
    r.delete(f'user_{user.id}_token')
    r.delete(f'user_{user.id}_refresh_token')
    r.delete(f'user_{user.custom_user.intra_id}_42_access_token')
    r.delete(f'user_{user.custom_user.intra_id}_42_refresh_token')
    r.delete(f'42_refresh_token_{request.COOKIES.get("42_refresh_token")}')
    r.delete(f'42_access_token_{request.COOKIES.get("42_access_token")}')
    r.delete(f'user_{user.id}_twoFA_code')
    r.delete(f'user_{user.id}_twoFA_verified{request.COOKIES.get("42_access_token")}')
    r.delete(f'user_{user.id}_twoFA_verified{request.COOKIES.get("42_refresh_token")}')
    r.delete(f'user_{user.id}_twoFA_verified{request.COOKIES.get("refresh_token")}')
    r.delete(f'user_{user.id}_twoFA_verified{request.COOKIES.get("token")}')
    response = JsonResponse({'success': True}, status=200)
    response.delete_cookie('42_access_token')
    response.delete_cookie('token')
    response.delete_cookie('refresh_token')
    response.delete_cookie('42_refresh_token')
    return response

## > REGISTER < ################

@require_POST
def register(request):

    try: data = json.loads(request.body.decode('utf-8'))
    except json.JSONDecodeError: return JsonResponse({'success': False, 'message': 'An error has occurred.'}, status=400)

    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    password2 = data.get('password2')

    if not username or not email or not password or not password2:
        return JsonResponse({'success': False, 'message': 'An error has occurred.'}, status=400)
    if not re.search(r"^[A-Za-z0-9_-]{5,16}$", username):
        return JsonResponse({'success': False, 'message': 'Username can only contain alphanumeric characters and "_-" symbols, and be between 5 and 16 characters long.'}, status=400)
    if "@student.42" in email or not re.search(r"^[A-Za-z0-9+._-]{3,}@[A-Za-z0-9+._-]{3,}\.[A-Za-z0-9+._-]{2,}$", email):
        return JsonResponse({'success': False, 'message': 'Invalid email address.'}, status=400)
    if not re.search(r"^[A-Za-z\d_@.!?-]{8,24}$", password):
        return JsonResponse({'success': False, 'message': 'Password can only contain alphanumeric characters and "_@.!?-" symbols, and be between 8 and 24 characters long.'}, status=400)
    if password != password2:
        return JsonResponse({'success': False, 'message': 'Confirmation password does not match.'}, status=400)
    if User.objects.filter(username=username).exists():
        return JsonResponse({'success': False, 'message': 'The username is already in use.'}, status=400)
    if User.objects.filter(email=email).exists():
        return JsonResponse({'success': False, 'message': 'The email address is already in use.'}, status=400)

    user = User.objects.create_user(username=username, email=email, password=password)
    custom_user = CustomUserModel(user=user)
    custom_user.intra_id = None
    custom_user.save()
    user.save()

    token = jwt.encode({'user_id': user.id, 'iat': int(time.time()), 'exp': int(time.time()) + 60 * 5}, settings.SECRET_KEY, algorithm='HS256')
    refresh_token = jwt.encode({'user_id': user.id, 'iat': int(time.time()), 'exp': int(time.time()) + 60 * 60 * 24 * 7}, settings.REFRESH_TOKEN_SECRET, algorithm='HS256')
    r.setex(f'user_{user.id}_token', 60 * 5, token)
    r.setex(f'user_{user.id}_refresh_token', 60 * 60 * 24 * 7, refresh_token)

    response = JsonResponse({'success': True, 'user_id': user.id, 'twoFA_enabled': user.custom_user.twoFA_enabled}, status=200)
    response.set_cookie(key='token', value=token, httponly=True, secure=True, samesite='Strict', max_age=60 * 5)
    response.set_cookie(key='refresh_token', value=refresh_token, httponly=True, secure=True, samesite='Strict', max_age=60 * 60 * 24 * 7)

    if user.custom_user.twoFA_enabled:
            utils_send_twoFA_code(user)
    response.delete_cookie('42_access_token')
    response.delete_cookie('42_refresh_token')
    return response

## > DELETE < ##################

@require_GET
@request_from_42_or_regular_user
@twoFA_status_check
def delete(request):

    user = request.user
    user.custom_user.delete()
    user.delete()
    r.delete(f'user_{user.id}_token')
    r.delete(f'user_{user.id}_refresh_token')
    r.delete(f'user_{user.custom_user.intra_id}_42_access_token')
    r.delete(f'user_{user.custom_user.intra_id}_42_refresh_token')
    r.delete(f'42_refresh_token_{request.COOKIES.get("42_refresh_token")}')
    r.delete(f'42_access_token_{request.COOKIES.get("42_access_token")}')
    r.delete(f'user_{user.id}_twoFA_code')
    r.delete(f'user_{user.id}_twoFA_verified{request.COOKIES.get("42_access_token")}')
    r.delete(f'user_{user.id}_twoFA_verified{request.COOKIES.get("42_refresh_token")}')
    r.delete(f'user_{user.id}_twoFA_verified{request.COOKIES.get("refresh_token")}')
    r.delete(f'user_{user.id}_twoFA_verified{request.COOKIES.get("token")}')
    response = JsonResponse({'success': True}, status=200)
    response.delete_cookie('42_access_token')
    response.delete_cookie('token')
    response.delete_cookie('refresh_token')
    response.delete_cookie('42_refresh_token')
    return response

### 42 #########################################################

## > CALLBACK < ################

def callback42(request):

    code = request.GET.get('code')

    token_data = {
        'grant_type': 'authorization_code',
        'client_id': os.getenv('T_API_42_PUBLICKEY'),
        'client_secret': os.getenv('T_API_42_SECRETKEY'),
        'code': code,
        'redirect_uri': os.getenv('T_API_42_CALLBACK')
    }

    token_response = requests.post(url=os.getenv('T_API_42_URL_TOKN'), data=token_data)
    token_json = token_response.json()
    access_token = token_json.get('access_token')
    expires_in_seconds = token_json.get('expires_in')
    refresh_token = token_json.get('refresh_token')

    if access_token:
        headers = {'Authorization': f'Bearer {access_token}'}
        user_response = requests.get(url=os.getenv('T_API_42_URL_USER'), headers=headers)
        user_data = user_response.json()

        username = user_data.get('login') + '#42'
        intra_id = user_data.get('id')
        email = user_data.get('email')
        image_url = user_data['image']['versions']['medium'] # ['micro', 'small', 'medium', 'large']

        user = User.objects.filter(custom_user__intra_id=intra_id).first()
        if user is None:
            first_connection = True
        else:
            first_connection = False

        if first_connection:
            user = User.objects.create_user(username=username, email=email)
            user.set_unusable_password()
            user.save()
            custom_user = CustomUserModel(user=user)
            custom_user.intra_id = intra_id
            custom_user.profile_picture_url = image_url
        else:
            custom_user = CustomUserModel.objects.get(user=user)
            custom_user.intra_id = intra_id

        user.save()
        custom_user.save()

        response = redirect('/home')
        response.set_cookie('42_access_token', access_token, httponly=True, secure='True', samesite='Strict', max_age=expires_in_seconds)
        response.set_cookie('42_refresh_token', refresh_token, httponly=True, secure='True', samesite='Strict', max_age=60 * 60 * 24 * 7)
        r.set(f'user_{user.id}_twoFA_verified{request.COOKIES.get("42_access_token")}', value='True', ex=expires_in_seconds)
        r.set(f'user_{user.id}_twoFA_verified{request.COOKIES.get("42_refresh_token")}', value='True', ex=60 * 60 * 24 * 7)
        r.setex(f'user_{user.custom_user.intra_id}_42_access_token', expires_in_seconds, access_token)
        r.setex(f'42_access_token_{access_token}', expires_in_seconds, intra_id)
        r.setex(f'user_{user.custom_user.intra_id}_42_refresh_token', 60 * 60 * 24 * 7, refresh_token)
        r.setex(f'42_refresh_token_{refresh_token}', 60 * 60 * 24 * 7, intra_id)

        response.delete_cookie('token')
        response.delete_cookie('refresh_token')
        return response
    return JsonResponse({'success': False, 'message': 'Authentication failed.'}, status=400)

### SECURITY ###################################################

## > 2FA: VALIDATION < #########

@require_POST
@jwt_required
def twofa_validation(request):

    try: data = json.loads(request.body.decode('utf-8'))
    except json.JSONDecodeError: return JsonResponse({'success': False, 'message': 'An error has occurred.'}, status=400)

    user = request.user

    twofa_0 = data.get('twofa_0')
    twofa_1 = data.get('twofa_1')
    twofa_2 = data.get('twofa_2')
    twofa_3 = data.get('twofa_3')
    twofa_4 = data.get('twofa_4')
    twofa_5 = data.get('twofa_5')

    if not twofa_0 or not twofa_1 or not twofa_2 or not twofa_3 or not twofa_4 or not twofa_5:
        return JsonResponse({'success': False, 'message': 'An error has occurred.'}, status=400)

    redis_code = r.get(f'user_{user.id}_twoFA_code')
    if redis_code is None:
        return JsonResponse({'success': False, 'message': 'The verification code has expired.'}, status=404)

    twoFA_code = twofa_0 + twofa_1 + twofa_2 + twofa_3 + twofa_4 + twofa_5

    if redis_code.decode('utf-8') == twoFA_code:
        r.set(f'user_{user.id}_twoFA_verified{request.COOKIES.get("refresh_token")}', 'True', ex=60 * 60 * 24)
        r.set(f'user_{user.id}_twoFA_verified{request.COOKIES.get("token")}', 'True', ex=60 * 60 * 24)
        return JsonResponse({'success': True}, status=200)
    return JsonResponse({'success': False, 'message': 'The verification code is invalid.'}, status=400)

## > 2FA: RESEND < #############

@require_GET
@jwt_required
def twofa_resend(request):

    user = request.user
    utils_send_twoFA_code(user)
    return JsonResponse({'success': True}, status=200)

### PROFILE ####################################################

## > ME < ######################

@request_from_42_or_regular_user
@require_GET
@twoFA_status_check
def me(request):

    user = request.user

    username = user.username
    email = user.email
    profile_picture_url = user.custom_user.profile_picture_url
    flatness = user.custom_user.flatness
    horizontalPosition = user.custom_user.horizontalPosition
    verticalPosition = user.custom_user.verticalPosition
    horizontalPosition = user.custom_user.horizontalPosition
    verticalPosition = user.custom_user.verticalPosition
    suitColor = user.custom_user.suitColor
    visColor = user.custom_user.visColor
    ringsColor = user.custom_user.ringsColor
    bpColor = user.custom_user.bpColor
    twoFA_enabled = user.custom_user.twoFA_enabled
    return JsonResponse({'success': True, 'user_id': user.id, 'username': username, 'email': email, 'profile_picture_url': profile_picture_url, 'flatness': flatness, 'horizontalPosition': horizontalPosition, 'verticalPosition': verticalPosition, 'suitColor': suitColor, 'visColor': visColor, 'ringsColor': ringsColor, 'bpColor': bpColor, 'twofa_enabled': twoFA_enabled}, status=200)

## > ME: UPDATE AVATAR < #######

@request_from_42_or_regular_user
@require_POST
@twoFA_status_check
def me_update_avatar(request):

    user = request.user
    if request.FILES.get('avatar', None):
        file = request.FILES['avatar']
        ext = os.path.splitext(file.name)[1]
        if ext.lower() not in ['.jpg', '.jpeg']:
            return JsonResponse({'success': False, 'message': 'Unsupported image format. Upload an image in .jpg or .jpeg format.'}, status=400)
        new_name = f"{uuid.uuid4()}{ext}"
        utils_upload_file(file, new_name)
        user.custom_user.profile_picture_url = f"{settings.MEDIA_URL}{new_name}"
        user.custom_user.save()
        user.save()
        return JsonResponse({'success': True, 'profile_picture_url': user.custom_user.profile_picture_url}, status=200)
    return JsonResponse({'success': False, 'message': 'An error has occurred.'}, status=400)

## > ME: UPDATE COLORS < #######

@request_from_42_or_regular_user
@require_POST
@twoFA_status_check
def me_update_colors(request):

    try: data = json.loads(request.body.decode('utf-8'))
    except json.JSONDecodeError: return JsonResponse({'success': False, 'message': 'An error has occurred.'}, status=400)

    suitColor = data.get('suitColor', '#ffffff')
    visColor = data.get('visColor', '#ffffff')
    ringsColor = data.get('ringsColor', '#ffffff')
    bpColor = data.get('bpColor', '#ffffff')

    if not suitColor or not visColor or not ringsColor or not bpColor:
        return JsonResponse({'success': False, 'message': 'An error has occurred.'}, status=400)

    for color in suitColor, visColor, ringsColor, bpColor:
        if not re.search(r"^#[A-Fa-f0-9]{6}$", color):
            return JsonResponse({'success': False, 'message': 'An error has occurred.'}, status=400)

    def clamp(value, min_value, max_value):
        return max(min_value, min(value, max_value))

    user = request.user

    custom_user = user.custom_user
    custom_user.suitColor = suitColor
    custom_user.visColor = visColor
    custom_user.ringsColor = ringsColor
    custom_user.bpColor = bpColor
    user.custom_user.flatness = clamp(float(data.get('flatness')), 1.5, 4.2)
    user.custom_user.horizontalPosition = clamp(float(data.get('horizontalPosition')), 4.9, 10)
    user.custom_user.verticalPosition = clamp(float(data.get('verticalPosition')), -1.5, 1.5)
    user.custom_user.save()
    user.save()

    return JsonResponse({'success': True, 'flatness': user.custom_user.flatness, 'horizontalPosition': user.custom_user.horizontalPosition, 'verticalPosition': user.custom_user.verticalPosition, 'suitColor': suitColor, 'visColor': visColor, 'ringsColor': ringsColor, 'bpColor': bpColor }, status=200)

## > ME: UPDATE INFO < #########

@request_from_42_or_regular_user
@require_POST
@twoFA_status_check
def me_update_info(request):

    try: data = json.loads(request.body.decode('utf-8'))
    except json.JSONDecodeError: return JsonResponse({'success': False, 'message': 'An error has occurred.'}, status=400)

    username = data.get('username')
    email = data.get('email')

    if not username or not email:
        return JsonResponse({'success': False, 'message': 'An error has occurred.'}, status=400)
    if username.endswith('#42') or not re.search(r"^[A-Za-z0-9_-]{5,24}$", username):
        return JsonResponse({'success': False, 'message': 'Username can only contain alphanumeric characters and "_-" symbols, and be between 5 and 24 characters long.'}, status=400)
    if "@student.42" in email or not re.search(r"^[A-Za-z0-9+._-]{3,}@[A-Za-z0-9+._-]{3,}\.[A-Za-z0-9+._-]{2,}$", email):
        return JsonResponse({'success': False, 'message': 'Invalid email address.'}, status=400)

    user = request.user

    if User.objects.filter(username=username).exclude(id=user.id).exists():
        return JsonResponse({'success': False, 'message': 'The username is already in use.'}, status=400)
    if User.objects.filter(email=email).exclude(id=user.id).exists():
        return JsonResponse({'success': False, 'message': 'The email address is already in use.'}, status=400)

    user.username = username
    user.email = email

    user.custom_user.save()
    user.save()

    return JsonResponse({'success': True, 'username': username, 'email': email}, status=200)

## > ME: UPDATE PASSWORD < #####

@request_from_42_or_regular_user
@require_POST
@twoFA_status_check
def me_update_password(request):

    try: data = json.loads(request.body.decode('utf-8'))
    except json.JSONDecodeError: return JsonResponse({'success': False, 'message': 'An error has occurred.'}, status=400)

    password = data.get('password')
    password2 = data.get('password2')

    if not password or not password2 or not re.search(r"^[A-Za-z\d_@.!?-]{8,24}$", password):
        return JsonResponse({'success': False, 'message': 'Password can only contain alphanumeric characters and "_@.!?-" symbols, and be between 8 and 24 characters long.'}, status=400)
    if password != password2:
        return JsonResponse({'success': False, 'message': 'Confirmation password does not match.'}, status=400)

    user = request.user
    user.set_password(password)
    user.custom_user.save()
    user.save()
    return JsonResponse({'success': True}, status=200)

## > ME: UPDATE 2FA < ##########

@request_from_42_or_regular_user
@require_POST
@twoFA_status_check
def me_update_twofa_status(request):

    try: data = json.loads(request.body.decode('utf-8'))
    except json.JSONDecodeError: return JsonResponse({'success': False, 'message': 'An error has occurred.'}, status=400)

    twoFA_enabled = data.get('twoFA_enabled')
    if twoFA_enabled == None:
        return JsonResponse({'success': False, 'message': 'twoFA_enabled value is missing.'}, status=400)
    user = request.user

    user.custom_user.twoFA_enabled = twoFA_enabled == 'True'
    user.custom_user.save()
    if twoFA_enabled:
        if request.COOKIES.get("refresh_token"):
            r.set(f'user_{user.id}_twoFA_verified{request.COOKIES.get("refresh_token")}', 'True', ex=60 * 60 * 24)
    elif not twoFA_enabled:
        if request.COOKIES.get("refresh_token"):
            r.set(f'user_{user.id}_twoFA_verified{request.COOKIES.get("refresh_token")}', 'False', ex=60 * 60 * 24)
    return JsonResponse({'success': True, 'message': 'twoFa updated'}, status=200)

## > USER < ####################

@request_from_42_or_regular_user
@require_GET
@twoFA_status_check
def user(request, user_id):

    user = User.objects.filter(id=user_id).first()

    if not user:
        return JsonResponse({'success': False, 'message': 'This user does not exist.'}, status=400)

    username = user.username
    profile_picture_url = user.custom_user.profile_picture_url
    suitColor = user.custom_user.suitColor
    visColor = user.custom_user.visColor
    ringsColor = user.custom_user.ringsColor
    bpColor = user.custom_user.bpColor
    flatness = user.custom_user.flatness
    horizontalPosition = user.custom_user.horizontalPosition
    verticalPosition = user.custom_user.verticalPosition
    return JsonResponse({'success': True, 'user_id': user.id, 'username': username, 'profile_picture_url': profile_picture_url, 'suitColor': suitColor, 'visColor': visColor, 'ringsColor': ringsColor, 'bpColor': bpColor, 'flatness': flatness, 'horizontalPosition': horizontalPosition, 'verticalPosition': verticalPosition,}, status=200)

## > USERS LIST < ##############

@request_from_42_or_regular_user
@require_GET
@twoFA_status_check
def user_list(request):

    users = User.objects.exclude(id=request.user.id)
    users_data = sorted(
        [
            {
                'user_id': user.id,
                'username': user.username,
                'profile_picture_url': user.custom_user.profile_picture_url,
                'is_friend': request.user.custom_user.friends_list.filter(id=user.custom_user.id).exists(),
                'is_online': (r.get(f'user_{user.id}_status') or b'offline').decode('utf-8')
            }
            for user in users
        ],
        key=lambda x: x['is_friend'],
        reverse=True
    )
    return JsonResponse({'success': True, 'users': users_data}, status=200)

### FRIENDS ####################################################

## > FRIEND: ADD < #############

@require_GET
@request_from_42_or_regular_user
@twoFA_status_check
def friend_add(request, user_id):

    if user_id == request.user.id:
        return JsonResponse({'success': False, 'message': 'Nice try lol.'}, status=400)

    friend = User.objects.filter(id=user_id).first()

    if not friend:
        return JsonResponse({'success': False, 'message': 'This user does not exist.'}, status=400)

    user = request.user
    if user.custom_user.friends_list.filter(id=user_id).exists():
        return JsonResponse({'success': False, 'message': 'This player is already in your friends list.'}, status=400)
    user.custom_user.friends_list.add(friend.custom_user)
    return JsonResponse({'success': True}, status=200)

## > FRIEND: REMOVE < ##########

@require_GET
@request_from_42_or_regular_user
@twoFA_status_check
def friend_remove(request, user_id):

    friend = User.objects.filter(id=user_id).first()

    if not friend:
        return JsonResponse({'success': False, 'message': 'This user does not exist.'}, status=400)

    user = request.user
    user.custom_user.friends_list.remove(friend.custom_user)
    return JsonResponse({'success': True}, status=200)

## > FRIEND: LIST < ############

@require_GET
@request_from_42_or_regular_user
@twoFA_status_check
def friend_list(request):

    user = request.user
    friends_list = user.custom_user.friends_list.all()
    friends = [{'username': friend.user.username, 'profile_picture_url': friend.profile_picture_url} for friend in friends_list]
    return JsonResponse({'success': True, 'friends': friends}, status=200)

