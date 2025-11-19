import express from "express";
import userAuth from "../middleware/userAuth.js";
import { getUserData } from "../controller/userController.js";
import { chatBotController } from "../controller/chatBotController.js";

const userRouter = express.Router();

userRouter.get("/data", userAuth, getUserData);
userRouter.post("/chatbot", userAuth, chatBotController);

export default userRouter;
