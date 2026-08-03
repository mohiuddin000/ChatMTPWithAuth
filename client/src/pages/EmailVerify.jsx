import React, { useContext, useEffect, useRef, useState } from "react";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ThemeToggle from "../components/ThemeToggle";

const EmailVerify = () => {
    axios.defaults.withCredentials = true;
    const navigate = useNavigate();
    const { backendUrl, isLoggedin, userData, getUserData } =
        useContext(AppContent);
    const inputRefs = useRef([]);
    const [loading, setLoading] = useState(false);

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

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        const otp = inputRefs.current.map((el) => el.value).join("");
        if (otp.length !== 6) {
            toast.error("Please enter a valid 6-digit code");
            return;
        }

        setLoading(true);
        try {
            const { data } = await axios.post(
                backendUrl + "/api/auth/verify-account",
                { otp },
            );

            if (data.success) {
                toast.success("Email verified");
                getUserData();
                navigate("/");
            } else {
                toast.error(data.message || "Verification failed");
            }
        } catch (error) {
            toast.error("Verification failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        isLoggedin && userData && userData.isAccountVerified && navigate("/");
    }, [isLoggedin, userData]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg px-5">
            <button
                onClick={() => navigate("/")}
                className="fixed left-5 sm:left-8 top-5 font-display font-semibold text-lg tracking-tight text-text hover:text-accent transition-colors"
            >
                ChatMTP
            </button>
            <ThemeToggle className="fixed right-5 sm:right-8 top-5" />

            <form onSubmit={onSubmitHandler} className="w-full max-w-sm">
                <h1 className="font-display text-2xl font-semibold text-text mb-1">
                    Verify your email
                </h1>
                <p className="text-sm text-text-muted mb-8">
                    Enter the 6-digit code we sent to your email.
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
                                ref={(el) => (inputRefs.current[index] = el)}
                                onInput={(e) => handleInput(e, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                className="w-11 h-12 text-center text-lg font-mono rounded-md border border-border bg-bg text-text outline-none focus:border-accent transition-colors"
                            />
                        ))}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-accent text-white text-sm font-medium py-2.5 rounded-md hover:bg-accent-hover transition-colors disabled:opacity-60"
                >
                    {loading ? "Verifying…" : "Verify email"}
                </button>

                <p className="text-center text-sm text-text-muted mt-6">
                    Didn't get a code?{" "}
                    <span
                        onClick={() => toast.info("Resend is coming soon")}
                        className="text-accent hover:text-accent-hover cursor-pointer font-medium"
                    >
                        Resend
                    </span>
                </p>
            </form>
        </div>
    );
};

export default EmailVerify;
