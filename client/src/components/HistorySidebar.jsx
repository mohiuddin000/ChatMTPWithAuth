import React, { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { AppContent } from "../context/AppContext";
import { toast } from "react-toastify";

export default function HistorySidebar({
    onChatSelect,
    currentChatId,
    refreshTrigger,
}) {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState("");
    const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
    const { backendUrl, userData } = useContext(AppContent);
    const editInputRef = useRef(null);

    useEffect(() => {
        fetchHistory();
    }, [userData, refreshTrigger]);

    useEffect(() => {
        if (editingId && editInputRef.current) {
            editInputRef.current.focus();
            editInputRef.current.select();
        }
    }, [editingId]);

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

    const startEditing = (e, chat) => {
        e.stopPropagation();
        setEditingId(chat.id);
        setEditValue(chat.title || "New Chat");
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditValue("");
    };

    const saveRename = async (chatId) => {
        const title = editValue.trim();
        if (!title) {
            cancelEditing();
            return;
        }

        // optimistic update
        setChats((prev) =>
            prev.map((c) => (c.id === chatId ? { ...c, title } : c)),
        );
        setEditingId(null);

        try {
            await axios.put(
                `${backendUrl}/api/chat/${userData.id}/${chatId}/rename`,
                { title },
            );
        } catch (error) {
            console.error("Error renaming chat:", error);
            toast.error("Couldn't rename chat");
            fetchHistory(); // revert to real state on failure
        }
    };

    const handleEditKeyDown = (e, chatId) => {
        if (e.key === "Enter") {
            e.preventDefault();
            saveRename(chatId);
        } else if (e.key === "Escape") {
            cancelEditing();
        }
    };

    const requestDelete = (e, chatId) => {
        e.stopPropagation();
        setConfirmingDeleteId(chatId);
    };

    const cancelDelete = (e) => {
        e.stopPropagation();
        setConfirmingDeleteId(null);
    };

    const confirmDelete = async (e, chatId) => {
        e.stopPropagation();

        const wasCurrent = chatId === currentChatId;

        // optimistic update
        setChats((prev) => prev.filter((c) => c.id !== chatId));
        setConfirmingDeleteId(null);
        if (wasCurrent) onChatSelect(null);

        try {
            await axios.delete(
                `${backendUrl}/api/chat/${userData.id}/${chatId}`,
            );
        } catch (error) {
            console.error("Error deleting chat:", error);
            toast.error("Couldn't delete chat");
            fetchHistory(); // revert to real state on failure
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
                                    onClick={() =>
                                        editingId !== chat.id &&
                                        onChatSelect(chat.id)
                                    }
                                    className={`group px-3 py-2 mx-0.5 mb-0.5 rounded-md cursor-pointer transition-colors ${
                                        chat.id === currentChatId
                                            ? "bg-accent-soft"
                                            : "hover:bg-surface-hover"
                                    }`}
                                >
                                    {confirmingDeleteId === chat.id ? (
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-xs text-error">
                                                Delete this chat?
                                            </span>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                    onClick={(e) =>
                                                        confirmDelete(
                                                            e,
                                                            chat.id,
                                                        )
                                                    }
                                                    className="text-xs font-medium text-white bg-error px-2 py-1 rounded"
                                                >
                                                    Delete
                                                </button>
                                                <button
                                                    onClick={cancelDelete}
                                                    className="text-xs font-medium text-text-muted hover:text-text px-2 py-1"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="min-w-0 flex-1">
                                                {editingId === chat.id ? (
                                                    <input
                                                        ref={editInputRef}
                                                        value={editValue}
                                                        onChange={(e) =>
                                                            setEditValue(
                                                                e.target.value,
                                                            )
                                                        }
                                                        onKeyDown={(e) =>
                                                            handleEditKeyDown(
                                                                e,
                                                                chat.id,
                                                            )
                                                        }
                                                        onBlur={() =>
                                                            saveRename(chat.id)
                                                        }
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        }
                                                        className="w-full text-sm bg-bg border border-accent rounded px-1.5 py-0.5 outline-none"
                                                    />
                                                ) : (
                                                    <div className="text-sm text-text truncate">
                                                        {chat.title ||
                                                            "New chat"}
                                                    </div>
                                                )}
                                                <div className="text-xs text-text-muted mt-0.5">
                                                    {chat.messages?.length || 0}{" "}
                                                    messages
                                                </div>
                                            </div>

                                            {editingId !== chat.id && (
                                                <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                                                    <button
                                                        onClick={(e) =>
                                                            startEditing(
                                                                e,
                                                                chat,
                                                            )
                                                        }
                                                        aria-label="Rename chat"
                                                        title="Rename"
                                                        className="w-6 h-6 flex items-center justify-center rounded text-text-muted hover:text-accent hover:bg-surface"
                                                    >
                                                        <svg
                                                            width="13"
                                                            height="13"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        >
                                                            <path d="M12 20h9" />
                                                            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={(e) =>
                                                            requestDelete(
                                                                e,
                                                                chat.id,
                                                            )
                                                        }
                                                        aria-label="Delete chat"
                                                        title="Delete"
                                                        className="w-6 h-6 flex items-center justify-center rounded text-text-muted hover:text-error hover:bg-surface"
                                                    >
                                                        <svg
                                                            width="13"
                                                            height="13"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        >
                                                            <polyline points="3 6 5 6 21 6" />
                                                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                                            <path d="M10 11v6" />
                                                            <path d="M14 11v6" />
                                                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
