from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    StoreViewSet, CameraViewSet, ProduceBinViewSet, SecurityEventViewSet,
    AttendanceRecordViewSet, AnalyticsSettingViewSet, UserViewSet,
    DepartmentViewSet, DesignationViewSet, UnknownFaceViewSet, get_tenant_configs,
    update_tenant_config, login_view, status_view
)
from .stream_views import camera_stream_view, camera_snapshot_view, camera_scan_face_view


router = DefaultRouter()
router.register(r'stores', StoreViewSet, basename='store')
router.register(r'cameras', CameraViewSet, basename='camera')
router.register(r'produce-bins', ProduceBinViewSet, basename='producebin')
router.register(r'security-events', SecurityEventViewSet, basename='securityevent')
router.register(r'attendance', AttendanceRecordViewSet, basename='attendancerecord')
router.register(r'analytics-settings', AnalyticsSettingViewSet, basename='analyticssetting')
router.register(r'users', UserViewSet, basename='user')
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'designations', DesignationViewSet, basename='designation')
router.register(r'unknown-faces', UnknownFaceViewSet, basename='unknownface')


urlpatterns = [
    path('cameras/<str:camera_id>/stream/', camera_stream_view, name='camera-stream'),
    path('cameras/<str:camera_id>/snapshot/', camera_snapshot_view, name='camera-snapshot'),
    path('cameras/<str:camera_id>/scan-face/', camera_scan_face_view, name='camera-scan-face'),
    path('status', status_view, name='status'),
    path('auth/login', login_view, name='login'),
    path('tenant-configs', get_tenant_configs, name='tenant-configs-list'),
    path('tenant-configs/<str:store_id>', update_tenant_config, name='tenant-config-detail'),
    path('', include(router.urls)),
]

