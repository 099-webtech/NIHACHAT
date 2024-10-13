const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Route to handle user signup
router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Create a new user
    const newUser = new User({ name, email, password });
    try {
        await newUser.save();
        res.status(201).json({ message: 'Account created successfully!' });
    } catch (error) {
        if (error.name === 'ValidationError') {
            let errorMessage = '';

            // Check for required fields errors
            if (error.errors.name && error.errors.name.kind === 'required') {
                errorMessage = 'Name is required.';}
            else if (error.errors.email && error.errors.email.kind === 'required') {
                errorMessage = 'Email is required.';
            } else if (error.errors.password && error.errors.password.kind === 'required') {
                errorMessage = 'Password is required.';
            }

            // Check for password length validation error
            if (error.errors.password && error.errors.password.kind === 'minlength') {
                errorMessage = 'Minimum password length is 6.';
            }

            return res.status(400).json({ message: errorMessage });
        }

        // General server error handling
        res.status(500).json({ message: 'Error creating account' });
    }
});

// Route to handle user login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: 'User does not exist' });
    }

    // Check if the password is correct
    if (user.password !== password) {
        return res.status(401).json({ message: 'Invalid password' });
    }

    // Respond with success message
    
    res.status(200).json({ message: 'Login successful', name: user.name });
});

module.exports = router;
