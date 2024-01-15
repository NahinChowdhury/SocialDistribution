import axios from "axios";
import React, {FunctionComponent, useEffect, useState} from "react";
import { AuthorInterface, CommentInterface } from "../interfaces";
import { CreateComment } from "./CreateComment";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { EditComment } from "./EditComment";

export const CommentSection:FunctionComponent<any> = ({post=[]}) => {

    const user = JSON.parse(window.localStorage.getItem("user") || "{}");
    const token = window.localStorage.getItem("token") || "";

    const [comments, setComments] = useState<CommentInterface[]>([]);
    const [fetch, setFetch] = useState<boolean>(true);
    const [openEditComment, setOpenEditComment] = useState<boolean>(false);
    const [commentToEdit, setCommentToEdit] = useState<CommentInterface | undefined>(undefined);

    const defaultEndpoint = post.source.includes("beeg-yoshi-backend-858f363fca5e.herokuapp.com") ? post.source+'comments': post.id.includes("web-weavers-backend-fb4af7963149.herokuapp.com") ? `${post.id}/comments/` : post.id.includes("super-coding-team-89a5aa34a95f.herokuapp.com") ? `${post.id}/comments` : post.comments+'/';
	const [endpoint, setEndpoint] = useState<string | null>(post.source.includes("beeg-yoshi-backend-858f363fca5e.herokuapp.com") ? post.source+'comments': post.id.includes("web-weavers-backend-fb4af7963149.herokuapp.com") ? `${post.id}/comments/` : post.id.includes("super-coding-team-89a5aa34a95f.herokuapp.com") ? `${post.id}/comments` : post.comments+'/');
	const [fetchNext, setFetchNext] = useState<boolean>(true);

    useEffect(() => {
        if(endpoint === null || fetchNext === false) return;

        let headers = {};
        if(endpoint.includes("beeg-yoshi-backend-858f363fca5e.herokuapp.com")){
            headers = {Authorization: `Token 98f2ff14e354dc9744b7bf8ad79ec47e5037db5b`}
        } else if(endpoint.includes("web-weavers-backend-fb4af7963149.herokuapp.com")){
            headers = {Authorization: `Basic YS10ZWFtOjEyMzQ1`}
        } else if(endpoint.includes("super-coding-team-89a5aa34a95f.herokuapp.com")){
            headers = {Authorization: `Basic YS10ZWFtOmEtdGVhbQ==`}
        }

        axios.get(endpoint, {headers: headers})
        .then(res => {
            if(endpoint.includes("beeg-yoshi-backend-858f363fca5e.herokuapp.com")){
                const postComments = res.data || [];

                let updatedComments = postComments.map( (comment: any) => {
                    return { ...comment, id: String(comment.id) , author: { id: String(comment.author), displayName: comment.displayName } as AuthorInterface};
                });
                setComments(updatedComments);
                setEndpoint(null);
                setFetchNext(false);
                setFetch(false);
                return
            } else if (endpoint.includes("web-weavers-backend-fb4af7963149.herokuapp.com")) {
                const postComments = res.data.items || [];

                setComments(postComments);
                setEndpoint(null);
                setFetchNext(false);
                setFetch(false);
                return
            } else if (endpoint.includes("super-coding-team-89a5aa34a95f.herokuapp.com")) {
                const postComments = res.data.comments || [];

                setComments(postComments);
                setEndpoint(null);
                setFetchNext(false);
                setFetch(false);
                return
            }

            // local comment endpoint parsing
            const { comments: postComments } = res.data?.results || [];

            if(endpoint === defaultEndpoint) {
                setComments(postComments);
            }else{
                setComments(prevComments => [...prevComments, ...postComments]);
            }
            setEndpoint(res.data?.next);
            setFetchNext(false);
            setFetch(false);
        })
        .catch(e => {
            console.log("Error: " + e.response)
            const error = e.response.data;
            console.log(e);
            console.log(error)
            setComments(prevComments => [...prevComments]);
            setFetchNext(false);
            setFetch(false);
        })
    },[fetchNext])
    
    useEffect(() => {
        if(fetch === false) return;
        
        setEndpoint(defaultEndpoint);
        setFetchNext(true);
    }, [fetch])

    const deleteComment = (commentUrl: string) => {
        console.log(commentUrl);
        axios.delete(commentUrl+"/")
        .then(res => {
            setFetch(true);
        })
        .catch(e => {

            const error = e.response.data;
            alert("Could not delete comment")
        })
    }

    const sendLike = (commentUrl: string) => {
        console.log(commentUrl)
        axios.post(commentUrl+'/likes/',
            {},
            {headers: {
                Authorization: `Token ${token}`
                }
            })
            .then(res => {
                console.log(res.data);

                axios.get(commentUrl+'/',
                    {headers: {
                        Authorization: `Token ${token}`
                        }
                    })
                    .then(res => {
                        const comment = res?.data[0];

                        setComments(prevComment => {
                            return prevComment.map(currComment => {
                                console.log(currComment.id, comment.id)
                                if(currComment.id === comment.id){
                                    return comment;
                                }else{
                                    return currComment
                                }
                            })
                        })
                    })
            })
            .catch(e => {
                const error = e.response.data;
                console.log(error);
                alert("Could not like comment")
            })
    }

    const sendUnike = (commentUrl: string) => {

        axios.delete(commentUrl+'/likes/', 
            {headers: {
                Authorization: `Token ${token}`
                }
            })
            .then(res => {
                
                // remove the like from the post

                setComments(prevComments => {
                    return prevComments.map(currComment => {
                        if(currComment.id === commentUrl){
                            return {
                                ...currComment,
                                likes: currComment.likes?.filter(like => like.author.id !== user.id)
                            }
                        }else{
                            return currComment
                        }
                    })
                })
            })
            .catch(e => {
                const error = e.response.data;
                console.log(error);
                alert("Could not unlike comment")
            })
    }
    const commentHtml = (comment: CommentInterface) => {

        return (
            <div key={comment.id} className="card my-3 mx-3">
                <div className="card-body">
                    <div className="d-flex justify-content-end">
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                        <span className="d-flex align-items-center mb-3">
                            <Link to={`/${comment.author.id}`} ><img src={comment?.author?.profilePicture || comment?.author?.profileImage || "https://static.vecteezy.com/system/resources/previews/016/267/347/large_2x/profile-account-outline-icon-isolated-flat-design-illustration-free-vector.jpg"} 
                            alt="Author Profile" className="rounded-circle mr-2" width="50" height="50" /></Link>
                            <Link to={`/${comment.author.id}`} style={{textDecoration: 'none', color: 'black'}}><h5 className="card-title" style={{marginLeft: "0.5rem"}}>{comment.author.displayName}</h5></Link>
                        </span>
                        {
                            (post.id.includes("c404-5f70eb0b3255.herokuapp.com") || post.id.includes("127.0.0.1")) &&
                            Object.keys(user).length !== 0 && 
                            <span>
                                {user.id === comment.author.id && <button className="btn btn-warning" style={{marginRight: "0.25rem"}} onClick={() => {setOpenEditComment(!openEditComment); setCommentToEdit(comment)}}>Edit Comment</button>}
                                {user.id === comment.author.id && <button className="btn btn-danger" onClick={() => deleteComment(comment.id)}>Delete Comment</button>}
                            </span>
                        }
                    </div>
                    <p className="card-subtitle mb-2 text-muted small">{new Date(comment.published).toLocaleString()}</p>
                    <p className="card-text pl-5">
                        {comment.contentType === "text/plain" ?
                            <>{comment.comment}</>
                            :
                            <ReactMarkdown>{comment.comment}</ReactMarkdown>
                        }
                    </p>
                    { (post.id.includes("c404-5f70eb0b3255.herokuapp.com") || post.id.includes("127.0.0.1")) && (comment?.id?.includes("c404-5f70eb0b3255.herokuapp.com") || comment?.id?.includes("127.0.0.1")) &&
                        <div className="d-flex align-items-start flex-column mt-2">
                            <p className="card-text small text-muted mb-0">{comment.likes.length} Likes</p>
                            {   
                                Object.keys(user).length !== 0 && 
                                (
                                    !comment.likes?.find(like => like.author.id === user.id) ?
                                    <button className="btn btn-primary mt-2" onClick={() => sendLike(comment.id)}>Like Comment</button>
                                    :
                                    <button className="btn btn-danger mt-2" onClick={() => sendUnike(comment.id)}>Unlike Comment</button>
                                )
                            }
                        </div>
                    }
                </div>
            </div>
        )
    }

    return post.id === "" ?
    (
    <>Unable to show comments for this post</>
    ):
    (
        <div className="comments" style={{marginLeft:"5rem"}}>
            {Object.keys(user).length !== 0 && <CreateComment post={post} setFetchComments={setFetch}/>}
            {openEditComment && <EditComment comment={commentToEdit} setOpenEditComment={setOpenEditComment} setFetch={setFetch} setCommentToEdit={setCommentToEdit}/>}
            
            {post.visibility === "FRIENDS" && post.author.id !== user.id ? 
                // find if comments has atleast one comment from user.id. show the comments that the user.id created

                comments.length > 0 ?
                    comments.filter(comment => comment.author.id === user.id).length > 0 ?
                        comments.filter(comment => comment.author.id === user.id).map(comment => {
                            if(comment.author.id === user.id){
                                return (
                                    commentHtml(comment)
                                    )
                            }
                        })
                        :
                        <>Comments are private</>
                    :
                    <></>
            :
            comments.length > 0 ? 
                comments.map(comment => {
                    return (
                        commentHtml(comment)
                        )
                })
                :
                <></>
            }
            <div className="text-center">
                {endpoint === null ? <p className="text-danger">End of comments!</p> : <button className="btn btn-success" onClick={() => setFetchNext(true)}>Load More Comments</button>}
            </div>
        </div>
        
    )
}