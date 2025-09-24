
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.views.static import serve as static_serve

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # URLs da API
    path('api/', include('academia.urls')),
    
    # URLs para servir as páginas HTML do frontend do usuário
    path('', TemplateView.as_view(template_name='academia/home.html'), name='home'),
    path('login/', TemplateView.as_view(template_name='academia/login.html'), name='login'),
    path('portal/', TemplateView.as_view(template_name='academia/portal.html'), name='portal'),
    path('cadastro/', TemplateView.as_view(template_name='academia/cadastro.html'), name='cadastro'),
    path('recuperar/', TemplateView.as_view(template_name='academia/recuperar.html'), name='recuperar'),
    path('robots.txt', static_serve, {'path': 'robots.txt', 'document_root': settings.STATIC_ROOT}),
    path('sitemap.xml', static_serve, {'path': 'sitemap.xml', 'document_root': settings.STATIC_ROOT}),
]

# Servir arquivos estáticos e media em desenvolvimento
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

