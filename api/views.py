from django.shortcuts import render

from .user.serializers import UserSerializer
from .models import Comment, FollowRequest, Follower, Inbox, Like, Post
from api.user.models import User
from rest_framework.views import APIView
from .serializers import CommentSerializer, FollowRequestSerializer, FollowerSerializer, InboxSerializer, LikeSerializer, PostSerializer
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.pagination import PageNumberPagination
from rest_framework.exceptions import ValidationError
from rest_framework.generics import ListAPIView
from rest_framework import status
from django.http import HttpResponse, Http404
from .user.models import User

from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import AnonymousUser
from django.db.models import Q

from drf_spectacular.utils import extend_schema


import requests

class CustomPageNumberPagination(PageNumberPagination):
    page_query_param = 'page'
    page_size_query_param = 'size'

class PostProfile(APIView):
    
    def get(self, request, author_id=None, post_id=None, *args, **kwargs):
        user = request.user

        if(isinstance(user, User)):
            userId = user.id
        else:
            userId = None

        post = get_object_or_404(Post, id=post_id)
        serializer = PostSerializer(post)
        return Response(appendUserInfo(serializer.data, "posts", ["author"], userId))

    def post(self, request, author_id=None, post_id=None, *args, **kwargs):
        if post_id:
            post = get_object_or_404(Post, id=post_id)
            serializer = PostSerializer(post, data=request.data)
        else:
            serializer = PostSerializer(data=request.data)
        
        if serializer.is_valid():
            author_instance = get_object_or_404(User, id=author_id)
            serializer.save(author=author_instance)
            return Response(appendUserInfo(serializer.data, "posts", ["author"]), status=200)
        return Response(serializer.errors, status=400)
    
    def put(self, request, author_id=None, post_id=None, *args, **kwargs):

        post_exists = Post.objects.filter(id=post_id).exists()

        if post_exists:
            return Response({"detail": "Post with this ID already exists."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = PostSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(id=post_id, author_id=author_id)
            return Response(appendUserInfo(serializer.data, "posts", ["author"]), status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, author_id=None, post_id=None, *args, **kwargs):
        post = get_object_or_404(Post, id=post_id)
        post.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class PostsListView(ListAPIView):
    queryset = Post.objects.all().order_by('-published')
    serializer_class = PostSerializer
    pagination_class = CustomPageNumberPagination
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]
    
    def list(self, request, author_id=None):

        user = request.user
        if(isinstance(user, User)):
            userId = user.id
        else:
            userId = None

        # first check if author_id user exists locally
        author = User.objects.filter(id=author_id).first()
        if author:

            if "c404-5f70eb0b3255.herokuapp.com" in author.url or "127.0.0.1" in author.url:
                queryset = self.get_queryset().filter(author__id=author_id)
                page = self.paginate_queryset(queryset)
                if page is not None:
                    serializer = self.get_serializer(page, many=True)
                    
                    return self.get_paginated_response({
                        "type": "posts",
                        "items": appendUserInfo(serializer.data, "posts", ["author"], userId)
                    })
                
                serializer = self.get_serializer(queryset, many=True)

                return Response({
                    "type": "posts",
                    "items": appendUserInfo(serializer.data, "posts", ["author"], userId)
                })
            elif "beeg-yoshi-backend-18879c976d99.herokuapp.com" in author.url:
                # make a request to their server to get all posts
                headers = {'Authorization': 'Token 98f2ff14e354dc9744b7bf8ad79ec47e5037db5b'}
                response = requests.get(author.url + "/posts/", headers=headers)
                if response.status_code == 200:
                    return Response({
                        "count": 0,
                        "next": None,
                        "previous": None,
                        "results": {"items": response.json()}
                    })
            elif "web-weavers-backend-fb4af7963149.herokuapp.com" in author.url:
                # make a request to their server to get all posts
                response = requests.get(author.url + "/posts/", auth=('a-team', '12345'))
                if response.status_code == 200:
                    return Response({
                        "count": 0,
                        "next": None,
                        "previous": None,
                        "results": response.json()
                    })
        else:
            # if user not found locally, then check if user exists on other servers
            # send a request to team1 and see if a user with this id exists there
            print("inside else")
            authorExistsTeam1 = checkServerUser('https://beeg-yoshi-backend-858f363fca5e.herokuapp.com', author_id) # this function creates a user with foreign server id if user does not exist
            if authorExistsTeam1:
                headers = {'Authorization': 'Token 98f2ff14e354dc9744b7bf8ad79ec47e5037db5b'}
                response2 = requests.get(authorExistsTeam1.url+"/posts/", headers=headers)
                if response2.status_code == 200:
                    return Response(response2.json())
            else:
                print('inside else 2')
                # send request to other team
                authorExistsTeam2 = checkServerUser('https://web-weavers-backend-fb4af7963149.herokuapp.com', author_id)
                print(authorExistsTeam2)
                if authorExistsTeam2:
                    response3 = requests.get(authorExistsTeam2.url+"/posts/")
                    print(response3)
                    if response3.status_code == 200:
                        return Response({
                            "count": 0,
                            "next": None,
                            "previous": None,
                            "results": response3.json()
                        })
        
        return Response(status=400, data="User with this ID does not exist")
    

    def post(self, request, author_id=None, *args, **kwargs):
        user = request.user
        if author_id != user.id:
            return Response({"detail": "Cannot create post for another user"}, status=status.HTTP_400_BAD_REQUEST)

        dataCopy = request.data.copy()

        if(dataCopy.get("origin") == None):
            dataCopy["origin"] = ""
        dataCopy["source"] = ""

        serializer = PostSerializer(data=dataCopy)
        if serializer.is_valid():
            serializer.save(author_id=author_id)

            postId = serializer.data.get('id')
            postModel = Post.objects.get(id=postId)
            postAuthor = User.objects.get(id=author_id)
            postModel.source = str(postAuthor.url) + "/posts/" + str(postId)

            if(postModel.origin == ""):
                postModel.origin = str(postAuthor.url) + "/posts/" + str(postId)

            postModel.save()
            serializer = PostSerializer(postModel)

            postType = dataCopy.get('visibility')
            if postType == 'FRIENDS':
                
                # finding all users who follow me
                user_followers = Follower.objects.filter(followed__id=author_id)
                follower_ids = [follower.follower.id for follower in user_followers]
                friendsList = []
                for follower_id in follower_ids:
                    friend = Follower.objects.filter(followed__id=follower_id, follower__id=author_id).first()
                    if friend:
                        friendsList.append(friend)

                for friend in friendsList:
                    friendObject = User.objects.get(id=friend.followed.id)
                    inbox = Inbox.objects.create(author=friendObject, item=serializer.data)
                    inbox.save()
                
                # you have all the followers in the user_follower object
                # go over each and see if host is super-coding
                # if yes, send request to super-coding
                postAuthor = User.objects.get(id=author_id)
                for follower in user_followers:
                    followerObject = User.objects.get(id=follower.follower.id)
                    if "super-coding-team-89a5aa34a95f.herokuapp.com" in followerObject.url:
                        followingResponse = requests.get(followerObject.url+"/followers/"+str(author_id), auth=('a-team', 'a-team'))
                        if followingResponse.status_code == 200:
                            json = serializer.data
                            json['id'] = postAuthor.url + "/posts/" + json['id'] + '/'
                            print("super coding inbox sending")
                            print(json['id'])

                            friendPostInbox = requests.post(followerObject.url+"/inbox", json=json, auth=('a-team', 'a-team'))
                            
                        else:
                            print("request failed")
                            return Response(status=400, data="Could not send post to super-coding since other server gave error")


            # if post type is specific user, then send to specific user
            elif postType == 'SPECIFIC_AUTHOR':
                author = User.objects.get(id=serializer.data.get("specific_author"))
                inbox = Inbox.objects.create(author=author, item=serializer.data)
                inbox.save()

            # if post is public, then send to all users
            elif postType == 'PUBLIC':
                user_followers = Follower.objects.filter(followed__id=author_id)
                print("public post")
                for follower in user_followers:
                    print(follower.follower.id)
                    followerInfo = User.objects.get(id=follower.follower.id)
                    inbox = Inbox.objects.create(author=followerInfo, item=serializer.data)
                    inbox.save()

            return Response(appendUserInfo(serializer.data, "posts", ["author"]), status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class AllPublicPostListView(ListAPIView):
    queryset = Post.objects.all().order_by('-published')
    serializer_class = PostSerializer
    pagination_class = CustomPageNumberPagination

    def get(self, request, *args, **kwargs):
        
        user = request.user

        if(isinstance(user, User)):
            userId = user.id
        else:
            userId = None
        
        queryset = self.get_queryset().filter(visibility="PUBLIC")
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            
            return self.get_paginated_response({
                "type": "posts",
                "items": appendUserInfo(serializer.data, "posts", ["author"], userId)
            })
        
        serializer = self.get_serializer(queryset, many=True)

        return Response({
            "type": "posts",
            "items": appendUserInfo(serializer.data, "posts", ["author"], userId)
        })
    
class AllPostListView(ListAPIView):
    queryset = Post.objects.all().order_by('-published')
    serializer_class = PostSerializer
    pagination_class = CustomPageNumberPagination

    def get(self, request, *args, **kwargs):
        
        user = request.user
        
        if(isinstance(user, User)):
            userId = user.id
        else:
            userId = None

        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            
            return self.get_paginated_response({
                "type": "posts",
                "items": appendUserInfo(serializer.data, "posts", ["author"], userId)
            })
        
        serializer = self.get_serializer(queryset, many=True)

        return Response({
            "type": "posts",
            "items": appendUserInfo(serializer.data, "posts", ["author"], userId)
        })
    
class CommentProfile(APIView):
    
    def get(self, request, author_id=None, post_id=None, comment_id=None, *args, **kwargs):
        post = get_object_or_404(Post, id=post_id)
        comment = get_object_or_404(Comment, id=comment_id, post=post)
        serializer = CommentSerializer(comment)
        return Response(appendUserInfo(serializer.data, "comments", ["author"]))
    
    def post(self, request, author_id=None, post_id=None, comment_id=None, *args, **kwargs):
    
        user = request.user
        if not isinstance(user, User):
            return Response({"detail": "User not authenticated"}, status=400)

        serverKey = "" # this `is like a local request

        # Maybe not needed??
        if isinstance(user, User):
            if user.displayName == "beeg":
                serverKey = "https://beeg-yoshi-backend-858f363fca5e.herokuapp.com"
            elif user.displayName == "web":
                serverKey = "https://web-weavers-backend-fb4af7963149.herokuapp.com"
            elif user.displayName == "super-coding":
                serverKey = "https://super-coding-team-89a5aa34a95f.herokuapp.com"

        authorPassed = request.data.get('author_id')
        if serverKey != "":
            if not authorPassed: # need to pass author_id because otherwise my server will not know who the comment author is
                return Response(status=400, data="Need to pass author_id in request.body for comment edit endpoint since this request is from a foreign server")
            authorExistsOrCreated = checkServerUser(serverKey, authorPassed) # this function creates a user with foreign server id if user does not exist

            if not authorExistsOrCreated:
                return Response(status=400, data="User trying to edit comment does not exist")

        dataCopy = request.data.copy()

        if authorPassed:
            dataCopy['author'] = authorPassed


        if comment_id and post_id:
            post = get_object_or_404(Post, id=post_id)
            comment = get_object_or_404(Comment, id=comment_id, post=post)
            serializer = CommentSerializer(comment, data=dataCopy)
        elif comment_id:
            comment = get_object_or_404(Comment, id=comment_id)
        else:
            serializer = CommentSerializer(data=dataCopy)

        if serializer.is_valid():
            author_instance = get_object_or_404(User, id=author_id)
            serializer.save(post=post, author=author_instance)
            return Response(appendUserInfo(serializer.data, "comments", ["author"]), status=201)
        return Response(serializer.errors, status=400)

    def delete(self, request, author_id=None, post_id=None, comment_id=None, *args, **kwargs):
        comment = get_object_or_404(Comment, id=comment_id)
        comment.delete()
        return Response(status=204)

class CommentsListView(ListAPIView):
    queryset = Comment.objects.all().order_by('-published')
    serializer_class = CommentSerializer
    pagination_class = CustomPageNumberPagination

    def list(self, request, author_id=None, post_id=None, *args, **kwargs):

        post = get_object_or_404(Post, id=post_id)
        
        queryset = self.get_queryset().filter(post=post)
        page = self.paginate_queryset(queryset)
        
        base_url = request.build_absolute_uri('/')[:-1]  
        post_url = f"{base_url}/authors/{post.author.id}/posts/{post_id}"
        comments_url = f"{post_url}/comments"

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                "type": "comments",
                "page": self.paginator.page.number,
                "size": self.paginator.page_size,
                "post": post_url,
                "id": comments_url,
                "comments": appendUserInfo(serializer.data, "comments", ["author"])
            })

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "type": "comments",
            "page": 1, 
            "size": len(serializer.data),  
            "post": post_url,
            "id": comments_url,
            "comments": appendUserInfo(serializer.data, "comments", ["author"])
        })

    def post(self, request, author_id=None, post_id=None, *args, **kwargs):
        
        post = get_object_or_404(Post, id=post_id)

        serverKey = "" # this `is like a local request

        user = request.user
        if isinstance(user, User):
            if user.displayName == "beeg":
                serverKey = "https://beeg-yoshi-backend-858f363fca5e.herokuapp.com"
            elif user.displayName == "web":
                serverKey = "https://web-weavers-backend-fb4af7963149.herokuapp.com"
            elif user.displayName == "super-coding":
                serverKey = "https://super-coding-team-89a5aa34a95f.herokuapp.com"

        authorPassed = request.data.get('author_id')
        if serverKey != "":
            if not authorPassed: # need to pass author_id because otherwise my server will not know who the comment author is
                return Response(status=400, data="Need to pass author_id in request.body for comment create endpoint since this request is from a foreign server")
            authorExistsOrCreated = checkServerUser(serverKey, authorPassed) # this function creates a user with foreign server id if user does not exist

            if not authorExistsOrCreated:
                return Response(status=400, data="User trying to create comment does not exist")


        dataCopy = request.data.copy()
        if authorPassed:
            dataCopy['author'] = authorPassed

        serializer = CommentSerializer(data=dataCopy)
        if serializer.is_valid():
            serializer.save(post=post)

            # set comment in inbox of post author
            inbox = Inbox.objects.create(author=post.author, item=serializer.data)
            inbox.save()
            return Response(appendUserInfo(serializer.data, "comments", ["author"]), status=201)  
        return Response(serializer.errors, status=400)

