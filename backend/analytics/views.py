from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, action
from .models import Store, TenantConfig, User, Camera, ProduceBin, SecurityEvent, AttendanceRecord, AnalyticsSetting
from .serializers import (
    StoreSerializer, TenantConfigSerializer, UserSerializer, CameraSerializer,
    ProduceBinSerializer, SecurityEventSerializer, AttendanceRecordSerializer, AnalyticsSettingSerializer
)

class StoreViewSet(viewsets.ModelViewSet):
    queryset = Store.objects.all().order_by('id')
    serializer_class = StoreSerializer

    def create(self, request, *args, **kwargs):
        existing_ids = set(Store.objects.values_list('id', flat=True))
        idx = 1
        while f"STORE-{idx:02d}" in existing_ids:
            idx += 1
        new_store_id = f"STORE-{idx:02d}"
        
        data = request.data.copy()
        data['id'] = new_store_id
        data['created_at'] = '2026-10-08'
        if not data.get('client_username') and not data.get('clientUsername'):
            code_str = data.get('code', '').lower().replace('-', '_')
            data['client_username'] = f"client_{code_str}"
        elif data.get('clientUsername'):
            data['client_username'] = data.get('clientUsername')

        if not data.get('client_password') and not data.get('clientPassword'):
            data['client_password'] = 'password123'
        elif data.get('clientPassword'):
            data['client_password'] = data.get('clientPassword')

        if data.get('managerName'):
            data['manager_name'] = data.get('managerName')
        if data.get('managerEmail'):
            data['manager_email'] = data.get('managerEmail')

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        store = serializer.save()

        # Provision Tenant Config
        TenantConfig.objects.create(
            store=store,
            tenant_id=f"TNT-{idx:03d}",
            client_name=store.name,
            enabled_modules={"storeOverview": True, "cameraLiveView": True, "produceBins": True, "analyticsSettings": False, "securityReview": False, "staffAttendance": True},
            visible_charts={"trafficDwellChart": True, "produceFillAlerts": True, "posSalesCorrelation": True},
            camera_controls_allowed=False,
            theme_customization={"brandTitle": f"{store.name} Portal", "primaryColor": "#2563eb"}
        )

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

@api_view(['GET'])
def get_tenant_configs(request):
    configs = TenantConfig.objects.all()
    res = {}
    for cfg in configs:
        serializer = TenantConfigSerializer(cfg)
        res[cfg.store_id] = serializer.data
    return Response(res)

@api_view(['PUT'])
def update_tenant_config(request, store_id):
    try:
        cfg = TenantConfig.objects.get(store_id=store_id)
    except TenantConfig.DoesNotExist:
        return Response({'detail': 'Tenant config not found'}, status=status.HTTP_404_NOT_FOUND)

    data = request.data
    if 'enabledModules' in data:
        cfg.enabled_modules = data['enabledModules']
    if 'visibleCharts' in data:
        cfg.visible_charts = data['visibleCharts']
    if 'cameraControlsAllowed' in data:
        cfg.camera_controls_allowed = data['cameraControlsAllowed']
    if 'themeCustomization' in data:
        cfg.theme_customization = data['themeCustomization']
    if 'clientName' in data:
        cfg.client_name = data['clientName']

    cfg.save()
    serializer = TenantConfigSerializer(cfg)
    return Response(serializer.data)

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

class ProduceBinViewSet(viewsets.ModelViewSet):
    queryset = ProduceBin.objects.all().order_by('id')
    serializer_class = ProduceBinSerializer

class SecurityEventViewSet(viewsets.ModelViewSet):
    queryset = SecurityEvent.objects.all().order_by('id')
    serializer_class = SecurityEventSerializer

class AttendanceRecordViewSet(viewsets.ModelViewSet):
    queryset = AttendanceRecord.objects.all().order_by('id')
    serializer_class = AttendanceRecordSerializer

class AnalyticsSettingViewSet(viewsets.ModelViewSet):
    queryset = AnalyticsSetting.objects.all().order_by('id')
    serializer_class = AnalyticsSettingSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('id')
    serializer_class = UserSerializer


@api_view(['POST'])
def login_view(request):
    identifier = request.data.get('identifier', '').strip()
    password = request.data.get('password', '').strip()

    # Search user by username, email, or client_username in Store
    user = User.objects.filter(username=identifier).first() or User.objects.filter(email=identifier).first()
    if user:
        if password and user.password and user.password != password:
            return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response({
            'user': UserSerializer(user).data,
            'token': f"token_{user.id}_demo",
            'isClientPortal': user.role != 'super_admin'
        })

    store = Store.objects.filter(client_username=identifier).first()
    if store:
        if password and store.client_password and store.client_password != password:
            return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        client_user = {
            'id': f"CLIENT-{store.id}",
            'name': f"{store.name} Portal Manager",
            'email': store.manager_email or f"manager@{store.code.lower()}.com",
            'username': store.client_username,
            'role': 'store_manager',
            'assignedStoreId': store.id,
            'avatar': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            'phone': '+1 (555) 999-0000',
            'department': 'Store Client Operations',
            'joinedDate': store.created_at or '2025-01-01',
            'permissions': ['store_view', 'camera_view', 'produce_view', 'attendance_view']
        }
        return Response({
            'user': client_user,
            'token': f"token_{store.id}_client_demo",
            'isClientPortal': True
        })

    return Response({'detail': 'User or Client portal not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def status_view(request):
    return Response({'status': 'online', 'database': 'PostgreSQL'})

