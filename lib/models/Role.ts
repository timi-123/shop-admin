import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
    clerkId: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["admin", "vendor", "user"],
        default: "user",
    },
    emailDomain: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

const Role = mongoose.models.Role || mongoose.model("Role", roleSchema);

export default Role;