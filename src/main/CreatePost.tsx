import axios from "axios";
import React, {FunctionComponent, useEffect, useState} from "react";
import { AuthorInterface, PostInterface } from "../interfaces";
import Modal from 'react-bootstrap/Modal';

export const CreatePost:FunctionComponent<any> = ({setOpenCreatePost, setFetch}) => {
    
    const [formData, setFormData] = useState<PostInterface>({
		title: "",
		description: "",
		contentType: "text/plain",
		categories: "",
		visibility: "PUBLIC",
		unlisted: false,
		specific_author: null,
		image: "",
		imageObject: null,
	} as PostInterface)

	const [authors, setAuthors] = useState<AuthorInterface[]>([]);
	const token = window.localStorage.getItem("token") || "";
	const user = JSON.parse(window.localStorage.getItem("user") || "{}");

	useEffect(() => {
		axios.get('getAllUsers/', { 
		  	headers: {
				'Authorization': `Token ${token}`
		  }
		})
		.then(response => {
			console.log('Authors fetched:', response.data);
		  	setAuthors(response.data); 
		})
		.catch(error => {
		  	console.error('Error fetching authors:', error);
		});
	  }, [token]);
	
    const submitData = async () => {

		const user = JSON.parse(window.localStorage.getItem("user") || "{}");
		const token = window.localStorage.getItem("token") || "";
		const submissionData = {
			...formData,
			specific_author: formData.specific_author ? formData.specific_author.id : null,
		  };

		console.log(formData);
		if(!formData.title || !formData.description || !formData.visibility) {
			alert("Title, Description, and Visibility are required fields");
			return;
		}
		if (formData.visibility === 'SPECIFIC_AUTHOR' && !formData.specific_author) {
			alert("Please select a specific author");
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


		axios.post(`${user.url}/posts/`,
			{...submissionData, image: imgUrl !== "" ? imgUrl : submissionData.image},
			{headers: {
				Authorization: `Token ${token}`,
			}})
			.then(res => {
				console.log(res.data);
				setOpenCreatePost(false);
				setFetch(true);
			})
			.catch(e => {
				const error = e.response.data;
				alert("Could not create post")
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
    
    return ( 

		<Modal show={true} onHide={() => setOpenCreatePost(false)}>
			<Modal.Header closeButton>
				<Modal.Title>Create Post</Modal.Title>
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
						<option value="SPECIFIC_AUTHOR">Specific Author</option>
	 				</select>
	 			</div>
				 {formData.visibility === 'SPECIFIC_AUTHOR' && (
					<div className="form-group">
						<label htmlFor="specific_author">Specific Author</label>
						<select
						className="form-control"
						id="specific_author"
						value={formData.specific_author?.id || ''}
						onChange={(e) => {
							const author = authors.find((author) => author.id === e.target.value) || null;
							setFormData({ ...formData, specific_author: author });
						}}
						>
						<option value="">Select an author</option>
						{
						authors.map((author) => {
							return author.id !== user.id ? (
							<option key={author.id} value={author.id}>
								{author.displayName}
							</option>
							) : null;
						})
						}

						</select>
					</div>
				)}
	 			<div className="form-group form-check">
	 				<input type="checkbox" className="form-check-input" id="unlisted" name="unlisted" checked={formData.unlisted} onChange={(e) => setFormData({ ...formData, unlisted: e.target.checked })} />
	 				<label className="form-check-label">Unlisted</label>
	 			</div>
			</Modal.Body>
			<Modal.Footer>
				<button className="btn btn-secondary" onClick={() => setOpenCreatePost(false)}>Close</button>
				<button className="btn btn-primary" onClick={submitData}>Submit</button>
			</Modal.Footer>
		</Modal>

        
    )
}