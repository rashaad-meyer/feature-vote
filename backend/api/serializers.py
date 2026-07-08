from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import Idea, Vote

User = get_user_model()


class IdeaSerializer(serializers.ModelSerializer):
    created_by = serializers.ReadOnlyField(source='created_by.username')
    has_voted = serializers.SerializerMethodField()

    class Meta:
        model = Idea
        fields = [
            'id',
            'title',
            'description',
            'vote_count',
            'created_at',
            'created_by',
            'has_voted',
        ]
        read_only_fields = ['vote_count', 'created_at', 'created_by']

    def get_has_voted(self, obj) -> bool:
        request = self.context.get('request')
        if request is None or not request.user.is_authenticated:
            return False
        return obj.votes.filter(user=request.user).exists()


class VoteSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Vote
        fields = ['id', 'idea', 'user', 'created_at']
        read_only_fields = ['idea', 'user', 'created_at']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        validators=[validate_password],
        style={'input_type': 'password'},
    )

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
        )
