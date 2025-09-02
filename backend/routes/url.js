import express from 'express';
import { 
    generateShortUrl, 
    getRedirectUrl,
    getUrlsByUserId,
    createUrlPassword,
    createCustomAlias,
    createAdvancedCustomUrl,
    getQrCodeByShortId,
    updateShortUrlDetails,
    getUrlClicksByDayAndCountry,
    deleteShortUrl
} from '../controllers/urlController.js';
import verifyTokens from '../middlewares/authMiddleware.js';
import { passwordFormMiddleware } from '../middlewares/urlPasswordMiddleware.js';
const router = express.Router();

router.post('/api/url',generateShortUrl);
router.all('/:shortId', passwordFormMiddleware, getRedirectUrl);


router.use(verifyTokens);
router.put('/api/user/url/:shortId', updateShortUrlDetails);
router.get('/api/user/urls', getUrlsByUserId);
router.post('/api/user/url/alias', createCustomAlias);
router.post('/api/user/url/password', createUrlPassword);
router.delete('/api/user/url/:shortId', deleteShortUrl);
router.post('/api/user/url/advanced', createAdvancedCustomUrl);
router.get('/api/url/:shortId/qr', getQrCodeByShortId);
router.get('/api/user/url/analytics', getUrlClicksByDayAndCountry);

export default router;