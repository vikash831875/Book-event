import { Router } from 'express';
import * as eventController from '../controllers/event.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import { verifyToken } from '../utils/jwt.js';
import prisma from '../config/db.js';

const router = Router();

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true },
    });
    if (user) {
      req.user = user;
    }
  } catch (error) {
    // Ignore invalid token for public event details
  }

  next();
};

router.get('/', eventController.getEvents);
router.get('/:id', optionalAuth, eventController.getEventById);
router.post(
  '/:id/book',
  authMiddleware,
  roleMiddleware('USER'),
  eventController.bookEvent
);

export default router;
