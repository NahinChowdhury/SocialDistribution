import axios from "axios";
import React, {FunctionComponent, useState} from "react";
import { CommentInterface } from "../interfaces";
import Modal from 'react-bootstrap/Modal';

export const EditComment:FunctionComponent<any> = ({comment, setOpenEditComment, setFetch, setCommentToEdit}) => {
    
    const [formData, setFormData] = useState<CommentInterface>({
		comment: comment.comment,
		contentType: comment.contentType,
	} as CommentInterface)
	
    const submitData = () => {
		console.log("Comment")
		console.log(comment)
		const user = JSON.parse(window.localStorage.getItem("user") || "{}");
		const token = window.localStorage.getItem("token") || "";

		if(!formData.comment || !formData.contentType) {
			alert("Comment and contentType are required fields");
			return;
		}

		axios.post(`${comment.id}/`,
				{...formData, author: user.id},
				{headers: {
					Authorization: `Token ${token}`
				}})
			.then(res => {
				console.log("SUCCESS");
				setFetch(true);
				close();
			})
			.catch(e => {
				const error = e.response;
				alert("Could not submit edit comment")
			})
    }
    
	const close = () =>{
		setCommentToEdit(undefined);
		setOpenEditComment(false);
	}
    return ( 

		<Modal show={true} onHide={() => close()}>
			<Modal.Header closeButton>
				<Modal.Title>Edit Comment</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<div className="form-group">
	 				<label>Comment</label>
	 				<textarea className="form-control" id="comment" name="comment" value={formData.comment} onChange={(e) => setFormData({ ...formData, comment: e.target.value })} />
	 			</div>
	 			<div className="form-group">
	 				<label htmlFor="contentType">Content Type</label>
	 				<select className="form-control" id="contentType" name="contentType" value={formData.contentType} onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}>
	 					<option value="text/plain">Text/Plain</option>
	 					<option value="text/markdown">Text/Markdown</option>
	 				</select>
	 			</div>
			</Modal.Body>
			<Modal.Footer>
				<button className="btn btn-secondary" onClick={() => close()}>Close</button>
				<button className="btn btn-primary" onClick={submitData}>Submit</button>
			</Modal.Footer>
		</Modal>

        
    )
}