from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.urls import reverse
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from .models import Idea, Vote

User = get_user_model()


class RegistrationTests(APITestCase):
    def test_register_creates_user(self):
        url = reverse('api:register')
        payload = {'username': 'alice', 'email': 'alice@example.com', 'password': 'sup3rs3cret!'}
        response = self.client.post(url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='alice').exists())
        self.assertNotIn('password', response.data)

    def test_register_rejects_weak_password(self):
        url = reverse('api:register')
        response = self.client.post(url, {'username': 'bob', 'password': '123'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_returns_token(self):
        User.objects.create_user(username='carol', password='sup3rs3cret!')
        url = reverse('api:login')
        response = self.client.post(url, {'username': 'carol', 'password': 'sup3rs3cret!'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)


class IdeaTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='dave', password='sup3rs3cret!')
        self.other = User.objects.create_user(username='erin', password='sup3rs3cret!')
        self.token = Token.objects.create(user=self.user)

    def authenticate(self, user=None):
        token = self.token if user is None else Token.objects.create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

    def test_list_ideas_is_public(self):
        Idea.objects.create(title='Dark mode', created_by=self.user)
        response = self.client.get(reverse('api:idea-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

    def test_create_requires_authentication(self):
        response = self.client.post(reverse('api:idea-list'), {'title': 'Nope'})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_idea_sets_owner(self):
        self.authenticate()
        response = self.client.post(
            reverse('api:idea-list'),
            {'title': 'Export to CSV', 'description': 'Please'},
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        idea = Idea.objects.get()
        self.assertEqual(idea.created_by, self.user)
        self.assertEqual(idea.vote_count, 0)

    def test_only_owner_can_delete(self):
        idea = Idea.objects.create(title='Dark mode', created_by=self.user)
        self.authenticate(user=self.other)
        response = self.client.delete(reverse('api:idea-detail', args=[idea.pk]))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_owner_can_delete(self):
        idea = Idea.objects.create(title='Dark mode', created_by=self.user)
        self.authenticate()
        response = self.client.delete(reverse('api:idea-detail', args=[idea.pk]))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)


class VoteTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='frank', password='sup3rs3cret!')
        self.token = Token.objects.create(user=self.user)
        self.idea = Idea.objects.create(title='Dark mode', created_by=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')

    def test_vote_increments_count(self):
        response = self.client.post(reverse('api:idea-vote', args=[self.idea.pk]))
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.idea.refresh_from_db()
        self.assertEqual(self.idea.vote_count, 1)
        self.assertTrue(Vote.objects.filter(idea=self.idea, user=self.user).exists())

    def test_cannot_vote_twice(self):
        self.client.post(reverse('api:idea-vote', args=[self.idea.pk]))
        response = self.client.post(reverse('api:idea-vote', args=[self.idea.pk]))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.idea.refresh_from_db()
        self.assertEqual(self.idea.vote_count, 1)

    def test_unvote_decrements_count(self):
        self.client.post(reverse('api:idea-vote', args=[self.idea.pk]))
        response = self.client.post(reverse('api:idea-unvote', args=[self.idea.pk]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.idea.refresh_from_db()
        self.assertEqual(self.idea.vote_count, 0)
        self.assertFalse(Vote.objects.filter(idea=self.idea, user=self.user).exists())

    def test_unvote_without_vote_fails(self):
        response = self.client.post(reverse('api:idea-unvote', args=[self.idea.pk]))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_vote_requires_authentication(self):
        self.client.credentials()
        response = self.client.post(reverse('api:idea-vote', args=[self.idea.pk]))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class OrderingTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='grace', password='sup3rs3cret!')
        # Created oldest-first; low_votes is newest.
        self.high_votes = Idea.objects.create(
            title='Popular', vote_count=50, created_by=self.user
        )
        self.low_votes = Idea.objects.create(
            title='Fresh', vote_count=1, created_by=self.user
        )

    def _titles(self, ordering):
        response = self.client.get(reverse('api:idea-list'), {'ordering': ordering})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        return [row['title'] for row in response.data['results']]

    def test_default_ordering_is_by_votes(self):
        response = self.client.get(reverse('api:idea-list'))
        titles = [row['title'] for row in response.data['results']]
        self.assertEqual(titles, ['Popular', 'Fresh'])

    def test_order_by_newest(self):
        self.assertEqual(self._titles('-created_at'), ['Fresh', 'Popular'])

    def test_order_by_votes(self):
        self.assertEqual(self._titles('-vote_count'), ['Popular', 'Fresh'])


class SeedCommandTests(APITestCase):
    def test_seed_demo_is_idempotent(self):
        call_command('seed_demo')
        call_command('seed_demo')
        self.assertEqual(User.objects.filter(username='demo').count(), 1)
        self.assertEqual(Idea.objects.count(), 8)
        self.assertTrue(
            self.client.login(username='demo', password='demo12345')
        )
