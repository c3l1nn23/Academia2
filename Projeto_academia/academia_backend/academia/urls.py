from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from . import views

# Router para ViewSets
router = DefaultRouter()
router.register(r'planos', views.PlanoViewSet)

urlpatterns = [
    # URLs do router
    path('', include(router.urls)),
    
    # URLs de autenticação JWT
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('register/', views.RegisterView.as_view(), name='register_direct'),  # URL direta
    path('login/', views.LoginView.as_view(), name='login_direct'),  # URL direta
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('auth/user/', views.UserProfileView.as_view(), name='user_profile'),
    path('auth/check-email/', views.CheckEmailView.as_view(), name='check_email'),
    path('auth/password-reset/', views.PasswordResetView.as_view(), name='password_reset'),
    
    # URLs específicas da academia
    path('dashboard/', views.DashboardView.as_view(), name='dashboard'),
    path('planos/escolher/', views.EscolherPlanoView.as_view(), name='escolher_plano'),
    path('treinos/', views.TreinoListView.as_view(), name='treinos'),
    path('treinos/<int:pk>/', views.TreinoDetailView.as_view(), name='treino_detail'),
    path('exercicios/', views.ExercicioListView.as_view(), name='exercicios'),
    path('avaliacoes/', views.AvaliacaoListView.as_view(), name='avaliacoes'),
]
