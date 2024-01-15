from api.user.models import User
from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ['id', 'displayName', 'github', 'profilePicture', 'url', 'is_active', 'created', 'updated', 'host']
        read_only_field = ['is_active', 'created', 'updated', 'host']