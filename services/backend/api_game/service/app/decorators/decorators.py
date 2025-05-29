from ..endpoints.endpoints_utils import utils_get_info
from django.http import JsonResponse
from requests.cookies import RequestsCookieJar

import logging
logger = logging.getLogger(__name__)

def jwt_required(view_func):
	def _wrapped_view(request, *args, **kwargs):
		user, returned_cookies_from_auth = utils_get_info(request.COOKIES)
		request.user = user

		if not request.user:
			return JsonResponse({'success': False, 'message': 'Failed to fetch user info.'}, status=400)
		response = view_func(request, *args, **kwargs)
		if isinstance(returned_cookies_from_auth, RequestsCookieJar):
			for cookie in returned_cookies_from_auth:
				response.set_cookie(key=cookie.name, value=cookie.value, httponly=True, secure=cookie.secure, samesite='Strict', max_age=int(cookie.expires))
		return response
	return _wrapped_view
