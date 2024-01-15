import axios from "axios";
import React, {FunctionComponent, useEffect, useState} from "react";
import { Link, useParams } from "react-router-dom";
import { AuthorInterface, PostInterface } from "../interfaces";
import { CreatePost } from "./CreatePost";
import { CommentSection } from "./CommentSection";
import ReactMarkdown from "react-markdown";
import { EditPost } from "./EditPost";


export const GithubActivity:FunctionComponent<any> = () => {

	const user = JSON.parse(window.localStorage.getItem("user") || "{}");
	const token = window.localStorage.getItem("token") || "";

	const [githubActivity, setGithubActivity] = useState<any>(null);

	useEffect(() => {
		if(Object.keys(user).length === 0) {
			alert("This user does not have a github account linked to their profile")
			return
		}

		axios.get(`https://api.github.com/users/${user.github.split('/').pop()}/events`)
			.then(res => {
				console.log(res.data);
				setGithubActivity(res.data);
			})
			.catch(e => {
				alert("Could not find user's github activity");
			})
	}, [])

	return (
		<>
			{
				githubActivity && 
				githubActivity.map((activity: any) => {
					if(activity.type === "PushEvent"){
						return (
							<div key={activity.id}>
								<div className="card my-3 mx-5">
									<div className="card-body">
										<span className="d-flex align-items-center">
											<Link to={`/${user.id}`} style={{marginRight: '0.5rem'}}><img src={activity.actor.avatar_url} alt="Author Github Profile" className="rounded-circle mr-2" width="50" height="50" /></Link>
											<h2>{activity.actor.display_login} pushed a commit to the <Link to={`https://github.com/${activity.repo.name}`}>{activity.repo.name}</Link> repository</h2>
										</span>
									</div>
								</div>
							</div>
						)
					} else if(activity.type === "PullRequestEvent"){
						return (
							<div key={activity.id}>
								<div className="card my-3 mx-5">
									<div className="card-body">
										<span className="d-flex align-items-center">
											<Link to={`/${user.id}`} style={{marginRight: '0.5rem'}}><img src={activity.actor.avatar_url} alt="Author Github Profile" className="rounded-circle mr-2" width="50" height="50" /></Link>
											<h2>{activity.actor.display_login} {activity.payload.action} a pull request at the <Link to={`https://github.com/${activity.repo.name}`}>{activity.repo.name}</Link> repository</h2>
										</span>
									</div>
								</div>
							</div>
						)
					} else if(activity.type === "CreateEvent"){
						return (
							<div key={activity.id}>
								<div className="card my-3 mx-5">
									<div className="card-body">
										<span className="d-flex align-items-center">
											<Link to={`/${user.id}`} style={{marginRight: '0.5rem'}}><img src={activity.actor.avatar_url} alt="Author Github Profile" className="rounded-circle mr-2" width="50" height="50" /></Link>
											<h2>{activity.actor.display_login} created a new branch named {`"${activity.payload.ref || activity.payload.master_branch}"`} at the <Link to={`https://github.com/${activity.repo.name}`}>{activity.repo.name}</Link> repository</h2>
										</span>
									</div>
								</div>
							</div>
						)
					} else if(activity.type === "ForkEvent"){
						return (
							<div key={activity.id}>
								<div className="card my-3 mx-5">
									<div className="card-body">
										<span className="d-flex align-items-center">
											<Link to={`/${user.id}`} style={{marginRight: '0.5rem'}}><img src={activity.actor.avatar_url} alt="Author Github Profile" className="rounded-circle mr-2" width="50" height="50" /></Link>
											<h2>{activity.actor.display_login} forked the <Link to={`https://github.com/${activity.repo.name}`}>{activity.repo.name}</Link> repository and created the <Link to={`https://github.com/${activity.payload.forkee.full_name}`}>{activity.payload.forkee.full_name}</Link> repository</h2>
										</span>
									</div>
								</div>
							</div>
						)
					} else {
						return (<></>)
					}
				}
			)}
		</>
	);
}