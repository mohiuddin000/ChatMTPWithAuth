import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AssistantChat from "../components/AssistantChat";
import HistorySidebar from "../components/HistorySidebar";
import { AppContent } from "../context/AppContext";
import Navbar from "../components/Navbar";

function ChatPage() {
    const { isLoggedin } = useContext(AppContent);
    const navigate = useNavigate();
    const [currentChatId, setCurrentChatId] = useState(null);

    useEffect(() => {
        // If the app explicitly knows the user is NOT logged in, redirect to login.
        if (isLoggedin === false) {
            navigate("/login");
        }
    }, [isLoggedin, navigate]);

    // While the auth state is unknown (app still loading), show a minimal loader.
    if (isLoggedin === undefined || isLoggedin === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0d1117]">
                <div className="text-gray-300">Checking authentication…</div>
            </div>
        );
    }

    const handleChatSelect = (chatId) => {
        setCurrentChatId(chatId);
    };

    // Only render the chat when logged in
    return isLoggedin ? (
        <>
            <Navbar />
            <div className="flex h-screen pt-16">
                <HistorySidebar
                    onChatSelect={handleChatSelect}
                    currentChatId={currentChatId}
                />
                <div className="flex-1">
                    <AssistantChat currentChatId={currentChatId} />
                </div>
            </div>
        </>
    ) : null;
}

export default ChatPage;
