import { Router } from 'express';
import * as organizerController from '../controllers/organizer.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { eventValidation, updateEventValidation } from '../middlewares/validation.rules.js';

const router = Router();

router.use(authMiddleware, roleMiddleware('ORGANIZER'));

router.get('/dashboard', organizerController.getDashboard);
router.post('/events', eventValidation, validate, organizerController.createEvent);
router.patch('/events/:id', updateEventValidation, validate, organizerController.updateEvent);
router.get('/events', organizerController.getOrganizerEvents);
router.get('/events/:id/attendees', organizerController.getEventAttendees);
router.get('/events/:id/analytics', organizerController.getEventAnalytics);

export default router;
