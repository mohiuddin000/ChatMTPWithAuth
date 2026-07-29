import mongoose from "mongoose";

const memorySchema = new mongoose.Schema(
    {
        summary: {
            type: String,
            default: "",
        },
        fact: {
            type: [String],
            default: [],
        },
        updatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: false }
);

const memmoryModel =
    mongoose.model.memory || mongoose.model("memory", memorySchema);

export default memmoryModel;
