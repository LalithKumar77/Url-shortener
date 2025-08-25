import shortid from 'shortid';
import Url from '../models/urlModel.js';
import { verifyToken } from '../utils/jwtUtils.js';

export async function generateShortUrl(req,res) {
    console.log('generate shorturl function called');
    const userId = req.user.id; 
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
        const urlEntry = req.urlEntry; // Use urlEntry from middleware
        if (!urlEntry) {
            return res.status(404).json({ error: 'URL not found' });
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