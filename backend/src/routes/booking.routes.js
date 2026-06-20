import { Router } from 'express';
import * as bookingController from '../controllers/booking.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';

const router = Router();

router.use(authMiddleware, roleMiddleware('USER'));

router.get('/me', bookingController.getMyBookings);
router.delete('/:id', bookingController.cancelBooking);

export default router;
