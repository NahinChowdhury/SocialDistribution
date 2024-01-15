from django.test import TestCase
from django.urls import reverse
from rest_framework import status
import uuid
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework.authtoken.models import Token
from api.user.models import User
from .models import Post,Comment,Follower,FollowRequest, Inbox
from rest_framework import status
import uuid

class Tests(TestCase):

    def setUp(self):

        self.admin_user = User.objects.create_superuser(
            displayName='admin',
            github='http://github.com/admin',
            password='password'
        )
        self.client.login(displayName='admin', password='password')

        self.user = User.objects.create(
            id="764efa883dda1e11db47671c4a3bbd9e",
            host="http://127.0.0.1:8000/",
            displayName="John Doe",
            url="http://127.0.0.1:8000/authors/764efa883dda1e11db47671c4a3bbd9e",
            github="http://github.com/johndoe",
        )
        self.user2 = User.objects.create(
            id="164efa883dda1e11db47671c4a3bbd9e",
            host="http://127.0.0.1:8000/",
            displayName="DD",
            url="http://127.0.0.1:8000/authors/164efa883dda1e11db47671c4a3bbd9e",
            github="http://github.com/DD",
        )
        self.user3 = User.objects.create(
            id="964efa883dda1e11db47671c4a3bbd9e",
            host="http://127.0.0.1:8000/",
            displayName="aD",
            url="http://127.0.0.1:8000/authors/964efa883dda1e11db47671c4a3bbd9e",
            github="http://github.com/cc",
        )

        self.post = Post.objects.create(
            id="564efa883dda1e11db47671c4a3bbd9e",
            title="Test Post",
            description="This is a test post.",
            author=self.user,
            visibility="PUBLIC"
        )
        self.post2 = Post.objects.create(
            id="111efa883dda1e11db47671c4a3bbd9e",
            title="Test Post2",
            description="This is a test post2.",
            author=self.user,
            visibility="PUBLIC"
        )

        self.post3 = Post.objects.create(
            id="44444a883dda1e11db47671c4a3bbd9e",
            title="private Post",
            description="This is a private post.",
            author=self.user,
            visibility="PRIVATE"
        )
        self.comment = Comment.objects.create(
            id="664efa883dda1e11db47671c4a3bbd9e",
            comment="Test comment",
            author=self.user2,
            post=self.post
        )
        self.follow=FollowRequest.objects.create(
            summary="user 2 follow 1",
            actor=self.user,
            object=self.user2

        )
        self.follower = Follower.objects.create(
            followed=self.user,
            follower=self.user2
        )
        self.follow=FollowRequest.objects.create(
            summary="user 3 follow 1",
            actor=self.user3,
            object=self.user

        )
        self.inbox = Inbox.objects.create(
            author=self.user3,
            item={
                "type":"post",
                "id": "564efa883dda1e11db47671c4a3bbd9e",
                "title": "Test Post",
                "description": "This is a test post.",
                "author": self.user.id,
                "visibility": "PUBLIC"
            }
        )
        self.inbox3 = Inbox.objects.create(
            author=self.user3,
            item={
                "type":"post",
                "id": "999efa883dda1e11db47671c4a3bbd9e",
                "title": "Test Post99",
                "description": "This is a test post99.",
                "author": self.user.id,
                "visibility": "PUBLIC"
            }
        )
        self.inbox2 = Inbox.objects.create(
            author=self.user,
            item={
                "type":"comment",
                "id":"664efa883dda1e11db47671c4a3bbd9e",
                "comment":"Test comment",
                "author":self.user2.id,
                "post":self.post.id
            }
        )

    def test_author_get(self):
        url = reverse('author-profile', args=[str(self.user.id)])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["displayName"], "John Doe")

    def test_post_get(self):
        url = reverse('author-post-detail', args=[str(self.user.id), str(self.post.id)])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]["title"], "Test Post")

    def test_post_post(self):
        token, _ = Token.objects.get_or_create(user=self.user)
        header = {'HTTP_AUTHORIZATION': 'Token ' + token.key}
        url = reverse('author-post-detail', args=[str(self.user.id), str(self.post.id)])
        post_data = {
            "title": "Updated Test Post",
            "description": "This is an updated test post.",
            "author": str(self.user.id),
            "visibility": "PUBLIC"
        }
        response = self.client.post(url, post_data, format='json', **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]["title"], "Updated Test Post")
    
    def test_post_delete(self):
        token, _ = Token.objects.get_or_create(user=self.user)
        header = {'HTTP_AUTHORIZATION': 'Token ' + token.key}
        url = reverse('author-post-detail', args=[str(self.user.id), str(self.post.id)])
        response = self.client.delete(url, header)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_postlist_post(self):
        token, _ = Token.objects.get_or_create(user=self.user)
        header = {'HTTP_AUTHORIZATION': 'Token ' + token.key}
        url = reverse('author-posts-list', args=[str(self.user.id)])
        post_data = {
            "title": "New Test Post",
            "description": "This is a new test post.",
            "author": str(self.user.id),
            "visibility": "PUBLIC"
        }
        response = self.client.post(url, post_data, format='json', **header)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data[0]["title"], "New Test Post")


    def test_comment_get(self):
        url = reverse('comment-profile', args=[str(self.user.id), str(self.post.id), str(self.comment.id)])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]["comment"], "Test comment")
    
    def test_comments_post(self):
        token, _ = Token.objects.get_or_create(user=self.user)
        header = {'HTTP_AUTHORIZATION': 'Token ' + token.key}
        url = reverse('comments-list', args=[str(self.user.id), str(self.post.id)])
        comment_data = {
            "comment": "New Test Comment",
            "author": str(self.user2.id),
            "post": str(self.post.id)
        }
        response = self.client.post(url, comment_data, format='json', **header)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data[0]["comment"], "New Test Comment")

    def test_follows_get(self):
        url = reverse('follow-requests-list', args=[str(self.user2.id)])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['results']['items'][0]['summary'], 'user 2 follow 1')

    def test_follower_get(self):
        url = reverse('followers-list', args=[str(self.user.id), str(self.user2.id)])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]["follower"]["id"], str(self.user2.id))

    def test_follower_put(self):
        url = reverse('followers-list', args=[str(self.user.id), str(self.user3.id)])
        response = self.client.post(url)
        print(response.data,"11111111")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Follower.objects.filter(followed=self.user, follower=self.user3).exists())

    def test_follower_delete(self):
        url = reverse('followers-list', args=[str(self.user.id), str(self.user2.id)])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Follower.objects.filter(followed=self.user, follower=self.user2).exists())

    def test_like_post(self):
        token, _ = Token.objects.get_or_create(user=self.user2)
        header = {'HTTP_AUTHORIZATION': 'Token ' + token.key}
        url = reverse('like-post-list', args=[str(self.user.id), str(self.post.id)])
        like_data = {
            "post": str(self.post.id),
            "author": str(self.user2.id),
        }
        response = self.client.post(url, like_data, format='json', **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]["author"]["id"], str(self.user2.id))


    def test_like_comment(self):
        token, _ = Token.objects.get_or_create(user=self.user2)
        header = {'HTTP_AUTHORIZATION': 'Token ' + token.key}
        url = reverse('like-comment-list', args=[str(self.user.id), str(self.post.id), str(self.comment.id)])
        like_data = {
            "comment": str(self.comment.id),
            "author": str(self.user2.id),
        }
        response = self.client.post(url, like_data, format='json', **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]["author"]["id"], str(self.user2.id))

    def test_get_inbox(self):
        url = reverse('author-inbox', args=[str(self.user3.id)])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        inbox_items = response.data['results']['items']
        self.assertEqual(len(inbox_items), 2)

        url = reverse('author-inbox', args=[str(self.user.id)])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        inbox_items = response.data['results']['items']
        self.assertEqual(len(inbox_items), 1)
        self.assertEqual(inbox_items[0]['id'], "664efa883dda1e11db47671c4a3bbd9e")

    def test_delete_inbox(self):
        url = reverse('author-inbox', args=[str(self.user3.id)])
        response = self.client.get(url)
        inbox_items = response.data['results']['items']
        self.assertEqual(len(inbox_items), 2)
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        response = self.client.get(url)
        inbox_items = response.data['results']['items']
        self.assertEqual(len(inbox_items),0)

    def test_django_admin(self):
        response = self.client.get('/admin/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_swagger_json(self):
        url = reverse('schema-json', kwargs={'format': '.json'})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_swagger_ui(self):
        url = reverse('schema-swagger-ui')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_redoc(self):
        url = reverse('schema-redoc')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_all_public_posts(self):
        url = reverse('all-public-posts')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']['items']),2)

    def test_get_all_posts(self):
        url = reverse('all-posts')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']['items']),3)


    def test_get_all_users(self):
        url = reverse('all-user')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 4)