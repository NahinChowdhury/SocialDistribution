import axios from "axios";
import React, {FunctionComponent, useState, useEffect} from "react";
import { AuthorInterface } from "../interfaces";
import { Link, useParams } from "react-router-dom";

export const OtherSocials:FunctionComponent<any> = ({otherUser={}}) => {

	const user = JSON.parse(window.localStorage.getItem("user") || "{}");
	const token = window.localStorage.getItem("token") || "";

	const id = useParams().id;

	const [followerList, setFollowerList] = useState<AuthorInterface[]>([]);
	const defaultFollowerEndpoint = otherUser?.url + `/followers/`;
	const [followerEndpoint, setFollowerEndpoint] = useState<string | null>(otherUser?.url + `/followers/`);
	const [fetchNextFollower, setFetchNextFollower] = useState<boolean>(true);

	const [followingList, setFollowingList] = useState<AuthorInterface[]>([]);
	const defaultFollowingEndpoint = otherUser?.url + `/following/`;
	const [followingEndpoint, setFollowingEndpoint] = useState<string | null>(otherUser?.url + `/following/`);
	const [fetchNextFollowing, setFetchNextFollowing] = useState<boolean>(true);

	const [friendsList, setFriendsList] = useState<AuthorInterface[]>([]);
	const defaultFriendsEndpoint = otherUser?.url + `/friends/`;
	const [friendsEndpoint, setFriendsEndpoint] = useState<string | null>(otherUser?.url + `/friends/`);
	const [fetchNextFriends, setFetchNextFriends] = useState<boolean>(true);

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
				if(followingEndpoint == otherUser.url + `/following/`){
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
			if(followerEndpoint == otherUser.url + `/followers/`){
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

    return ( 
        <div className="other-socials">
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

			
        </div>
        
    )
}