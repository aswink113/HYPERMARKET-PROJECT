from django.contrib import admin
from django.urls import path, include

from django.http import JsonResponse

def root_status_view(request):
    return JsonResponse({
        "message": "Hypermarket Vision Analytics Backend API is running.",
        "api_endpoints": "http://127.0.0.1:8001/api/",
        "status": "online",
        "database": "PostgreSQL"
    })

urlpatterns = [
    path('', root_status_view, name='root-status'),
    path('admin/', admin.site.urls),
    path('api/', include('analytics.urls')),
]

