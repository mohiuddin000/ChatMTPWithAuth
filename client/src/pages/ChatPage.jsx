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

    // Bumped every time a message is sent, so the sidebar knows to
    // re-fetch chat titles/order (e.g. after auto-naming a new chat).
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        // Only redirect once we KNOW for sure the user is logged out.
        if (isLoggedin === false) {
            navigate("/login");
        }
    }, [isLoggedin, navigate]);

    // While auth state is still unknown, show a minimal loader —
    // never redirect during this phase.
    if (isLoggedin === undefined || isLoggedin === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg">
                <div className="text-sm text-text-muted font-mono">
                    Checking authentication…
                </div>
            </div>
        );
    }

    const handleChatSelect = (chatId) => {
        setCurrentChatId(chatId);
    };

    return isLoggedin ? (
        <>
            <Navbar />
            <div className="flex h-screen pt-16 bg-bg">
                <HistorySidebar
                    onChatSelect={handleChatSelect}
                    currentChatId={currentChatId}
                    refreshTrigger={refreshTrigger}
                />
                <div className="flex-1 min-w-0">
                    <AssistantChat
                        currentChatId={currentChatId}
                        onMessageSent={() => setRefreshTrigger((v) => v + 1)}
                        onChatCreated={(chatId) => setCurrentChatId(chatId)}
                    />
                </div>
            </div>
        </>
    ) : null;
}

export default ChatPage;
