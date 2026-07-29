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
                `${backendUrl}/api/chat/${userData.id}/history`
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
                `${backendUrl}/api/chat/${userData.id}/newchat`
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
        <div className="w-80 bg-[#0d1117] border-r border-[#00C2FF]/10 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-[#00C2FF]/10">
                <button
                    onClick={createNewChat}
                    className="w-full bg-gradient-to-r from-[#00C2FF] to-[#6C63FF] text-black px-4 py-2 rounded-lg hover:brightness-105 transition-all duration-150 font-medium"
                >
                    New Chat
                </button>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto p-2">
                {loading ? (
                    <div className="text-center text-gray-400 py-8">
                        Loading...
                    </div>
                ) : (
                    Object.entries(groupedChats).map(([date, dateChats]) => (
                        <div key={date} className="mb-4">
                            <div className="text-xs text-gray-500 uppercase tracking-wide px-2 py-1 mb-2">
                                {date}
                            </div>
                            {dateChats.map((chat) => (
                                <div
                                    key={chat.id}
                                    onClick={() => onChatSelect(chat.id)}
                                    className={`px-3 py-2 mx-1 rounded-lg cursor-pointer transition-all duration-150 ${
                                        chat.id === currentChatId
                                            ? "bg-[#00C2FF]/10 border border-[#00C2FF]/20"
                                            : "hover:bg-[#071122] border border-transparent"
                                    }`}
                                >
                                    <div className="text-sm text-gray-200 truncate">
                                        {chat.title || "New Chat"}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
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
