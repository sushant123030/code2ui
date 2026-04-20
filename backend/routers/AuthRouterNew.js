const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/UserModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const signToken = (user) => {
  return jwt.sign(
    { id: user._id, fullName: user.fullName || user.name },
    process.env.JWT_SECRET,
    { expiresIn: '1h' },
  );
};

const handleOAuthRedirect = (req, res) => {
  if (!req.user) {
    return res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
  }

  const token = signToken(req.user);
  return res.redirect(`${FRONTEND_URL}/auth/social?token=${encodeURIComponent(token)}`);
};

router.post('/signup', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Full name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      name: fullName,
      email,
      password: hashedPassword,
      provider: 'local',
    });

    const savedUser = await newUser.save();
    console.log(`New user created: ${email}`);

    const token = signToken(savedUser);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: savedUser._id,
        fullName: savedUser.fullName,
        email: savedUser.email,
      },
      token,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`Login attempt for non-existent user: ${email}`);
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.password) {
      console.log(`User ${email} has no password set`);
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`Invalid password for user: ${email}`);
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    const token = signToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        fullName: user.fullName || user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${FRONTEND_URL}/login?error=google_auth_failed`,
  }),
  handleOAuthRedirect,
);

router.get('/apple', passport.authenticate('apple'));

router.post(
  '/apple/callback',
  passport.authenticate('apple', {
    session: false,
    failureRedirect: `${FRONTEND_URL}/login?error=apple_auth_failed`,
  }),
  handleOAuthRedirect,
);

router.get(
  '/apple/callback',
  passport.authenticate('apple', {
    session: false,
    failureRedirect: `${FRONTEND_URL}/login?error=apple_auth_failed`,
  }),
  handleOAuthRedirect,
);

module.exports = router;
