from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from .models import Idea, Vote

User = get_user_model()


class VoteTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='frank', password='sup3rs3cret!')
        self.token = Token.objects.create(user=self.user)
        self.idea = Idea.objects.create(title='Dark mode', created_by=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')

    def test_cannot_vote_twice(self):
        self.client.post(reverse('api:idea-vote', args=[self.idea.pk]))
        response = self.client.post(reverse('api:idea-vote', args=[self.idea.pk]))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.idea.refresh_from_db()
        self.assertEqual(self.idea.vote_count, 1)
        self.assertEqual(Vote.objects.filter(idea=self.idea, user=self.user).count(), 1)
