import { generate } from "../chatbot_toolCaling/chatBot.js";
import {
    addMessage,
    getChatsAndMemory,
    getChatMessages as getChatMessagesFromDB,
    createNewChat,
} from "./userChat.js";

const getmessages = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role, text: rawText, chatId } = req.body;
        const text = String(rawText || "").trim();
        console.log("Received message:", { userId, role, text, chatId });

        if (!role || !text) {
            return res
                .status(400)
                .json({ error: "role and text required and cannot be empty" });
        }

        let currentChatId = chatId;
        if (!currentChatId) {
            // Create a new chat if no chatId provided
            const newChat = await createNewChat(userId);
            currentChatId = newChat.id;
        }

        // Add user message to history
        const userMessage = { role: "user", text, timestamp: new Date() };
        await addMessage(userId, currentChatId, userMessage);

        // Get chatbot response
        const botResponse = await generate(text, userId);

        // Add assistant response to history
        const assistantMessage = {
            role: "assistant",
            text: botResponse,
            timestamp: new Date(),
        };
        const messages = await addMessage(
            userId,
            currentChatId,
            assistantMessage
        );

        return res.json({
            ok: true,
            messages,
            response: botResponse,
            chatId: currentChatId,
        });
    } catch (error) {
        console.error("POST GETMESSAGES", error);
        if (error.message && error.message.includes("Invalid parameters")) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(500).json({ error: "Internal server error" });
    }
};

const getHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const data = await getChatsAndMemory(userId);
        return res.json({ ok: true, data });
    } catch (error) {
        console.error("GET HISTORY ERROR", error);
        if (error.message && error.message.includes("User not found")) {
            return res.status(404).json({ error: error.message });
        }

        return res.status(500).json({ error: "Internal server error" });
    }
};

const createChat = async (req, res) => {
    try {
        const { userId } = req.params;
        const history = await createNewChat(userId);
        return res.json({ ok: true, history });
    } catch (error) {
        console.error("CREATE CHAT ERROR", error);
        if (error.message && error.message.includes("User not found")) {
            return res.status(404).json({ error: error.message });
        }

        return res.status(500).json({ error: "Internal server error" });
    }
};

const getChatMessages = async (req, res) => {
    try {
        const { userId, chatId } = req.params;
        const messages = await getChatMessagesFromDB(userId, chatId);
        return res.json({ messages });
    } catch (error) {
        console.error("GET CHAT MESSAGES ERROR", error);
        if (error.message && error.message.includes("Chat not found")) {
            return res.status(404).json({ error: error.message });
        }

        return res.status(500).json({ error: "Internal server error" });
    }
};

export { getmessages, getHistory, createChat, getChatMessages };