class FollowRequestsListView(ListAPIView):
    queryset = FollowRequest.objects.all().order_by('-id')
    serializer_class = FollowRequestSerializer
    pagination_class = CustomPageNumberPagination

    def list(self, request, author_id=None, *args, **kwargs):
        queryset = self.get_queryset().filter(object__id=author_id)
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                "type": "Follow",
                "items": appendUserInfo(serializer.data, "followRequest", ["actor", "object"])
            })
        
        serializer = self.get_serializer(queryset, many=True)

        return Response({
            "type": "Follow",
            "items": appendUserInfo(serializer.data, "followRequest", ["actor", "object"])
        })

    def post(self, request, author_id=None, *args, **kwargs):
        
        # get actor id from request

        actor_id = request.data.get('actor')
        if not actor_id:
            return Response(status=400, data="Actor ID not provided")
        
        serverKey = "" # this `is like a local request
        
        user = request.user
        print(user)
        if isinstance(user, User):
            if user.displayName == "beeg":
                serverKey = "https://beeg-yoshi-backend-858f363fca5e.herokuapp.com"
            elif user.displayName == "web":
                serverKey = "https://web-weavers-backend-fb4af7963149.herokuapp.com"
            elif user.displayName == "super-coding":
                serverKey = "https://super-coding-team-89a5aa34a95f.herokuapp.com"

            authorExistsOrCreated = checkServerUser(serverKey, actor_id) # this function creates a user with foreign server id if user does not exist
            print(authorExistsOrCreated)
            if serverKey != "" and not authorExistsOrCreated:
                return Response(status=400, data="User trying to send follow request does not exist")
        
        actor = User.objects.get(id=actor_id)
        print("actor")
        print(actor)
        object = User.objects.get(id=author_id) 
        print("object")
        print(object)

        if FollowRequest.objects.filter(actor_id=request.data.get('actor'), object_id=author_id).exists():
            return Response(status=400, data="Follow request already exists")
        
        if request.data['actor'] == author_id:
            return Response(status=400, data="Actor cannot sent request to themself")
        
        # pending -> check if already following
        if Follower.objects.filter(followed_id=author_id, follower_id=actor_id).exists():
            return Response(status=400, data="Already following")
        
        data = request.data.copy()
        data['summary'] = f"{actor.displayName} wants to follow {object.displayName}"
        
        serializer = FollowRequestSerializer(data=data)
        if serializer.is_valid():
            serializer.save(object_id=author_id)

            # set follow request in inbox of object
            inbox = Inbox.objects.create(author=object, item=serializer.data)
            inbox.save()

            return Response(appendUserInfo(serializer.data, "followRequest", ["actor", "object"]), status=201)  
        return Response(serializer.errors, status=400)

    def delete(self, request, author_id=None, *args, **kwargs):
        follow_request = get_object_or_404(FollowRequest, actor__id=request.data.get('actor'), object__id=author_id)
        follow_request.delete()
        return Response(status=204)
    
