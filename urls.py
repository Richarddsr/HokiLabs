# urls.py no projeto principal
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('apphoki.urls')),  # Inclui todas as URLs do aplicativo apphoki
]
