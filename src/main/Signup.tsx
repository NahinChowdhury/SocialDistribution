import axios from "axios";
import React, {FunctionComponent, useState} from "react";
import { Link } from "react-router-dom";
import './Signup.css';


export const Signup:FunctionComponent = () => {

	const [userName, setUserName] = useState<string>("");
	const [github, setGithub] = useState<string>("https://github.com/");
	const [password, setPassword] = useState<string>("");
	const [confirmPassword, setConfirmPassword] = useState<string>("");
	
	
	const signupClicked = (e: { preventDefault: () => void; }) => {
		e.preventDefault();

		if( userName.length === 0 || github.length === 0 || password.length === 0 || confirmPassword.length === 0 ){
			return alert("All 4 fields need to be full");
		}
		if(password !== confirmPassword){
			return alert("Password needs to be the same as confirm password");
		}
		
		// make a backend call to create the account.
		// if successful, then redirect to login page to log in

		axios.post("/api/auth/register/",  {displayName: userName, password: password, github: github})
			.then(res => {
				console.log(res.data)
				const data = res.data
				window.localStorage.setItem("user", JSON.stringify(data.user));
				window.localStorage.setItem("token", data.token);

				window.location.pathname = '/';
			})
			.catch(e => {
				const error = e.response.data;
				console.log(error);
				let message = '';
				if('github' in error) {
					message += error.github[0] + '\n'
				}
				
				if('password' in error) {
					message += error.password[0] + '\n'
				}
				alert(message)
			})
	}



	return ( 
		<div className="authent-container">
			<div className="signup-form">
				<div className="form-field">
					<div>User Name</div>
					<input 
						type="text" 
						value={userName} 
						onChange={e => {setUserName(e.target.value)}}
						placeholder="Enter your username"
					/>
				</div>

			<div className="form-field">
				<div>Github</div>
				<input 
					type="text" 
					value={github} 
					onChange={e => {setGithub(e.target.value)}}
					placeholder="Enter your GitHub URL"
				/>
			</div>

			<div className="form-field">
				<div>Password</div>
				<input
					type="password" 
					value={password}
					onChange={e => {setPassword(e.target.value)}}
					placeholder="Enter your password"
				/>
			</div>

			<div className="form-field">
				<div>Confirm Password</div>
				<input 
					type="password" 
					value={confirmPassword} 
					onChange={e => {setConfirmPassword(e.target.value)}}
					placeholder="Confirm your password"
				/>
			</div>

			<div className="form-action">
				<button onClick={signupClicked}>Sign Up</button>
			</div>
			<div className="form-footer">
				Have an account? <Link to="/login">Go to Log In</Link>
			</div>
			</div>
		</div>
	)
}