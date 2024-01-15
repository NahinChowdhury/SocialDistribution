import axios from "axios";
import React, {FunctionComponent, useEffect, useState} from "react";
import { Link, useParams } from "react-router-dom";
import { AuthorInterface, PostInterface } from "../interfaces";
import { CreatePost } from "./CreatePost";
import { CommentSection } from "./CommentSection";
import ReactMarkdown from "react-markdown";
import { EditPost } from "./EditPost";


export const Posts:FunctionComponent<any> = ({mode="timeline", customUrl = "", otherUser={}}) => {

	const user = JSON.parse(window.localStorage.getItem("user") || "{}");
	const token = window.localStorage.getItem("token") || "";

    const domain = window.location.hostname;
    const port = window.location.port;

    const id = useParams().id;
    const [posts, setPosts] = useState<PostInterface[]>([]);
    const [fetch, setFetch] = useState<boolean>(true);
    const [openCreatePost, setOpenCreatePost] = useState<boolean>(false);
    const [openEditPost, setOpenEditPost] = useState<boolean>(false);
    const [postToEdit, setPostToEdit] = useState<PostInterface | undefined>(undefined);


    const defaultEndpoint = mode === "timeline" ? "getAllPosts/" : mode === "others" && customUrl.includes("super-coding-team-89a5aa34a95f.herokuapp.com") ? `${customUrl}/authors/${id}/posts` : mode === "others" ? `${customUrl}/authors/${id}/posts/` : `/authors/${user.id}/posts/`;
	const [endpoint, setEndpoint] = useState<string | null>(mode === "timeline" ? "getAllPosts/" : mode === "others" && customUrl.includes("super-coding-team-89a5aa34a95f.herokuapp.com") ? `${customUrl}/authors/${id}/posts` : mode === "others" ? `${customUrl}/authors/${id}/posts/` : `/authors/${user.id}/posts/`);
	const [fetchNext, setFetchNext] = useState<boolean>(true);
    const [firstFetched, setFirstFetched] = useState<boolean>(false);
    const webEndpoint = 'https://web-weavers-backend-fb4af7963149.herokuapp.com'
    const beegEndpoint = 'https://beeg-yoshi-backend-858f363fca5e.herokuapp.com/service'
    const superEndpoint = 'https://super-coding-team-89a5aa34a95f.herokuapp.com'

	useEffect(() => {
        console.log('customUrl');
        console.log(customUrl);
		if(endpoint === null || fetchNext === false) return;
        
        let headers: any = {Authorization: `Token ${token}`}

        if(customUrl.includes("beeg-yoshi-backend-858f363fca5e.herokuapp.com")){
            headers = {Authorization: `Token 98f2ff14e354dc9744b7bf8ad79ec47e5037db5b`}
        } else if(customUrl.includes("web-weavers-backend-fb4af7963149.herokuapp.com")){
            headers = {Authorization: `Basic YS10ZWFtOjEyMzQ1`}
        } else if(customUrl.includes("super-coding-team-89a5aa34a95f.herokuapp.com")){
            headers = {Authorization: `Basic YS10ZWFtOmEtdGVhbQ==`}
        }

		axios.get(endpoint!,
            {headers: headers}
            )
			.then(res => {
                const firstFetchedSaved = firstFetched;
                // custom handling for beeg since they have no pagination
                if(customUrl.includes("beeg-yoshi-backend-858f363fca5e.herokuapp.com")){
                    const friendPosts: PostInterface[] = res.data || [];
                    let updatedFriendPosts = friendPosts.map(post => {
                        return { ...post, id: String(post.id) , author: { id: String(post.author) } as AuthorInterface};
                    });
                    console.log(updatedFriendPosts);
                    if(endpoint === defaultEndpoint) {
                        setPosts(updatedFriendPosts);
                    }else{
                        setPosts(prevPosts => [...prevPosts, ...updatedFriendPosts]);
                    }
                    setEndpoint(null);
                    setFetchNext(false);
                    setFetch(false);
                    return;
                } else if(customUrl.includes("web-weavers-backend-fb4af7963149.herokuapp.com")){
                    const { items: friendPosts } = res.data || [];
                    console.log(friendPosts);
                    if(endpoint === defaultEndpoint) {
                        setPosts(friendPosts);
                    }else{
                        setPosts(prevPosts => [...prevPosts, ...friendPosts]);
                    }
                    setEndpoint(null);
                    setFetchNext(false);
                    setFetch(false);
                    return;
                } else if(customUrl.includes("super-coding-team-89a5aa34a95f.herokuapp.com")){
                    const friendPosts: PostInterface[] = res.data || [];
                    if(endpoint === defaultEndpoint) {
                        setPosts(friendPosts);
                    }else{
                        setPosts(prevPosts => [...prevPosts, ...friendPosts]);
                    }
                    setEndpoint(null);
                    setFetchNext(false);
                    setFetch(false);
                    return;
                }

                const { items: friendPosts } = res.data?.results || [];
                console.log(friendPosts);
                if(!firstFetchedSaved) {
                    setPosts(prevPosts => [...prevPosts, ...friendPosts]);
                }
                else if(endpoint === defaultEndpoint) {
					setPosts(friendPosts);
				}else {
                    setPosts(prevPosts => [...prevPosts, ...friendPosts]);
				}
				setEndpoint(res.data?.next);
				setFetchNext(false);
                setFetch(false);
			})
			.catch(e => {
				const error = e.response.data;
				console.log(error);
				setPosts(prevPosts => [...prevPosts]);
				setFetchNext(false);
                setFetch(false);
			})

        if(!firstFetched && mode==="timeline"){
            console.log("sending request to web-weavers")
            axios.get(`${webEndpoint}/public-posts/`,
			{ 
                headers: {
                    Authorization: `Basic YS10ZWFtOjEyMzQ1`
                }
            })
                .then(res => {
                    const { items: friendPosts } = res.data || [];
                    console.log(webEndpoint);
                    console.log(friendPosts);
                    setPosts(prevPosts => [...prevPosts, ...friendPosts]);
                })
                .catch(e => {
                    const error = e.response.data;
                    alert("Could not fetch posts from web-weavers")
                })

            console.log("sending request to beeg-yoshi")
            axios.get(`${beegEndpoint}/get/public/posts/`,
            {
                headers: {
                    Authorization: `Token 98f2ff14e354dc9744b7bf8ad79ec47e5037db5b`
                }
            })
                .then(res => {
                    console.log(res.data)
                    const friendPosts:PostInterface[] = res.data || [];
                    let updatedFriendPosts = friendPosts.map(post => {
                        return { ...post, id: String(post.id) , author: { ...post.author, id: String(post.author.id) }};
                    });
                    
                    
                    console.log(updatedFriendPosts);
                    setPosts(prevPosts => [...prevPosts, ...updatedFriendPosts]);
                })
                .catch(e => {
                    const error = e.response.data;
                    alert("Could not fetch posts from beeg-yoshi")
                })
            

            axios.get(`${superEndpoint}/authors/allposts`,
            {
                headers: {
                    Authorization: `Basic YS10ZWFtOmEtdGVhbQ==`
                }
            })
                .then(res => {
                    const friendPosts:PostInterface[] = res.data || [];
                    setPosts(prevPosts => [...prevPosts, ...friendPosts]);
                })
                .catch(e => {
                    const error = e.response.data;
                    alert("Could not fetch posts from super-coding")
                })

            }
        setFirstFetched(true);

	}, [fetchNext])

    useEffect(() => {
        if(fetch === false) return;
        
        setEndpoint(defaultEndpoint);
        setFetchNext(true);
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
                alert("Could not delete post")
            })
    }

    const sendLike = (post: PostInterface) => {

        let sendRequestEndpoint = post.id+'/likes/'
        let headers: any = {Authorization: `Token ${token}`}
        let data: any = {}
        
        if(post.id.includes("web-weavers-backend-fb4af7963149.herokuapp.com")){
            sendRequestEndpoint = post.id.split("posts/")[0] + "inbox/"
            data = {
                type: "Like",
                author: user.url,
                object: post.id,
                summary: `${user.displayName} liked your post`,
            }
            headers = {Authorization: `Basic YS10ZWFtOjEyMzQ1`}
        } else if(post.source.includes("beeg-yoshi-backend-858f363fca5e.herokuapp.com")){
            sendRequestEndpoint = `https://beeg-yoshi-backend-858f363fca5e.herokuapp.com/service/remote/authors/like/${String(post.id)}/`
            data = {
                author: user.id,
                displayName: user.displayName,
                object_id: post.id,
                server: "A-Team"
            }
            headers = {Authorization: "Token 98f2ff14e354dc9744b7bf8ad79ec47e5037db5b"}
        } else if(post.id.includes("super-coding-team-89a5aa34a95f.herokuapp.com")){
            sendRequestEndpoint = `${post?.author?.id}/inbox`;
            data = {
                object: post.id,
                type: 'like',
                summary: `${user.displayName} liked your post`,
                author: {id: user.url}
            }
            headers = {Authorization: `Basic YS10ZWFtOmEtdGVhbQ==`}
        }
        axios.post(sendRequestEndpoint,
            data,
            {headers: headers
            })
            .then(res => {
                console.log(res.data);
                
                if(post.id.includes("web-weavers-backend-fb4af7963149.herokuapp.com") || post.source.includes("beeg-yoshi-backend-858f363fca5e.herokuapp.com") || post.id.includes("super-coding-team-89a5aa34a95f.herokuapp.com")){
                    if(post.source.includes("beeg-yoshi-backend-858f363fca5e.herokuapp.com") && res.status == 200){
                        alert("Already liked this post")
                    }
                    setPosts(prevPosts => {
                        return prevPosts.map(currPost => {
                            console.log(currPost.id, post.id)
                            if(currPost.id === post.id){
                                console.log("user liking post found")
                                return {
                                    ...currPost,
                                    likes: [
                                        {
                                            author: {...user},
                                            type: "Like",
                                            comment: '',
                                            post: currPost?.id.split('/')[currPost?.id.split('/').length - 1],
                                        }
                                    ]
                                }
                            }else{
                                return currPost
                            }
                        })
                    })
                } else{
                    // get fresh data and replace liked post with new post
                    axios.get(post.id+'/',
                        {headers: {
                            Authorization: `Token ${token}`
                            }
                        })
                        .then(res => {
                            const post = res?.data[0];
    
                            setPosts(prevPosts => {
                                return prevPosts.map(currPost => {
                                    console.log(currPost.id, post.id)
                                    if(currPost.id === post.id){
                                        return post;
                                    }else{
                                        return currPost
                                    }
                                })
                            })
                        })
                }
            })
            .catch(e => {
                const error = e.response.data;
                console.log(error);
                if(e.response.status === 409){
                    alert("Already liked this post")
                    setPosts(prevPosts => {
                        return prevPosts.map(currPost => {
                            console.log(currPost.id, post.id)
                            if(currPost.id === post.id){
                                console.log("user liking post found")
                                return {
                                    ...currPost,
                                    likes: [
                                        {
                                            author: {...user},
                                            type: "Like",
                                            comment: '',
                                            post: currPost?.id.split('/')[currPost?.id.split('/').length - 1],
                                        }
                                    ]
                                }
                            }else{
                                return currPost
                            }
                        })
                    })
                } else{
                    alert("Could not like post")
                }
            })
    }

    const sendUnike = (post: PostInterface) => {

        axios.delete(post.id+'/likes/', 
            {headers: {
                Authorization: `Token ${token}`
                }
            })
            .then(res => {
                
                // remove the like from the post
                setPosts(prevPosts => {
                    return prevPosts.map(currPost => {
                        if(currPost.id === post.id){
                            return {
                                ...currPost,
                                likes: currPost.likes?.filter(like => like.author.id !== user.id)
                            }
                        }else{
                            return currPost
                        }
                    })
                })
            })
            .catch(e => {
                const error = e.response.data;
                console.log(error);
                alert("Could not unlike post")
            })
    }

    const sharePost = (post: PostInterface) => {
        
        axios.post(`/authors/${user.id}/posts/`,
            {
                ...post
            },
            {
                headers: {
                    Authorization: `Token ${token}`
                    }
            })
            .then(res => {
                console.log(res.data);
            })
            .catch(e => {
                const error = e.response.data;
                console.log(error);
                alert("Could not share post")
            })

    }

	return ( 
		<div className="posts">
			{mode !== "others" && (
                <div className="mx-5">
                    <button className="btn btn-primary my-3" onClick={() => setOpenCreatePost(!openCreatePost)}>
                        Create Post
                    </button>
                </div>
            )}
            {openCreatePost && <CreatePost setOpenCreatePost={setOpenCreatePost} setFetch={setFetch}/>}
            {openEditPost && <EditPost post={postToEdit} setOpenEditPost={setOpenEditPost} setFetch={setFetch} setPostToEdit={setPostToEdit} />}
		
			{posts.length > 0 ? 
                posts.map(post => {
                    return (
                        post.unlisted && (post.author.id !== user.id || mode !== "profile") ? 
                            null :
                            post.visibility === "PRIVATE" && post.author.id !== user.id ? 
                            null :
                            post.author.id !== user.id && post.visibility.toLowerCase() === "friends" && mode === "timeline" ?
                            null :
                            post.author.id !== user.id && post.visibility === "FRIENDS" && !post.author?.isFriends ?
                            null :
                            post.author.id !== user.id && otherUser?.url?.includes("super-coding-team-89a5aa34a95f.herokuapp.com") && post.visibility.toLowerCase() === "friends" && !otherUser?.isFriends ?
                            null :
                            post.author.id !== user.id && post.visibility === "SPECIFIC_AUTHOR" && post.specific_author !== user.id ?
                            null :
                            <div key={post.id}>
                                <div className="card my-3 mx-5">
                                <div className="card-body">
                                    <span className="d-flex align-items-center">
                                        <Link to={`/${post.author.id.split('/')[post.author.id.split('/').length - 1]}`}><img src={post?.author?.profilePicture || post?.author?.profileImage || "https://static.vecteezy.com/system/resources/previews/016/267/347/large_2x/profile-account-outline-icon-isolated-flat-design-illustration-free-vector.jpg"} alt="Author Profile" className="rounded-circle mr-2" width="50" height="50" /></Link>
                                        <h1 className="card-title display-1" style={{marginLeft: "0.5rem"}}>{post.title}</h1>
                                    </span>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <p className="card-text mb-0"><Link to={`/${post.author.id.split('/')[post.author.id.split('/').length - 1]}`}>{post.author.displayName}</Link> • { (post?.id?.includes("socialdistribution.onrender.com") || post?.id?.includes("127.0.0.1")) ? 'Local': post?.id?.includes("web-weavers-backend-fb4af7963149.herokuapp.com") ? 'Web Weavers' : post?.id?.includes("super-coding-team-89a5aa34a95f.herokuapp.com") ? 'Super Coding': 'Beeg Yoshi'} • {post.visibility} • {new Date(post.published).toLocaleString()}</p>
                                        { (post.id.includes("socialdistribution.onrender.com") || post.id.includes("127.0.0.1")) &&
                                            <span>
                                                {post.author.id === user.id && <button className="btn btn-warning" style={{marginRight: "0.25rem"}} onClick={() => {setOpenEditPost(!openEditPost); setPostToEdit(post)}}>Edit Post</button>}
                                                {post.author.id === user.id && <button className="btn btn-danger" style={{marginRight: "0.25rem"}} onClick={() => deletePost(post.id)}>Delete Post</button>}
                                                <button className="btn btn-primary" onClick={() => navigator.clipboard.writeText(`${domain}${port !== '' ? `:${port}` : ''}/${post.author.id}/posts/${post.id.split('/')[post.id.split('/').length - 1]}`)}>Copy Link</button>
                                            </span>
                                        }
                                    </div>
                                    <h5 className="card-title">{post.description}</h5>
                                    <div className="card-text">
                                        {
                                            post.id.includes("web-weavers-backend-fb4af7963149.herokuapp.com")  && (post.contentType === "image/png;base64" || post.contentType === "image/jpeg;base64") ?
                                                <img src={`data:${post.contentType},${post.content}`} alt="Post Image" style={{width: "50%"}}/>
                                            :
                                                post.contentType === "text/plain" ?
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
                                    {(post.id.includes("socialdistribution.onrender.com") || post.id.includes("127.0.0.1")) && post.source !== post.origin && 
                                        <div className="d-flex justify-content-start">
                                            <p className="card-text small text-muted mb-0">
                                                <a href={`${window.location.origin}/${post.origin?.split('authors/')[1]}`}>
                                                    Click here to view the original post!
                                                </a>
                                            </p>
                                        </div>
                                    }
                                    {post?.likes && <p className="card-text small text-muted mb-0">{post?.likes?.length} Likes</p>}
                                    {
                                        <div className="d-flex align-items-center mt-2">
                                            <div className="d-flex align-items-center" style={{marginRight: "0.25rem"}}>
                                                {!post.likes?.find((like) => like.author.id === user.id) ? (
                                                <button className="btn btn-primary" onClick={() => sendLike(post)}>
                                                    Like Post
                                                </button>
                                                ) : (
                                                <button className="btn btn-danger" onClick={() => sendUnike(post)} disabled={post.id.includes("web-weavers-backend-fb4af7963149.herokuapp.com") || post.source.includes("beeg-yoshi-backend-858f363fca5e.herokuapp.com") || post.id.includes("super-coding-team-89a5aa34a95f.herokuapp.com")}>
                                                    Unlike Post
                                                </button>
                                                )}
                                            </div>
                                            <div className="d-flex align-items-center" style={{marginRight: "0.25rem"}}>
                                                <button className="btn btn-secondary" onClick={ () => {setPosts(prevPosts => {
                                                        return prevPosts.map(currPost => {
                                                            if(currPost.id === post.id){
                                                                return{
                                                                    ...currPost,
                                                                    showComments: !currPost.showComments
                                                                }
                                                            }else{
                                                                return currPost
                                                            }
                                                        })
                                                    })}}>
                                                        Comments
                                                    </button>
                                            </div>
                                            {
                                                (post.id.includes("socialdistribution.onrender.com") || post.id.includes("127.0.0.1")) &&
                                                <div className="d-flex align-items-center">
                                                    <button className="btn btn-success" onClick={ () => {sharePost(post)}}>
                                                        Share
                                                    </button>
                                                </div>
                                            }
                                        </div>
                                    }
                                    {post.showComments && 
                                        <CommentSection post={post} />
                                    }
                                </div>
                                </div>
                            </div>
                    )
                })
                :
                <>
                </>
            }

            <div className="text-center">
                {endpoint === null ? <p className="text-danger">End of posts!</p> : <button className="btn btn-success" onClick={() => setFetchNext(true)}>Load More Posts</button>}
            </div>
		</div>

		
	)
}