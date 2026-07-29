import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    verifyOtp: {
        type: String,
        default: "",
    },
    verifyOtpExpireAt: {
        type: Number,
        default: 0,
    },
    isAccountVerified: {
        type: Boolean,
        default: false,
    },
    resetOtp: {
        type: String,
        default: "",
    },
    resetOtpExpireAt: {
        type: Number,
        default: 0,
    },
    chats: [
        {
            id: {
                type: String,
                required: true,
            },
            title: {
                type: String,
                default: "New Chat",
            },
            messages: {
                type: [Object],
                default: [],
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
            updatedAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    memory: {
        summary: {
            type: String,
            default: "",
        },
        facts: {
            type: [String],
            default: [],
        },
        updatedAt: {
            type: Date,
            default: null,
        },
    },
});

const userModel = mongoose.model.user || mongoose.model("user", userSchema);

export default userModel;
