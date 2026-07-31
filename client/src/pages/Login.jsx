import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
    const { backendUrl, setIsLoggedIn, getUserData } = useContext(AppContent);

    const [state, setState] = useState("Login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            axios.defaults.withCredentials = true;

            if (state === "Sign Up") {
                const { data } = await axios.post(
                    backendUrl + "/api/auth/register",
                    { name, email, password },
                );

                if (data.success) {
                    setIsLoggedIn(true);
                    await getUserData();
                    navigate("/chat");
                } else {
                    toast.error(data.message);
                }
            } else {
                const { data } = await axios.post(
                    backendUrl + "/api/auth/login",
                    { email, password },
                );

                if (data.success) {
                    setIsLoggedIn(true);
                    await getUserData();
                    navigate("/chat");
                } else {
                    toast.error(data.message);
                }
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

            <div className="w-full max-w-sm">
                {/* Pill toggle */}
                <div className="flex p-1 mb-8 rounded-lg bg-surface border border-border">
                    {["Login", "Sign Up"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setState(tab)}
                            className={`flex-1 text-sm font-medium py-2 rounded-md transition-colors ${
                                state === tab
                                    ? "bg-bg text-text shadow-sm border border-border"
                                    : "text-text-muted hover:text-text"
                            }`}
                        >
                            {tab === "Login" ? "Log in" : "Sign up"}
                        </button>
                    ))}
                </div>

                <h1 className="font-display text-2xl font-semibold text-text mb-1">
                    {state === "Sign Up"
                        ? "Create your account"
                        : "Welcome back"}
                </h1>
                <p className="text-sm text-text-muted mb-6">
                    {state === "Sign Up"
                        ? "Start a new conversation history."
                        : "Log in to continue where you left off."}
                </p>

                <form onSubmit={onSubmitHandler} className="space-y-4">
                    {state === "Sign Up" && (
                        <div>
                            <label className="block text-xs font-medium text-text-muted mb-1.5">
                                Full name
                            </label>
                            <input
                                onChange={(e) => setName(e.target.value)}
                                value={name}
                                type="text"
                                required
                                className="w-full px-3.5 py-2.5 rounded-md border border-border bg-bg text-text text-sm outline-none focus:border-accent transition-colors"
                                placeholder="Jane Doe"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-medium text-text-muted mb-1.5">
                            Email
                        </label>
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            type="email"
                            required
                            className="w-full px-3.5 py-2.5 rounded-md border border-border bg-bg text-text text-sm outline-none focus:border-accent transition-colors"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-medium text-text-muted">
                                Password
                            </label>
                            {state === "Login" && (
                                <span
                                    onClick={() => navigate("/reset-password")}
                                    className="text-xs text-accent hover:text-accent-hover cursor-pointer"
                                >
                                    Forgot password?
                                </span>
                            )}
                        </div>
                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            type="password"
                            required
                            className="w-full px-3.5 py-2.5 rounded-md border border-border bg-bg text-text text-sm outline-none focus:border-accent transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-accent text-white text-sm font-medium py-2.5 rounded-md hover:bg-accent-hover transition-colors disabled:opacity-60 mt-2"
                    >
                        {loading
                            ? "Please wait…"
                            : state === "Sign Up"
                              ? "Create account"
                              : "Log in"}
                    </button>
                </form>

                <p className="text-center text-sm text-text-muted mt-6">
                    {state === "Sign Up" ? (
                        <>
                            Already have an account?{" "}
                            <span
                                onClick={() => setState("Login")}
                                className="text-accent hover:text-accent-hover cursor-pointer font-medium"
                            >
                                Log in
                            </span>
                        </>
                    ) : (
                        <>
                            Don't have an account?{" "}
                            <span
                                onClick={() => setState("Sign Up")}
                                className="text-accent hover:text-accent-hover cursor-pointer font-medium"
                            >
                                Sign up
                            </span>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
};

export default Login;
