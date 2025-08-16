import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique:true
    },
    gmail:{
        type: String,
        required: true,
        unique:true
    },
    password:{
        type:String,
        required: true
    },
    refreshToken: {
      type: String,
      default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    profilePicture: {
        type: String,
        default: null
    },
    resetPasswordToken:{
        type: String,
        default: null
    },
    resetPasswordExpires:{
        type: Date, 
        default: null
    }
});

const User = mongoose.model("User", userSchema);

export default User;