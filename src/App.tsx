import React from 'react';
import { Route, Routes as Switch, BrowserRouter as Router } from "react-router-dom";
import { Header, Footer, PrivateRoute } from './components/Index';
import { Login, Signup } from './main/Index';
import { NotFound } from "./others/NotFound";

import './App.css';
import { Timeline } from "./main/Timeline";
import { Profile } from "./main/Profile";
import { OtherProfiles } from "./main/OtherProfiles";
import { Inbox } from "./main/Inbox";
import { SinglePost } from "./main/SinglePost";

import axios from 'axios';


axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'X-CSRFToken'

function App() {
	return (
		<>
		
			<Router>
			<Header />
			
				<Switch>
					<Route path="/" element={ <PrivateRoute />  }>
						<Route path="/" element={ <Timeline /> }/>
					</Route>

					<Route path="/profile" element={ <PrivateRoute />  }>
						<Route path="/profile" element={ <Profile /> }/>
					</Route>

					<Route path="/inbox" element={ <PrivateRoute />  }>
						<Route path="/inbox" element={ <Inbox /> }/>
					</Route>

					<Route path="/:id" element={ <PrivateRoute />  }>
						<Route path="/:id" element={ <OtherProfiles /> }/>
					</Route>
					
					<Route path="/:id/posts/:postId" element={ <SinglePost /> }/>

					<Route path="/signup" element={ <Signup /> } />
					<Route path="/login" element={ <Login /> }/>

					<Route path="/NotFound" element={ <NotFound /> } />
					<Route path="*" element={ <NotFound /> } />

				</Switch>
			
			<Footer />
			</Router>

		</>
	);
}

export default App;