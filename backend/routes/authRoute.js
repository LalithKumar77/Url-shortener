import express from "express";
import verifyTokens from "../middlewares/authMiddleware.js";
import {
    createUserHandler,
    loginHandler,
    forgotPasswordHandler,
    validateResetToken,
    resetPasswordHandler,
    updatePassword,
    signoutHandler,
    deleteAccountHandler,
    checkUserLocationDetails
} from "../controllers/authController.js";

const router = express.Router();



router.post('/signup', createUserHandler);
router.post('/login', loginHandler);
router.post('/logout', signoutHandler);
router.post('/forgot-password', forgotPasswordHandler);
router.post('/validate-reset-token', validateResetToken);
router.post('/reset-password', resetPasswordHandler);
router.put('/update-password', verifyTokens,updatePassword);

router.delete('/delete-account', deleteAccountHandler);
router.get('/check-location', checkUserLocationDetails);

export default router;