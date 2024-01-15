import axios from "axios";
import React, {FunctionComponent, useState, useEffect} from "react";
import { AuthorInterface } from "../interfaces";
import { Link } from "react-router-dom";

export const Socials:FunctionComponent = () => {

	const user = JSON.parse(window.localStorage.getItem("user") || "{}");
	const token = window.localStorage.getItem("token") || "";
	
	const [userList, setUserList] = useState<AuthorInterface[]>([]);
	const defaultUserEndpoint = `authors/`;
	const [userEndpoint, setUserEndpoint] = useState<string | null>(`authors/`);
	const [fetchNextUser, setFetchNextUser] = useState<boolean>(true);

	const [beegTeamUserList, setBeegTeamUserList] = useState<AuthorInterface[]>([]);
	const defaultBeegTeamUserEndpoint = `https://beeg-yoshi-backend-858f363fca5e.herokuapp.com/service/authors/`;
	const [beegTeamUserEndpoint, setBeegTeamUserEndpoint] = useState<string | null>(`https://beeg-yoshi-backend-858f363fca5e.herokuapp.com/service/authors/`);
	const [fetchNextBeegTeamUser, setFetchNextBeegTeamUser] = useState<boolean>(true);

	const [webTeamUserList, setWebTeamUserList] = useState<AuthorInterface[]>([]);
	const defaultWebTeamUserEndpoint = `https://web-weavers-backend-fb4af7963149.herokuapp.com/authors/`;
	const [webTeamUserEndpoint, setWebTeamUserEndpoint] = useState<string | null>(`https://web-weavers-backend-fb4af7963149.herokuapp.com/authors/`);
	const [fetchNextWebTeamUser, setFetchNextWebTeamUser] = useState<boolean>(true);	
	
	const [superTeamUserList, setSuperTeamUserList] = useState<AuthorInterface[]>([]);
	const defaultSuperTeamUserEndpoint = `https://super-coding-team-89a5aa34a95f.herokuapp.com/authors/`;
	const [superTeamUserEndpoint, setSuperTeamUserEndpoint] = useState<string | null>(`https://super-coding-team-89a5aa34a95f.herokuapp.com/authors/`);
	const [fetchNextSuperTeamUser, setFetchNextSuperTeamUser] = useState<boolean>(true);

	const [followerList, setFollowerList] = useState<AuthorInterface[]>([]);
	const defaultFollowerEndpoint = user.url + `/followers/`;
	const [followerEndpoint, setFollowerEndpoint] = useState<string | null>(user.url + `/followers/`);
	const [fetchNextFollower, setFetchNextFollower] = useState<boolean>(true);

	const [followingList, setFollowingList] = useState<AuthorInterface[]>([]);
	const defaultFollowingEndpoint = user.url + `/following/`;
	const [followingEndpoint, setFollowingEndpoint] = useState<string | null>(user.url + `/following/`);
	const [fetchNextFollowing, setFetchNextFollowing] = useState<boolean>(true);

	const [followRequestList, setFollowRequestList] = useState<AuthorInterface[]>([]);
	const defaultFollowRequestEndpoint = user.url + `/followRequests/`;
	const [followRequestEndpoint, setFollowRequestEndpoint] = useState<string | null>(user.url + `/followRequests/`);
	const [fetchNextFollowRequest, setFetchNextFollowRequest] = useState<boolean>(true);

	const [friendsList, setFriendsList] = useState<AuthorInterface[]>([]);
	const defaultFriendsEndpoint = user.url + `/friends/`;
	const [friendsEndpoint, setFriendsEndpoint] = useState<string | null>(user.url + `/friends/`);
	const [fetchNextFriends, setFetchNextFriends] = useState<boolean>(true);
	
	useEffect(() => {
		if(followRequestEndpoint === null || fetchNextFollowRequest === false) return;

		// get all follower list
		axios.get(followRequestEndpoint!)
			.then(res => {
				// console.log(res.data?.results?.items.map((follower:any) => follower.follower));
				const newFollowRequestList = res.data?.results?.items;
				const cleanedNewFollowRequestList = newFollowRequestList.map((followRequest:any) => followRequest.actor);
				console.log(cleanedNewFollowRequestList);
				if(followRequestEndpoint == user.url + `/followRequests/`){
					setFollowRequestList(cleanedNewFollowRequestList);
				}
				else{
					setFollowRequestList(prevFollowRequestList => [...prevFollowRequestList, ...cleanedNewFollowRequestList]);
				}
				setFetchNextFollowRequest(false);
				setFollowRequestEndpoint(res.data?.next);
			})
			.catch(err => {
				console.log(err);
				setFollowRequestList(prevFollowRequestList => [...prevFollowRequestList]);
				setFetchNextFollowRequest(false);
			})
	}, [fetchNextFollowRequest])

	useEffect(() => {
		if(friendsEndpoint === null || fetchNextFriends === false) return;

		// get all follower list
		axios.get(friendsEndpoint!)
			.then(res => {
				// console.log(res.data?.results?.items.map((follower:any) => follower.follower));
				const newFriendsList = res.data?.results?.items;
				const cleanedNewFriendsList = newFriendsList.map((friend:any) => friend.followed);
				console.log(cleanedNewFriendsList);
				if(friendsEndpoint == user.url + `/friends/`){
					setFriendsList(cleanedNewFriendsList);
				}
				else{
					setFriendsList(prevFriendsList => [...prevFriendsList, ...cleanedNewFriendsList]);
				}
				setFetchNextFriends(false);
				setFriendsEndpoint(res.data?.next);
			})
			.catch(err => {
				console.log(err);
				setFriendsList(prevFriendsList => [...prevFriendsList]);
				setFetchNextFriends(false);
			})
	}, [fetchNextFriends])

	useEffect(() => {
		if(followingEndpoint === null || fetchNextFollowing === false) return;

		// get all follower list
		axios.get(followingEndpoint!)
			.then(res => {
				// console.log(res.data?.results?.items.map((follower:any) => follower.follower));
				const newFollowingList = res.data?.results?.items;
				const cleanedNewFollowingList = newFollowingList.map((following:any) => following.followed);
				console.log(cleanedNewFollowingList);
				if(followingEndpoint == user.url + `/following/`){
					setFollowingList(cleanedNewFollowingList);
				}
				else{
					setFollowingList(prevFollowingList => [...prevFollowingList, ...cleanedNewFollowingList]);
				}
				setFetchNextFollowing(false);
				setFollowingEndpoint(res.data?.next);
			})
			.catch(err => {
				console.log(err);
				setFollowingList(prevFollowingList => [...prevFollowingList]);
				setFetchNextFollowing(false);
			})

	}, [fetchNextFollowing])

	useEffect(() => {
		if(followerEndpoint === null || fetchNextFollower === false) return;

		// get all follower list
		axios.get(followerEndpoint!)
		.then(res => {
			// console.log(res.data?.results?.items.map((follower:any) => follower.follower));
			const newFollowerList = res.data?.results?.items;
			const cleanedNewFollowerList = newFollowerList.map((follower:any) => follower.follower);
			console.log(cleanedNewFollowerList);
			if(followerEndpoint == user.url + `/followers/`){
				setFollowerList(cleanedNewFollowerList);
			} else{
				setFollowerList(prevFollowerList => [...prevFollowerList, ...cleanedNewFollowerList]);
			}
			setFetchNextFollower(false);
			setFollowerEndpoint(res.data?.next);
		})
		.catch(err => {
			console.log(err);
			setFollowerList(prevFollowerList => [...prevFollowerList]);
			setFetchNextFollower(false);
		})
	}, [fetchNextFollower])

	useEffect(() => {
		if(userEndpoint === null || fetchNextUser === false) return;

		axios.get(userEndpoint!,
			{
				headers: {
					Authorization: `Token ${token}`
				}
			})
			.then(res => {
				console.log(res.data?.results);
				const newUserList: AuthorInterface[] = res.data?.results?.items;
				if(userEndpoint === "authors/") {
					setUserList(newUserList);
				}else{
					setUserList(prevUserList => [...prevUserList, ...newUserList]);
				}
				setFetchNextUser(false);
				setUserEndpoint(res.data?.next);
			})
			.catch(err => {
				console.log(err);
				setUserList(prevUserList => [...prevUserList]);
				setFetchNextUser(false);
			})
	}
	, [fetchNextUser])

	useEffect(() => {
		if(beegTeamUserEndpoint === null || fetchNextBeegTeamUser === false) return;

		axios.get(beegTeamUserEndpoint!,
			{
				headers: {
					Authorization: `Token 98f2ff14e354dc9744b7bf8ad79ec47e5037db5b`
				}
			})
			.then(res => {
				console.log("beeg");
				console.log(res.data);
				const newUserList: AuthorInterface[] = res.data;
				if(beegTeamUserEndpoint === defaultBeegTeamUserEndpoint) {
					setBeegTeamUserList(newUserList);
				}else{
					setBeegTeamUserList(prevUserList => [...prevUserList, ...newUserList]);
				}
				setFetchNextBeegTeamUser(false);
				setBeegTeamUserEndpoint(null);
			})
			.catch(err => {
				console.log(err);
				setBeegTeamUserList(prevUserList => [...prevUserList]);
				setFetchNextBeegTeamUser(false);
			})
	}, [fetchNextBeegTeamUser])

	useEffect(() => {
		if(webTeamUserEndpoint === null || fetchNextWebTeamUser === false) return;

		axios.get(webTeamUserEndpoint!,
			{headers: {Authorization: `Basic YS10ZWFtOjEyMzQ1`}}
			)
			.then(res => {
				console.log("web");
				console.log(res.data);
				const newUserList: AuthorInterface[] = res.data?.items;
				if(webTeamUserEndpoint === defaultWebTeamUserEndpoint) {
					setWebTeamUserList(newUserList);
				}else{
					setWebTeamUserList(prevUserList => [...prevUserList, ...newUserList]);
				}
				setFetchNextWebTeamUser(false);
				setWebTeamUserEndpoint(null);
			})
			.catch(err => {
				console.log(err);
				setWebTeamUserList(prevUserList => [...prevUserList]);
				setFetchNextWebTeamUser(false);
			})
	}, [fetchNextWebTeamUser])

	useEffect(() => {
		if(superTeamUserEndpoint === null || fetchNextSuperTeamUser === false) return;

		axios.get(superTeamUserEndpoint!,
			{headers: {Authorization: `Basic YS10ZWFtOmEtdGVhbQ==`}}
			)
			.then(res => {
				console.log("Super");
				console.log(res.data);
				const newUserList: AuthorInterface[] = res.data?.items;
				if(superTeamUserEndpoint === defaultSuperTeamUserEndpoint) {
					setSuperTeamUserList(newUserList);
				}else{
					setSuperTeamUserList(prevUserList => [...prevUserList, ...newUserList]);
				}
				setFetchNextSuperTeamUser(false);
				setSuperTeamUserEndpoint(null);
			})
			.catch(err => {
				console.log(err);
				setSuperTeamUserList(prevUserList => [...prevUserList]);
				setFetchNextSuperTeamUser(false);
			})
	}, [fetchNextSuperTeamUser])

	const acceptFollowRequest = (followerUrl:string = "") => {
		
		const followerId = followerUrl.split("/").pop();
		
		axios.post(`${user.url}/followers/${followerId}/`)
			.then(res => {
				console.log(res.data);

				const follower = followRequestList.find(followRequest => followRequest.id === followerId);
				setFollowRequestList(prevFollowRequestList => prevFollowRequestList.filter(followRequest => followRequest.id !== followerId));
				setFollowerList(prevFollowerList => [...prevFollowerList, follower!]);

				setFriendsEndpoint(user.url + `/friends/`);
				setFetchNextFriends(true);

			})
			.catch(err => {
				alert("Unable to accept follow request")
			})
	}

	const rejectFollowRequest = (followerUrl:string = "") => {
		
		const followerId = followerUrl.split("/").pop();

		// right is sending request
		// left is receiving request
		axios.delete(`${user.url}/followRequests/${followerId}/`)
			.then(res => {
				console.log(res.data);
				setFollowRequestList(prevFollowRequestList => prevFollowRequestList.filter(followRequest => followRequest.id !== followerId));
			})
			.catch(err => {
				alert("Unable to reject follow request")
			})
	}

	const sendFollowRequest = (otherUserUrl:string = "") => {

		axios.post(`${otherUserUrl}/followRequests/`, {actor: user.id})
			.then(res => {
				console.log(res.data);

				setUserList(prevUserList => {
					const newUserList = prevUserList.map(user => {
						if(user.url === otherUserUrl){
							user.following = 'Pending';
						}
						return user;
					})
					return newUserList;
				})
			})
			.catch(err => {
				alert("Unable to send follow request")
			})
	}

	const stopFollowing = (otherUserUrl:string = "") => {

		axios.delete(`${otherUserUrl}/followers/${user.id}/`)
			.then(res => {
				console.log(res.data);
				console.log(otherUserUrl)
				setFollowingList(prevFollowingList => prevFollowingList.filter(following => following.id !== otherUserUrl))

				setUserList(prevUserList => {
					const newUserList = prevUserList.map(user => {
						if(user.url === otherUserUrl){
							user.following = "Not Following";
						}
						return user;
					})
					return newUserList;
				})
			})
			.catch(err => {
				alert("Unable to stop following")
			})
	}

	const cancelFollowRequest = (otherUserUrl:string = "") => {

		axios.delete(`${otherUserUrl}/followRequests/`, {data: {actor: user.id}})
			.then(res => {
				console.log(res.data);

				setUserList(prevUserList => {
					const newUserList = prevUserList.map(user => {
						if(user.url === otherUserUrl){
							user.following = 'Not Following';
						}
						return user;
					})
					return newUserList;
				})
			})
			.catch(err => {
				alert("Unable to cancel follow request")
			})
	}



    return ( 
        <div className="socials">
			<h1>All Pending Follow Requests</h1>
			<div className="row mt-2 px-3 py-3">
				{followRequestList.map(followRequest => {
					return (
						<div className="card mx-1 my-1" style={{width: "18rem"}}>
							<img src={followRequest?.profilePicture || followRequest?.profileImage || "https://static.vecteezy.com/system/resources/previews/016/267/347/large_2x/profile-account-outline-icon-isolated-flat-design-illustration-free-vector.jpg"} className="card-img-top" alt="..."/>
							<div className="card-body">
								<h5 className="card-title">{followRequest.displayName}</h5>
								<p className="card-text">{followRequest.github}</p>
								<p className="card-text">ID: {followRequest.id}</p>
								<div className="btn btn-success" onClick={() => acceptFollowRequest(followRequest.id)}>Accept follow request</div>
								<div className="btn btn-danger" onClick={() => rejectFollowRequest(followRequest.id)}>Reject follow request</div>
								<div className="btn btn-primary mt-1" onClick={() => {window.location.href = `/${followRequest.id}` }}>View Profile</div> 
							</div>
						</div>
					)
				})}
			</div>
			<div className="text-center">
                {followRequestEndpoint === null ? <p className="text-danger">End of follow requests!</p> : <button className="btn btn-success" onClick={() => setFetchNextFollowRequest(true)}>Load More follow requests</button>}
            </div>

			<h1>Local Friends</h1>
			<div className="row mt-2 px-3 py-3">
				{friendsList.map(friend => {
					return (
						<div className="card mx-1 my-1" style={{width: "18rem"}}>
							<img src={friend?.profilePicture || friend?.profileImage || "https://static.vecteezy.com/system/resources/previews/016/267/347/large_2x/profile-account-outline-icon-isolated-flat-design-illustration-free-vector.jpg"} className="card-img-top" alt="..."/>
							<div className="card-body">
								<h5 className="card-title">{friend.displayName}</h5>
								<p className="card-text">{friend.github}</p>
								<p className="card-text">ID: {friend.id}</p>
								<button className="btn btn-primary" onClick={() => {window.location.href = `/${friend.id}` }}>View Profile</button> 
							</div>
						</div>
					)
				})}
			</div>
			<div className="text-center">
                {friendsEndpoint === null ? <p className="text-danger">End of friends!</p> : <button className="btn btn-success" onClick={() => setFetchNextFriends(true)}>Load More follow requests</button>}
            </div>

			<h1>Local Following</h1>
			<div className="row mt-2 px-3 py-3">
				{followingList.map(following => {
					return (
						<div className="card mx-1 my-1" style={{width: "18rem"}}>
							<img 
							src={following?.profilePicture || following?.profileImage || "https://static.vecteezy.com/system/resources/previews/016/267/347/large_2x/profile-account-outline-icon-isolated-flat-design-illustration-free-vector.jpg"} 
							className="card-img-top" alt="..."/>
							<div className="card-body">
								<h5 className="card-title">{following.displayName}</h5>
								<p className="card-text">{following.github}</p>
								<p className="card-text">ID: {following.id}</p>
								<button className="btn btn-danger" onClick={() => stopFollowing(following.url)}>Stop Following</button>
								<button className="btn btn-primary mt-1" onClick={() => {window.location.href = `/${following.id}` }}>View Profile</button> 
							</div>
						</div>
					)
				})}
			</div>
			<div className="text-center">
                {followingEndpoint === null ? <p className="text-danger">End of following!</p> : <button className="btn btn-success" onClick={() => setFetchNextFollowing(true)}>Load More followings</button>}
            </div>

			<h1>All Followers</h1>
			<div className="row mt-2 px-3 py-3">
				{followerList.map(follower => {
					return (
						<div className="card mx-1 my-1" style={{width: "18rem"}}>
							<img 
							src={follower?.profilePicture || follower?.profileImage || "https://static.vecteezy.com/system/resources/previews/016/267/347/large_2x/profile-account-outline-icon-isolated-flat-design-illustration-free-vector.jpg"} 
							className="card-img-top" alt="..."/>
							<div className="card-body">
								<h5 className="card-title">{follower.displayName}</h5>
								<p className="card-text">{follower.github}</p>
								<p className="card-text">ID: {follower.id}</p>
								<button className="btn btn-primary" onClick={() => {window.location.href = `/${follower.id}` }}>View Profile</button> 
							</div>
						</div>
					)
				})}
			</div>
			<div className="text-center">
                {followerEndpoint === null ? <p className="text-danger">End of followers!</p> : <button className="btn btn-success" onClick={() => setFetchNextFollower(true)}>Load More followers</button>}
            </div>

			<h1>All Local users</h1>
			<div className="row mt-2 px-3 py-3">
				{userList.map(user => {
					return (
						<div className="card mx-1 my-1" style={{width: "18rem"}}>
							<img src={user?.profilePicture || user?.profileImage || "https://static.vecteezy.com/system/resources/previews/016/267/347/large_2x/profile-account-outline-icon-isolated-flat-design-illustration-free-vector.jpg"} className="card-img-top" alt="..."/>
							<div className="card-body">
								<h5 className="card-title">{user.displayName}</h5>
								<p className="card-text">{user.github}</p>
								<p className="card-text">ID: {user.id}</p>
								{user.followed && <p className="card-text">Follows you</p>}
								{user.following === "Following" ? 
									<button className="btn btn-danger" onClick={() => {stopFollowing(user.url)}}>Stop following</button> 
									: 
									user.following === "Not Following" ? 
										<button className="btn btn-primary" onClick={() => sendFollowRequest(user.url)}>Send follow request</button> 
										: 
										<button className="btn btn-secondary" onClick={() => cancelFollowRequest(user.url)}>Cancel Follow Request</button>
								}
								<button className="btn btn-primary mt-1" onClick={() => {window.location.href = `/${user.id}` }}>View Profile</button> 
							</div>
						</div>
					)
				})}
			</div>
			<div className="text-center">
                {userEndpoint === null ? <p className="text-danger">End of local users!</p> : <button className="btn btn-success" onClick={() => setFetchNextUser(true)}>Load More users</button>}
            </div>

			<h1>All Beeg-Yoshi server users</h1>
			<div className="row mt-2 px-3 py-3">
				{beegTeamUserList.map(user => {
					return (
						<div className="card mx-1 my-1" style={{width: "18rem"}}>
							<img src={user?.profilePicture || user?.profileImage || "https://static.vecteezy.com/system/resources/previews/016/267/347/large_2x/profile-account-outline-icon-isolated-flat-design-illustration-free-vector.jpg"} className="card-img-top" alt="..."/>
							<div className="card-body">
								<h5 className="card-title">{user.displayName}</h5>
								<p className="card-text">{user.github}</p>
								<p className="card-text">ID: {user.id}</p>
								<button className="btn btn-primary mt-1" onClick={() => {window.location.href = `/${user.id}` }}>View Profile</button> 
							</div>
						</div>
					)
				})}
			</div>
			<div className="text-center">
                {beegTeamUserEndpoint === null ? <p className="text-danger">End of Beeg-Yoshi server users!</p> : <button className="btn btn-success" onClick={() => setFetchNextBeegTeamUser(true)}>Load More users</button>}
            </div>

			<h1>All Web-Weavers server users</h1>
			<div className="row mt-2 px-3 py-3">
				{webTeamUserList.map(user => {
					return (
						<div className="card mx-1 my-1" style={{width: "18rem"}}>
							<img src={user?.profilePicture || user?.profileImage || "https://static.vecteezy.com/system/resources/previews/016/267/347/large_2x/profile-account-outline-icon-isolated-flat-design-illustration-free-vector.jpg"} className="card-img-top" alt="..."/>
							<div className="card-body">
								<h5 className="card-title">{user.displayName}</h5>
								<p className="card-text">{user.github}</p>
								<p className="card-text">ID: {user?.id?.split('/')[user?.id?.split('/').length - 1]}</p>
								<button className="btn btn-primary mt-1" onClick={() => {window.location.href = `/${user.id.split('/')[user?.id?.split('/').length - 1]}` }}>View Profile</button> 
							</div>
						</div>
					)
				})}
			</div>
			<div className="text-center">
                {webTeamUserEndpoint === null ? <p className="text-danger">End of Web-Weavers server users!</p> : <button className="btn btn-success" onClick={() => setFetchNextWebTeamUser(true)}>Load More users</button>}
            </div>

			<h1>All Super-Coding server users</h1>
			<div className="row mt-2 px-3 py-3">
				{superTeamUserList.map(user => {
					return (
						<div className="card mx-1 my-1" style={{width: "18rem"}}>
							<img src={user?.profilePicture || user?.profileImage || "https://static.vecteezy.com/system/resources/previews/016/267/347/large_2x/profile-account-outline-icon-isolated-flat-design-illustration-free-vector.jpg"} className="card-img-top" alt="..."/>
							<div className="card-body">
								<h5 className="card-title">{user.displayName}</h5>
								<p className="card-text">{user.github}</p>
								<p className="card-text">ID: {user?.id?.split('/')[user?.id?.split('/').length - 1]}</p>
								<button className="btn btn-primary mt-1" onClick={() => {window.location.href = `/${user.id.split('/')[user?.id?.split('/').length - 1]}` }}>View Profile</button> 
							</div>
						</div>
					)
				})}
			</div>
			<div className="text-center">
                {superTeamUserEndpoint === null ? <p className="text-danger">End of Super-Coding server users!</p> : <button className="btn btn-success" onClick={() => setFetchNextSuperTeamUser(true)}>Load More users</button>}
            </div>
			
        </div>
        
    )
}