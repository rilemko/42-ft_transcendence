from django.urls import path
from .endpoints import endpoints

urlpatterns = [
    path('status/',                         endpoints.status, name='status'),

    path('account/login/',                  endpoints.login, name='login'),
    path('account/logout/',                 endpoints.logout, name='logout'),
    path('account/register/',               endpoints.register, name='register'),
    path('account/delete/',                 endpoints.delete, name='delete'),

    path('callback/42/',                    endpoints.callback42, name='callback42'),

    path('twofa/validate/',                 endpoints.twofa_validation, name='twofa_validation'),
    path('twofa/resend/',                   endpoints.twofa_resend, name='twofa_resend'),

    path('me/',                             endpoints.me, name='me'),
    path('me/update/avatar/',               endpoints.me_update_avatar, name='me_update_avatar'),
    path('me/update/colors/',               endpoints.me_update_colors, name='me_update_colors'),
    path('me/update/info/',                 endpoints.me_update_info, name='me_update_info'),
    path('me/update/password/',             endpoints.me_update_password, name='me_update_password'),
    path('me/update/twofa/',                endpoints.me_update_twofa_status, name='me_update_twofa_status'),

    path('user/<int:user_id>/',             endpoints.user, name='user_details'),
    path('user/list/',                      endpoints.user_list, name='user_list'),

    path('friend/add/<int:user_id>/',       endpoints.friend_add, name='friend_add'),
    path('friend/remove/<int:user_id>/',    endpoints.friend_remove, name='friend_remove'),
    path('friend/list/',                    endpoints.friend_list, name='friend_list'),
]
