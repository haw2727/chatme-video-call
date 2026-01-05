import mongoose from 'mongoose';

const groupChatSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: "" },
    avatar: { type: String, default: "" },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isPrivate: { type: Boolean, default: false },
    maxMembers: { type: Number, default: 100 },
    settings: {
        allowMemberInvite: { type: Boolean, default: true },
        allowMediaSharing: { type: Boolean, default: true },
        muteNotifications: { type: Boolean, default: false }
    }
}, { timestamps: true });

const GroupChat = mongoose.model('GroupChat', groupChatSchema);

export default GroupChat;