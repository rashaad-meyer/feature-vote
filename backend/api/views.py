from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import F
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter
from rest_framework.response import Response

from .models import Idea, Vote
from .permissions import IsOwnerOrReadOnly
from .serializers import IdeaSerializer, RegisterSerializer

User = get_user_model()


class IdeaViewSet(viewsets.ModelViewSet):
    """CRUD for ideas plus vote / unvote actions."""

    queryset = Idea.objects.all()
    serializer_class = IdeaSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filter_backends = [OrderingFilter]
    ordering_fields = ['vote_count', 'created_at']
    ordering = ['-vote_count', '-created_at']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def vote(self, request, pk=None):
        idea = self.get_object()
        with transaction.atomic():
            _, created = Vote.objects.get_or_create(idea=idea, user=request.user)
            if created:
                Idea.objects.filter(pk=idea.pk).update(vote_count=F('vote_count') + 1)
        if not created:
            return Response(
                {'detail': 'You have already voted for this idea.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        idea.refresh_from_db()
        serializer = self.get_serializer(idea)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def unvote(self, request, pk=None):
        idea = self.get_object()
        with transaction.atomic():
            deleted, _ = Vote.objects.filter(idea=idea, user=request.user).delete()
            if deleted:
                Idea.objects.filter(pk=idea.pk).update(vote_count=F('vote_count') - 1)
        if not deleted:
            return Response(
                {'detail': 'You have not voted for this idea.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        idea.refresh_from_db()
        serializer = self.get_serializer(idea)
        return Response(serializer.data, status=status.HTTP_200_OK)


class RegisterView(generics.CreateAPIView):
    """Register a new user account."""

    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
