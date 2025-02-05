from django.urls import path
from . import views

app_name = 'apphoki'

urlpatterns = [
    path('', views.home_view, name='home'),
    path('home_page/', views.home_page_view, name='home_page'),
    path('games/', views.games_view, name='games'),
    path('logout/', views.logout_view, name='logout'),
    path('flippyhoki/', views.flippyhoki_view, name='flippyhoki'),
    path('pays/', views.pays_view, name='pays'),
    path('space-wars/', views.space_wars_view, name='space-wars'),
    path('pixeldroid/', views.pixeldroid_view, name='pixeldroid'),
]