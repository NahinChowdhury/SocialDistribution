import axios from "axios";
import React, {FunctionComponent, useEffect, useState} from "react";
import { Link, useParams } from "react-router-dom";
import { CommentInterface, FollowRequestInterface, LikeInterface, PostInterface } from "../interfaces";


export const Inbox:FunctionComponent = () => {

	const user = JSON.parse(window.localStorage.getItem("user") || "{}");
	const [inboxItems, setInboxItems] = useState<(LikeInterface | PostInterface | CommentInterface | FollowRequestInterface)[]>([]);
	
	const defaultEndpoint = `${user.url}/inbox/`;
	const [endpoint, setEndpoint] = useState<string | null>(`${user.url}/inbox/`);
	const [fetchNext, setFetchNext] = useState<boolean>(true);

	useEffect(() => {
		if(endpoint === null || fetchNext === false) return;
		axios.get(endpoint)
		.then(res => {
			setInboxItems(prevInbox => [...prevInbox, ...res.data?.results?.items.map((item: any) => {
				switch (item.type) {
					case 'post':
						return item as PostInterface;
					case 'comment':
						return item as CommentInterface;
					case 'Like':
						return item as LikeInterface;
					case 'Follow':
						return item as FollowRequestInterface;
					default:
						throw new Error(`Unknown item type: ${item.type}`);
				}
			})]);
			setEndpoint(res.data?.next);
			setFetchNext(false);
		})
		.catch(e => {
			const error = e.response.data;
			setInboxItems([]);
			alert("Could not fetch inbox")
		})
	}, [fetchNext])

	const clearInbox = () => {
		axios.delete(`${user.url}/inbox/`)
		.then(res => {
			console.log(res.data)
			setInboxItems([]);
			setEndpoint(null);
		})
		.catch(e => {
			const error = e.response.data;
			console.log(error);
			alert("Could not clear inbox")
		})
	}

	return (
		<div className="inbox my-5">
			<div className="d-flex justify-content-between align-items-center mb-5">
				<h1 className="display-1" style={{marginLeft: "3rem"}}>Inbox</h1>
				<span>
					<button onClick={() => clearInbox()} className="btn btn-danger" style={{marginRight: "3rem"}}>Clear Inbox</button>
				</span>
			</div>
			{inboxItems.map((item, index) => {
				if (item.type === "Like") {
					return (
						<div key={index}>
							<div className="card my-3 mx-5">
								<div className="card-body">
									<span className="d-flex align-items-center">
										<Link to={`/${item.author.id}`} style={{marginRight: '0.5rem'}}><img src={item?.author?.profilePicture || item?.author?.profileImage || "https://static.vecteezy.com/system/resources/previews/016/267/347/large_2x/profile-account-outline-icon-isolated-flat-design-illustration-free-vector.jpg"} alt="Author Profile" className="rounded-circle mr-2" width="50" height="50" /></Link>
										<h2>{item.author.displayName} liked your {item.comment ? <Link to={`/${item.author.id}/posts/${item.post}`}>comment</Link> : <Link to={`/${item.author.id}/posts/${item.post}`}>post</Link>}</h2>
									</span>
								</div>
							</div>
						</div>
					)
				} else if (item.type === "post") {
					return (
						<div key={index}>
							<div className="card my-3 mx-5">
								<div className="card-body">
									<span className="d-flex align-items-center">
										<Link to={`/${item.author.id}`} style={{marginRight: '0.5rem'}}><img src={item?.author?.profilePicture || item?.author?.profileImage || "https://static.vecteezy.com/system/resources/previews/016/267/347/large_2x/profile-account-outline-icon-isolated-flat-design-illustration-free-vector.jpg"} alt="Author Profile" className="rounded-circle mr-2" width="50" height="50" /></Link>
										<h2>{item.author.displayName} just created a {item.visibility.toLowerCase() === "public" ? "public" : item.visibility.toLowerCase() === "FRIENDS" ? "friends only": item.visibility.toLowerCase()} post. Click <Link to={`/${item.author.id}/posts/${item.id}`}>here</Link> to view it!</h2>
									</span>
								</div>
							</div>
						</div>
					)
				} else if (item.type === "comment") {
					return (
						<div key={index}>
							<div className="card my-3 mx-5">
								<div className="card-body">
									<span className="d-flex align-items-center">
										<Link to={`/${item.author.id}`} style={{marginRight: '0.5rem'}}><img src={item?.author?.profilePicture || item?.author?.profileImage || "https://static.vecteezy.com/system/resources/previews/016/267/347/large_2x/profile-account-outline-icon-isolated-flat-design-illustration-free-vector.jpg"} alt="Author Profile" className="rounded-circle mr-2" width="50" height="50" /></Link>
										<h2>{item.author.displayName} commented on your post. Click <Link to={`/${item.author.id}/posts/${item.post}`}>here</Link> to view it!</h2>
									</span>
								</div>
							</div>
						</div>
					)
				} else if (item.type === "Follow") {
					return (
						<div key={index}>
							<div className="card my-3 mx-5">
								<div className="card-body">
									<span className="d-flex align-items-center">
										<Link to={`/${item.actor.id}`} style={{marginRight: '0.5rem'}}><img src={item?.actor?.profilePicture || item?.actor?.profileImage || "https://static.vecteezy.com/system/resources/previews/016/267/347/large_2x/profile-account-outline-icon-isolated-flat-design-illustration-free-vector.jpg"} alt="Author Profile" className="rounded-circle mr-2" width="50" height="50" /></Link>
										<h2><Link to={`/${item.actor.id}`}>{item.actor.displayName}</Link> sent you a follow request. You can find the request on your <Link to={"/profile#socials"}>profile</Link>!</h2>
									</span>
								</div>
							</div>
						</div>
					)
				} else{
					return (<></>)
				}
			})}
			<div className="text-center">
                {endpoint === null ? <p className="text-danger">End of inbox!</p> : <button className="btn btn-success" onClick={() => setFetchNext(true)}>Load More inbox objects</button>}
            </div>
		</div>
	)
}