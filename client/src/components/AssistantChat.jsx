import axios from "axios";
import { useState, useRef, useEffect, useContext } from "react";
import { AppContent } from "../context/AppContext";

export default function AssistantChat({ currentChatId }) {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]); // { role: "user" | "assistant", text: string }
    const [loading, setLoading] = useState(false);
    const chatContainerRef = useRef(null);
    const textareaRef = useRef(null);

    const { backendUrl, userData } = useContext(AppContent);

    useEffect(() => {
        if (currentChatId && userData?.id) {
            loadChatMessages();
        } else {
            setMessages([]);
        }
    }, [currentChatId, userData]);

    useEffect(() => {
        const el = chatContainerRef.current;
        if (el) {
            el.scrollTop = el.scrollHeight;
        }
    }, [messages, loading]);

    // auto-grow textarea up to a max height
    useEffect(() => {
        const el = textareaRef.current;
        if (el) {
            el.style.height = "auto";
            el.style.height = Math.min(el.scrollHeight, 160) + "px";
        }
    }, [input]);

    const loadChatMessages = async () => {
        try {
            const response = await axios.get(
                `${backendUrl}/api/chat/${userData.id}/messages/${currentChatId}`,
            );
            setMessages(response.data.messages || []);
        } catch (error) {
            console.error("Error loading chat messages:", error);
            setMessages([]);
        }
    };

    async function callServer(question) {
        try {
            const response = await axios.post(
                `${backendUrl}/api/chat/${userData.id}/message`,
                {
                    role: "user",
                    text: question,
                    chatId: currentChatId,
                },
            );
            return response.data.response;
        } catch (err) {
            console.error("Error calling server:", err);
            throw new Error("Server error");
        }
    }

    async function handleSend() {
        const question = input.trim();
        if (!question || loading) return;

        setMessages((prev) => [...prev, { role: "user", text: question }]);
        setInput("");
        setLoading(true);

        try {
            const assistantMessage = await callServer(question);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", text: assistantMessage },
            ]);
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    text: "Something went wrong on my end. Please try again.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    }

    function handleKeyDown(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    const hasMessages = messages.length > 0;

    return (
        <div className="flex flex-col h-full bg-bg">
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto">
                <div className="max-w-2xl mx-auto px-5 pt-8 pb-40">
                    {!hasMessages && !loading ? (
                        <div className="text-center pt-20">
                            <p className="font-display text-lg text-text mb-1">
                                Start a conversation
                            </p>
                            <p className="text-sm text-text-muted">
                                Ask a question below to get going.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {messages.map((msg, idx) =>
                                msg.role === "user" ? (
                                    <div key={idx} className="text-right">
                                        <span className="inline-block text-sm bg-surface text-text rounded-md px-3.5 py-2.5 max-w-[85%] text-left leading-relaxed">
                                            {msg.text}
                                        </span>
                                    </div>
                                ) : (
                                    <div
                                        key={idx}
                                        className="border-l-2 border-accent pl-4"
                                    >
                                        <span className="font-mono text-[11px] uppercase tracking-wide text-accent">
                                            Assistant
                                        </span>
                                        <p className="text-sm text-text mt-1 leading-relaxed whitespace-pre-wrap">
                                            {msg.text}
                                        </p>
                                    </div>
                                ),
                            )}

                            {loading && (
                                <div className="border-l-2 border-border pl-4 flex items-center gap-1.5 py-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" />
                                    <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce [animation-delay:0.15s]" />
                                    <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce [animation-delay:0.3s]" />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* composer */}
            <div className="border-t border-border bg-bg">
                <div className="max-w-2xl mx-auto px-5 py-4">
                    <div className="flex items-end gap-2 rounded-lg border border-border focus-within:border-accent transition-colors px-3 py-2">
                        <textarea
                            ref={textareaRef}
                            rows={1}
                            className="flex-1 resize-none outline-none bg-transparent text-sm text-text placeholder-text-muted py-1.5 max-h-40"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask anything…"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || loading}
                            className="shrink-0 bg-accent text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {loading ? "…" : "Send"}
                        </button>
                    </div>
                    <p className="text-xs text-text-muted mt-2 text-center">
                        Press Enter to send, Shift + Enter for a new line
                    </p>
                </div>
            </div>
        </div>
    );
}
