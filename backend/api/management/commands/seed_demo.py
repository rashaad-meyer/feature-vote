from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

from api.models import Idea

User = get_user_model()

DEMO_USERNAME = 'demo'
DEMO_PASSWORD = 'demo12345'

SAMPLE_IDEAS = [
    ('Dark mode support', 'Let users switch between light and dark themes.', 142),
    ('CSV export', 'Download the full ideas list as a CSV file.', 98),
    ('Keyboard shortcuts', 'Navigate and vote without leaving the keyboard.', 76),
    ('Slack notifications', 'Notify a channel when a new idea is posted.', 54),
    ('Idea comments', 'Let users discuss an idea in a thread.', 41),
    ('Tags and filtering', 'Categorise ideas with tags and filter by them.', 33),
    ('Public roadmap', 'Show which ideas are planned, in progress, or shipped.', 21),
    ('Email digests', 'Weekly summary of the top-voted ideas.', 8),
]


class Command(BaseCommand):
    help = 'Seed a demo user and sample ideas (idempotent).'

    @transaction.atomic
    def handle(self, *args, **options):
        user, created = User.objects.get_or_create(
            username=DEMO_USERNAME,
            defaults={'email': 'demo@example.com'},
        )
        if created:
            user.set_password(DEMO_PASSWORD)
            user.save(update_fields=['password'])
            self.stdout.write(self.style.SUCCESS(f'Created user "{DEMO_USERNAME}".'))
        else:
            self.stdout.write(f'User "{DEMO_USERNAME}" already exists.')

        added = 0
        for title, description, vote_count in SAMPLE_IDEAS:
            _, idea_created = Idea.objects.get_or_create(
                title=title,
                defaults={
                    'description': description,
                    'vote_count': vote_count,
                    'created_by': user,
                },
            )
            added += int(idea_created)

        self.stdout.write(
            self.style.SUCCESS(
                f'Seeding complete. {added} new idea(s) added; '
                f'login with {DEMO_USERNAME} / {DEMO_PASSWORD}.'
            )
        )
