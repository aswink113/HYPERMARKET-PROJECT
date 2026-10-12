from rest_framework import serializers
from .models import Store, TenantConfig, User, Camera, ProduceBin, SecurityEvent, AttendanceRecord, AnalyticsSetting, Department, Designation

class StoreSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False)
    cameraCount = serializers.IntegerField(source='camera_count', read_only=True)
    managerName = serializers.CharField(source='manager_name', allow_null=True, required=False)
    managerEmail = serializers.CharField(source='manager_email', allow_null=True, required=False)
    clientUsername = serializers.CharField(source='client_username', allow_null=True, required=False)
    clientPassword = serializers.CharField(source='client_password', allow_null=True, required=False)
    createdAt = serializers.CharField(source='created_at', read_only=True)

    class Meta:
        model = Store
        fields = ['id', 'name', 'code', 'city', 'country', 'address', 'status', 'cameraCount', 'managerName', 'managerEmail', 'clientUsername', 'clientPassword', 'createdAt']

class TenantConfigSerializer(serializers.ModelSerializer):
    tenantId = serializers.CharField(source='tenant_id', allow_null=True, required=False)
    storeId = serializers.CharField(source='store_id', read_only=True)
    clientName = serializers.CharField(source='client_name', allow_null=True, required=False)
    enabledModules = serializers.JSONField(source='enabled_modules')
    visibleCharts = serializers.JSONField(source='visible_charts')
    cameraControlsAllowed = serializers.BooleanField(source='camera_controls_allowed')
    themeCustomization = serializers.JSONField(source='theme_customization')

    class Meta:
        model = TenantConfig
        fields = ['tenantId', 'storeId', 'clientName', 'enabledModules', 'visibleCharts', 'cameraControlsAllowed', 'themeCustomization']

class UserSerializer(serializers.ModelSerializer):
    assignedStoreId = serializers.CharField(source='assigned_store_id', allow_null=True, required=False)
    joinedDate = serializers.CharField(source='joined_date', allow_null=True, required=False)
    facePhotos = serializers.JSONField(source='face_photos', required=False)

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'username', 'password', 'role', 'assignedStoreId', 'avatar', 'facePhotos', 'phone', 'gender', 'designation', 'department', 'joinedDate', 'permissions']

class CameraSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False)
    storeId = serializers.SlugRelatedField(source='store', slug_field='id', queryset=Store.objects.all())
    ipAddress = serializers.CharField(source='ip_address', allow_null=True, required=False)
    cameraUsername = serializers.CharField(source='camera_username', allow_null=True, required=False)
    cameraPassword = serializers.CharField(source='camera_password', allow_null=True, required=False)
    retentionDays = serializers.IntegerField(source='retention_days', required=False)
    analyticsActive = serializers.JSONField(source='analytics_active', required=False)
    streamUrl = serializers.CharField(source='stream_url', allow_null=True, required=False)
    posterUrl = serializers.CharField(source='poster_url', allow_null=True, required=False)
    rtspPort = serializers.CharField(source='rtsp_port', allow_null=True, required=False)
    streamPath = serializers.CharField(source='stream_path', allow_null=True, required=False)
    lastHeartbeat = serializers.CharField(source='last_heartbeat', allow_null=True, required=False)

    class Meta:
        model = Camera
        fields = ['id', 'name', 'location', 'storeId', 'status', 'ipAddress', 'rtspPort', 'streamPath', 'cameraUsername', 'cameraPassword', 'resolution', 'fps', 'fov', 'retentionDays', 'codecs', 'analyticsActive', 'streamUrl', 'posterUrl', 'lastHeartbeat']

class ProduceBinSerializer(serializers.ModelSerializer):
    cameraId = serializers.CharField(source='camera_id', allow_null=True, required=False)
    cameraName = serializers.CharField(source='camera_name', allow_null=True, required=False)
    storeId = serializers.SlugRelatedField(source='store', slug_field='id', queryset=Store.objects.all())
    fillPercentage = serializers.IntegerField(source='fill_percentage')
    lastChecked = serializers.CharField(source='last_checked', allow_null=True, required=False)
    mappedSku = serializers.CharField(source='mapped_sku', allow_null=True, required=False)
    pricePerKg = serializers.FloatField(source='price_per_kg')
    targetWeightKg = serializers.FloatField(source='target_weight_kg')
    estVisibleWeightKg = serializers.FloatField(source='est_visible_weight_kg')
    polygonPoints = serializers.JSONField(source='polygon_points')

    class Meta:
        model = ProduceBin
        fields = ['id', 'name', 'category', 'cameraId', 'cameraName', 'storeId', 'fillPercentage', 'status', 'confidence', 'lastChecked', 'mappedSku', 'pricePerKg', 'targetWeightKg', 'estVisibleWeightKg', 'polygonPoints']

