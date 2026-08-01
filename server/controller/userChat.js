import { set } from "mongoose";
import { randomUUID } from "crypto";
import userModel from "../models/userModel.js";

function extractFactsFromText(text = "") {
    const facts = [];

    try {
        // "i am X" / "i'm X" / "my name is X"
        const relAm = /\b(?:i am|i'm|my name is)\s+([A-Za-z0-9\s.'-]{1,80})/i;
        const m = text.match(relAm);
        if (m && m[0]) facts.push(m[0].trim());

        //"I like X" , "I love X"

        const relLike = /\b(?:i like|i love| i enjoy)\s+([A-Za-z0-9\s.'-]+)/i;
        const ml = text.match(relLike);
        if (ml && ml[0]) facts.push(ml[0].trim());

        //"i live in X" , I'm from X
        const reFrom =
            /\b(?:i live in|i'm from|i reside in|from)\s+([A-Za-z0-9\s.'-]+)/i;
        const mf = text.match(reFrom);
        if (mf && mf[0]) facts.push(mf[0].trim());

        //fallback short personal sentances

        if (
            text.length < 120 &&
            /\b(?:i am|i'm|my name is|i like|i love|i enjoy|i live in|i'm from|from|i reside in)\b/i.test(
                text,
            )
        ) {
            facts.push(text.trim());
        }
    } catch (error) {
        console.error("Error extracting facts:", error);
    }

    return [...new Set(facts)].map((s) => s.trim()).filter(Boolean);
}

async function addMessage(userId, chatId, messageText) {
    console.log("Adding message:", { userId, chatId, messageText });
    if (
        !userId ||
        !chatId ||
        !messageText ||
        !messageText.role ||
        !messageText.text
    ) {
        throw new Error("Invalid parameters provided to addMessage");
    }
    // Ensure timestamp is set
    messageText.timestamp = messageText.timestamp || new Date();

    // Add message to specific chat and update chat's updatedAt
    const updated = await userModel
        .findOneAndUpdate(
            { _id: userId, "chats.id": chatId },
            {
                $push: {
                    "chats.$.messages": messageText,
                },
                $set: {
                    "chats.$.updatedAt": new Date(),
                },
            },
            { new: true, select: "chats" },
        )
        .lean();

    if (messageText.role === "user") {
        const facts = extractFactsFromText(messageText.text || "");

        if (facts.length > 0) {
            await updateMemory(userId, facts);
        }
    }

    const chat = updated?.chats?.find((c) => c.id === chatId);

    // Auto-name the chat from the first user message, so users don't
    // have to look at a list of undifferentiated "New Chat" entries.
    if (
        chat &&
        messageText.role === "user" &&
        chat.messages.length === 1 &&
        (!chat.title || chat.title === "New Chat")
    ) {
        const autoTitle = generateChatTitle(messageText.text);
        await userModel.updateOne(
            { _id: userId, "chats.id": chatId },
            { $set: { "chats.$.title": autoTitle } },
        );
        if (chat) chat.title = autoTitle;
    }

    return chat ? chat.messages : [];
}

// Turns the first user message into a short chat title, e.g.
// "What's the best way to learn Rust in 2026?" -> "What's the best way to learn Rust in…"
function generateChatTitle(text) {
    const clean = String(text || "")
        .replace(/\s+/g, " ")
        .trim();
    const MAX_LEN = 42;
    if (clean.length <= MAX_LEN) return clean || "New Chat";
    return clean.slice(0, MAX_LEN).trim() + "…";
}

async function renameChat(userId, chatId, title) {
    const clean = String(title || "").trim();
    if (!userId || !chatId || !clean) {
        throw new Error("Invalid parameters provided to renameChat");
    }

    const updated = await userModel
        .findOneAndUpdate(
            { _id: userId, "chats.id": chatId },
            {
                $set: {
                    "chats.$.title": clean.slice(0, 80),
                    "chats.$.updatedAt": new Date(),
                },
            },
            { new: true, select: "chats" },
        )
        .lean();

    if (!updated) {
        throw new Error("Chat not found");
    }

    const chat = updated.chats.find((c) => c.id === chatId);
    if (!chat) {
        throw new Error("Chat not found");
    }
    return chat;
}

async function deleteChat(userId, chatId) {
    if (!userId || !chatId) {
        throw new Error("Invalid parameters provided to deleteChat");
    }

    const updated = await userModel
        .findByIdAndUpdate(
            userId,
            { $pull: { chats: { id: chatId } } },
            { new: true, select: "chats" },
        )
        .lean();

    if (!updated) {
        throw new Error("User not found");
    }

    return true;
}

async function getChatsAndMemory(userId) {
    if (!userId) {
        throw new Error("Invalid userId provided to getChatsAndMemory");
    }

    const user = await userModel.findById(userId).select("chats memory").lean();

    if (!user) {
        throw new Error("User not found");
    }
    return {
        chats: user.chats || [],
        memory: user.memory || { summary: "", facts: [], updatedAt: null },
    };
}

async function getChatMessages(userId, chatId) {
    if (!userId || !chatId) {
        throw new Error("Invalid userId or chatId provided to getChatMessages");
    }

    const user = await userModel
        .findOne({ _id: userId, "chats.id": chatId })
        .select("chats.$")
        .lean();

    if (!user || !user.chats || user.chats.length === 0) {
        throw new Error("Chat not found");
    }

    return user.chats[0].messages || [];
}

async function createNewChat(userId, title = "New Chat") {
    if (!userId) {
        throw new Error("Invalid userId provided to createNewChat");
    }

    const chatId = randomUUID();
    const newChat = {
        id: chatId,
        title,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const updated = await userModel.findByIdAndUpdate(
        userId,
        { $push: { chats: newChat } },
        { new: true, select: "chats" },
    );

    if (!updated) {
        throw new Error("User not found");
    }

    return newChat;
}

export {
    addMessage,
    getChatsAndMemory,
    getChatMessages,
    updateMemory,
    extractFactsFromText,
    createNewChat,
    renameChat,
    deleteChat,
};
