from django.db import models

class Store(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=50, default='active')
    camera_count = models.IntegerField(default=0)
    manager_name = models.CharField(max_length=150, blank=True, null=True)
    manager_email = models.CharField(max_length=150, blank=True, null=True)
    client_username = models.CharField(max_length=100, blank=True, null=True)
    client_password = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        db_table = 'stores'

    def __str__(self):
        return self.name

class TenantConfig(models.Model):
    store = models.OneToOneField(Store, on_delete=models.CASCADE, primary_key=True, related_name='tenant_config')
    tenant_id = models.CharField(max_length=50, blank=True, null=True)
    client_name = models.CharField(max_length=255, blank=True, null=True)
    enabled_modules = models.JSONField(default=dict)
    visible_charts = models.JSONField(default=dict)
    camera_controls_allowed = models.BooleanField(default=True)
    theme_customization = models.JSONField(default=dict)

    class Meta:
        db_table = 'tenant_configs'

class User(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=100, blank=True, null=True)
    password = models.CharField(max_length=100, blank=True, null=True)
    role = models.CharField(max_length=50, default='store_manager')
    assigned_store_id = models.CharField(max_length=50, blank=True, null=True)
    avatar = models.TextField(blank=True, null=True)
    face_photos = models.JSONField(default=list, blank=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    gender = models.CharField(max_length=20, blank=True, null=True)
    designation = models.CharField(max_length=150, blank=True, null=True)
    department = models.CharField(max_length=100, blank=True, null=True)
    joined_date = models.CharField(max_length=50, blank=True, null=True)
    permissions = models.JSONField(default=list)

    class Meta:
        db_table = 'users'

class Camera(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True, null=True)
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='cameras')
    status = models.CharField(max_length=50, default='online')
    ip_address = models.CharField(max_length=50, blank=True, null=True)
    resolution = models.CharField(max_length=50, default='1080p (1920x1080)')
    fps = models.IntegerField(default=30)
    fov = models.CharField(max_length=50, default='90 deg Fixed')
    retention_days = models.IntegerField(default=14)
    codecs = models.CharField(max_length=100, default='H.264 / ONVIF Profile T')
    analytics_active = models.JSONField(default=dict)
    stream_url = models.TextField(blank=True, null=True)
    poster_url = models.TextField(blank=True, null=True)
    rtsp_port = models.CharField(max_length=10, default='554')
    stream_path = models.CharField(max_length=255, default='/Streaming/Channels/101')
    camera_username = models.CharField(max_length=100, blank=True, null=True)
    camera_password = models.CharField(max_length=100, blank=True, null=True)
    last_heartbeat = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        db_table = 'cameras'

class ProduceBin(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100, blank=True, null=True)
    camera_id = models.CharField(max_length=50, blank=True, null=True)
    camera_name = models.CharField(max_length=255, blank=True, null=True)
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='produce_bins')
    fill_percentage = models.IntegerField(default=50)
    status = models.CharField(max_length=50, default='OK')
    confidence = models.FloatField(default=0.9)
    last_checked = models.CharField(max_length=50, blank=True, null=True)
    mapped_sku = models.CharField(max_length=50, blank=True, null=True)
    price_per_kg = models.FloatField(default=0)
    target_weight_kg = models.FloatField(default=0)
    est_visible_weight_kg = models.FloatField(default=0)
    polygon_points = models.JSONField(default=list)

    class Meta:
        db_table = 'produce_bins'

class SecurityEvent(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    timestamp = models.CharField(max_length=50, blank=True, null=True)
    camera_id = models.CharField(max_length=50, blank=True, null=True)
    camera_name = models.CharField(max_length=255, blank=True, null=True)
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='security_events')
    location = models.CharField(max_length=255, blank=True, null=True)
    event_type = models.CharField(max_length=100, blank=True, null=True)
    confidence = models.FloatField(default=0.85)
    status = models.CharField(max_length=50, default='Pending Review')
    clip_duration_sec = models.IntegerField(default=15)
    thumbnail_url = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    reviewed_by = models.CharField(max_length=150, blank=True, null=True)
    reviewed_at = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        db_table = 'security_events'

class AttendanceRecord(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    employee_id = models.CharField(max_length=50, blank=True, null=True)
    employee_name = models.CharField(max_length=150, blank=True, null=True)
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='attendance_records')
    department = models.CharField(max_length=100, blank=True, null=True)
    shift_date = models.CharField(max_length=50, blank=True, null=True)
    clock_in_time = models.CharField(max_length=50, blank=True, null=True)
    clock_out_time = models.CharField(max_length=50, blank=True, null=True)
    break_duration_minutes = models.IntegerField(default=0)
    auth_method = models.CharField(max_length=50, blank=True, null=True)
    status = models.CharField(max_length=50, blank=True, null=True)
    camera_occupancy_signal = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        db_table = 'attendance_records'

class AnalyticsSetting(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    key = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    enabled = models.BooleanField(default=True)
    accuracy = models.FloatField(default=90.0)
    data_purpose = models.TextField(blank=True, null=True)
    model = models.CharField(max_length=100, blank=True, null=True)
    requires_review = models.BooleanField(default=False)

    class Meta:
        db_table = 'analytics_settings'

class Department(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=150, unique=True)
    code = models.CharField(max_length=50, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    floor_zone = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        db_table = 'departments'

    def __str__(self):
        return self.name

class Designation(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    title = models.CharField(max_length=150, unique=True)
    department = models.CharField(max_length=150, blank=True, null=True)
    level = models.CharField(max_length=50, default='Associate')
    created_at = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        db_table = 'designations'

    def __str__(self):
        return self.title


class UnknownFace(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    person_key = models.CharField(max_length=50, unique=True)
    first_seen = models.CharField(max_length=100)
    last_seen = models.CharField(max_length=100)
    scan_count = models.IntegerField(default=1)
    latest_snapshot = models.TextField()
    snapshots = models.JSONField(default=list)
    embedding = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'unknown_faces'
        ordering = ['-updated_at']

    def __str__(self):
        return self.person_key
