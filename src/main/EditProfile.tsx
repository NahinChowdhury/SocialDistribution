import axios from "axios";
import React, {FunctionComponent, useEffect, useState} from "react";
import { UserProfileInterface } from "../interfaces";
import Modal from 'react-bootstrap/Modal';

export const EditProfile:FunctionComponent<any> = ({user, setOpenEditProfile, setFetch}) => {
    
	const token = window.localStorage.getItem("token") || "";
    const [formData, setFormData] = useState<UserProfileInterface>({
		id: user?.id,
		displayName: user?.displayName,
		github: user?.github,
		profilePictureURL: user?.profilePicture,
	} as UserProfileInterface)
	
    const submitData = async () => {

		if(!formData.github.startsWith("https://github.com/")){
			alert("Github must start with https://github.com/");
			return;
		}
		
		if(formData.displayName.trim() === ""){
			alert("Display Name cannot be empty or just spaces");
			return;
		}
		
		let pfpUrl = "";
		if(formData.profilePicture instanceof File){
			pfpUrl = await uploadToImgur(formData.profilePicture)
			if (pfpUrl === "") {
				alert("Error uploading profile picture. Please close the modal and try again.");
				return;
			}
		}	

		if(token === ""){
			alert("You must be logged in to edit your profile. Redirecting to login page...");
			
			window.localStorage.removeItem("token");
			window.localStorage.removeItem("user");
			window.location.href = "/login";
			return;
		}

		axios.put(`${user.url}/`,
				{id: formData.id, displayName: formData.displayName, github: formData.github, profilePicture: pfpUrl ? pfpUrl : formData.profilePictureURL},
				{headers: {
					Authorization: `Token ${token}`
				}})
			.then(res => {
				setOpenEditProfile(false);
				setFetch(true);
			})
			.catch(e => {
				console.log(e)
				alert(e.response.data.detail);
			})
    }
    
	const uploadToImgur = async (file: File)  => {
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

		<Modal show={true} onHide={() => setOpenEditProfile(false)}>
			<Modal.Header closeButton>
				<Modal.Title>Edit Profile</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<div className="form-group">
	 					<label>ID</label>
	 					<input type="text" className="form-control" id="id" name="id" value={formData.id} disabled />
	 			</div>
	 			<div className="form-group">
	 				<label>Display Name</label>
					<input type="text" className="form-control" id="displayName" name="displayName" value={formData.displayName} onChange={(e) => setFormData({ ...formData, displayName: e.target.value?.trim() })} />
	 			</div>
				<div className="form-group">
	 				<label>Github</label>
					<input type="text" className="form-control" id="github" name="github" value={formData.github} 
						onChange={(e) => {
							if(!e.target.value.startsWith("https://github.com/")){
								setFormData({ ...formData, github: "https://github.com/"})
								return
							}
							setFormData({ ...formData, github: e.target.value })}
						} 
					/>
	 			</div>
				 <div className="form-group">
					<label>Profile Picture</label>
					<input type="file" className="form-control" id="profilePicture" name="profilePicture" onChange={(e) => setFormData({ ...formData, profilePicture: e.target.files ? e.target.files[0] : null })} />
				</div>
			</Modal.Body>
			<Modal.Footer>
				<button className="btn btn-secondary" onClick={() => setOpenEditProfile(false)}>Close</button>
				<button className="btn btn-primary" onClick={submitData}>Submit</button>
			</Modal.Footer>
		</Modal>

        
    )
}