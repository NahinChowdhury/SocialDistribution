from rest_framework import serializers
from django.core.exceptions import ObjectDoesNotExist

from api.user.serializers import UserSerializer
from api.user.models import User


class RegisterSerializer(UserSerializer):
    password = serializers.CharField(max_length=128, min_length=8, write_only=True, required=True)
    displayName = serializers.CharField(required=True, max_length=255)

    class Meta:
        model = User
        fields = ['id','displayName', 'github', 'profilePicture', 'url', 'password', 'is_active', 'created', 'updated']
        

    def create(self, validated_data):
        try:
            user = User.objects.get(displayName=validated_data['displayName'])
        except ObjectDoesNotExist:
            user = User.objects.create_user(**validated_data)
        return user