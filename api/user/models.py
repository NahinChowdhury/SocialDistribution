from django.db import models
from django.conf import settings
import secrets
from rest_framework.authtoken.models import Token

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

# Image link: https://static.vecteezy.com/system/resources/previews/016/267/347/large_2x/profile-account-outline-icon-isolated-flat-design-illustration-free-vector.jpg

def generateID():
    return secrets.token_urlsafe(32)

def getHostURL():
    if hasattr(settings, 'DJANGO_ENV'):
        if settings.DJANGO_ENV == 'development':
            return "http://127.0.0.1:8000/"
        else:
            return "https://socialdistribution.onrender.com/"
    else:
        return "https://socialdistribution.onrender.com/"  # or any default value

class UserManager(BaseUserManager):

    def create_user(self, displayName, github, password=None, is_active=True, profilePicture="https://static.vecteezy.com/system/resources/previews/016/267/347/large_2x/profile-account-outline-icon-isolated-flat-design-illustration-free-vector.jpg", **kwargs):
        """Create and return a `User` with an email, phone number, username and password."""
        print("Creating user")
        if displayName is None:
            raise TypeError('Users must have a username.')
        if github is None:
            raise TypeError('Users must have an github.')


        user = self.model(displayName=displayName, github=github, password=password, is_active=True, profilePicture=profilePicture, **kwargs)
        user.set_password(password)
        user.save(using=self._db)
        Token.objects.create(user=user)

        return user

    def create_superuser(self, displayName, github, password):
        """
        Create and return a `User` with superuser (admin) permissions.
        """
        if password is None:
            raise TypeError('Superusers must have a password.')
        if github is None:
            raise TypeError('Superusers must have an github.')
        if displayName is None:
            raise TypeError('Superusers must have a displayName.')

        user = self.create_user(displayName, github, password)
        user.is_superuser = True
        user.is_staff = True
        user.save(using=self._db)

        return user


class User(AbstractBaseUser, PermissionsMixin):
    type = models.CharField(max_length=6, default="author")
    id = models.CharField(db_index=True, max_length=50, primary_key=True, unique=True, default=generateID)
    displayName = models.CharField(db_index=True, max_length=255, unique=True)
    github = models.URLField(db_index=True,  null=True, blank=True)
    profilePicture = models.URLField(max_length=500, default="https://static.vecteezy.com/system/resources/previews/016/267/347/large_2x/profile-account-outline-icon-isolated-flat-design-illustration-free-vector.jpg")
    url = models.CharField(max_length=255, default = "")
    host = models.CharField(max_length=255, default=getHostURL)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now=True)
    updated = models.DateTimeField(auto_now_add=True)
    
    USERNAME_FIELD = 'displayName'
    REQUIRED_FIELDS = ['github']

    objects = UserManager()

    def __str__(self):
        return f"{self.displayName}"
    
    def save(self, *args, **kwargs):
        self.url = str(self.host) + "authors/" + str(self.id)
        return super(User, self).save(*args, **kwargs)