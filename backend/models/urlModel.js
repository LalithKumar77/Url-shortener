import mongoose from "mongoose";

const urlSchema = mongoose.Schema({
    shortId: {
        type: String,
        required: true,
        unique: true
    },
    redirectUrl: {
        type: String,
        required: true
    },
    history: [ {timestamp: {type: Number}}],
},{timestamps: true});

const Url = mongoose.model('Url', urlSchema);


export default Url;