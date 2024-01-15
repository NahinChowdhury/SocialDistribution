CMPUT404-project-socialdistribution
===================================

CMPUT 404 Project: Social Distribution

[Project requirements](https://github.com/uofa-cmput404/project-socialdistribution/blob/master/project.org) 

Link to Site
==========
    https://socialdistribution.onrender.com/login

Resources
==========
- [FullStack React & Django Authentication : Django REST ,TypeScript, Axios, Redux & React Router](https://dev.to/koladev/django-rest-authentication-cmh)
- [API Documentation with Swagger and Redoc | Learn Django REST Framework #16](https://www.youtube.com/watch?v=NVlebOJkzKE)
- [Django and React Tutorial // 4 - Deploy Django and React with Heroku](https://www.youtube.com/watch?v=r0ECufCyyyw)
- [React-Django-Heroku Web App Deployment](https://github.com/mdrhmn/react-dj-todoapp)
- [Adding TypeScript](https://create-react-app.dev/docs/adding-typescript/)

Setup
=======
### Requirements
    >> NodeJs: v16.14.0
    >> NPM: v8.5.3
    >> Python: v3.8

### Prerequisites
> Create a .env file with the following content:
>    > DATABASE_URL=sqlite:///db.sqlite3
>    > 
>    > DJANGO_ENV=development

### Running process
    >> virtualenv venv
    >> venv\Scripts\activate
    >> pip install -r requirements.txt
    >> python manage.py makemigrations
    >> python manage.py migrate
    >> npm install
    >> python manage.py collectstatic
    >> npm run build

Tests
=======
    python manage.py test

Documentation
=======
    https://socialdistribution.onrender.com/swagger/
    Note: To get a successful response from authorized endpoints, please click on the Authorize button and pass a valid token
    Example token: Token 0dc5bf543ed82edd06e754ef32ee91d779c2618f

Usage of AJAX
==============
    Our website uses an npm package named Axios to perform frontend to backend communication. This allows our website to achieve AJAX behavior

Remote Team connections
=========================
### Web Weavers
    - Users from our server can like and comment on web-weavers posts
    - Users from our server can send/accept/reject follow requests from web-weavers users
    - Users from our server can stop following web-weavers users
    - Users from our server can see public and image posts hosted on web-weavers server
    - Likes and comments sent by web-weavers' users will be sent to my server's user's inbox
    - Users from our server cannot share a post with web-weavers users
    - Users from our server cannot see friends-only posts from web-weavers users
    - Users from our server cannot unlike or delete comments from posts on web-weavers server since they don't have that functionality for remote users

### Beeg Yoshi
    - Users from our server can like and comment on beeg-yoshi posts
    - Users from our server can send/accept/reject follow requests from beeg-yoshi users
    - Users from our server can stop following beeg-yoshi users
    - Users from our server can see public and image posts hosted on beeg-yoshi server
    - Likes and comments sent by beeg-yoshis' users will be sent to my server's user's inbox
    - Users from our server cannot share a post with beeg-yoshi users
    - Users from our server cannot see friends-only posts from beeg-yoshi users
    - Users from our server cannot unlike or delete comments from posts on beeg-yoshi server since they don't have that functionality for remote users

### Super Coding Team We Are Awesome
    - Users from our server can like and comment on super-coding posts
    - Users from our server can send/accept/reject follow requests from super-coding users
    - Users from our server can see public and image posts hosted on super-coding server
    - Likes and comments sent by super-codings' users will be sent to my server's user's inbox
    - Users from our server can see friends-only posts from super-coding users
    - Users from our server cannot share a post with super-coding users
    - Users from our server cannot stop following super-coding users
    - Users from our server cannot unlike or delete comments from posts on super-coding server since they don't have that functionality for remote users

### Note
- When two users follow each other, then they are friends on our server. The same logic applies to remote friends. To find out your acoount is friends with another remote user, check the account's followers and then go to the profile of the remote user to see if the account is following the remote user
- We have set the pagination value to 100 because some of our users were not showing up on other remote servers. They only make a request to our server once and don't request any more users after the first response 
- Private posts can only be seen by the user who posted them, so remote users cannot see any private posts from my server

Contributors / Licensing
========================

Authors:
    
* JunJie Chen
* Zhi Liu
* Nahin Chowdhury
* Luofan Peng
* Jahratul Mim 

Generally everything is LICENSE'D under the _______Apache 2_______.
