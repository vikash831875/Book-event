import asyncHandler from '../utils/asyncHandler.js';
import * as authService from '../services/auth.service.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const allowedRole = role === 'ORGANIZER' ? 'ORGANIZER' : 'USER';
  const { user, token } = await authService.registerUser({
    name,
    email,
    password,
    role: allowedRole,
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: { user, token },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await authService.loginUser({ email, password });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: { user, token },
  });
});

export const logout = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
});

export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: { user: req.user },
  });
});
