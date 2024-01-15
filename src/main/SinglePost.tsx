import axios from "axios";
import React, {FunctionComponent, useEffect, useState} from "react";
import { Link, useParams } from "react-router-dom";
import { PostInterface } from "../interfaces";
import { CreatePost } from "./CreatePost";
import { CommentSection } from "./CommentSection";
import ReactMarkdown from "react-markdown";
import { EditPost } from "./EditPost";


export const SinglePost:FunctionComponent<any> = () => {

	const user = JSON.parse(window.localStorage.getItem("user") || "{}");
	const token = window.localStorage.getItem("token") || "";
	
	const domain = window.location.hostname;
    const port = window.location.port;

    const id = useParams().id;
	const postId = useParams().postId;
    const [post, setPost] = useState<PostInterface | null>(null);
    const [fetch, setFetch] = useState<boolean>(true);
    const [openEditPost, setOpenEditPost] = useState<boolean>(false);
    const [postToEdit, setPostToEdit] = useState<PostInterface | undefined>(undefined);


	useEffect(() => {
		if(fetch === false) return;

		let config = {};
		if (Object.keys(user).length !== 0 && token !== "") {
			config = {
				headers: { Authorization: `Token ${token}` }
			};
		}

		axios.get(`/authors/${id}/posts/${postId}/`,
			config
			)
			.then(res => {
				console.log(res.data[0])
				setPost(res.data[0]);
				setFetch(false);
			})
			.catch(e => {
				const error = e.response.data;
				setPost(null);
			})
	}, [fetch])

    const deletePost = (postUrl: string) => {

        axios.delete(postUrl+'/', 
            {headers: {
                Authorization: `Token ${token}`
                }
            })
            .then(res => {
                console.log(res.data);
                setFetch(true);
            })
            .catch(e => {
                const error = e.response.data;
                console.log(error);
				alert("Could not delete this post. Please try again!")
            })
    }

    const sendLike = (postToLike: PostInterface) => {

		let sendLikeEndpoint = `${postToLike.id}/likes/`;
		let headers: any = {
			Authorization: `Token ${token}`
		}
		let data = {}

		if (postToLike.id.includes("web-weavers-backend-fb4af7963149.herokuapp.com")) {
			sendLikeEndpoint = `${postToLike.id}/inbox/`;
			data = {
				summary: `${user.displayName} likes your post`,
				type: "Like",
				author: user?.url,
				object: postToLike.id,
			}
			headers = {Authorization: `Basic YS10ZWFtOjEyMzQ1`}

		}else if(postToLike.source.includes("beeg-yoshi-backend-858f363fca5e.herokuapp.com")) {
			sendLikeEndpoint = `https://beeg-yoshi-backend-858f363fca5e.herokuapp.com/service/authors/${postToLike.author}/like/${user.id}/`;
			// might need to pass more info in data
			headers = {
				Authorization: `Token 98f2ff14e354dc9744b7bf8ad79ec47e5037db5b`
			}
		}
        axios.post(sendLikeEndpoint,
            data,
            {headers: headers})
            .then(res => {
                console.log(res.data);
				setFetch(true);
               
            })
            .catch(e => {
                const error = e.response.data;
                console.log(error);
				alert("Could not like this post. Please try again!")
            })
    }

    const sendUnike = (postToUnlike: PostInterface) => {

        axios.delete(postToUnlike.id+'/likes/', 
            {headers: {
                Authorization: `Token ${token}`
                }
            })
            .then(res => {
                
                // remove the like from the post

                post && setPost({...post, likes: post.likes?.filter(like => like.author.id !== user.id)})
            })
            .catch(e => {
                const error = e.response.data;
                console.log(error);
				alert("Could not unlike this post. Please try again!")
            })
    }


	return ( 
		<div className="single-post">
            {openEditPost && <EditPost post={postToEdit} setOpenEditPost={setOpenEditPost} setFetch={setFetch} setPostToEdit={setPostToEdit} />}
		
			{post ? 
				(
					post.visibility === "PRIVATE" && post.author.id !== user.id ? 
						"Unable to show this post because it may be private or deleted" :
						post.author.id !== user.id && post.visibility === "FRIENDS" && !post.author?.isFriends ?
						"Unable to show this post because it may be private or deleted" :
						<div key={post.id}>
							<div className="card my-3 mx-5">
							<div className="card-body">
								<span className="d-flex align-items-center">
									<Link to={`/${post.author.id.split('/')[post.author.id.split('/').length - 1]}`}><img src={post?.author?.profilePicture || post?.author?.profileImage || "https://static.vecteezy.com/system/resources/previews/016/267/347/large_2x/profile-account-outline-icon-isolated-flat-design-illustration-free-vector.jpg"} alt="Author Profile" className="rounded-circle mr-2" width="50" height="50" /></Link>
									<h1 className="card-title display-1" style={{marginLeft: "0.5rem"}}>{post.title}</h1>
								</span>
								<div className="d-flex justify-content-between align-items-center">
									<p className="card-text mb-0"><Link to={`/${post.author.id.split('/')[post.author.id.split('/').length - 1]}`}>{post.author.displayName}</Link> • {post.visibility} • {new Date(post.published).toLocaleString()}</p>
									{ (post.id.includes("c404-5f70eb0b3255.herokuapp.com") || post.id.includes("127.0.0.1")) &&
										<span>
											{Object.keys(user).length !== 0 && post.author.id === user.id && <button className="btn btn-warning" style={{marginRight: "0.25rem"}} onClick={() => {setOpenEditPost(!openEditPost); setPostToEdit(post)}}>Edit Post</button>}
											{Object.keys(user).length !== 0 && post.author.id === user.id && <button className="btn btn-danger" style={{marginRight: "0.25rem"}} onClick={() => deletePost(post.id)}>Delete Post</button>}
											<button className="btn btn-primary" onClick={() => navigator.clipboard.writeText(`${domain}${port !== '' ? `:${port}` : '' }/${post.author.id}/posts/${post.id.split('/')[post.id.split('/').length - 1]}`)}>Copy Link</button>
										</span>
									}
								</div>
								<h5 className="card-title">{post.description}</h5>
								<div className="card-text">
									{post.contentType === "text/plain" ?
										<p>{post.content}</p>
										:
										<ReactMarkdown>{post.content}</ReactMarkdown>
									}
								</div>
								{post.image &&
									<div className="d-flex justify-content-center">
										{<img src={post.image} alt="Post Image" style={{width: "50%"}}/>}
									</div>
								}
								{ (post.id.includes("c404-5f70eb0b3255.herokuapp.com") || post.id.includes("127.0.0.1")) &&
									<>
										<p className="card-text small text-muted mb-0">{post.likes.length} Likes</p>
										<div className="d-flex align-items-center mt-2">
											{
												Object.keys(user).length !== 0 && 
												<div className="d-flex align-items-center" style={{marginRight: "0.25rem"}}>
													{!post.likes?.find((like) => like.author.id === user.id) ? (
													<button className="btn btn-primary" onClick={() => sendLike(post)}>
														Like Post
													</button>
													) : (
													<button className="btn btn-danger" onClick={() => sendUnike(post)}>
														Unlike Post
													</button>
													)}
												</div>
											}
											<div className="d-flex align-items-center justify-content-end">
												<button className="btn btn-secondary" onClick={ () => setPost({...post, showComments: !post.showComments}) } >
													Comments
												</button>
											</div>
										</div>
									</>
								}
								
								{post.showComments && 
									<CommentSection post={post} />
								}
							</div>
							</div>
						</div>
				)
                :
                <>
				Post with id {postId} not found!
                </>
            }
		</div>

		
	)
}