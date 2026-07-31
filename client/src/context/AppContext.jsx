import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const AppContent = createContext();

export const AppContextProvider = (props) => {
    axios.defaults.withCredentials = true;

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    // isLoggedin starts as `null` = "we don't know yet" (auth check still
    // running). Only becomes true/false once getAuthStatus() resolves.
    // This prevents pages from redirecting to /login before the real
    // auth status has been confirmed.
    const [isLoggedin, setIsLoggedIn] = useState(null);
    const [userData, setUserData] = useState(false);

    const getAuthStatus = async () => {
        try {
            const { data } = await axios.get(backendUrl + "/api/auth/is-auth");
            if (data.success) {
                setIsLoggedIn(true);
                getUserData();
            } else {
                setIsLoggedIn(false);
                setUserData(false);
            }
        } catch (error) {
            setIsLoggedIn(false);
            setUserData(false);
        }
    };

    const getUserData = async () => {
        try {
            const { data } = await axios.get(backendUrl + "/api/user/data");
            if (data.success) {
                setUserData(data.userData);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Could not load your account data.");
        }
    };

    useEffect(() => {
        getAuthStatus();
    }, []);

    const value = {
        backendUrl,
        isLoggedin,
        setIsLoggedIn,
        userData,
        setUserData,
        getUserData,
    };

    return (
        <AppContent.Provider value={value}>
            {props.children}
        </AppContent.Provider>
    );
};
