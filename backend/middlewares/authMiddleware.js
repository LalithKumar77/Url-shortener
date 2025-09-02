import { verifyToken,generateToken } from "../utils/jwtUtils.js";
import User from "../models/User.js";

async function  verifyTokens(req,res,next){
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;
    if(!accessToken && !refreshToken){
        console.log("No tokens provided");
        return res.status(401).json({message:"unAuthorized Acess"});
    }
    if(accessToken && !refreshToken){
        console.log("Access token provided without refresh token");
    }
    const isAccessTokenValid = verifyToken(accessToken,process.env.JWT_SECRET);
    if(isAccessTokenValid){
        req.user = isAccessTokenValid;
        return next();
    }
    if(!isAccessTokenValid) console. log("Access token is invalid, checking refresh token");

    const isRefreshTokenValid = verifyToken(refreshToken,process.env.JWT_REFRESH_SECRET);
    if(!isRefreshTokenValid){
        console.log("Refresh token is invalid");
        return res.status(401).json({message:"Invalid Token"});
    }
    console.log("Refresh token is valid", isRefreshTokenValid);
    try {
        // find user where the refreshTokens array contains this token
        console.log("RefreshToken data before checking ",isRefreshTokenValid);
        const user = await User.findOne({ _id: isRefreshTokenValid.id, 'refreshTokens.token': refreshToken });
        if(!user){
            console.log('user not found in auth middleware', user);
            return res.status(403).json({message:"User not found"});
        }
        const payload = {
            id: user._id,
            username: user.username
        };
        const newAccessToken = generateToken(payload, process.env.JWT_SECRET, '15m');
        const newRefreshToken = generateToken(payload, process.env.JWT_REFRESH_SECRET, '7d');
        // replace the old refresh token in the refreshTokens array with the new one
        await User.updateOne(
            { _id: user._id, 'refreshTokens.token': refreshToken },
            { $set: { 'refreshTokens.$.token': newRefreshToken, 'refreshTokens.$.createdAt': Date.now() } }
        );
        // update top-level refreshToken for backward compatibility
        // user.refreshToken = newRefreshToken;
        // Removing expired refresh tokens before saving
        const now = Date.now();
        user.refreshTokens = user.refreshTokens.filter(rt => {
            try {
                const payload = verifyToken(rt.token, process.env.JWT_REFRESH_SECRET);
                return payload && payload.exp * 1000 > now;
            } catch {
                return false;
            }
        });
        await user.save();
        // set new cookies
        const isProd = process.env.PRODUCTION === 'true';
        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax',
            maxAge: 15 * 60 * 1000
        });
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        console.log("Tokens rotated successfully");
        req.user = payload;
        next();
    } catch (error) {
        console.error("Token rotation error:", error);
        return res.status(500).json({message:"Internal Server Error"});
    }
}

export default verifyTokens;