class FollowRequestsProfileView(APIView):

    def get(self, request, author_id=None, object_id=None, *args, **kwargs):
        follow_request = get_object_or_404(FollowRequest, actor__id=object_id, object__id=author_id)
        serializer = FollowRequestSerializer(follow_request)
        return Response(appendUserInfo(serializer.data, "followRequest", ["actor", "object"]))
    
    def delete(self, request, author_id=None, object_id=None, *args, **kwargs):
        # author_id is receiving request 
        # object_id is sending request
        follow_request = get_object_or_404(FollowRequest, actor__id=object_id, object__id=author_id)

        foreignAuthor = User.objects.get(id=object_id)
        print(foreignAuthor.url)
        if 'beeg-yoshi-backend-858f363fca5e.herokuapp.com' in foreignAuthor.url:
            # user on right is the user who is receiving the request
            response = requests.delete('https://beeg-yoshi-backend-858f363fca5e.herokuapp.com/service/remote/authors/'+str(object_id)+'/request/'+str(author_id)+'/')
            print(response.status_code)
            print(response.json())
            if response.status_code == 200:
                print("request success")
                follow_request.delete()
                return Response(status=204)
            return Response(status=400, data="Could not delete follow request since other server gave error")

        follow_request.delete()
        return Response(status=204)

