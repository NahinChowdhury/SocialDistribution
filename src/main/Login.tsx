import axios from "axios";
import React, {FunctionComponent, useState} from "react";
import { Link } from "react-router-dom";
import './login.css';


export const Login:FunctionComponent = () => {

	const [userName, setUserName] = useState<string>("");
	const [password, setPassword] = useState<string>("");

	const loginClicked = (e: { preventDefault: () => void; }) => {
		e.preventDefault();

		if( userName.length === 0 || password.length === 0 ){
			return alert("Both fields need to be full");
		}

		// make a request to the backend to verify account exists

		axios.post("/api/auth/login/",  {displayName: userName, password: password})
			.then(res => {
				console.log(JSON.stringify(res.data.user))
				const data = res.data
				window.localStorage.setItem("user", JSON.stringify(data.user));
				window.localStorage.setItem("token", data.token);
				window.location.pathname = '/';
			})
			.catch(e => {
				const error = e.response.data;
				console.log(error);
				alert(error.detail)
			})
	}

	return ( 
		<div className="login-cont">
			<div className="login">
				<div className="profile-placeholder"></div>
				
				<div>User Name</div>
				<input 
					type="text" 
					value={userName} 
					onChange={e => {
						setUserName(e.target.value)
					}}
				/>
				<div className="input-label">Password</div>
				<input 
					type="password" 
					value={password} 
					onChange={e => {
						setPassword(e.target.value)
					}}
				/>
				<button className="login-btn" onClick={loginClicked}>Log In</button>
			
				<div className="signup-text">Don't have an account? <Link to="/signup"> Sign up!</Link></div>
				
			</div>
		</div>
	)
}