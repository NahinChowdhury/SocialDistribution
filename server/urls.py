"""
URL configuration for server project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from api import views
...
from django.urls import re_path
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from django.views.generic import TemplateView

schema_view = get_schema_view(
   openapi.Info(
      title="A-team API",
      default_version='v1',
      description="Test description",
      terms_of_service="https://www.google.com/policies/terms/",
      contact=openapi.Contact(email="contact@snippets.local"),
      license=openapi.License(name="BSD License"),
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('swagger<format>/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('admin/', admin.site.urls),
	path('authors/', views.UserListView.as_view(), name='author-profile'),
	path('authors/<str:author_id>/', views.UserProfile.as_view(), name='author-profile'),
    path('authors/<str:author_id>/posts/', views.PostsListView.as_view(), name='author-posts-list'),
    path('authors/<str:author_id>/posts/<str:post_id>/', views.PostProfile.as_view(), name='author-post-detail'),
    path('authors/<str:author_id>/posts/<str:post_id>/likes/', views.LikesListView.as_view(), name='like-post-list'),
    path('authors/<str:author_id>/posts/<str:post_id>/comments/', views.CommentsListView.as_view(), name='comments-list'),
    path('authors/<str:author_id>/posts/<str:post_id>/comments/<str:comment_id>/', views.CommentProfile.as_view(), name='comment-profile'),
    path('authors/<str:author_id>/posts/<str:post_id>/comments/<str:comment_id>/likes/', views.LikesListView.as_view(), name='like-comment-list'),
    path('authors/<str:author_id>/followRequests/', views.FollowRequestsListView.as_view(), name='follow-requests-list'),
    path('authors/<str:author_id>/followRequests/<str:object_id>/', views.FollowRequestsProfileView.as_view(), name='follow-requests-list'),
    path('authors/<str:author_id>/friends/', views.FriendsListView.as_view(), name='followers-list'),
    path('authors/<str:author_id>/following/', views.FollowingListView.as_view(), name='following-list'),
    path('authors/<str:author_id>/following/<str:object_id>/', views.FollowingProfileView.as_view(), name='following-list'),
    path('authors/<str:author_id>/followers/', views.FollowerListView.as_view(), name='followers-list'),
    path('authors/<str:author_id>/followers/<str:foreign_author_id>/', views.FollowerProfile.as_view(), name='followers-list'),
	path('authors/<str:author_id>/inbox/', views.InboxListView.as_view(), name='author-inbox'),
    path('api/', include(('api.routers', 'api'), namespace='api-api')),
	# custom endpoints
    path('getAllPublicPosts/', views.AllPublicPostListView.as_view(), name='all-public-posts'),
    path('getAllPosts/', views.AllPostListView.as_view(), name='all-posts'),
    path('getAllUsers/', views.AllUserView.as_view(), name='all-user'),
	re_path('.*', TemplateView.as_view(template_name='index.html'))
    ]