class FollowerProfile(APIView):

    def get(self, request, author_id=None, foreign_author_id=None, *args, **kwargs):
        follower = get_object_or_404(Follower, followed__id=author_id, follower__id=foreign_author_id)
        serializer = FollowerSerializer(follower)
        return Response(appendUserInfo(serializer.data, "follower", ["followed", "follower"]))
    
    def post(self, request, author_id=None, foreign_author_id=None, *args, **kwargs):

        # pending -> check if already following
        if Follower.objects.filter(followed_id=author_id, follower_id=foreign_author_id).exists():
            return Response(status=400, data="Already following")
        
        # check if foreign author id sent follow request to author id
        follow_request = FollowRequest.objects.filter(actor_id=foreign_author_id, object_id=author_id)
        # if not, return 400
        if not follow_request.exists():
            return Response(status=400, data="Cannot accept follow request since follow request does not exist")
        # if yes, create follower object
        data = {
            "type": "followers",
            "followed": author_id,
            "follower": foreign_author_id
        }
        serializer = FollowerSerializer(data=data)
        if serializer.is_valid():
            foreignAuthor = User.objects.get(id=foreign_author_id)
            print(foreignAuthor.url)
            if 'beeg-yoshi-backend-858f363fca5e.herokuapp.com' in foreignAuthor.url:
                # user on right is the user who is receiving the request
                response = requests.put('https://beeg-yoshi-backend-858f363fca5e.herokuapp.com/service/remote/authors/'+str(foreign_author_id)+'/request/'+str(author_id)+'/', 
                                        data={"server":'A-Team'})
                print(response.status_code)
                print(response.json())
                if response.status_code == 200:
                    print("request success")

                    serializer.save()
                    
                    # delete follow request after adding as follower
                    follow_request.delete()

                    return Response(appendUserInfo(serializer.data, "follower", ["followed", "follower"]), status=201)
                return Response(status=400, data="Could not accept follow request since other server gave error")
            else:
                serializer.save()

                follow_request.delete()

                return Response(appendUserInfo(serializer.data, "follower", ["followed", "follower"]), status=201)
        
    def delete(self, request, author_id=None, foreign_author_id=None, *args, **kwargs):
        follower = get_object_or_404(Follower, followed__id=author_id, follower__id=foreign_author_id)
        follower.delete()
        return Response(status=204)
        
