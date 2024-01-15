from rest_framework import serializers

from .user.serializers import UserSerializer
from .models import Comment, Follower, Inbox, Like, Post, FollowRequest

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['type', 'author', 'comment', 'contentType', 'published', 'id', 'post']
        read_only_fields = ['type', 'published', 'post', 'id']

class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = [
            'type', 'id', 'title', 'source', 'origin', 'description', 'contentType',
            'content', 'author', 'categories', 'count', 'comments', 'published',
            'visibility', 'specific_author','unlisted', 'image'
        ]
        read_only_fields = ['type', 'id', 'author', 'count', 'comments', 'published', 'categories']

        def validate(self, data):
            visibility = data.get('visibility')
            specific_author = data.get('specific_author')
            if visibility == 'SPECIFIC_AUTHOR' and not specific_author:
                raise serializers.ValidationError({
                    'specific_author': 'You must select a specific author when visibility is set to "SPECIFIC_AUTHOR".'
                })

            if visibility != 'SPECIFIC_AUTHOR' and specific_author:
                raise serializers.ValidationError({
                    'specific_author': 'A specific author can only be selected when visibility is set to "SPECIFIC_AUTHOR".'
                })

            return data

class FollowRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = FollowRequest
        fields = ['type', 'summary', 'actor', 'object']
        read_only_fields = ['type', 'object']

class FollowerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Follower
        fields = [ 'type', 'followed', 'follower']
        read_only_fields = ['type']

class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = [ 'type', 'summary', 'author', 'post', 'comment']
        read_only_fields = ['type', ]

class InboxSerializer(serializers.ModelSerializer):
    class Meta:
        model = Inbox
        fields = ['item']
        read_only_fields = ['item', 'published']