import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import validate from '../middlewares/validate.middleware.js';
import { registerValidation, loginValidation } from '../middlewares/validation.rules.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);
router.post('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.getMe);

export default router;
