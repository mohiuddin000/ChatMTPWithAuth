import express from "express";
import userAuth from "../middleware/userAuth.js";
import {
    getHistory,
    createChat,
    getmessages,
    getChatMessages,
} from "../controller/chat.js";

const chatRouter = express.Router();

chatRouter.post("/:userId/message", userAuth, getmessages);
chatRouter.get("/:userId/history", userAuth, getHistory);
chatRouter.post("/:userId/newchat", userAuth, createChat);
chatRouter.get("/:userId/messages/:chatId", userAuth, getChatMessages);

export default chatRouter;
