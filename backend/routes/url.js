import express from 'express';
import { 
    generateShortUrl, 
    getRedirectUrl,
    getUrlsByUserId,
    createUrlPassword,
    createCustomAlias
} from '../controllers/urlController.js';
import verifyTokens from '../middlewares/authMiddleware.js';
import { passwordFormMiddleware } from '../middlewares/urlPasswordMiddleware.js';
const router = express.Router();

router.post('/api/url',verifyTokens,generateShortUrl);
router.all('/:shortId', passwordFormMiddleware, getRedirectUrl);


router.get('/api/user/urls', verifyTokens, getUrlsByUserId);
router.post('/api/user/url/alias',verifyTokens,createCustomAlias);
router.post('/api/user/url/password', verifyTokens, createUrlPassword);

export default router;