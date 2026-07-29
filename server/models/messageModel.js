import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        role: {
            type: String,
            enum: ["user", "assistant "],
            required: true,
        },

        text: {
            type: String,
            required: true,
        },
        timeStamps: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: false }
);

const messageModel =
    mongoose.model.message || mongoose.model("message", messageSchema);

export default messageModel;
