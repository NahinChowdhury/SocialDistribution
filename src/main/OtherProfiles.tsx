import axios from "axios";
import React, {FunctionComponent, useEffect, useState} from "react";
import { Link, useParams } from "react-router-dom";
import { Posts } from "./Posts";
import { AuthorInterface } from "../interfaces";
import { OtherSocials } from "./OtherSocials";


export const OtherProfiles:FunctionComponent = () => {

	const user = JSON.parse(window.localStorage.getItem("user") || "{}");
	const token = window.localStorage.getItem("token") || "";
	const id = useParams().id;
	const [currentTab, setCurrentTab] = useState<string>("posts");
	const [otherUserInfo, setOtherUserInfo] = useState<AuthorInterface>({} as AuthorInterface)
	const [pendingFollowRequestReceived, setPendingFollowRequestReceived] = useState<boolean>(false);
	const [following, setFollowing] = useState<boolean>(false);
	const [pendingFollowRequestSent, setPendingFollowRequestSent] = useState<boolean>(false);
	const [customUrl, setCustomUrl] = useState<string>("");
	useEffect(() => {
		if(id == user.id) {
			window.location.href = "/profile";
		}
	}, []);

	useEffect(() => {
		axios.get(`/authors/${id}/`, {headers: {Authorization: `Token ${token}`}})
		.then(res => {
			let prelimCustomUrl = res?.data?.host || "";
			
			if (prelimCustomUrl.includes('beeg-yoshi-backend-858f363fca5e.herokuapp.com')) {
				prelimCustomUrl = 'https://beeg-yoshi-backend-858f363fca5e.herokuapp.com/service'
			}
			if (prelimCustomUrl.endsWith('/')) {
				prelimCustomUrl = prelimCustomUrl.slice(0, -1);
			}
			setCustomUrl(prelimCustomUrl)
			setOtherUserInfo(res.data);
			console.log("Other user info")
			console.log(res.data)
		})
		.catch(e => {
			const error = e.response.data;
			window.location.href = "/NotFound";
		})

	}, [id])

	useEffect(() => {
		if(Object.keys(otherUserInfo).length == 0) return;
		let followingEndpoint = `${otherUserInfo.url}/followers/${user.id}/`;
		let headers: any = {Authorization: `Token ${token}`}

		if(otherUserInfo.url.includes("beeg-yoshi-backend-858f363fca5e.herokuapp.com")) {
			// left should be who is followed
			// right should who is following
			followingEndpoint = `https://beeg-yoshi-backend-858f363fca5e.herokuapp.com/service/remote/authors/${otherUserInfo.id}/followers/${user.id}/`;
			headers = {Authorization: `Token 98f2ff14e354dc9744b7bf8ad79ec47e5037db5b`}
		} else if(otherUserInfo.url.includes("web-weavers-backend-fb4af7963149.herokuapp.com")) {
			followingEndpoint = `${otherUserInfo.url}/followers/`;
			headers = {Authorization: `Basic YS10ZWFtOjEyMzQ1`}
		} else if(otherUserInfo.url.includes("super-coding-team-89a5aa34a95f.herokuapp.com")) {
			// left is user who is followed
			// right is user who is following
			followingEndpoint = `${otherUserInfo.url}/followers/${user.id}`;
			headers = {Authorization: `Basic YS10ZWFtOmEtdGVhbQ==`}
		}

		// checking if loggedin user is following other user
		axios.get(followingEndpoint, {headers: headers})
		.then(res => {
			if(otherUserInfo.url.includes("web-weavers-backend-fb4af7963149.herokuapp.com")) {
				const userFollowers = res.data.items as AuthorInterface[];
				let following = false;
				for(let follower of userFollowers) {
					if (follower.id.includes(user.id)) {
						console.log("following" + follower.id)
						following = true;
						break;
					}
				}
				if(!following){
					throw new Error("Not following");
				}
			} else if(otherUserInfo.url.includes("beeg-yoshi-backend-858f363fca5e.herokuapp.com")) {
				if(res.data.message) {
					throw new Error("Not following");
				}
			} else if(otherUserInfo.url.includes("super-coding-team-89a5aa34a95f.herokuapp.com")) {
				if(!res.data.is_follower) {
					throw new Error("Not following");
				}
			}
			setFollowing(true);
		})
		.catch(e => {
			setFollowing(false);

			let followRequestPendingEndpoint = `${otherUserInfo.url}/followRequests/${user.id}/`
			let headers: any = {Authorization: `Token ${token}`}

			if (otherUserInfo.url.includes("beeg-yoshi-backend-858f363fca5e.herokuapp.com")) {
				// left should be from_user
				// right should be to_user
				followRequestPendingEndpoint = `https://beeg-yoshi-backend-858f363fca5e.herokuapp.com/service/remote/authors/${user.id}/request/${otherUserInfo.id}/`;
				headers = {Authorization: `Token 98f2ff14e354dc9744b7bf8ad79ec47e5037db5b`}
			}

			// if not following, then check if request sent
			// request sent should be on the receiving user's server
			if (otherUserInfo.url.includes("web-weavers-backend-fb4af7963149.herokuapp.com")) {
				// cannot do anything because this server doesn't allow you to check pending requests
				followRequestPendingEndpoint = `${otherUserInfo.url}/inbox/`;
			} else {

				// checking if loggedin user has sent follow request to other user
				axios.get(followRequestPendingEndpoint, {headers: headers})
				.then(res => {
					if (otherUserInfo.url.includes("beeg-yoshi-backend-858f363fca5e.herokuapp.com")) {
						if(res.data.message) {
							throw new Error("Follow request not sent");
						}
					}
					setPendingFollowRequestSent(true);
				})
				.catch(e => {
					// loggedin user has not sent a follow request to other user
					setPendingFollowRequestSent(false);
				})
			}
		})

		let followRequestEndpoint = `${user.url}/followRequests/${id}/`;
		axios.get(followRequestEndpoint)
		.then(res => {
			setPendingFollowRequestReceived(true);
		})
		.catch(e => {
			const error = e.response.data;
			setPendingFollowRequestReceived(false);
		})
	}, [otherUserInfo])

	const acceptFollowRequest = () => {

		axios.post(`/authors/${user.id}/followers/${id}/`)
			.then(res => {
				setPendingFollowRequestReceived(false);
			})
			.catch(err => {
				console.log(err);
				alert("Something went wrong. Could not accept follow request!")
			})
	}

	const rejectFollowRequest = () => {
		
		axios.delete(`/authors/${user.id}/followRequests/${id}/`)
			.then(res => {
				setPendingFollowRequestReceived(false);
			})
			.catch(err => {
				console.log(err);
				alert("Something went wrong. Could not reject follow request!")
			})
	}

	const sendFollowRequest = () => {

		let sendFollowRequestEndpoint = `${otherUserInfo.url}/followRequests/`;
		let data: any = {actor: user.id}
		let headers: any = {Authorization: `Token ${token}`}

		if(otherUserInfo.url.includes("https://beeg-yoshi-backend-858f363fca5e.herokuapp.com")) {
			// left should be from_user
			// right should be to_user
			sendFollowRequestEndpoint = `https://beeg-yoshi-backend-858f363fca5e.herokuapp.com/service/remote/authors/${user.id}/request/${otherUserInfo.id}/`;
			headers = {Authorization: `Token 98f2ff14e354dc9744b7bf8ad79ec47e5037db5b`}
			data = {server: "A-Team", displayName: user.displayName}

		} else if(otherUserInfo.url.includes("web-weavers-backend-fb4af7963149.herokuapp.com")) {
			sendFollowRequestEndpoint = `${otherUserInfo.url}/inbox/`;
			data = {summary: `${user.displayName} follows ${otherUserInfo.displayName}`, 
					type: `Follow`,
					actor: user.url,
					object: otherUserInfo.url
				}
				headers = {Authorization: `Basic YS10ZWFtOjEyMzQ1`}
		} else if(otherUserInfo.url.includes("super-coding-team-89a5aa34a95f.herokuapp.com")) {
			sendFollowRequestEndpoint = `${otherUserInfo.url}/inbox`;
			data = {summary: `${user.displayName} follows ${otherUserInfo.displayName}`, 
					type: `Follow`,
					actor: {id: user.url, displayName: user.displayName},
					object: {id: otherUserInfo.url, displayName: otherUserInfo.displayName}
				}
			headers = {Authorization: `Basic YS10ZWFtOmEtdGVhbQ==`}
		}

		axios.post(sendFollowRequestEndpoint, data, {headers: headers})
			.then(res => {
				setPendingFollowRequestSent(true);
			})
			.catch(err => {
				if( err.response.status === 409) {
					alert("You have already sent a follow request to this user!")
					setPendingFollowRequestSent(true);
				}else{
					console.log(err);
					alert("Something went wrong. Could not send follow request!")
				}
			})
	}

	const cancelFollowRequest = () => {
		let cancelFollowRequestEndpoint = `${otherUserInfo.url}/followRequests/`;
		let data: any = {actor: user.id}
		let headers: any = {Authorization: `Token ${token}`}
		
		if(otherUserInfo.url.includes("https://beeg-yoshi-backend-858f363fca5e.herokuapp.com")) {
			// left should be from_user
			// right should be to_user
			cancelFollowRequestEndpoint = `https://beeg-yoshi-backend-858f363fca5e.herokuapp.com/service/remote/authors/${user.id}/request/${otherUserInfo.id}/`;
			headers = {Authorization: `Token 98f2ff14e354dc9744b7bf8ad79ec47e5037db5b`}
		} else if(otherUserInfo.url.includes("web-weavers-backend-fb4af7963149.herokuapp.com")) {
			cancelFollowRequestEndpoint = `${otherUserInfo.url}/inbox/`;
			data = {
					actor: user.url,
					object: otherUserInfo.url
				}
			headers = {Authorization: `Basic YS10ZWFtOjEyMzQ1`}
		}
		axios.delete(cancelFollowRequestEndpoint, {headers: headers, data: data})
			.then(res => {
				setPendingFollowRequestSent(false);
			})
			.catch(err => {
				console.log(err);
				alert("Something went wrong. Could not cancel follow request!")
			}
		)
	}

	const stopFollowing = () => {
		let stopFollowingEndpoint = `${otherUserInfo.url}/followers/${user.id}/`;
		let data: any = {actor: user.id}
		let headers: any = {Authorization: `Token ${token}`}
		
		if(otherUserInfo.url.includes("https://beeg-yoshi-backend-858f363fca5e.herokuapp.com")) {
			stopFollowingEndpoint = `https://beeg-yoshi-backend-858f363fca5e.herokuapp.com/service/remote/authors/${user.id}/request/${otherUserInfo.id}/`;
			headers = {Authorization: `Token 98f2ff14e354dc9744b7bf8ad79ec47e5037db5b`}
		} else if(otherUserInfo.url.includes("web-weavers-backend-fb4af7963149.herokuapp.com")) {
			stopFollowingEndpoint = `${otherUserInfo.url}/followers/${user.id}/`;
			headers = {Authorization: `Basic YS10ZWFtOjEyMzQ1`}
		}

		axios.delete(stopFollowingEndpoint, {headers: headers, data: data})
			.then(res => {
				setFollowing(false);
			})
			.catch(err => {
				console.log(err);
				alert("Something went wrong. Could not stop following!")
			})
	}

	return (
		<div className="other-profile">
			{/* Show other user info */}
			<div className="container-fluid">
				<div className="row">
					<div className="col-md-2 ">
						<img src={otherUserInfo?.profilePicture || otherUserInfo?.profileImage || "https://static.vecteezy.com/system/resources/previews/016/267/347/large_2x/profile-account-outline-icon-isolated-flat-design-illustration-free-vector.jpg"} alt="Profile Picture" className="img-fluid rounded-circle" />
					</div>
					<div className="col-md-10 d-flex flex-column justify-content-center">
						<h1>{otherUserInfo.displayName}</h1>
						<h2>{otherUserInfo.github}</h2>
						<h2>ID: {otherUserInfo?.id?.toString()?.split('/').pop()}</h2>
						<div className="d-flex">
							{following?
								<div className="btn btn-danger" style={{marginRight:"1rem"}} onClick={() => stopFollowing()}>Stop Following</div>
								:
								pendingFollowRequestSent ?
									<div className="btn btn-secondary" style={{marginRight:"1rem"}} onClick={() => cancelFollowRequest()}>Cancel Request</div>
									:
									<div className="btn btn-primary" style={{marginRight:"1rem"}} onClick={() => sendFollowRequest()}>Send Follow Request</div>
							}
							{pendingFollowRequestReceived ? 
								<>
									<div className="btn btn-success" onClick={() => acceptFollowRequest()}>Accept Follow Request</div>
									<div className="btn btn-danger" onClick={() => rejectFollowRequest()}>Reject Follow Request</div>
								</>
								: 
								<></>
							}
						</div>
					</div>
				</div>
			</div>

			{Object.keys(otherUserInfo).length > 0 &&
			<div className="row mt-2 mx-3 my-3 border-bottom">
				<div className="col d-flex align-items-center justify-content-center"
					style={{
						backgroundColor: currentTab === 'posts' ? 'gray' : 'white',
						color: currentTab === 'posts' ? 'white' : 'black',
						cursor: "pointer",
					}}
					onClick={() => setCurrentTab("posts")}
				>
					<h5>
						Posts
					</h5>
				</div>
				{(otherUserInfo.url.includes("127.0.0.1") || otherUserInfo.url.includes("socialdistribution.onrender.com")) &&
				<div className="col d-flex align-items-center justify-content-center"
					style={{
						backgroundColor: currentTab === 'social' ? 'gray' : 'white',
						color: currentTab === 'social' ? 'white' : 'black',
						cursor: "pointer",
					}}
					onClick={() => setCurrentTab("social")}
				>
					<h5>
						Social
					</h5>
				</div>
				}
			</div>
			}
			{Object.keys(otherUserInfo).length > 0 && currentTab === 'posts' && <Posts mode={"others"} customUrl={customUrl} otherUser={otherUserInfo}/>}
			{Object.keys(otherUserInfo).length > 0 && (otherUserInfo.url.includes("127.0.0.1") || otherUserInfo.url.includes("socialdistribution.onrender.com")) && currentTab === 'social' && <OtherSocials otherUser={otherUserInfo} />}
		</div>
	)
}