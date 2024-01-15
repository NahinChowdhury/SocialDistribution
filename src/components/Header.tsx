import axios from "axios";
import React, { FunctionComponent, useEffect, useState } from "react";
import { Link } from "react-router-dom";

export const Header: FunctionComponent = () => {

	const user = JSON.parse(localStorage.getItem("user") || "{}");
	const [loggedIn, setLoggedIn] = useState(false);
	const [isNavCollapsed, setIsNavCollapsed] = useState(true);
	const [onLoginPage, setOnLoginPage] = useState(false);

	const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

	useEffect(() => {
		if (Object.keys(user).length !== 0) {
			setLoggedIn(true);
		}else{
			setLoggedIn(false);
		}
	}, []);

	useEffect(() => {
		console.log(window.location.href)
		if(window.location.href.includes("login") || window.location.href.includes("signup")) {
			setOnLoginPage(true);
		}else{
			setOnLoginPage(false);
		}
	}, [window.location.href]);

	const handleLogout = () => {
		// Handle logout logic
		window.localStorage.clear();
		window.location.href = "/login";
		setLoggedIn(false);
	};

  return (
	<nav className="navbar navbar-expand-lg navbar-light bg-light">
		<Link className="navbar-brand" to="/">
			Social Distribution
		</Link>
		<button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation" onClick={handleNavCollapse}>
			<span className="navbar-toggler-icon"></span>
		</button>
		<div className={`${isNavCollapsed ? 'collapse' : ''} navbar-collapse`} id="navbarNav">
			<ul className="navbar-nav mr-auto">
				{loggedIn ? (
					<>
						<li className="nav-item">
							<Link className="nav-link" to="/">
							Timeline
							</Link>
						</li>
						<li className="nav-item">
							<Link className="nav-link" to="/profile">
							Profile
							</Link>
						</li>
						<li className="nav-item">
							<Link className="nav-link" to="/inbox">
							Inbox
							</Link>
						</li>

						<li className="nav-item">
							<button className="btn btn-outline-secondary" onClick={handleLogout}>
								Logout
							</button>
						</li>
					</>
				) : (
					!onLoginPage &&
					<li className="nav-item">
						<Link className="btn btn-outline-primary" to="/login">
							Login
						</Link>
					</li>
				)}
			</ul>
		</div>
	</nav>
  );
};