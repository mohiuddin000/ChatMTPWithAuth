import React, { useContext, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Navbar = () => {
    const navigate = useNavigate();
    const { userData, backendUrl, setIsLoggedIn, setUserData } =
        useContext(AppContent);

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target)
            ) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleMenu = () => setIsOpen((v) => !v);

    const sendVerificationOtp = async () => {
        try {
            axios.defaults.withCredentials = true;
            const { data } = await axios.post(
                backendUrl + "/api/auth/send-verify-otp",
            );
            if (data.success) {
                navigate("/email-verify");
                toast.success("Verification email sent");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Could not send verification email");
        }
    };

    const logout = async () => {
        try {
            axios.defaults.withCredentials = true;
            const { data } = await axios.post(backendUrl + "/api/auth/logout");
            if (data.success) {
                setIsLoggedIn(false);
                setUserData(false);
                navigate("/");
            }
        } catch (error) {
            toast.error("Could not log out");
        }
    };

    const initial = userData?.name?.[0]?.toUpperCase() || "?";

    return (
        <header className="w-full flex items-center justify-between px-5 sm:px-8 h-16 fixed top-0 left-0 z-50 bg-bg/90 backdrop-blur-sm border-b border-border">
            <button
                onClick={() => navigate("/")}
                className="font-display font-semibold text-lg tracking-tight text-text hover:text-accent transition-colors"
            >
                ChatMTP
            </button>

            {userData ? (
                <div ref={dropdownRef} className="relative">
                    <button
                        onClick={toggleMenu}
                        aria-label="Account menu"
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-accent-soft text-accent font-mono text-sm font-medium border border-border hover:border-accent transition-colors"
                    >
                        {initial}
                    </button>

                    {isOpen && (
                        <div
                            className="absolute right-0 mt-2 w-48 rounded-lg border border-border bg-bg shadow-[0_8px_24px_rgba(25,24,15,0.08)] overflow-hidden"
                            role="menu"
                        >
                            <div className="px-4 py-3 border-b border-border">
                                <div className="text-sm font-medium text-text truncate">
                                    {userData.name}
                                </div>
                                <div className="text-xs text-text-muted truncate">
                                    {userData.email}
                                </div>
                            </div>
                            <ul className="text-sm text-text py-1">
                                {!userData.isAccountVerified && (
                                    <li
                                        onClick={() => {
                                            setIsOpen(false);
                                            sendVerificationOtp();
                                        }}
                                        className="px-4 py-2 hover:bg-surface-hover cursor-pointer"
                                    >
                                        Verify email
                                    </li>
                                )}
                                <li
                                    onClick={() => {
                                        setIsOpen(false);
                                        logout();
                                    }}
                                    className="px-4 py-2 hover:bg-surface-hover cursor-pointer text-error"
                                >
                                    Log out
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            ) : (
                <button
                    onClick={() => navigate("/login")}
                    className="text-sm font-medium px-4 py-2 rounded-md border border-border text-text hover:border-accent hover:text-accent transition-colors"
                >
                    Log in
                </button>
            )}
        </header>
    );
};

export default Navbar;
