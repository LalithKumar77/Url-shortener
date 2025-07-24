import shortid from 'shortid';
import Url from '../models/urlModel.js';

export async function generateShortUrl(req,res) {
    const shortId = shortid();
    const body = req.body;
    const baseUrl = `https://shorturl-kohl.vercel.app`;
    if(!body.url){
        return res.status(400).json({error: 'Url is required'});
    }
    const check = await Url.findOne({ redirectUrl: body.url });
    if(check){
        return res.status(200).json({ shortId: `${baseUrl}/${check.shortId}` });
    }
    
    await Url.create({
        shortId: shortId,
        redirectUrl:body.url,
        visitHistory: [],
    });
    
    return res.status(201).json({ shortId: `${baseUrl}/${shortId}` });
}

export async function getRedirectUrl(req, res) {
    console.log(`getRedirectUrl called`);
    try {
        const shortId = req.params.shortId;
        const url = await Url.findOneAndUpdate(
            { shortId: shortId },
            {
                $push: { history: { timestamp: Date.now() } }
            }
        );
        if (!url) {
            return res.status(404).json({ error: 'Url not found' });
        }
        return res.redirect(url.redirectUrl);
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
