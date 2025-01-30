from django.contrib import admin
from django.urls import path, include
from apphoki import views  # Importa as views do app "apphoki"

urlpatterns = [
    path('admin/', admin.site.urls),  # Rota para o painel de administração
    path('', include('apphoki.urls')),  # URL raiz que aponta para home.html
    # path('home_page/', views.home_page_view, name='home_page'),  # Rota para home_page.html
]
