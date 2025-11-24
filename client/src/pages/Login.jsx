import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
    const { backendUrl, setIsLoggedIn, getUserData } = useContext(AppContent);

    const [state, setState] = useState("Sign Up");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const onSubmitHandler = async (e) => {
        try {
            e.preventDefault();
            axios.defaults.withCredentials = true;
            if (state == "Sign Up") {
                const { data } = await axios.post(
                    backendUrl + "/api/auth/register",
                    {
                        name,
                        email,
                        password,
                    }
                );

                if (data.success) {
                    setIsLoggedIn(true);
                    getUserData();
                    navigate("/chat");
                } else {
                    toast.error(data.message);
                }
            } else {
                const { data } = await axios.post(
                    backendUrl + "/api/auth/login",
                    {
                        email,
                        password,
                    }
                );

                if (data.success) {
                    setIsLoggedIn(true);
                    getUserData();
                    navigate("/chat");
                } else {
                    console.log(data);
                    // alert(data.message);
                    toast.error(data.message);
                }
            }
        } catch (error) {
            console.error("Error during authentication:", error);
            toast.error(error.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-[#0d1117]">
            {/* Logo (glow) */}
            <img
                onClick={() => navigate("/")}
                src={assets.chatMTP_logo}
                alt="Logo"
                className="absolute left-5 sm:left-20 top-5 w-10 sm:w-20 cursor-pointer
                           drop-shadow-[0_0_18px_rgba(0,194,255,0.35)]"
            />

            <div
                className="relative w-full sm:w-96 p-8 sm:p-10 rounded-2xl
                            bg-gradient-to-br from-[rgba(255,255,255,0.03)] to-[rgba(255,255,255,0.01)]
                            border border-[#00C2FF]/10
                            backdrop-blur-md
                            shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
            >
                <h2 className="text-3xl font-semibold text-white text-center mb-3">
                    {state === "Sign Up" ? "Create Account" : "Login"}
                </h2>

                <p className="text-center text-sm mb-6 text-gray-400">
                    {state === "Sign Up"
                        ? "Create your account"
                        : "Login to your account!"}
                </p>

                <form onSubmit={onSubmitHandler}>
                    {state === "Sign Up" && (
                        <div
                            className="mb-4 flex items-center gap-3 w-full px-4 py-3 rounded-full
                                        bg-[rgba(255,255,255,0.02)] border border-[#00C2FF]/8"
                        >
                            <img
                                src={assets.person_icon}
                                alt=""
                                className="w-5 h-5 opacity-90"
                            />
                            <input
                                onChange={(e) => setName(e.target.value)}
                                value={name}
                                type="text"
                                className="bg-transparent outline-none placeholder-gray-400 text-gray-100 w-full"
                                placeholder="Full Name"
                                required
                            />
                        </div>
                    )}

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
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            type="email"
                            className="bg-transparent outline-none placeholder-gray-400 text-gray-100 w-full"
                            placeholder="Email Id"
                            required
                        />
                    </div>

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
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            type="password"
                            className="bg-transparent outline-none placeholder-gray-400 text-gray-100 w-full"
                            placeholder="Password"
                            required
                        />
                    </div>

                    {state === "Login" && (
                        <p
                            onClick={() => navigate("/reset-password")}
                            className="mb-4 text-sm text-[#00C2FF] cursor-pointer hover:underline"
                        >
                            Forgot password?
                        </p>
                    )}

                    <button
                        className="w-full py-2.5 rounded-full
                                   bg-gradient-to-r from-[#00C2FF] to-[#6C63FF]
                                   text-black font-semibold
                                   hover:brightness-110 transition-all duration-200
                                   shadow-[0_8px_24px_rgba(108,99,255,0.16)]"
                    >
                        {state}
                    </button>
                </form>

                {state === "Sign Up" ? (
                    <p className="text-gray-400 text-center text-xs mt-4">
                        Already have an account?{" "}
                        <span
                            onClick={() => setState("Login")}
                            className="text-[#00C2FF] cursor-pointer underline"
                        >
                            Login here
                        </span>
                    </p>
                ) : (
                    <p className="text-gray-400 text-center text-xs mt-4">
                        Don't have an account?{" "}
                        <span
                            onClick={() => setState("Sign Up")}
                            className="text-[#00C2FF] cursor-pointer underline"
                        >
                            Sign up
                        </span>
                    </p>
                )}

                {/* subtle neon bottom glow */}
                <div
                    className="pointer-events-none absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-64 h-2
                                rounded-full bg-gradient-to-r from-[#00C2FF] to-[#6C63FF] opacity-20 blur-[18px]"
                ></div>
            </div>
        </div>
    );
};

export default Login;
