import axios from "axios";
import { useState, useRef, useEffect, useContext } from "react";
import { AppContent } from "../context/AppContext";

export default function AssistantChat({ currentChatId }) {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]); // { role: "user" | "assistant", text: string }
    const [loading, setLoading] = useState(false);
    const chatContainerRef = useRef(null);

    const { backendUrl, isLoggedin, userData, getUserData } =
        useContext(AppContent);

    // keep a stable threadId for this session
    const threadIdRef = useRef(
        Date.now().toString(36) + Math.random().toString(36).substring(2)
    );

    // Load messages when chat changes
    useEffect(() => {
        if (currentChatId && userData?.id) {
            loadChatMessages();
        } else {
            setMessages([]);
        }
    }, [currentChatId, userData]);

    // auto scroll to bottom when new message is added
    useEffect(() => {
        const el = chatContainerRef.current;
        if (el) {
            el.scrollTop = el.scrollHeight;
        }
    }, [messages, loading]);

    const loadChatMessages = async () => {
        try {
            const response = await axios.get(
                `${backendUrl}/api/chat/${userData.id}/messages/${currentChatId}`
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
                }
            );

            console.log("Server response:", response.data);
            return response.data.response;
        } catch (err) {
            console.error("Error calling server:", err);
            throw new Error("Server error");
        }
    }

    async function handleSend() {
        const question = input.trim();
        if (!question || loading) return;

        // add user message
        setMessages((prev) => [...prev, { role: "user", text: question }]);
        setInput("");
        setLoading(true);

        try {
            const assistantMessage = await callServer(question);

            console.log("Assistant message:", assistantMessage);

            // add assistant message
            setMessages((prev) => [
                ...prev,
                { role: "assistant", text: assistantMessage },
            ]);
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    text: "Sorry, something went wrong. Please try again.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    }

    function handleKeyDown(e) {
        // Enter to send, Shift+Enter for new line
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    return (
        <div className="min-h-screen bg-[#0d1117] bg-gradient-to-br from-[#0d1117] via-[#071022] to-[#000000] text-gray-100 pt-3 ">
            <div
                ref={chatContainerRef}
                id="chat-container"
                className="container mx-auto max-w-3xl pb-44 px-4 pt-8"
            >
                {/* Chat header (optional space) */}
                <div className="flex items-center gap-3 mb-6">
                    <div
                        className="w-10 h-10 rounded-full bg-[#071122] flex items-center justify-center
                                    ring-2 ring-[#00C2FF]/25 shadow-[0_6px_24px_rgba(0,194,255,0.08)]"
                    >
                        <span className="text-[#00C2FF] font-semibold">AI</span>
                    </div>
                    <div>
                        <div className="text-sm text-[#00C2FF] font-medium">
                            Assistant
                        </div>
                        <div className="text-xs text-gray-400">
                            Ask anything — I'm listening
                        </div>
                    </div>
                </div>

                {/* messages */}
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`my-4 max-w-[85%] break-words px-4 py-3 rounded-2xl shadow-sm
                            ${
                                msg.role === "user"
                                    ? "ml-auto bg-gradient-to-r from-[#071122] to-[#071522] text-gray-100 border border-[#00C2FF]/8 shadow-[0_6px_18px_rgba(0,0,0,0.6)]"
                                    : "mr-auto bg-[linear-gradient(180deg,#071224,#081827)] text-gray-200 border border-[#00C2FF]/10 shadow-[0_6px_20px_rgba(0,194,255,0.04)]"
                            }`}
                    >
                        {msg.text}
                    </div>
                ))}

                {/* loading bubbles */}
                {loading && (
                    <div className="my-4 max-w-[40%] px-4 py-3 rounded-2xl bg-[linear-gradient(180deg,#071224,#081827)] border border-[#00C2FF]/10 shadow-[0_6px_18px_rgba(0,194,255,0.06)]">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#00C2FF] animate-bounce" />
                            <div className="w-2.5 h-2.5 rounded-full bg-[#00C2FF] animate-bounce [animation-delay:0.15s]" />
                            <div className="w-2.5 h-2.5 rounded-full bg-[#00C2FF] animate-bounce [animation-delay:0.3s]" />
                        </div>
                    </div>
                )}
            </div>

            {/* bottom input bar */}
            <div className="fixed inset-x-0 bottom-0 flex items-center justify-center pointer-events-none">
                <div className="pointer-events-auto bg-[linear-gradient(90deg,#071122,rgba(7,17,34,0.85))] border border-[#00C2FF]/8 rounded-3xl w-full max-w-3xl p-3 mb-4 mx-4">
                    <textarea
                        id="input"
                        rows={1}
                        className="w-full resize-none outline-none p-3 bg-transparent text-gray-100 placeholder-gray-400 rounded-xl min-h-[48px]"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask something..."
                    />

                    <div className="flex items-center justify-end mt-2">
                        <button
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00C2FF] to-[#6C63FF] text-black px-4 py-2 rounded-full hover:brightness-105 transition-all duration-150 disabled:opacity-50"
                            onClick={handleSend}
                            disabled={!input.trim() || loading}
                            id="ask-button"
                        >
                            {loading ? "Thinking..." : "Ask"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
