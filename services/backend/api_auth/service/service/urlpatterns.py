from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path
from os import environ


urlpatterns = [
    path('api/' + environ.get('T_SELF_NAME') + '/', include('app.urlpatterns')),
    path('', include('django_prometheus.urls'))
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
