from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.settings import api_settings
from django.contrib.auth.models import update_last_login

from api.user.serializers import UserSerializer
from rest_framework.authtoken.models import Token

class LoginSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):
        data = super().validate(attrs)

        data['user'] = UserSerializer(self.user).data
        try:
            data['token'] = str(Token.objects.get_or_create(user=self.user)[0])
        except:
            data['token'] = str(Token.objects.create(user=self.user))

        if api_settings.UPDATE_LAST_LOGIN:
            update_last_login(None, self.user)

        return {"user": data["user"], "token": data["token"]}