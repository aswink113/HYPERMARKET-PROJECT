from rest_framework import viewsets
from ..models import ProduceBin
from ..serializers import ProduceBinSerializer

class ProduceBinViewSet(viewsets.ModelViewSet):
    queryset = ProduceBin.objects.all().order_by('id')
    serializer_class = ProduceBinSerializer
