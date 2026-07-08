from django.contrib import admin

from .models import Idea, Vote


@admin.register(Idea)
class IdeaAdmin(admin.ModelAdmin):
    list_display = ['title', 'vote_count', 'created_by', 'created_at']
    list_filter = ['created_at']
    search_fields = ['title', 'description']


@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    list_display = ['idea', 'user', 'created_at']
    list_filter = ['created_at']
