import React, { useEffect, useState} from "react";
import { Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';


export const PrivateRoute= () => {

    const [isLoggedIn, setIsLoggedIn] = useState<boolean|null>(null);

    useEffect(() => {
        const token: string = window.localStorage.getItem("token") || "";

        axios.post("/api/auth/isLoggedIn/", {token: token})
            .then(res => {
                setIsLoggedIn(true);
            })
            .catch(error => {
                setIsLoggedIn(false);
                window.location.href = "/login";
            })
    },[]);

    const renderComponent = () => {
        if(isLoggedIn === null){
            return <>Loading...</>
        }else if(isLoggedIn){
            return <Outlet />;
        }else{
            return <Navigate to="/login" />;
        }
    }

    return renderComponent();
}