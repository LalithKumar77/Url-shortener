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
    deleteAccountHandler
} from "../controllers/authController.js";

const router = express.Router();



router.post('/signup', createUserHandler);
router.post('/login', loginHandler);

router.use(verifyTokens);
router.post('/forgot-password', forgotPasswordHandler);
router.post('/validate-reset-token', validateResetToken);
router.post('/reset-password', resetPasswordHandler);
router.put('/update-password', updatePassword);
router.post('/logout', signoutHandler);
router.delete('/delete-account', deleteAccountHandler);

export default router;