class FollowerListView(ListAPIView):
    queryset = Follower.objects.all().order_by('-id')
    serializer_class = FollowerSerializer
    pagination_class = CustomPageNumberPagination

    def list(self, request, author_id=None, *args, **kwargs):
        queryset = self.get_queryset().filter(followed__id=author_id)
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                "type": "followers",
                "items": appendUserInfo(serializer.data, "follower", ["followed", "follower"])
            })
        
        serializer = self.get_serializer(queryset, many=True)

        return Response({
            "type": "followers",
            "items": appendUserInfo(serializer.data, "follower", ["followed", "follower"])
        })


# get all following of an author
class FollowingListView(ListAPIView):
    queryset = Follower.objects.all().order_by('-id')
    serializer_class = FollowerSerializer
    pagination_class = CustomPageNumberPagination

    def list(self, request, author_id=None, *args, **kwargs):
        queryset = self.get_queryset().filter(follower__id=author_id)
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                "type": "following",
                "items": appendUserInfo(serializer.data, "follower", ["followed", "follower"])
            })
        
        serializer = self.get_serializer(queryset, many=True)

        return Response({
            "type": "followers",
            "items": appendUserInfo(serializer.data, "follower", ["followed", "follower"])
        })
    
class FollowingProfileView(APIView):

    def get(self, request, author_id=None, object_id=None, *args, **kwargs):
        # check if author_id follows object_id
        # if following, send follower object
        following = Follower.objects.filter(follower__id=author_id, followed__id=object_id).exists()
        if not following:
            return Response(status=400, data="Author does not follow object")
        follower = get_object_or_404(Follower, follower__id=author_id, followed__id=object_id)
        serializer = FollowerSerializer(follower)
        return Response(appendUserInfo(serializer.data, "follower", ["followed", "follower"]))

    
class FriendsListView(ListAPIView):
    queryset = Follower.objects.all().order_by('-id')
    serializer_class = FollowerSerializer
    pagination_class = CustomPageNumberPagination

    def list(self, request, author_id=None, *args, **kwargs):
        # api get all friends of an author -> a friend is when you and opposite person follow eachother
        

        my_followers = Follower.objects.filter(followed__id=author_id)
        follower_ids = [follower.follower.id for follower in my_followers]
        queryset = []
        for follower_id in follower_ids:
            friend = Follower.objects.filter(followed__id=follower_id, follower__id=author_id).first()
            if friend:
                queryset.append(friend)
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                "type": "friends",
                "items": appendUserInfo(serializer.data, "follower", ["followed", "follower"])
            })
        
        serializer = self.get_serializer(queryset, many=True)

        return Response({
            "type": "friends",
            "items": appendUserInfo(serializer.data, "follower", ["followed", "follower"])
        })

class UserProfile(APIView):
    @extend_schema(
        description="List a single author",
        responses={200: UserSerializer(many=False)},
    )
    def get(self, request, author_id=None, *args, **kwargs):
        authorized_user = request.user

        user = User.objects.filter(id=author_id)
        if not user:
            # send a request to team1 and see if a user with this id exists there
            headers = {'Authorization': 'Token 98f2ff14e354dc9744b7bf8ad79ec47e5037db5b'}
            response = requests.get(f'https://beeg-yoshi-backend-858f363fca5e.herokuapp.com/service/authors/{author_id}/', headers=headers)
            
            if response.status_code == 200:
                # send this user to frontend
                user = response.json()
                return Response(user)
            else:
                # send request to other team
                response2 = requests.get(f'https://web-weavers-backend-fb4af7963149.herokuapp.com/authors/{author_id}/', auth=('a-team', '12345'))

                if response2.status_code == 200:
                    
                    # send this user to frontend
                    user = response2.json()
                    user['profilePicture'] = user['profileImage']
                    del user['profileImage']
                    return Response(user)
                
                else:
                    # send request to super-coding
                    headers = {'Authorization': 'Basic YS10ZWFtOmEtdGVhbQ=='}
                    response3 = requests.get(f'https://super-coding-team-89a5aa34a95f.herokuapp.com/authors/{author_id}', headers=headers)

                    if response3.status_code == 200:
                        user = response3.json()
                        return Response(user)
                    

                return Response(status=400, data="User with this ID does not exist")
        elif user and hasattr(user[0], 'url') and "super-coding-team-89a5aa34a95f.herokuapp.com" in user[0].url:
            jsonResponse = UserSerializer(get_object_or_404(User, id=author_id)).data
            # check if authorized user's displayname is not web, beeg or super-coding
            # if the authorized user is not any, then check if the user is following the user with this id
            if isinstance(authorized_user, User):
                # check if authorized user is followwed by author_id
                if Follower.objects.filter(follower__id=author_id, followed__id=authorized_user.id).exists():

                    jsonResponse['isFollowed'] = True

                    # check if authorized user is followed by the user with this id
                    headers = {'Authorization': 'Basic YS10ZWFtOmEtdGVhbQ=='}
                    isFollowingResponse = requests.get(f'https://super-coding-team-89a5aa34a95f.herokuapp.com/authors/{author_id}/followers/{authorized_user.id}', headers=headers)
                    if isFollowingResponse.status_code == 200:
                        print("inside super-coding is following")
                        jsonResponse['isFollowing'] = True

                        if jsonResponse['isFollowed'] and jsonResponse['isFollowing']:
                            jsonResponse['isFriends'] = True

            # send this user to frontend
            return Response(jsonResponse)
        
        user = get_object_or_404(User, id=author_id)

        serializer = UserSerializer(user)
        return Response(serializer.data)
    
    def put(self, request, author_id=None, *args, **kwargs):
        
        user = request.user
        if not isinstance(user, User):
            return Response({"detail": "User not authenticated"}, status=400)
        
        if user.id != author_id:
            return Response({'detail': 'User does not have permission to edit this profile.'}, status=400)
        
        # check if user exists with requested display name
        # save the filtered user in a variable
        duplicateDisplayName = User.objects.filter(displayName=request.data.get('displayName')).first()

        if duplicateDisplayName:
            if duplicateDisplayName.id != user.id:
                return Response({'detail': 'User with this display name already exists. Please choose another one.'}, status=400)
        
            if duplicateDisplayName.github != user.github:
                return Response({'detail': 'User with this github already exists. Please choose another one.'}, status=400)

        user = get_object_or_404(User, id=author_id)
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(id=author_id)
            return Response(serializer.data, status=200)
        return Response(serializer.errors, status=400)


