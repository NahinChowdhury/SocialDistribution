from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.viewsets import ViewSet
from rest_framework.permissions import AllowAny
from rest_framework import status
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from api.auth.serializers import LoginSerializer
from rest_framework.authtoken.models import Token


class LoginViewSet(ViewSet):
    serializer_class = LoginSerializer
    permission_classes = (AllowAny,)
    http_method_names = ['post']

    def create(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        return Response(serializer.validated_data, status=status.HTTP_200_OK)
    
    def isLoggedIn(self, request, *args, **kwargs):
        # get the token from the request body and see if user exists
        # "token": Token.objects.get(user=user).key,
        # above is how tokens are created during registration
        # 
        # I want to get the token from the request body and see if it exists
        # if it exists, then the user is logged in and return token and message
        # if it doesn't exist, then the user is not logged in and return message

        token = request.data.get('token')
        if token:
            try:
                token_obj = Token.objects.get(key=token)
                user = token_obj.user
                return Response({'message': 'User is logged in', 'token': token}, status=status.HTTP_200_OK)
            except:
                pass
        return Response({'message': 'User is not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
