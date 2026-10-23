import uuid
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from ..models import AttendanceRecord, Store, UnknownFace
from ..serializers import AttendanceRecordSerializer, UnknownFaceSerializer

class AttendanceRecordViewSet(viewsets.ModelViewSet):
    queryset = AttendanceRecord.objects.all().order_by('-id')
    serializer_class = AttendanceRecordSerializer

    def create(self, request, *args, **kwargs):
        existing_ids = set(AttendanceRecord.objects.values_list('id', flat=True))
        idx = AttendanceRecord.objects.count() + 1
        while f"ATT-{idx:04d}" in existing_ids:
            idx += 1
        
        data = request.data.copy()
        data['id'] = f"ATT-{idx:04d}"
        if not data.get('storeId') and not data.get('store_id'):
            store = Store.objects.first()
            if store:
                data['storeId'] = store.id
        elif data.get('store_id'):
            data['storeId'] = data.get('store_id')

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class UnknownFaceViewSet(viewsets.ModelViewSet):
    queryset = UnknownFace.objects.all().order_by('-updated_at')
    serializer_class = UnknownFaceSerializer

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        p_key = data.get('personKey') or data.get('person_key')
        if p_key:
            existing = UnknownFace.objects.filter(person_key=p_key).first()
            if existing:
                existing.last_seen = data.get('lastSeen') or data.get('last_seen') or existing.last_seen
                existing.scan_count = data.get('scanCount') or data.get('scan_count') or (existing.scan_count + 1)
                existing.latest_snapshot = data.get('latestSnapshot') or data.get('latest_snapshot') or existing.latest_snapshot
                existing.snapshots = data.get('snapshots') or existing.snapshots
                if data.get('embedding'):
                    existing.embedding = data.get('embedding')
                existing.save()
                serializer = self.get_serializer(existing)
                return Response(serializer.data, status=status.HTTP_200_OK)

        if not data.get('id'):
            data['id'] = f"UF-{uuid.uuid4().hex[:8].upper()}"

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=False, methods=['delete'])
    def clear_all(self, request):
        UnknownFace.objects.all().delete()
        return Response({'status': 'All unknown faces cleared'}, status=status.HTTP_200_OK)
