import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AppContent } from "../context/AppContext";

export default function HistorySidebar({ onChatSelect, currentChatId }) {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const { backendUrl, userData } = useContext(AppContent);

    useEffect(() => {
        fetchHistory();
    }, [userData]);

    const fetchHistory = async () => {
        if (!userData?.id) return;

        try {
            const response = await axios.get(
                `${backendUrl}/api/chat/${userData.id}/history`,
            );
            setChats(response.data.data.chats || []);
        } catch (error) {
            console.error("Error fetching history:", error);
        } finally {
            setLoading(false);
        }
    };

    const createNewChat = async () => {
        if (!userData?.id) return;

        try {
            const response = await axios.post(
                `${backendUrl}/api/chat/${userData.id}/newchat`,
            );
            const newChat = response.data.history;
            setChats((prev) => [newChat, ...prev]);
            onChatSelect(newChat.id);
        } catch (error) {
            console.error("Error creating new chat:", error);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return "Today";
        if (diffDays === 2) return "Yesterday";
        if (diffDays <= 7)
            return date.toLocaleDateString("en-US", { weekday: "long" });

        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    };

    const groupChatsByDate = (chats) => {
        const groups = {};
        chats.forEach((chat) => {
            const dateKey = formatDate(chat.updatedAt || chat.createdAt);
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(chat);
        });
        return groups;
    };

    const groupedChats = groupChatsByDate(chats);

    return (
        <div className="w-72 shrink-0 bg-surface border-r border-border flex flex-col h-full">
            <div className="p-3 border-b border-border">
                <button
                    onClick={createNewChat}
                    className="w-full flex items-center justify-center gap-1.5 bg-accent text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-accent-hover transition-colors"
                >
                    <span aria-hidden="true">+</span> New chat
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                {loading ? (
                    <div className="text-center text-sm text-text-muted py-8">
                        Loading…
                    </div>
                ) : chats.length === 0 ? (
                    <div className="text-center text-sm text-text-muted px-4 py-8">
                        No conversations yet. Start a new chat to begin.
                    </div>
                ) : (
                    Object.entries(groupedChats).map(([date, dateChats]) => (
                        <div key={date} className="mb-4">
                            <div className="font-mono text-[10px] uppercase tracking-wide text-text-muted px-2 py-1 mb-1">
                                {date}
                            </div>
                            {dateChats.map((chat) => (
                                <div
                                    key={chat.id}
                                    onClick={() => onChatSelect(chat.id)}
                                    className={`px-3 py-2 mx-0.5 mb-0.5 rounded-md cursor-pointer transition-colors ${
                                        chat.id === currentChatId
                                            ? "bg-accent-soft"
                                            : "hover:bg-surface-hover"
                                    }`}
                                >
                                    <div className="text-sm text-text truncate">
                                        {chat.title || "New chat"}
                                    </div>
                                    <div className="text-xs text-text-muted mt-0.5">
                                        {chat.messages?.length || 0} messages
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
