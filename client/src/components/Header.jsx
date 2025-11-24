import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { AppContent } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const Header = () => {
    const { userData, isLoggedin } = useContext(AppContent);
    console.log("Header - isLoggedin:", isLoggedin, "userData:", userData);

    const navigate = useNavigate();

    return (
        <div className="w-full flex justify-center mt-24 px-4">
            {/* Card matching home background */}
            <div
                className="
                    w-full max-w-md rounded-3xl p-8 sm:p-10 text-center
                    bg-[#0d1117] 
                    bg-gradient-to-br from-[#0d1117] via-[#0a0f1f] to-[#000000]
                    border border-[#00C2FF]/10
                    shadow-[0_12px_28px_rgba(0,0,0,0.6)]
                    text-gray-200
                "
            >
                {/* Avatar */}
                <div className="flex justify-center -mt-16 mb-4">
                    <div
                        className="w-36 h-36 rounded-full bg-[#0a0f1f] flex items-center justify-center
                                    ring-4 ring-[#00C2FF]/15 shadow-[0_0_30px_rgba(0,194,255,0.18)]"
                    >
                        <img
                            src={assets.header_img}
                            alt=""
                            className="w-28 h-28 rounded-full object-cover"
                        />
                    </div>
                </div>

                {/* Greeting */}
                <h1 className="flex items-center gap-2 justify-center text-lg sm:text-2xl font-medium mb-1 text-[#00C2FF]">
                    Hey {userData ? userData.name : "User"}!
                    <img src={assets.hand_wave} alt="" className="w-7 h-7" />
                </h1>

                <h2 className="text-2xl sm:text-4xl font-extrabold mb-3 text-white">
                    Welcome to our app
                </h2>

                <p className="mb-6 max-w-xs mx-auto text-sm text-gray-400">
                    Let's start with a quick product tour and we'll have you up
                    and running in no time!
                </p>

                {/* Button */}
                {isLoggedin ? (
                    <button
                        onClick={() => navigate("/chat")}
                        className="
                        px-8 py-2.5 rounded-full
                        bg-gradient-to-r from-[#00C2FF] to-[#6C63FF]
                        text-black font-semibold
                        hover:brightness-110 transition-all duration-200
                        shadow-[0_8px_24px_rgba(108,99,255,0.16)]
                    "
                    >
                        Chat Now
                    </button>
                ) : (
                    <button
                        onClick={() => navigate("/login")}
                        className="
                        px-8 py-2.5 rounded-full
                        bg-gradient-to-r from-[#00C2FF] to-[#6C63FF]
                        text-black font-semibold
                        hover:brightness-110 transition-all duration-200
                        shadow-[0_8px_24px_rgba(108,99,255,0.16)]
                    "
                    >
                        Get Started
                    </button>
                )}

                {/* Soft bottom glow */}
                <div
                    className="pointer-events-none mt-6 w-40 h-1 mx-auto rounded-full 
                               bg-gradient-to-r from-[#00C2FF] to-[#6C63FF] opacity-20 blur-[14px]"
                />
            </div>
        </div>
    );
};

export default Header;
