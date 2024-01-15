from django.contrib import admin
from .models import *
from .user.models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['id', 'displayName', 'host', 'url', 'github', 'profilePicture']

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['type', 'author', 'comment', 'contentType', 'published', 'id']

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = [
            'type', 'id', 'title', 'source', 'origin', 'description', 'contentType',
            'content', 'author', 'categories', 'count', 'comments', 'published',
            'visibility', 'specific_author','unlisted', 'image'
        ]

@admin.register(Follower)
class FollowerAdmin(admin.ModelAdmin):
    list_filter = ['type', 'follower', 'followed']
    list_display = ['type', 'follower', 'followed']

@admin.register(FollowRequest)
class Friend_RequestAdmin(admin.ModelAdmin):
    list_filter = ['type', 'summary', 'actor', 'object']
    list_display = ['type', 'summary', 'actor', 'object']

@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_filter = ['type', 'summary', 'author', 'post', 'comment']
    list_display = ['type', 'summary', 'author', 'post', 'comment']

@admin.register(Inbox)
class InboxAdmin(admin.ModelAdmin):
    list_filter = ['type', 'author', 'item', 'published']
    list_display = ['type', 'author', 'item', 'published']