class SecurityEventSerializer(serializers.ModelSerializer):
    cameraId = serializers.CharField(source='camera_id', allow_null=True, required=False)
    cameraName = serializers.CharField(source='camera_name', allow_null=True, required=False)
    storeId = serializers.SlugRelatedField(source='store', slug_field='id', queryset=Store.objects.all())
    eventType = serializers.CharField(source='event_type', allow_null=True, required=False)
    clipDurationSec = serializers.IntegerField(source='clip_duration_sec')
    thumbnailUrl = serializers.CharField(source='thumbnail_url', allow_null=True, required=False)
    reviewedBy = serializers.CharField(source='reviewed_by', allow_null=True, required=False)
    reviewedAt = serializers.CharField(source='reviewed_at', allow_null=True, required=False)

    class Meta:
        model = SecurityEvent
        fields = ['id', 'timestamp', 'cameraId', 'cameraName', 'storeId', 'location', 'eventType', 'confidence', 'status', 'clipDurationSec', 'thumbnailUrl', 'notes', 'reviewedBy', 'reviewedAt']

class AttendanceRecordSerializer(serializers.ModelSerializer):
    employeeId = serializers.CharField(source='employee_id', allow_null=True, required=False)
    employeeName = serializers.CharField(source='employee_name', allow_null=True, required=False)
    storeId = serializers.SlugRelatedField(source='store', slug_field='id', queryset=Store.objects.all())
    shiftDate = serializers.CharField(source='shift_date', allow_null=True, required=False)
    clockInTime = serializers.CharField(source='clock_in_time', allow_null=True, required=False)
    clockOutTime = serializers.CharField(source='clock_out_time', allow_null=True, required=False)
    breakDurationMinutes = serializers.IntegerField(source='break_duration_minutes')
    authMethod = serializers.CharField(source='auth_method', allow_null=True, required=False)
    cameraOccupancySignal = serializers.CharField(source='camera_occupancy_signal', allow_null=True, required=False)

    class Meta:
        model = AttendanceRecord
        fields = ['id', 'employeeId', 'employeeName', 'storeId', 'department', 'shiftDate', 'clockInTime', 'clockOutTime', 'breakDurationMinutes', 'authMethod', 'status', 'cameraOccupancySignal']

class AnalyticsSettingSerializer(serializers.ModelSerializer):
    dataPurpose = serializers.CharField(source='data_purpose', allow_null=True, required=False)
    requiresReview = serializers.BooleanField(source='requires_review')

    class Meta:
        model = AnalyticsSetting
        fields = ['id', 'key', 'name', 'description', 'enabled', 'accuracy', 'dataPurpose', 'model', 'requiresReview']

class DepartmentSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False)
    floorZone = serializers.CharField(source='floor_zone', allow_null=True, required=False)
    createdAt = serializers.CharField(source='created_at', allow_null=True, required=False)

    class Meta:
        model = Department
        fields = ['id', 'name', 'code', 'description', 'floorZone', 'createdAt']

class DesignationSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False)
    createdAt = serializers.CharField(source='created_at', allow_null=True, required=False)

    class Meta:
        model = Designation
        fields = ['id', 'title', 'department', 'level', 'createdAt']


class UnknownFaceSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False)
    personKey = serializers.CharField(source='person_key')
    firstSeen = serializers.CharField(source='first_seen')
    lastSeen = serializers.CharField(source='last_seen')
    scanCount = serializers.IntegerField(source='scan_count')
    latestSnapshot = serializers.CharField(source='latest_snapshot')
    snapshots = serializers.JSONField(required=False)
    embedding = serializers.JSONField(required=False)

    class Meta:
        from .models import UnknownFace
        model = UnknownFace
        fields = ['id', 'personKey', 'firstSeen', 'lastSeen', 'scanCount', 'latestSnapshot', 'snapshots', 'embedding']
