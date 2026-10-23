from rest_framework import viewsets
from ..models import AnalyticsSetting
from ..serializers import AnalyticsSettingSerializer

class AnalyticsSettingViewSet(viewsets.ModelViewSet):
    queryset = AnalyticsSetting.objects.all().order_by('id')
    serializer_class = AnalyticsSettingSerializer
