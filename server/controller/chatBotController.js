import { generate } from "../chatbot_toolCaling/chatBot.js";

export const chatBotController = async (req, res) => {
    try {
        console.log("chatBotController called with body:", req.body);
        const { message, threadId } = req.body;

        if (
            !message ||
            typeof message !== "string" ||
            message.trim().length === 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid request: `message` is required",
            });
        }

        const MAX_LEN = 3000;
        let userMessage = message.trim();
        if (userMessage.length > MAX_LEN) {
            userMessage = userMessage.slice(0, MAX_LEN);
        }

        const tid =
            threadId && typeof threadId === "string" ? threadId : "default";

        const botResponse = await generate(userMessage, tid);

        return res.status(200).json({
            success: true,
            message: "Bot response generated",
            data: botResponse,
        });
    } catch (error) {
        console.error("chatBotController error:", error);
        return res.status(500).json({
            success: false,
            message: "Server Error",
            error: error?.message ?? "Unknown error",
        });
    }
};