# view to get all users
class UserListView(ListAPIView):
    queryset = User.objects.all().order_by('-id')
    serializer_class = UserSerializer
    pagination_class = CustomPageNumberPagination
    permission_classes = [AllowAny]
    
    @extend_schema(
        description="List all authors",
        responses={200: UserSerializer(many=True)},
    )
    def list(self, request, *args, **kwargs):

        user = request.user

        queryset = self.get_queryset()
        queryset = queryset.filter(Q(host='http://127.0.0.1:8000/') | Q(host='https://c404-5f70eb0b3255.herokuapp.com/'))

        if isinstance(user, User):
            queryset = queryset.exclude(id=user.id)
            
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                "type": "users",
                "items": appendFollowedFollowing(serializer.data, user)
            })
        
        serializer = self.get_serializer(queryset, many=True)

        return Response({
            "type": "users",
            "items": appendFollowedFollowing(serializer.data, user)
        })

class AllUserView(APIView):

    def get(self, request, *args, **kwargs):

        queryset = User.objects.all().order_by('-id')
        serializer = UserSerializer(queryset, many=True)
        return Response(serializer.data)
    
class LikesListView(ListAPIView):
    queryset = Like.objects.all()
    serializer_class = LikeSerializer
    pagination_class = CustomPageNumberPagination
    permission_classes = [IsAuthenticated]

    def list(self, request, author_id=None, post_id=None, comment_id=None, *args, **kwargs):
        if post_id:
            post = get_object_or_404(Post, id=post_id)
            queryset = self.get_queryset().filter(post=post)
        elif comment_id:
            comment = get_object_or_404(Comment, id=comment_id)
            queryset = self.get_queryset().filter(comment=comment)
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                "type": "likes",
                "items": appendUserInfo(serializer.data, "likes", ["author"])
            })
        
        serializer = self.get_serializer(queryset, many=True)

        return Response({
            "type": "likes",
            "items": appendUserInfo(serializer.data, "likes", ["author"])
        })
    
    def post(self, request, author_id=None, post_id=None, comment_id=None, *args, **kwargs):
        
        user = request.user
        if not isinstance(user, User):
            return Response({"detail": "User not authenticated"}, status=400)

        serverKey = "" # this `is like a local request

        if isinstance(user, User):
            if user.displayName == "beeg":
                serverKey = "https://beeg-yoshi-backend-858f363fca5e.herokuapp.com"
            elif user.displayName == "web":
                serverKey = "https://web-weavers-backend-fb4af7963149.herokuapp.com"
            elif user.displayName == "super-coding":
                serverKey = "https://super-coding-team-89a5aa34a95f.herokuapp.com"

        authorPassed = request.data.get('author_id')
        if serverKey != "":
            # this is for when a user from another server sends a post request to my server
            if not authorPassed: # need to pass author_id because otherwise my server will not know who the like author is
                return Response(status=400, data="Need to pass author_id in request.body for like create endpoint since this request is from a foreign server")
            authorExistsOrCreated = checkServerUser(serverKey, authorPassed) # this function creates a user with foreign server id if user does not exist

            if not authorExistsOrCreated:
                return Response(status=400, data="User trying to create like does not exist")
            
        # if I creating a like object on my server, then follow the below code
        data = request.data.copy()
        if authorPassed:
            data['author'] = authorPassed
            user = User.objects.get(id=authorPassed) # update user to the foreign server user 
        else:
            data['author'] = user.id

        # if like exists already
        if comment_id:
            like_exists = Like.objects.filter(author=user.id, comment=comment_id).exists()

            if like_exists:
                return Response({"detail": "You have already liked this comment"}, status=400)
            comment = get_object_or_404(Comment, id=comment_id)
            data['summary'] = f"{user.displayName} likes your comment"
            data['comment'] = comment.id
            data['post'] = comment.post.id
            serializer = LikeSerializer(data=data)
        elif post_id:
            like_exists = Like.objects.filter(author=user.id, post=post_id).exists()
            
            if like_exists:
                return Response({"detail": "You have already liked this post"}, status=400)

            post = get_object_or_404(Post, id=post_id)
            data['summary'] = f"{user.displayName} likes your post"
            data['post'] = post.id
            serializer = LikeSerializer(data=data)

        
        if serializer.is_valid():
            author_instance = get_object_or_404(User, id=user.id)
            serializer.save(author=author_instance)

            if comment_id:
                # set like in inbox of comment author
                inbox = Inbox.objects.create(author=comment.author, item=serializer.data)
                inbox.save()
            elif post_id:
                # set like in inbox of post author
                inbox = Inbox.objects.create(author=post.author, item=serializer.data)
                inbox.save()

            return Response(appendUserInfo(serializer.data, "likes", ["author"]), status=200)
        return Response(serializer.errors, status=400)
    
    def delete(self, request, author_id=None, post_id=None, comment_id=None, *args, **kwargs):

        user= request.user
        if not isinstance(user, User):
            return Response({"detail": "User not authenticated"}, status=400)

        serverKey = "" # this `is like a local request

        if isinstance(user, User):
            if user.displayName == "beeg":
                serverKey = "https://beeg-yoshi-backend-858f363fca5e.herokuapp.com"
            elif user.displayName == "web":
                serverKey = "https://web-weavers-backend-fb4af7963149.herokuapp.com"
            elif user.displayName == "super-coding":
                serverKey = "https://super-coding-team-89a5aa34a95f.herokuapp.com"

        authorPassed = request.data.get('author_id')
        if serverKey != "":
            if not authorPassed: # need to pass author_id because otherwise my server will not know who the like author is
                return Response(status=400, data="Need to pass author_id in request.body for like create endpoint since this request is from a foreign server")
            authorExistsOrCreated = checkServerUser(serverKey, authorPassed) # this function creates a user with foreign server id if user does not exist
            
            if not authorExistsOrCreated:
                return Response(status=400, data="User trying to remove like does not exist")

            user = User.objects.get(id=authorPassed) # update user to the foreign server user

        if comment_id:
            comment = get_object_or_404(Comment, id=comment_id)
            like = get_object_or_404(Like, comment=comment, author=user.id)
        elif post_id:
            post = get_object_or_404(Post, id=post_id)
            like = get_object_or_404(Like, post=post, author=user.id)

        if like.author.id != user.id:
            return Response({"detail": "User does not have permission to remove this like"}, status=400)
        
        like.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class InboxListView(ListAPIView):
    queryset = Inbox.objects.all().order_by('-published')
    serializer_class = InboxSerializer

    def list(self, request, author_id=None, *args, **kwargs):
        print(author_id)
        queryset = self.get_queryset().filter(author=author_id)
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                "type": "inbox",
                "author": User.objects.get(id=author_id).url,
                "items": appendInboxUserInfo(serializer.data)
            })
        
        serializer = self.get_serializer(queryset, many=True)

        return Response({
            "type": "inbox",
            "author": User.objects.get(id=author_id).url,
            "items": appendInboxUserInfo(serializer.data)
        })

    def post(self, request, author_id=None, *args, **kwargs):
        user = request.user
        if not isinstance(user, User):
            return Response({"detail": "User not authenticated"}, status=400)

        serverKey = "" # this `is like a local request

        if isinstance(user, User):
            if user.displayName == "beeg":
                serverKey = "https://beeg-yoshi-backend-858f363fca5e.herokuapp.com"
            elif user.displayName == "web":
                serverKey = "https://web-weavers-backend-fb4af7963149.herokuapp.com"
            elif user.displayName == "super-coding":
                serverKey = "https://super-coding-team-89a5aa34a95f.herokuapp.com"

        # expect item in request.body

        # check if item is a post, comment, like, follow, follow request
        


    def delete(self, request, author_id=None, *args, **kwargs):

        author = User.objects.get(id=author_id)

        queryset = self.get_queryset().filter(author=author_id)
        queryset.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# Helper functions
