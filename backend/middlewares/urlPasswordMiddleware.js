import Url from '../models/urlModel.js';

export async function passwordFormMiddleware(req, res, next) {
    try {
        const { shortId } = req.params;
        const urlEntry = await Url.findOne({ shortId });
        if (!urlEntry) {
            return res.status(404).send('URL not found');
        }

        // If no password, allow redirect
        if (!urlEntry.password) {
            req.urlEntry = urlEntry;
            return next();
        }

        // Show password form on GET
        if (req.method === 'GET') {
            const error = req.query.error ? '<p style="color:red;">Incorrect password, try again</p>' : '';
            return res.send(`
                <h2>This URL is password protected</h2>
                ${error}
                <form method="POST" action="/${shortId}">
                    <input type="password" name="password" placeholder="Enter password" required />
                    <button type="submit">Unlock</button>
                </form>
            `);
        }

        // Validate password on POST
        if (req.method === 'POST') {
            const { password } = req.body;
            if (!password) {
                return res.status(400).send('Password is required');
            }
            // Trim both passwords to avoid whitespace issues
            if (urlEntry.password.trim() !== password.trim()) {
                return res.redirect(`/${shortId}?error=incorrect-password`);
            }
            
            // Check if URL has expired
            if (urlEntry.expireAt && new Date() > urlEntry.expireAt) {
                return res.status(410).send(`
                    <h2>URL Expired</h2>
                    <p>This URL has expired and is no longer accessible.</p>
                `);
            }
            
            // Update visit history
            await Url.updateOne(
                { shortId: urlEntry.shortId },
                { $push: { history: { timestamp: Date.now() } } }
            );
            
            // For external redirects after POST, use meta refresh for better browser compatibility
            return res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta http-equiv="refresh" content="0; url=${urlEntry.redirectUrl}">
                    <title>Redirecting...</title>
                </head>
                <body>
                    <p>Redirecting to <a href="${urlEntry.redirectUrl}">${urlEntry.redirectUrl}</a>...</p>
                    <script>
                        window.location.replace("${urlEntry.redirectUrl}");
                    </script>
                </body>
                </html>
            `);
        }

        return res.status(405).send('Method not allowed');
    } catch (error) {
        console.error('Error in passwordFormMiddleware:', error);
        return res.status(500).send('Internal Server Error');
    }
}