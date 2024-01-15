import axios from "axios";
import React, {FunctionComponent, useEffect, useState} from "react";
import { Link, useNavigate } from "react-router-dom";
import { Posts } from "./Posts";
import { Socials } from "./Socials";
import { EditProfile } from "./EditProfile";
import { AuthorInterface } from "../interfaces";
import { GithubActivity } from "./GithubActivity";


export const Profile:FunctionComponent = () => {

	const [currentTab, setCurrentTab] = useState<"posts" | "socials" | "github">("posts");
	const [user, setUser] = useState<AuthorInterface>(JSON.parse(window.localStorage.getItem("user") || "{}") as AuthorInterface);
	const [openEditProfile, setOpenEditProfile] = useState<boolean>(false);
	const [fetch, setFetch] = useState<boolean>(false);

	const navigate = useNavigate();

	useEffect(() => {
		const hash = window.location.hash;
		if (hash === '#socials') {
			setCurrentTab('socials');
		} else if (hash === '#post') {
			setCurrentTab('posts');
		}
	}, []);

	useEffect(() => {
		if(Object.keys(user).length === 0) {
			window.location.href = "/login";
		}
	}, [user])

	useEffect(() => {
		if(fetch === false) return;

		axios.get(`${user.url}/`)
			.then(res => {
				window.localStorage.setItem("user", JSON.stringify(res.data));
				setUser(res.data);
				setFetch(false);
			})
			.catch(e => {
				alert(e.response.data.detail);
			})
	}, [fetch])

	return ( 
		<div className="profile">
			{/* Show user info */}
			<div className="container-fluid">
				<div className="row">
					<div className="col-md-2 ">
						<img src={user?.profilePicture || user?.profileImage || "https://static.vecteezy.com/system/resources/previews/016/267/347/large_2x/profile-account-outline-icon-isolated-flat-design-illustration-free-vector.jpg"} alt="Profile Picture" className="img-fluid rounded-circle" />
					</div>
					<div className="col-md-10 d-flex flex-column justify-content-center">
						<h1>{user.displayName}</h1>
						<h2>{user.github}</h2>
						<h2>ID: {user.id}</h2>
						<button className="btn btn-primary mt-3" onClick={ () => setOpenEditProfile(!openEditProfile)}>Edit Profile</button>
					</div>
				</div>
			</div>
			{openEditProfile && <EditProfile user={user} setOpenEditProfile={setOpenEditProfile} setFetch={setFetch}/>}

			<div className="row mt-2 mx-3 my-3 border-bottom">
				<div className="col d-flex align-items-center justify-content-center"
					style={{
						backgroundColor: currentTab === 'posts' ? 'gray' : 'white',
						color: currentTab === 'posts' ? 'white' : 'black',
						cursor: "pointer",
						borderRight: "1px solid gray",
					}}
					onClick={() => {setCurrentTab("posts"); navigate('#post')}}
				>
					<h5>
						Posts
					</h5>
				</div>
				<div className="col d-flex align-items-center justify-content-center"
					style={{
						backgroundColor: currentTab === 'socials' ? 'gray' : 'white',
						color: currentTab === 'socials' ? 'white' : 'black',
						cursor: "pointer",
						borderLeft: "1px solid gray",
						borderRight: "1px solid gray",
					}}
					onClick={() => {setCurrentTab("socials"); navigate('#socials')}}
				>
					<h5>
						Socials
					</h5>
				</div>
				<div className="col d-flex align-items-center justify-content-center"
					style={{
						backgroundColor: currentTab === 'github' ? 'gray' : 'white',
						color: currentTab === 'github' ? 'white' : 'black',
						cursor: "pointer",
						borderLeft: "1px solid gray",
					}}
					onClick={() => {setCurrentTab("github"); navigate('#github')}}
				>
					<h5>
						Github Activity
					</h5>
				</div>
			</div>

			{currentTab === 'posts' && <div id="post"><Posts mode={"profile"}/></div>}
			{currentTab === 'socials' && <div id="social"><Socials /></div>}
			{currentTab === 'github' && <div id="github"><GithubActivity /></div>}
		</div>
	)
}