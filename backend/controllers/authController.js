import User from "../models/User.js";
import argon2 from "argon2";
import { generateToken } from "../utils/jwtUtils.js"
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";
import Url from "../models/urlModel.js"; // Import the Url model
import { UAParser } from "ua-parser-js";
import getGeoInfo from "../utils/ipchecking.js";




 async function createUserHandler(req, res) {
    const { username, password, gmail } = req.body;

    if (!username || !password || !gmail) {
        return res.status(400).json({ error: "Username, password and gmail are required" });
    }
    try {
        const user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ error: "User already exists" });
        }
        const gmailExists = await User.findOne({ gmail });
        if (gmailExists) {
            return res.status(400).json({ error: "Gmail already exists" });
        }

        const hashedPassword = await argon2.hash(password, {
            type: argon2.argon2id
        });

        const newUser = new User({
            username,
            gmail,
            password: hashedPassword
        });

        await newUser.save();

        return res.status(201).json({
            message: "user created successfully",
            user: newUser // for temporary
        });

    } catch (err) {
        return res.status(500).json({ error: "Internal server error" });
    }
}


async function loginHandler(req, res) {
    const { gmail, password } = req.body;
    console.log("Login attempt with gmail:", gmail);
    if (!gmail || !password) {
        return res.status(400).json({ error: "Gmail and password are required" });
    }
    try {
        const user = await User.findOne({ gmail });
        if (!user) {
            return res.status(401).json({ error: "Invalid gmail" });
        }
        const isPasswordValid = await argon2.verify(user.password, password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid password" });
        }
        const payload = {
            id: user._id,
            username: user.username,
            gmail: user.gmail
        };
        const accessToken = generateToken(payload, process.env.JWT_SECRET, '15m');
        const refreshToken = generateToken(payload, process.env.JWT_REFRESH_SECRET, '7d');

        const userAgent = req.headers["user-agent"];
        const parser = new UAParser(userAgent);
        const result = parser.getResult();
            const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip;        
            console.log(`User Ip ${ip}`);        
       let location;
        if (ip === "127.0.0.1" || ip === "::1") {
            location = "localdev";
        } else {
            const details = await getGeoInfo(req);
            location = details.city ? details.city + ", " + details.country : details.country;
        }
        const userDevice = {
            deviceType: result.device.type || "Desktop", 
            os: result.os.name, 
            browser: result.browser.name,
            ip: ip,
            location: location
        };
        // store refresh token in user's refreshTokens array (one entry per device/session)
        user.refreshTokens = user.refreshTokens || [];
        user.refreshTokens.push({
            token: refreshToken,
            createdAt: Date.now(),
            device: userDevice
        });
        // keep top-level refreshToken for backward compatibility
        // user.refreshToken = refreshToken;
        await user.save();

        const isProd = process.env.PRODUCTION === 'true';
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: isProd,
            maxAge: 15 * 60 * 1000,
            sameSite: isProd ? 'none' : 'lax'
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: isProd,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: isProd ? 'none' : 'lax'
        });
        const date = new Date(user.createdAt).toLocaleString();
        const urlCount = await Url.countDocuments({ user: user._id });
        return res.status(200).json({
            message: "Login successful",
            user: {
                username: user.username,
                gmail: user.gmail,
                createdAt: date.split(",")[0],
                photo: user.profilePicture,
                urlCount    
            },
        });
    } catch (err) {
        console.log("Error during login:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function forgotPasswordHandler(req, res) {
    console.log("Forgot password request received");
    try {
        const { gmail } = req.body;
        if (!gmail) {
            return res.status(400).json({ error: "Gmail is required" });
        }
        const user = await User.findOne({ gmail });
        if (!user) {
            return res.status(200).json({
                message: 'If an account with that email exists, we have sent a password reset link.'
            });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const HashToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        user.resetPasswordToken = HashToken;
        user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; 
        await user.save();
        const isProd = process.env.PRODUCTION === 'true';
        const BaseUrl = isProd? process.env.FRONTEND_URL : 'http://localhost:5000';
        const resetURL = `${BaseUrl}/reset-password?token=${resetToken}`;

        const EmailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Password Reset</title>
                <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                <div class="header">
                    <h1>Password Reset Request</h1>
                </div>
                <div class="content">
                    <p>Hello,</p>
                    <p>We received a request to reset your password. Click the button below to reset it:</p>
                    <p style="text-align: center;">
                    <a href="${resetURL}" class="button">Reset Your Password</a>
                    </p>
                    <p><strong>This link will expire in 10 minutes.</strong></p>
                    <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
                    <p>For security reasons, please don't share this link with anyone.</p>
                </div>
                <div class="footer">
                    <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                    <p style="word-break: break-all;">${resetURL}</p>
                </div>
                </div>
            </body>
            </html>
        `;

        await sendEmail(gmail, "Password Reset Request", EmailHtml);

        return res.status(200).json({
            message: 'If an account with that email exists, we have sent a password reset link.'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function validateResetToken(req, res) {
    console.log("Validate reset token request received");
    console.log("Token received:", req.body.token); 
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ valid: false, message: 'Token is required' });
        }

        // Hash the token to compare with stored hash
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        console.log("Hashed token:", hashedToken); 

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        console.log("User found:", user ? "Yes" : "No"); // Debug log

        if (!user) {
            return res.status(400).json({ valid: false, message: 'Token is invalid or has expired' });
        }

        res.status(200).json({ valid: true });

    } catch (error) {
        console.error('Token validation error:', error);
        res.status(500).json({ valid: false, message: 'Internal server error' });
    }
}

async function resetPasswordHandler(req, res) {
    console.log("Reset password request received");
    console.log("Request Token:", req.body.token); // Debug log
    try {
        const { token, password } = req.body;

        // Validate input
        if (!token || !password) {
            return res.status(400).json({ message: 'Token and password are required' });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long' }); 
        }

        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            return res.status(400).json({
                message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
            });
        }

        // Hash the token to compare with stored hash
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        console.log("Hashed token for reset:", hashedToken); 
        // Find user with valid token that hasn't expired
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Token is invalid or has expired' });
        }

       
        const hashedPassword = await argon2.hash(password, {
            type: argon2.argon2id
        });

        user.password = hashedPassword;
        user.resetPasswordToken = undefined; 
        user.resetPasswordExpires = undefined;
        await user.save();

        //  Send confirmation email
        const EmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Password Reset Successful</h2>
          <p>Your password has been successfully reset. If you didn't make this change, please contact us immediately.</p>
          <p>For your security, we recommend:</p>
          <ul>
            <li>Using a unique password for this account</li>
            <li>Enabling two-factor authentication if available</li>
            <li>Not sharing your password with anyone</li>
          </ul>
        </div>
      `;
        await sendEmail(user.gmail, 'Password Reset Successful', EmailHtml);

        res.status(200).json({ message: 'Password reset successful' });

    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


async function updatePassword(req,res) {
    console.log('Update password request received');
    try{
        const {password,newPassword} = req.body;
        const userId = req.user.id;
        if(!password)
                return res.status(400).json({ message: 'Password is required' });
        if(!userId)
                return res.status(400).json({ message: 'User ID is required' });
        const user = await User.findById(userId);
        if(!user)
                return res.status(404).json({ message: 'User not found' });
        const check = await argon2.verify(user.password, password);
        if(!check)
                return res.status(401).json({ message: 'Invalid password' });
        const hashNewPassword = await argon2.hash(newPassword,{
            type: argon2.argon2id
        });
        user.password = hashNewPassword;
        await user.save();
        console.log('password updated successfully');
        return res.status(200).json({ message: 'Password updated successfully' });
    }catch(error){
        console.log('Error updating password:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function signoutHandler(req,res){
    try {
        // Check and remove refresh token from DB
        const refreshToken = req.cookies?.refreshToken;
        if (refreshToken) {
            await User.updateOne(
                { 'refreshTokens.token': refreshToken },
                { $pull: { refreshTokens: { token: refreshToken } } }
            );
        }
        // Clear cookies (match options used when setting them)
        const isProd = process.env.PRODUCTION === 'true';
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax'
        });
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax'
        });
        return res.status(200).json({ message: "Sign out Successfully done" });
    } catch (error) {
        console.error('Signout error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
 }


async function deleteAccountHandler(req,res){
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        await user.remove();
        return res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Error deleting account:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function checkUserLocationDetails(req, res) {
    try {
        const geoInfo = await getGeoInfo(req);
        if (geoInfo.error) {
            return res.status(500).json({ message: 'Failed to retrieve location information' });
        }
        console.log('User location details:', geoInfo);
        return res.status(200).json(geoInfo);
    } catch (error) {
        console.error('Error checking user location details:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export {
    createUserHandler,
    loginHandler,
    forgotPasswordHandler,
    validateResetToken,
    resetPasswordHandler,
    updatePassword,
    signoutHandler,
    deleteAccountHandler,
    checkUserLocationDetails
};