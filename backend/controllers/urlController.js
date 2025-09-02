import shortid from 'shortid';
import QRCode from 'qrcode';
import Url from '../models/urlModel.js';
import Analytics from '../models/analyticsModel.js';
import getGeoInfo from '../utils/ipchecking.js';

export async function generateShortUrl(req,res) {
    console.log('generate shorturl function called');
    let userId;
    if(req.user){
        userId = req.user.id;
    }else{
        userId = null;
    }
    const shortId = shortid();
    const body = req.body;
    const baseUrl = process.env.FRONTEND_URL;
    if(!body.url){
        return res.status(400).json({error: 'Url is required'});
    }
    const check = await Url.findOne({ redirectUrl: body.url , user: userId });
    if(check){
        return res.status(200).json({ shortId: `${baseUrl}/${check.shortId}` });
    }
    
    await Url.create({
        shortId: shortId,
        redirectUrl:body.url,
        user: userId,
        visitHistory: [],
    });
    
    return res.status(201).json({ shortId: `${baseUrl}/${shortId}` });
}

export async function getRedirectUrl(req, res) {
    console.log(`getRedirectUrl called`);
    try {
        const urlEntry = req.urlEntry; 
        console.log('urlEntry:', urlEntry);
        if (!urlEntry) {
            return res.status(404).json({ error: 'URL not found' });
        }
        console.log("user: ", urlEntry.user);
        // Track analytics if user is existing
        if (urlEntry.user) {
            const userAgent = req.headers['user-agent'] || null;
            const referrer = req.headers['referer'] || null;
            const geoDetails = await getGeoInfo(req);
            const analyticsEntry = await Analytics.create({
                urlId: urlEntry._id,
                userId: urlEntry.user,
                ip: geoDetails.ip,
                userAgent,
                referrer,
                city: geoDetails.city || null,
                country: geoDetails.country || null
            });
            console.log('Analytics entry created:', analyticsEntry);
        }

        // Update history
        await Url.updateOne(
            { shortId: urlEntry.shortId },
            { $push: { history: { timestamp: Date.now() } } }
        );
        console.log(`Redirecting to: ${urlEntry.redirectUrl}`);
        return res.redirect(urlEntry.redirectUrl);
    } catch (error) {
        console.error('Error in getRedirectUrl:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}



export async function getUrlsByUserId(req,res) {
    console.log("entered in to getUrlsByUserId");
    try {
        const userId = req.user.id;
        const urls = await Url.find({ user: userId });
        if(!urls || urls.length === 0) {
            return res.status(404).json({ error: 'No URLs found for this user' });
        }
        const reponse = urls.map(url =>({
            shortId: url.shortId,
            redirectUrl: url.redirectUrl,
            history: url.history.map( h =>({
                date : new Date(h.timestamp).toLocaleString(),
            })),
            createdAt: (new Date(url.createdAt).toLocaleString()).split(",")[0],
            expireAt: url.expireAt ? (new Date(url.expireAt).toLocaleString()).split(",")[0] : null,
            passwordProtected: !!url.password,
            password: url.password
        }));
        return res.status(200).json(reponse);
    } catch (error) {
        console.error('Error in getUrlsByUserId:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
    
}


export async function createUrlPassword(req,res) {
    try {
        const {redirectUrl, password} = req.body;
        const userId = req.user.id;
         if(!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        if(!redirectUrl || typeof redirectUrl !== 'string') {
            return res.status(400).json({ error: 'URL is required' });
        }
        if(!password || password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }
        const user = await Url.findOneAndUpdate(
                     { user: userId, redirectUrl: redirectUrl },
                     {$set:{password:password}},
                     { new: true}
            );
        if(!user) {
            return res.status(404).json({ error: 'User not found' });
        }

       return res.status(200).json({ message: 'URL password created successfully', user });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

export async function createCustomAlias(req, res) {
    try {
        const { alias, redirectUrl } = req.body;
        const check = await Url.findOne({ shortId: alias });
        if (check) {
            return res.status(400).json({ message: "Given alias already present, enter another one" });
        }
        const url = await Url.create({
            shortId: alias,
            redirectUrl: redirectUrl,
            user: req.user.id,
            history: [],
            createdAt: Date.now(),
            expireAt: null,
        });
        return res.status(201).json({ message: "Custom alias created successfully", url });
    } catch (error) {
        return res.status(500).json({ message: error.message || error });
    }
}
export async function createAdvancedCustomUrl(req, res) {
    try {
        const { alias, redirectUrl, password, expireAt, qr } = req.body;
        // Validate redirectUrl
        if (!redirectUrl || typeof redirectUrl !== 'string') {
            return res.status(400).json({ message: "Redirect URL is required." });
        }
        // Validate alias if provided
        let shortId;
        if (alias) {
            const aliasRegex = /^[a-zA-Z0-9\-]{4,32}$/;
            if (!aliasRegex.test(alias)) {
                return res.status(400).json({ message: "Alias must be 4-32 characters, alphanumeric or dashes only." });
            }
            // Check uniqueness
            const check = await Url.findOne({ shortId: alias });
            if (check) {
                return res.status(400).json({ message: "Given alias already present, enter another one" });
            }
            shortId = alias;
        } else {
            shortId = shortid();
        }
        // Validate password if provided
        let passwordField = null;
        if (password) {
            if (typeof password !== 'string' || password.length < 6) {
                return res.status(400).json({ message: "Password must be at least 6 characters long." });
            }
            passwordField = password;
        }
        // Validate expireAt if provided
        let expireDate = null;
        if (expireAt) {
            const dateObj = new Date(expireAt);
            if (isNaN(dateObj.getTime())) {
                return res.status(400).json({ message: "Invalid expiration date." });
            }
            expireDate = dateObj;
        }
        // Generate QR code if requested
        let qrCodeDataUrl = null;
        if (qr) {
            try {
                qrCodeDataUrl = await QRCode.toDataURL(redirectUrl);
            } catch (err) {
                console.error('QR code generation error:', err);
            }
        }
        // Create URL with qrCode field
        const url = await Url.create({
            shortId,
            redirectUrl,
            user: req.user.id,
            history: [],
            password: passwordField,
            expireAt: expireDate,
            createdAt: Date.now(),
            qrCode: qrCodeDataUrl
        });
        return res.status(201).json({
            message: "Custom URL created successfully",
            url
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || error });
    }
}
export async function deleteShortUrl(req, res) {
    try {
        const { shortId } = req.params;
        if (!shortId) {
            return res.status(400).json({ message: "shortId is required" });
        }
        const url = await Url.findOneAndDelete({ shortId });
        if (!url) {
            return res.status(404).json({ message: "URL not found" });
        }
        // Delete analytics for this shortId
        await Analytics.deleteMany({ urlId: url._id });
        return res.status(200).json({ message: "Short URL and analytics deleted successfully", shortId });
    } catch (error) {
        return res.status(500).json({ message: error.message || error });
    }
}



export async function getQrCodeByShortId(req, res) {
    try {
        const { shortId } = req.params;
        if (!shortId) {
            return res.status(400).json({ message: "shortId is required" });
        }
        const url = await Url.findOne({ shortId });
        if (!url) {
            return res.status(404).json({ message: "URL not found" });
        }
        // If qrCode is stored, return it
        if (url.qrCode) {
            return res.status(200).json({ qrCode: url.qrCode });
        }
        // Otherwise, generate QR code on demand
        try {
            const qrCodeDataUrl = await QRCode.toDataURL(url.redirectUrl);
            return res.status(200).json({ qrCode: qrCodeDataUrl });
        } catch (err) {
            return res.status(500).json({ message: "QR code generation failed" });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message || error });
    }
}

export async function updateShortUrlDetails(req, res) {
    try {
        console.log("body", req.body);
        const { shortId } = req.params;
        const { redirectUrl, expireAt, password, alias } = req.body;
        if (!shortId) {
            console.log("shortId is required");
            return res.status(400).json({ message: "shortId is required" });
        }
        // Find the URL entry
        const url = await Url.findOne({ shortId });
        if (!url) {
            console.log("URL not found");
            return res.status(404).json({ message: "URL not found" });
        }
        // Update fields if provided
        if (redirectUrl) url.redirectUrl = redirectUrl;
        if (expireAt) {
            const dateObj = new Date(expireAt);
            if (isNaN(dateObj.getTime())) {
                return res.status(400).json({ message: "Invalid expiration date." });
            }
            url.expireAt = dateObj;
        }
        if (req.body.hasOwnProperty('password')) {
            if (!password) {
                url.password = null;
            } else {
                if (typeof password !== 'string' || password.length < 6) {
                    return res.status(400).json({ message: "Password must be at least 6 characters long." });
                }
                url.password = password;
            }
        }
        if (alias && alias !== shortId) {
            const aliasRegex = /^[a-zA-Z0-9\-]{4,32}$/;
            if (!aliasRegex.test(alias)) {
                return res.status(400).json({ message: "Alias must be 4-32 characters, alphanumeric or dashes only." });
            }
            const existing = await Url.findOne({ shortId: alias });
            if (existing) {
                return res.status(400).json({ message: "Alias already in use." });
            }
            url.shortId = alias;
        }
        await url.save();
        return res.status(200).json({ message: "Short URL updated successfully", url });
    } catch (error) {
        return res.status(500).json({ message: error.message || error });
    }
}

export async function getUrlClicksByDayAndCountry(req, res) {
    try {
        const userId = req.user.id;
        const urls = await Url.find({ user: userId });
        if (!urls || urls.length === 0) {
            return res.status(404).json({ error: 'No URLs found for this user' });
        }

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 6);

        // Get all analytics for these URLs in the last 7 days
        const urlIds = urls.map(url => url._id);
        const analytics = await Analytics.find({
            urlId: { $in: urlIds },
            timestamp: { $gte: oneWeekAgo }
        });

        const result = urls.map(url => {
            // Clicks by day from analytics
            const clicksByDay = {};
            const countryStats = {};
            const uniqueIps = new Set();

            analytics
                .filter(a => a.urlId.toString() === url._id.toString())
                .forEach(a => {
                    // Day
                    const day = new Date(a.timestamp).toISOString().split('T')[0];
                    clicksByDay[day] = (clicksByDay[day] || 0) + 1;
                    // Country
                    if (a.country) {
                        countryStats[a.country] = (countryStats[a.country] || 0) + 1;
                    }
                    // Unique IPs
                    if (a.ip) {
                        uniqueIps.add(a.ip);
                    }
                });

            return {
                shortId: url.shortId,
                clicksByDay,
                countryStats,
                uniqueVisitorCount: uniqueIps.size
            };
        });

        return res.status(200).json({ urls: result });
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}