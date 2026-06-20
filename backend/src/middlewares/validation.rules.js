import { body } from 'express-validator';

export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

export const loginValidation = [
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const eventValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('venue').trim().notEmpty().withMessage('Venue is required'),
  body('eventDate').isISO8601().withMessage('Valid event date is required'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be greater than 0'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be 0 or greater'),
];

export const updateEventValidation = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('venue').optional().trim().notEmpty().withMessage('Venue cannot be empty'),
  body('eventDate').optional().isISO8601().withMessage('Valid event date is required'),
  body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be greater than 0'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be 0 or greater'),
];
