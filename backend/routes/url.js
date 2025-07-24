import express from 'express';
import { generateShortUrl, getRedirectUrl } from '../controllers/urlController.js';

const router = express.Router();

router.post('/api/url', generateShortUrl);
router.get('/:shortId', getRedirectUrl);

export default router;