import axios from "axios";
import React, {FunctionComponent, useState} from "react";
import { PostInterface } from "../interfaces";
import Modal from 'react-bootstrap/Modal';

export const EditPost:FunctionComponent<any> = ({post, setOpenEditPost, setFetch, setPostToEdit}) => {
    
    const [formData, setFormData] = useState<PostInterface>({
		title: post.title,
		description: post.description,
		contentType: post.contentType,
		categories: post.categories,
		visibility: post.visibility,
		unlisted: post.unlisted,
		content: post.content,
		image: post.image,
		imageObject: null,
	} as PostInterface)
	
    const submitData = async () => {
		const token = window.localStorage.getItem("token") || "";

		if(!formData.title || !formData.description || !formData.visibility) {
			alert("Title, Description, and Visibility are required fields");
			return;
		}

		let imgUrl: string = "";
		if(formData?.imageObject instanceof File){
			imgUrl = await uploadToImgur(formData.imageObject)
			if (imgUrl === "") {
				alert("Error uploading image. Please close the modal and try again.");
				return;
			}
		}

		axios.post(`${post.id}/`,
			{...formData, image: imgUrl !== "" ? imgUrl : formData.image},
			{headers: {
				Authorization: `Token ${token}`
			}})
			.then(res => {
				console.log(res.data);
				setOpenEditPost(false);
				setFetch(true);
			})
			.catch(e => {
				const error = e.response.data;
				alert("Could not submit edit post")
			})
    }

	const uploadToImgur = async (file: File): Promise<string>  => {
		const uploadFormData = new FormData();
		
		uploadFormData.append("file", file);
		uploadFormData.append("upload_preset", "cmput404");

		return await axios.post(
			"https://api.cloudinary.com/v1_1/dnk9xwniz/image/upload",
			uploadFormData
		).then(res => {
			return res.data.secure_url
		}).catch(e => {
			console.log("Error uploading profile picture")
			return ""
		})
		
	}
    
	const close = () =>{
		setPostToEdit(undefined);
		setOpenEditPost(false);
	}
    return ( 

		<Modal show={true} onHide={() => close()}>
			<Modal.Header closeButton>
				<Modal.Title>Edit Post</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<div className="form-group">
					<label>Title</label>
					<input type="text" className="form-control" id="title" name="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
	 			</div>
	 			<div className="form-group">
	 				<label>Description</label>
	 				<input type="text" className="form-control" id="description" name="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
	 			</div>
				<div className="form-group">
	 				<label>Content</label>
	 				<textarea className="form-control" id="content" name="content" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} />
	 			</div>
	 			<div className="form-group">
	 				<label htmlFor="contentType">Content Type</label>
	 				<select className="form-control" id="contentType" name="contentType" value={formData.contentType} onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}>
	 					<option value="text/plain">Text/Plain</option>
	 					<option value="text/markdown">Text/Markdown</option>
	 				</select>
	 			</div>
				 <div className="form-group">
					<label>Image</label>
	 				<input type="file" className="form-control" id="image" name="image" onChange={(e) => setFormData({ ...formData, imageObject: e.target.files ? e.target.files[0] : null })} />
				</div>
	 			<div className="form-group">
	 				<label>Categories</label>
	 				<input type="text" className="form-control" id="categories" name="categories" value={formData.categories} onChange={(e) => setFormData({ ...formData, categories: e.target.value })} />
	 			</div>
	 			<div className="form-group">
	 				<label htmlFor="visibility">Visibility</label>
	 				<select className="form-control" id="visibility" name="visibility" value={formData.visibility} onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}>
	 					<option value="PUBLIC">Public</option>
	 					<option value="PRIVATE">Private</option>
	 					<option value="FRIENDS">Friends</option>
	 				</select>
	 			</div>
	 			<div className="form-group form-check">
	 				<input type="checkbox" className="form-check-input" id="unlisted" name="unlisted" checked={formData.unlisted} onChange={(e) => setFormData({ ...formData, unlisted: e.target.checked })} />
	 				<label className="form-check-label">Unlisted</label>
	 			</div>
			</Modal.Body>
			<Modal.Footer>
				<button className="btn btn-secondary" onClick={() => close()}>Close</button>
				<button className="btn btn-primary" onClick={submitData}>Submit</button>
			</Modal.Footer>
		</Modal>

        
    )
}