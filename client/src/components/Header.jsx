import React, { useContext } from "react";
import { AppContent } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const previewMessages = [
    { role: "user", text: "Summarize today's top AI research papers." },
    {
        role: "assistant",
        text: "Here are three papers worth your attention, ranked by relevance to your recent reading.",
    },
];

const Header = () => {
    const { userData, isLoggedin } = useContext(AppContent);
    const navigate = useNavigate();

    return (
        <section className="w-full max-w-5xl mx-auto px-5 pt-36 pb-20">
            <div className="grid md:grid-cols-2 gap-14 items-center">
                {/* Left: copy */}
                <div>
                    <span className="font-mono text-xs uppercase tracking-widest text-accent">
                        Your assistant, always on
                    </span>
                    <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight mt-4 leading-[1.1] text-text">
                        {isLoggedin && userData
                            ? `Welcome back, ${userData.name.split(" ")[0]}.`
                            : "Ask anything. Get a straight answer."}
                    </h1>
                    <p className="mt-5 text-base text-text-muted max-w-md leading-relaxed">
                        ChatMTP keeps a running history of every conversation,
                        so you can pick up exactly where you left off — no
                        re-explaining, no lost context.
                    </p>

                    <button
                        onClick={() =>
                            navigate(isLoggedin ? "/chat" : "/login")
                        }
                        className="mt-8 inline-flex items-center gap-2 bg-accent text-white text-sm font-medium px-6 py-3 rounded-md hover:bg-accent-hover transition-colors"
                    >
                        {isLoggedin ? "Go to chat" : "Get started"}
                        <span aria-hidden="true">&rarr;</span>
                    </button>
                </div>

                {/* Right: signature element — a live-feeling chat preview,
                    styled like a document/callout rather than a bubble UI */}
                <div className="rounded-xl border border-border bg-surface p-5 sm:p-6">
                    <div className="flex items-center gap-2 pb-4 mb-4 border-b border-border">
                        <div className="flex gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-border" />
                            <span className="w-2.5 h-2.5 rounded-full bg-border" />
                            <span className="w-2.5 h-2.5 rounded-full bg-border" />
                        </div>
                        <span className="font-mono text-xs text-text-muted ml-1">
                            chatmtp — session
                        </span>
                    </div>

                    <div className="space-y-4">
                        <div className="text-right">
                            <span className="inline-block text-sm bg-surface-hover text-text rounded-md px-3 py-2 max-w-[85%]">
                                {previewMessages[0].text}
                            </span>
                        </div>

                        <div className="border-l-2 border-accent pl-3">
                            <span className="font-mono text-[11px] uppercase tracking-wide text-accent">
                                Assistant
                            </span>
                            <p className="text-sm text-text mt-1 leading-relaxed">
                                {previewMessages[1].text}
                            </p>
                        </div>

                        <div className="border-l-2 border-border pl-3 flex items-center gap-1.5 py-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" />
                            <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce [animation-delay:0.15s]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce [animation-delay:0.3s]" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Header;
