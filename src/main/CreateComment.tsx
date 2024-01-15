import axios from "axios";
import React, {FunctionComponent, useState} from "react";
import { CommentInterface } from "../interfaces";

export const CreateComment:FunctionComponent<any> = ({post, setFetchComments}) => {
    
    const [formData, setFormData] = useState<CommentInterface>({
		comment: "",
		contentType: "text/plain",
	} as CommentInterface);

    const submitData = () => {
		const user = JSON.parse(window.localStorage.getItem("user") || "{}");
		formData.author = user.id;

		if(!formData.comment || !formData.contentType){
			alert("Please fill out comment and contentType");
			return
		}
		
		let data: any = formData;
		let createCommentEndpoint = `${post.comments}/`;
		let headers: any = {};
		if(post.source.includes("beeg-yoshi-backend-858f363fca5e.herokuapp.com")){
			createCommentEndpoint = `https://beeg-yoshi-backend-858f363fca5e.herokuapp.com/service/remote/posts/${String(post.id)}/comments`;
			data = {
				author: user.id,
				displayName: user.displayName,
				comment: formData.comment,
				server: "A-Team"
			}
			headers = {Authorization: "Token 98f2ff14e354dc9744b7bf8ad79ec47e5037db5b"}
		} else if(post.id.includes("web-weavers-backend-fb4af7963149.herokuapp.com")){
			createCommentEndpoint = `${post.id}/comments/`;
			data = {
				author: user.url,
				comment: formData.comment,
				contentType: formData.contentType,
			}
			headers = {Authorization: "Basic YS10ZWFtOjEyMzQ1"}
		} else if(post.id.includes("super-coding-team-89a5aa34a95f.herokuapp.com")) {
			createCommentEndpoint = `${post?.author?.id}/inbox`;
			data = {
				type: "comment",
				id: post.id,
				author: {id: user.url},
				comment: formData.comment,
				contentType: formData.contentType,
			}
            headers = {Authorization: `Basic YS10ZWFtOmEtdGVhbQ==`}
		}
		axios.post(`${createCommentEndpoint}`, data, {headers: headers})
			.then(res => {
				if(post.id.includes("web-weavers-backend-fb4af7963149.herokuapp.com")){
					const commentId = res.data.id; 
					axios.post(`${post.author.id}/inbox/`, {
							id: commentId,
							type: "comment",
						},
						{headers: headers}
					).then(res => {
						console.log(res.data);
					}).catch(e => {
						console.log(e);
					})
				}
				console.log(res.data);
				setFormData({
					comment: "",
					contentType: "text/plain",
				} as CommentInterface)
				setFetchComments(true);
			})
			.catch(e => {
				const error = e.response.data;
				console.log(e);
				console.log(error)
				alert("Could not create comment")
			})
    }
    
    return ( 
        <div className="row my-3">
			<div className="col-md-7">
				<div className="form-group">
				<textarea
					className="form-control"
					id="comment"
					name="comment"
					value={formData.comment}
					onChange={(e) =>
					setFormData((prevFormData) => ({
						...prevFormData,
						comment: e.target.value,
					}))
					}
				/>
				</div>
			</div>
			<div className="col-md-3">
				<div className="form-group">
					<select
						className="form-control"
						id="contentType"
						name="contentType"
						value={formData.contentType}
						onChange={(e) =>
						setFormData((prevFormData) => ({
							...prevFormData,
							contentType: e.target.value,
						}))
						}
					>
						<option value="text/plain">Text/Plain</option>
						<option value="text/markdown">Text/Markdown</option>
					</select>
				</div>
			</div>
			<div className="col-md-2 my-auto">
				<button type="submit" className="btn btn-primary btn-block" onClick={submitData}>
					Submit
				</button>
			</div>
		</div>
        
    )
}