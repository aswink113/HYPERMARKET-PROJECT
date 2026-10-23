import uuid
from datetime import date
from rest_framework import viewsets, status
from rest_framework.response import Response
from ..models import Department, Designation
from ..serializers import DepartmentSerializer, DesignationSerializer

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all().order_by('name')
    serializer_class = DepartmentSerializer

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        if not data.get('id'):
            count = Department.objects.count() + 1
            data['id'] = f"DEP-{count:02d}-{uuid.uuid4().hex[:4].upper()}"
        if not data.get('createdAt') and not data.get('created_at'):
            data['created_at'] = str(date.today())
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class DesignationViewSet(viewsets.ModelViewSet):
    queryset = Designation.objects.all().order_by('title')
    serializer_class = DesignationSerializer

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        if not data.get('id'):
            count = Designation.objects.count() + 1
            data['id'] = f"DES-{count:02d}-{uuid.uuid4().hex[:4].upper()}"
        if not data.get('createdAt') and not data.get('created_at'):
            data['created_at'] = str(date.today())
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
