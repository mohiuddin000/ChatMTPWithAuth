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
        <div className="flex items-center justify-center min-h-screen bg-[#0d1117] bg-gradient-to-br from-[#0d1117] via-[#0a0f1f] to-[#000000] relative px-4">
            {/* Logo with neon glow */}
            <img
                onClick={() => navigate("/")}
                src={assets.chatMTP_logo}
                alt=""
                className="absolute left-5 sm:left-20 top-5 w-10 sm:w-20 cursor-pointer
                           drop-shadow-[0_0_18px_rgba(0,194,255,0.35)]"
            />

            <form
                onSubmit={onSubmitHandler}
                className="relative w-full max-w-md p-8 sm:p-10 rounded-2xl
                           bg-[#0d1117] bg-gradient-to-br from-[#0d1117] via-[#0a0f1f] to-[#000000]
                           border border-[#00C2FF]/8
                           shadow-[0_20px_40px_rgba(2,6,23,0.75)]
                           text-sm"
            >
                <h1 className="text-white text-2xl font-semibold text-center mb-2">
                    Verify OTP
                </h1>
                <p className="text-center mb-6 text-gray-400">
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
                                ref={(e) => (inputRefs.current[index] = e)}
                                onInput={(e) => handleInput(e, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                className="
                                    w-12 h-12 text-white text-center text-xl rounded-md
                                    bg-[rgba(255,255,255,0.02)] border border-[#00C2FF]/12
                                    focus:outline-none focus:ring-2 focus:ring-[#00C2FF]/30
                                    placeholder-gray-400
                                "
                            />
                        ))}
                </div>

                <button
                    className="w-full py-3 rounded-full
                               bg-gradient-to-r from-[#00C2FF] to-[#6C63FF]
                               text-black font-semibold
                               hover:brightness-105 transition-all duration-200
                               shadow-[0_8px_24px_rgba(108,99,255,0.14)]"
                >
                    Verify Email
                </button>

                {/* small helper text */}
                <p className="text-center text-xs text-gray-400 mt-4">
                    Didn't receive the code?{" "}
                    <span
                        onClick={() => {
                            // if you have resend endpoint you can wire it here later
                            toast.info("Resend OTP feature coming soon");
                        }}
                        className="text-[#00C2FF] cursor-pointer underline"
                    >
                        Resend
                    </span>
                </p>
            </form>

            {/* subtle neon radial glow behind the form */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="w-96 h-96 rounded-full bg-[radial-gradient(circle,rgba(0,194,255,0.06),transparent_40%)]" />
            </div>
        </div>
    );
};

export default EmailVerify;
