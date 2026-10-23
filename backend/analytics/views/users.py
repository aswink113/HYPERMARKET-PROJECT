from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from ..models import User, Store
from ..serializers import UserSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('id')
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        existing_ids = set(User.objects.values_list('id', flat=True))
        idx = User.objects.count() + 1
        while f"EMP-{idx:03d}" in existing_ids or f"USR-{idx:03d}" in existing_ids:
            idx += 1
        
        data = request.data.copy()
        if not data.get('id'):
            data['id'] = f"EMP-{idx:03d}"
        if not data.get('joinedDate') and not data.get('joined_date'):
            data['joined_date'] = '2026-10-12'
        if not data.get('permissions'):
            data['permissions'] = ['store_view', 'attendance_view']
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


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
