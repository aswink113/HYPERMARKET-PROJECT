from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from ..models import Camera
from ..serializers import CameraSerializer

class CameraViewSet(viewsets.ModelViewSet):
    queryset = Camera.objects.all().order_by('id')
    serializer_class = CameraSerializer

    def create(self, request, *args, **kwargs):
        existing_ids = set(Camera.objects.values_list('id', flat=True))
        idx = 1
        while f"CAM-{idx:02d}" in existing_ids:
            idx += 1
        new_cam_id = f"CAM-{idx:02d}"

        data = request.data.copy()
        data['id'] = new_cam_id
        if data.get('storeId') and not data.get('store_id'):
            data['store_id'] = data.get('storeId')
        if data.get('ipAddress') and not data.get('ip_address'):
            data['ip_address'] = data.get('ipAddress')
        if data.get('cameraUsername') and not data.get('camera_username'):
            data['camera_username'] = data.get('cameraUsername')
        if data.get('cameraPassword') and not data.get('camera_password'):
            data['camera_password'] = data.get('cameraPassword')
        if not data.get('last_heartbeat') and not data.get('lastHeartbeat'):
            data['last_heartbeat'] = 'Just now'
        if not data.get('analytics_active') and not data.get('analyticsActive'):
            data['analytics_active'] = {"peopleTracking": True, "produceAvailability": True, "queueDetection": True, "safetyMonitoring": True, "lossPrevention": True}

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=True, methods=['put'], url_path='analytics')
    def update_analytics(self, request, pk=None):
        camera = self.get_object()
        camera.analytics_active = request.data.get('analyticsActive', camera.analytics_active)
        camera.save()
        serializer = self.get_serializer(camera)
        return Response(serializer.data)
