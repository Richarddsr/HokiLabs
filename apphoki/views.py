from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from .models import User, PlayerScore

def home_view(request):
    if request.user.is_authenticated:
        return redirect('apphoki:games')
    return render(request, 'apphoki/home.html')

@login_required
def games_view(request):
    # Get highest scores for each game
    flippy_score = PlayerScore.objects.filter(user=request.user, game='flippy').order_by('-score').first()
    pixeldroid_score = PlayerScore.objects.filter(user=request.user, game='pixeldroid').order_by('-score').first()
    
    context = {
        'flippy_score': flippy_score,
        'pixeldroid_score': pixeldroid_score,
    }
    return render(request, 'apphoki/games.html', context)

@login_required
def flippyhoki_view(request):
    if request.method == 'POST':
        score = request.POST.get('score')
        if score:
            PlayerScore.objects.create(
                user=request.user,
                score=int(score),
                game='flippy'
            )
            return JsonResponse({'status': 'success'})
    return render(request, 'apphoki/flippyhoki.html')

@login_required
def pixeldroid_view(request):
    if request.method == 'POST':
        score = request.POST.get('score')
        if score:
            PlayerScore.objects.create(
                user=request.user,
                score=int(score),
                game='pixeldroid'
            )
            return JsonResponse({'status': 'success'})
    return render(request, 'apphoki/pixeldroid.html')

def home_page_view(request):
    if request.user.is_authenticated:
        return redirect('apphoki:games')
        
    if request.method == 'POST':
        action = request.POST.get('action')
        
        if action == 'login':
            username = request.POST.get('username')
            password = request.POST.get('password')
            
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                messages.success(request, 'Login realizado com sucesso!')
                return redirect('apphoki:games')
            else:
                messages.error(request, 'Usuário ou senha inválidos!')
                
        elif action == 'register':
            username = request.POST.get('username')
            email = request.POST.get('email')
            password = request.POST.get('password')
            password2 = request.POST.get('password2')
            
            if password != password2:
                messages.error(request, 'As senhas não coincidem!')
                return redirect('apphoki:home_page')
                
            if User.objects.filter(username=username).exists():
                messages.error(request, 'Nome de usuário já existe!')
                return redirect('apphoki:home_page')
                
            if User.objects.filter(email=email).exists():
                messages.error(request, 'Email já cadastrado!')
                return redirect('apphoki:home_page')
            
            try:
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=password
                )
                messages.success(request, 'Cadastro realizado com sucesso! Faça login para continuar.')
                return redirect('apphoki:home_page')
            except Exception as e:
                messages.error(request, 'Erro ao criar usuário. Tente novamente.')
                
    return render(request, 'apphoki/home_page.html')

@login_required
def pays_view(request):
    return render(request, 'apphoki/pays.html')

@login_required
def space_wars_view(request):
    return render(request, 'apphoki/space-wars.html')

@login_required
def logout_view(request):
    logout(request)
    return redirect('apphoki:home')
