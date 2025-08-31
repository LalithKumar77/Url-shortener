import mongoose from "mongoose";

const urlSchema = new mongoose.Schema({
    shortId: {
        type: String,
        required: true,
        unique: true
    },
    redirectUrl: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    history: [{ timestamp: { type: Number } }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    password:{
        type:String,
        default: null
    },
    expireAt:{
        type: Date,
        default:null
    },
    qrCode: {
        type: String,
        default: null
    }
}, { timestamps: true });

// TTL index for guest URLs (user: null)
urlSchema.index(
    { createdAt: 1 },
    { expireAfterSeconds: 1800, partialFilterExpression: { user: null } }
);

const Url = mongoose.model('Url', urlSchema);

export default Url;