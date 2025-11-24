import React, { useContext, useState, useRef, useEffect } from "react";
import { assets } from "../assets/assets";
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

    // Close dropdown when clicking outside
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

    const toggleMenu = () => setIsOpen(!isOpen);

    const sendVeificationOtp = async () => {
        try {
            axios.defaults.withCredentials = true;
            const { data } = await axios.post(
                backendUrl + "/api/auth/send-verify-otp"
            );
            if (data.success) {
                navigate("/email-verify");
                toast.success("Verification email sent successfully!");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
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
            toast.error(error.message);
        }
    };

    return (
        <div
            className="w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 fixed top-0 left-0 z-50
                        bg-[#0d1117]/60 backdrop-blur-md border-b border-[#00C2FF]/10 shadow-[0_4px_20px_rgba(0,194,255,0.05)]"
        >
            {/* Logo */}
            <img
                onClick={() => navigate("/")}
                src={assets.chatMTP_logo}
                alt="logo"
                className="w-15 sm:w-20 cursor-pointer drop-shadow-[0_0_12px_rgba(0,194,255,0.35)]"
            />

            {/* User Menu */}
            {userData ? (
                <div ref={dropdownRef} className="relative">
                    {/* Avatar Button */}
                    <div
                        onClick={toggleMenu}
                        className="w-10 h-10 flex justify-center items-center rounded-full 
                                   bg-[#1a1f2b] text-[#00C2FF]
                                   border border-[#00C2FF]/40
                                   shadow-[0_0_12px_rgba(0,194,255,0.35)]
                                   cursor-pointer select-none hover:bg-[#1a2233] transition"
                    >
                        {userData.name[0].toUpperCase()}
                    </div>

                    {/* Dropdown Panel */}
                    {isOpen && (
                        <div
                            className="absolute right-0 mt-3 w-44 rounded-xl p-2 
                                       bg-[#0f1629] border border-[#00C2FF]/20 
                                       shadow-[0_8px_24px_rgba(0,194,255,0.15)]
                                       animate-fadeIn"
                        >
                            <ul className="text-sm text-gray-300">
                                {!userData.isAccountVerified && (
                                    <li
                                        onClick={() => {
                                            setIsOpen(false);
                                            sendVeificationOtp();
                                        }}
                                        className="px-4 py-2 rounded-md hover:bg-[#1a233a] cursor-pointer"
                                    >
                                        Verify Email
                                    </li>
                                )}

                                <li
                                    onClick={() => {
                                        setIsOpen(false);
                                        logout();
                                    }}
                                    className="px-4 py-2 rounded-md hover:bg-[#1a233a] cursor-pointer"
                                >
                                    Logout
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            ) : (
                <button
                    onClick={() => navigate("/login")}
                    className="flex items-center gap-2 
                               border border-[#00C2FF]/40 rounded-full px-6 py-2 
                               text-[#00C2FF] bg-[#0d1117]
                               hover:bg-[#00C2FF]/20 transition-all duration-300 
                               shadow-[0_0_12px_rgba(0,194,255,0.35)]"
                >
                    Login
                </button>
            )}
        </div>
    );
};

export default Navbar;
