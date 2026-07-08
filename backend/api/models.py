from django.conf import settings
from django.db import models


class Idea(models.Model):
    """A feature idea that users can vote on."""

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    vote_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ideas',
    )

    class Meta:
        ordering = ['-vote_count', '-created_at']

    def __str__(self):
        return self.title


class Vote(models.Model):
    """A single user's vote for an idea. A user may vote for an idea once."""

    idea = models.ForeignKey(
        Idea,
        on_delete=models.CASCADE,
        related_name='votes',
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='votes',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['idea', 'user'],
                name='unique_vote_per_user_per_idea',
            ),
        ]

    def __str__(self):
        return f'{self.user} voted for {self.idea}'