def appendUserInfo(data, type, userAlias=[], userId=None):
    if not isinstance(data, list):
        data = [data]

    for item in data:
        for user in userAlias:
            author = User.objects.get(id=item[user])
            item[user] = {
                "type": "author",
                "id": author.id,
                "displayName": author.displayName,
                "github": author.github,
                "profilePicture": author.profilePicture,
                "url": author.host + "authors/" + author.id,
                "host": author.host,
            }

            if type == "posts":
                likes = Like.objects.filter(post=item['id'])
                item['likes'] = appendUserInfo(LikeSerializer(likes, many=True).data, "likes", ["author"])
                item['id'] = item[user]['url'] + "/posts/" + item['id']
                # check if author is friend
                if userId:
                    following = Follower.objects.filter(followed__id=userId, follower__id=item[user]['id']).exists()
                    followed = Follower.objects.filter(followed__id=item[user]['id'], follower__id=userId).exists()
                    item[user]['isFriends'] = following and followed
            elif type == "comments":
                likes = Like.objects.filter(comment=item['id'])
                item['likes'] = appendUserInfo(LikeSerializer(likes, many=True).data, "likes", ["author"])
                item['id'] = item[user]['url'] + "/posts/" + str(item['post']) + "/comments/" + item['id']
                if 'post' in item:
                    del item['post']

    return data

