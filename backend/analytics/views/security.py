from rest_framework import viewsets
from ..models import SecurityEvent
from ..serializers import SecurityEventSerializer

class SecurityEventViewSet(viewsets.ModelViewSet):
    queryset = SecurityEvent.objects.all().order_by('id')
    serializer_class = SecurityEventSerializer
