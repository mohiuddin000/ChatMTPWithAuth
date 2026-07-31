import React, { useContext, useRef, useState } from "react";
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
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

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
                        new Event("input", { bubbles: true }),
                    );
                }
            });
            inputRefs.current[5].focus();
        } else {
            e.preventDefault();
        }
    };

    const onSubmitEmail = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axios.post(
                backendUrl + "/api/auth/sent-reset-otp",
                { email },
            );
            if (data.success) {
                setIsEmailSent(true);
                toast.success(data.message || "Code sent to your email");
            } else {
                toast.error(data.message || "Failed to send code");
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const onSubmitOtp = (e) => {
        e.preventDefault();
        const otpArray = inputRefs.current.map((el) => el.value).join("");
        setOtp(otpArray);
        setIsOtpSubmitted(true);
    };

    const onSubmitNewPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axios.post(
                backendUrl + "/api/auth/reset-password",
                { email, otp, newPassword },
            );

            if (data.success) {
                toast.success(data.message);
                navigate("/login");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg px-5">
            <button
                onClick={() => navigate("/")}
                className="fixed left-5 sm:left-8 top-5 font-display font-semibold text-lg tracking-tight text-text hover:text-accent transition-colors"
            >
                ChatMTP
            </button>

            {!isEmailSent && (
                <form onSubmit={onSubmitEmail} className="w-full max-w-sm">
                    <h1 className="font-display text-2xl font-semibold text-text mb-1">
                        Reset your password
                    </h1>
                    <p className="text-sm text-text-muted mb-6">
                        We'll email you a 6-digit code to reset it.
                    </p>

                    <label className="block text-xs font-medium text-text-muted mb-1.5">
                        Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="you@example.com"
                        className="w-full px-3.5 py-2.5 rounded-md border border-border bg-bg text-text text-sm outline-none focus:border-accent transition-colors mb-6"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-accent text-white text-sm font-medium py-2.5 rounded-md hover:bg-accent-hover transition-colors disabled:opacity-60"
                    >
                        {loading ? "Sending…" : "Send code"}
                    </button>
                </form>
            )}

            {!isOtpSubmitted && isEmailSent && (
                <form onSubmit={onSubmitOtp} className="w-full max-w-sm">
                    <h1 className="font-display text-2xl font-semibold text-text mb-1">
                        Enter the code
                    </h1>
                    <p className="text-sm text-text-muted mb-8">
                        Check your inbox for the 6-digit code.
                    </p>

                    <div
                        className="flex justify-between mb-8"
                        onPaste={handlePaste}
                    >
                        {Array(6)
                            .fill(0)
                            .map((_, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength="1"
                                    required
                                    ref={(el) =>
                                        (inputRefs.current[index] = el)
                                    }
                                    onInput={(e) => handleInput(e, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    className="w-11 h-12 text-center text-lg font-mono rounded-md border border-border bg-bg text-text outline-none focus:border-accent transition-colors"
                                />
                            ))}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-accent text-white text-sm font-medium py-2.5 rounded-md hover:bg-accent-hover transition-colors"
                    >
                        Continue
                    </button>
                </form>
            )}

            {isOtpSubmitted && isEmailSent && (
                <form
                    onSubmit={onSubmitNewPassword}
                    className="w-full max-w-sm"
                >
                    <h1 className="font-display text-2xl font-semibold text-text mb-1">
                        Choose a new password
                    </h1>
                    <p className="text-sm text-text-muted mb-6">
                        Make it something you haven't used before.
                    </p>

                    <label className="block text-xs font-medium text-text-muted mb-1.5">
                        New password
                    </label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 rounded-md border border-border bg-bg text-text text-sm outline-none focus:border-accent transition-colors mb-6"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-accent text-white text-sm font-medium py-2.5 rounded-md hover:bg-accent-hover transition-colors disabled:opacity-60"
                    >
                        {loading ? "Saving…" : "Reset password"}
                    </button>
                </form>
            )}
        </div>
    );
};

export default ResetPassword;
