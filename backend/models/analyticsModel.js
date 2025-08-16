import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema({
    urlId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Url",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    eventType: {
        type: String,
        enum: ["visit", "click"],
        default: "visit"
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    ip: {
        type: String,
        default: null
    },
    userAgent: {
        type: String,
        default: null
    },
    referrer: {
        type: String,
        default: null
    },
    country: {
        type: String,
        default: null
    }
});

const Analytics = mongoose.model("Analytics", analyticsSchema);

export default Analytics;