def appendFollowedFollowing(data, user):
    if not isinstance(data, list):
        data = [data]

    if isinstance(user, AnonymousUser):
        return data
    
    for item in data:
        item['followed'] = Follower.objects.filter(followed__id=user.id, follower__id=item['id']).exists()

        # following has 2 versions: Either I have sent a follow request already or I have done nothing yet
        following = Follower.objects.filter(followed__id=item['id'], follower__id=user.id).exists()
        followRequestPending = FollowRequest.objects.filter(actor__id=user.id, object__id=item['id']).exists()
        if following:
            item['following'] = 'Following'
        elif followRequestPending:
            item['following'] = 'Pending'
        else:
            item['following'] = 'Not Following'

    return data

def appendInboxUserInfo(data):
    if not isinstance(data, list):
        data = [data]

    finalData = []

    for item in data:
        itemToAppend = item['item']
        type = itemToAppend['type']

        userAlias = []
        if type == 'post':
            userAlias = ["author"]
        elif type == 'comment':
            userAlias = ["author"]
        elif type == 'Follow':
            userAlias = ["actor", "object"]
        elif type == 'Like':
            userAlias = ["author"]

        for alias in userAlias:
            print(alias)
            print(itemToAppend[alias])
            print(item)
            author = User.objects.get(id=itemToAppend[alias])
            itemToAppend[alias] = {
                "type": "author",
                "id": author.id,
                "displayName": author.displayName,
                "github": author.github,
                "profilePicture": author.profilePicture,
                "url": author.host + "authors/" + author.id,
                "host": author.host,
            }

            if type == "posts":
                likes = Like.objects.filter(post=itemToAppend['id'])
                itemToAppend['likes'] = appendUserInfo(LikeSerializer(likes, many=True).data, "likes", ["author"])
                itemToAppend['id'] = itemToAppend[alias]['url'] + "/posts/" + itemToAppend['id']
            
            elif type == "comments":
                likes = Like.objects.filter(comment=itemToAppend['id'])
                itemToAppend['likes'] = appendUserInfo(LikeSerializer(likes, many=True).data, "likes", ["author"])
                itemToAppend['id'] = itemToAppend[alias]['url'] + "/posts/" + str(itemToAppend['post']) + "/comments/" + itemToAppend['id']
                if 'post' in itemToAppend:
                    del itemToAppend['post']
        
        finalData.append(itemToAppend)

    return finalData ## reversing the order of inbox to show latest on index 0


def checkServerUser(serverKey, author_id):
    if serverKey != "":
        if serverKey == 'https://beeg-yoshi-backend-858f363fca5e.herokuapp.com':
            print('author_id')
            print(author_id)
            # check if author with id exists then do nothing
            author = User.objects.filter(id=author_id).first()
            if not author:
                # if author does not exist, send a get request to serverKey/authors/author_id and then create user
                
                # send a get request
                headers = {'Authorization': 'Token 98f2ff14e354dc9744b7bf8ad79ec47e5037db5b'}
                response = requests.get(f'{serverKey}/service/authors/{author_id}/', headers=headers)
                print('response')
                print(f'{serverKey}/authors/{author_id}/')
                print(response)

                # check if the request was successful
                if response.status_code == 200:
                    # extract the author data from the response
                    author_data = response.json()
                    print('author_data')
                    print(author_data)
                    # create a new user with the author data
                    author = User.objects.create(id=author_id, 
                                        displayName=author_data['displayName'],
                                        type="author",
                                        github=author_data['github'],
                                        url=author_data['url'],
                                        host=author_data['host'],
                                        profilePicture=author_data['profileImage'],
                                        )
                    return author
            else:
                return author
        elif serverKey == 'https://web-weavers-backend-fb4af7963149.herokuapp.com':
            # check if author with id exists then do nothing
            author = User.objects.filter(id=author_id).first()
            if not author:
                # if author does not exist, send a get request to serverKey/authors/author_id and then create user
                
                # send a get request
                response = requests.get(f'{serverKey}/authors/{author_id}', auth=('a-team', '12345'))

                # check if the request was successful
                if response.status_code == 200:
                    # extract the author data from the response
                    author_data = response.json()

                    # create a new user with the author data
                    author = User.objects.create(id=author_id, 
                                        displayName=author_data['displayName'],
                                        type="author",
                                        github=author_data['github'],
                                        url=author_data['url'],
                                        host=author_data['host'],
                                        profilePicture=author_data['profileImage'],
                                        )
                    return author
            else:
                return author
        elif serverKey == 'https://super-coding-team-89a5aa34a95f.herokuapp.com':
            # check if author with id exists then do nothing
            author = User.objects.filter(id=author_id).first()
            if not author:
                # if author does not exist, send a get request to serverKey/authors/author_id and then create user
                
                # send a get request
                response = requests.get(f'{serverKey}/authors/{author_id}', auth=('a-team', 'a-team'))

                # check if the request was successful
                if response.status_code == 200:
                    # extract the author data from the response
                    author_data = response.json()

                    # create a new user with the author data
                    author = User.objects.create(id=author_id, 
                                        displayName=author_data['displayName'],
                                        type="author",
                                        github=author_data['github'],
                                        url=author_data['url'],
                                        host=author_data['host'],
                                        profilePicture=author_data['profileImage'],
                                        )
                    return author
            else:
                return author

        
        return 0