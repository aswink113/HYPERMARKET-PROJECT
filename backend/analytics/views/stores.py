from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from ..models import Store, TenantConfig
from ..serializers import StoreSerializer, TenantConfigSerializer

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
