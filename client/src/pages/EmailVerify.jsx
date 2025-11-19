import React, { useContext, useEffect, useRef } from "react";
import { assets } from "../assets/assets";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const EmailVerify = () => {
    axios.defaults.withCredentials = true;
    const navigate = useNavigate();
    const { backendUrl, isLoggedin, userData, getUserData } =
        useContext(AppContent);
    const inputRefs = useRef([]);

    const handleInput = (e, index) => {
        if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && index > 0 && e.target.value.length === 0) {
            inputRefs.current[index - 1].focus();
        } else if (e.key === "ArrowLeft" && index > 0) {
            inputRefs.current[index - 1].focus();
        } else if (
            e.key === "ArrowRight" &&
            index < inputRefs.current.length - 1
        ) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handlePaste = (e) => {
        const paste = e.clipboardData.getData("text");
        const pasteArray = paste.split("");
        if (pasteArray.length === 6) {
            pasteArray.forEach((char, index) => {
                if (inputRefs.current[index]) {
                    inputRefs.current[index].value = char;
                    inputRefs.current[index].dispatchEvent(
                        new Event("input", { bubbles: true })
                    );
                }
            });
            inputRefs.current[5].focus(); // Focus the last input after pasting
        } else {
            e.preventDefault(); // Prevent paste if not exactly 6 characters
        }
    };

    const onSubmitHandler = async (e) => {
        try {
            e.preventDefault();
            const otp = inputRefs.current.map((e) => e.value).join("");
            if (otp.length !== 6) {
                toast.error("Please enter a valid 6-digit OTP");
                return;
            }

            const { data } = await axios.post(
                backendUrl + "/api/auth/verify-account",
                { otp }
            );

            console.log("OTP verification response:", data);

            if (data.success) {
                toast.success("Email verified successfully!");
                getUserData();
                navigate("/");
            } else {
                toast.error(data.message || "Verification failed");
            }
        } catch (error) {
            toast.error(error.message || "Verification failed");
        }
    };

    useEffect(() => {
        isLoggedin && userData && userData.isAccountVerified && navigate("/");
    }, [isLoggedin, userData]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400">
            <img
                onClick={() => navigate("/")}
                src={assets.logo}
                alt=""
                className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
            />
            <form
                onSubmit={onSubmitHandler}
                className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
            >
                <h1 className="text-white text-2xl font-semibold text-center mb-4">
                    Verify OTP
                </h1>
                <p className="text-center mb-6 text-indigo-300">
                    Enter the 6-digit code sent to your Email ID
                </p>

                <div
                    className="flex justify-between mb-8"
                    onPaste={handlePaste}
                >
                    {Array(6)
                        .fill(0)
                        .map((_, index) => (
                            <input
                                type="text"
                                maxLength="1"
                                required
                                key={index}
                                className="w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md"
                                ref={(e) => (inputRefs.current[index] = e)}
                                onInput={(e) => handleInput(e, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                            />
                        ))}
                </div>
                <button className="w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full">
                    Verify Email
                </button>
            </form>
        </div>
    );
};

export default EmailVerify;
