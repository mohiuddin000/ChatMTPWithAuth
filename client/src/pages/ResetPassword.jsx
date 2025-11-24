import React, { useContext, useRef, useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContent } from "../context/AppContext";
import { toast } from "react-toastify";

const ResetPassword = () => {
    const { backendUrl } = useContext(AppContent);
    axios.defaults.withCredentials = true;

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isEmailSent, setIsEmailSent] = useState("");
    const [otp, setOtp] = useState("");
    const [isOtoSubmitted, setIsOtpSubmitted] = useState(false);

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

    const onSubmitEmail = async (e) => {
        e.preventDefault();

        try {
            const { data } = await axios.post(
                backendUrl + "/api/auth/sent-reset-otp",
                { email }
            );
            if (data.success) {
                setIsEmailSent(true);
                toast.success(data.message || "OTP sent to your email");
            } else {
                toast.error(data.message || "Failed to send OTP");
            }
        } catch (error) {
            toast.error(error.message || "An error occurred while sending OTP");
        }
    };

    const onSubmitOtp = async (e) => {
        e.preventDefault();
        const otpArray = inputRefs.current.map((e) => e.value).join("");
        setOtp(otpArray);
        setIsOtpSubmitted(true);
    };

    const onSubmitNewPassword = async (e) => {
        e.preventDefault();

        try {
            const { data } = await axios.post(
                backendUrl + "/api/auth/reset-password",
                { email, otp, newPassword }
            );

            data.success
                ? toast.success(data.message)
                : toast.error(data.message);
            data.success && navigate("/login");
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div
            className="flex items-center justify-center min-h-screen
                        bg-[#0d1117] bg-gradient-to-br from-[#0d1117] via-[#0a0f1f] to-[#000000] relative px-4"
        >
            {/* Logo with neon glow */}
            <img
                onClick={() => navigate("/")}
                src={assets.chatMTP_logo}
                alt=""
                className="absolute left-5 sm:left-20 top-5 w-10 sm:w-20 cursor-pointer
                           drop-shadow-[0_0_18px_rgba(0,194,255,0.35)]"
            />

            {/* Enter email id */}
            {!isEmailSent && (
                <form
                    onSubmit={onSubmitEmail}
                    className="relative w-full max-w-md p-8 sm:p-10 rounded-2xl
                               bg-[#0d1117] bg-gradient-to-br from-[#0d1117] via-[#0a0f1f] to-[#000000]
                               border border-[#00C2FF]/10 shadow-[0_20px_40px_rgba(2,6,23,0.75)]
                               text-sm"
                >
                    <h1 className="text-white text-2xl font-semibold text-center mb-3">
                        Reset Password
                    </h1>
                    <p className="text-center mb-6 text-gray-400">
                        Enter your registered email to receive a password reset
                        OTP.
                    </p>

                    <div
                        className="mb-4 flex items-center gap-3 w-full px-4 py-3 rounded-full
                                   bg-[rgba(255,255,255,0.02)] border border-[#00C2FF]/8"
                    >
                        <img
                            src={assets.mail_icon}
                            alt=""
                            className="w-5 h-5 opacity-90"
                        />
                        <input
                            type="email"
                            placeholder="Email ID"
                            className="bg-transparent outline-none text-gray-100 w-full placeholder-gray-400"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        className="w-full py-2.5 rounded-full
                                   bg-gradient-to-r from-[#00C2FF] to-[#6C63FF]
                                   text-black font-semibold
                                   hover:brightness-105 transition-all duration-200
                                   shadow-[0_8px_24px_rgba(108,99,255,0.14)]"
                    >
                        Submit
                    </button>
                </form>
            )}

            {/* Enter otp */}
            {!isOtoSubmitted && isEmailSent && (
                <form
                    onSubmit={onSubmitOtp}
                    className="relative w-full max-w-md p-8 sm:p-10 rounded-2xl
                               bg-[#0d1117] bg-gradient-to-br from-[#0d1117] via-[#0a0f1f] to-[#000000]
                               border border-[#00C2FF]/10 shadow-[0_20px_40px_rgba(2,6,23,0.75)]
                               text-sm"
                >
                    <h1 className="text-white text-2xl font-semibold text-center mb-3">
                        Reset password OTP
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
                                    className="w-12 h-12 text-white text-center text-xl rounded-md
                                               bg-[rgba(255,255,255,0.02)] border border-[#00C2FF]/12
                                               focus:outline-none focus:ring-2 focus:ring-[#00C2FF]/30"
                                    ref={(e) => (inputRefs.current[index] = e)}
                                    onInput={(e) => handleInput(e, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                />
                            ))}
                    </div>
                    <button
                        className="w-full py-2.5 rounded-full
                                   bg-gradient-to-r from-[#00C2FF] to-[#6C63FF]
                                   text-black font-semibold
                                   hover:brightness-105 transition-all duration-200
                                   shadow-[0_8px_24px_rgba(108,99,255,0.14)]"
                    >
                        Submit
                    </button>
                </form>
            )}

            {/* Enter New password */}
            {isOtoSubmitted && isEmailSent && (
                <form
                    onSubmit={onSubmitNewPassword}
                    className="relative w-full max-w-md p-8 sm:p-10 rounded-2xl
                               bg-[#0d1117] bg-gradient-to-br from-[#0d1117] via-[#0a0f1f] to-[#000000]
                               border border-[#00C2FF]/10 shadow-[0_20px_40px_rgba(2,6,23,0.75)]
                               text-sm"
                >
                    <h1 className="text-white text-2xl font-semibold text-center mb-3">
                        New Password
                    </h1>
                    <p className="text-center mb-6 text-gray-400">
                        Enter your new password to reset it.
                    </p>

                    <div
                        className="mb-4 flex items-center gap-3 w-full px-4 py-3 rounded-full
                                   bg-[rgba(255,255,255,0.02)] border border-[#00C2FF]/8"
                    >
                        <img
                            src={assets.lock_icon}
                            alt=""
                            className="w-5 h-5 opacity-90"
                        />
                        <input
                            type="password"
                            placeholder="New Password"
                            className="bg-transparent outline-none text-gray-100 w-full placeholder-gray-400"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        className="w-full py-2.5 rounded-full
                                   bg-gradient-to-r from-[#00C2FF] to-[#6C63FF]
                                   text-black font-semibold
                                   hover:brightness-105 transition-all duration-200
                                   shadow-[0_8px_24px_rgba(108,99,255,0.14)] mt-3"
                    >
                        Submit
                    </button>
                </form>
            )}

            {/* subtle radial glow behind forms */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="w-96 h-96 rounded-full bg-[radial-gradient(circle,rgba(0,194,255,0.06),transparent_40%)]" />
            </div>
        </div>
    );
};

export default ResetPassword;
