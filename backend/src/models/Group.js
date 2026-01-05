import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: "" },
    avatar: { type: String, default: "" },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isPrivate: { type: Boolean, default: false },
    maxMembers: { type: Number, default: 100 },
    streamChannelId: { type: String, unique: true }
}, { timestamps: true });

const Group = mongoose.model('Group', groupSchema);

export default Group;