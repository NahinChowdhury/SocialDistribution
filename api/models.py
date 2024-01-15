from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
import secrets
from api.user.models import User
from django.db.models import F
from django.core.exceptions import ValidationError

def generateID():
    return secrets.token_urlsafe(32)

class Post(models.Model):
    CONTENT_TYPES = (
    ('text/markdown', 'text/markdown'),
    ('text/plain', 'text/plain'),
    ('application/base64', 'application/base64'),
    ('image/png;base64', 'image/png;base64'),
    ('image/jpeg;base64', 'image/jpeg;base64')
    )

    type = models.CharField(max_length=50, default="post")
    title = models.CharField(max_length=255)
    id = models.CharField(db_index=True, max_length=50, primary_key=True, unique=True, default=generateID)
    source = models.CharField(max_length = 1024, blank=True)
    origin = models.CharField(max_length = 1024, blank=True)
    description = models.TextField()
    contentType = models.CharField(max_length=100,choices=CONTENT_TYPES,default='text/plain')
    content = models.TextField(max_length=1024, default="")
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    categories = models.CharField(max_length=255, default="")
    count = models.IntegerField(default=0)
    comments = models.CharField(max_length = 1024)
    published = models.DateTimeField(auto_now_add=True)
    visibility = models.CharField(choices=[("PUBLIC", "PUBLIC"), ("FRIENDS", "FRIENDS"), ("PRIVATE", "PRIVATE"),("SPECIFIC_AUTHOR","SPECIFIC_AUTHOR")], max_length=20)
    unlisted = models.BooleanField(default=False)
    specific_author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='specific')
    image = models.URLField(max_length=500, default="", null=True, blank=True)

    def clean(self):
            if self.visibility == 'SPECIFIC_AUTHOR' and not self.specific_author:
                raise ValidationError('You must select an author for SPECIFIC_AUTHOR visibility.')
            elif self.specific_author and self.visibility != 'SPECIFIC_AUTHOR':
                raise ValidationError('Specific author can only be set when visibility is SPECIFIC_AUTHOR.')

    def save(self, *args, **kwargs):
        self.clean()
        super(Post, self).save(*args, **kwargs)

    @property
    def comments(self):
        return f"{self.author.host}authors/{self.author.id}/posts/{self.id}/comments"

class Comment(models.Model):
    type = models.CharField(max_length=20, default="comment")
    author = models.ForeignKey(User, on_delete=models.CASCADE) #links the comment to an author
    comment = models.TextField()
    contentType = models.CharField(max_length=50, default="text/markdown")
    published = models.DateTimeField(auto_now_add=True)
    id = models.CharField(db_index=True, max_length=50, primary_key=True, unique=True, default=generateID)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)

class Follower(models.Model):
    type = models.CharField(max_length=20, default="followers")
    followed = models.ForeignKey(User, related_name='followed', on_delete=models.CASCADE, blank= True, null=True)
    follower = models.ForeignKey(User, related_name='follower', on_delete=models.CASCADE, blank= True, null=True)
    
class FollowRequest(models.Model):
    type = models.CharField(max_length=20, default="Follow")
    summary = models.CharField(max_length=248)
    actor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="actor_follows")
    object = models.ForeignKey(User, on_delete=models.CASCADE, related_name="object_follows", null=True)


class Like(models.Model):
    type = models.CharField(max_length=20, default="Like")
    summary = models.CharField(max_length=248)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="author")
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="like_post", null=True)
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name="like_comment", null=True)

class Inbox(models.Model):
    type = models.CharField(max_length=20, default="inbox")
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="author_inbox")
    item = models.JSONField(null=True)
    published = models.DateTimeField(auto_now_add=True)