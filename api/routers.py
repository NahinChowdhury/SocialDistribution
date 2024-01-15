from rest_framework.routers import SimpleRouter
from api.user.viewsets import UserViewSet
from api.auth.viewsets import LoginViewSet, RegistrationViewSet
from django.urls import path

routes = SimpleRouter()

urlpatterns = [
    path('auth/register/', RegistrationViewSet.as_view({'post': 'create'})),
    path('auth/login/', LoginViewSet.as_view({'post': 'create'})),
	path('auth/isLoggedIn/', LoginViewSet.as_view({'post': 'isLoggedIn'})),
    # path('authors/', UserViewSet.as_view({'get': 'list'})),
]
