export const chatBotController = async (req, res) => {
    const { message, threadId } = req.body;

    if (!message || !threadId) {
        return res
            .status(400)
            .json({ success: false, message: "Invalid request" });
    }

    try {
        const botResponse = await generate(message, threadId);

        return res
            .status(200)
            .json({
                success: true,
                message: "Bot response generated",
                data: botResponse,
            });
    } catch (error) {
        return res
            .status(500)
            .json({
                success: false,
                message: "Server Error",
                error: error.message,
            });
    }
};
