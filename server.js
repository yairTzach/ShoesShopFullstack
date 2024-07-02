const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb://127.0.0.1:27018/authDB')
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));

app.use(bodyParser.json());
app.use(express.static('public'));

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your-email@gmail.com',
        pass: 'your-email-password'
    }
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
    console.log('Received registration data:', { username, password, email });

    try {
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, and one number.' });
        }

        const usernameRegex = /^[a-zA-Z0-9]{3,30}$/;
        if (!usernameRegex.test(username)) {
            return res.status(400).json({ message: 'Username must be between 3 and 30 characters and can only contain letters and numbers.' });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const verificationCode = crypto.randomBytes(3).toString('hex');
        const verificationCodeExpiry = Date.now() + 3600000; // 1 hour from now

        const user = new User({
            username,
            password: hashedPassword,
            email,
            verificationCode,
            verificationCodeExpiry
        });

        await user.save();

        const mailOptions = {
            from: 'your-email@gmail.com',
            to: email,
            subject: 'Email Verification Code',
            text: `Your verification code is ${verificationCode}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ message: 'Error sending verification email' });
            } else {
                console.log('Email sent: ' + info.response);
                return res.status(201).json({ message: 'Registration successful. Please check your email for the verification code.' });
            }
        });
    } catch (err) {
        console.error('Error registering new user:', err);
        res.status(500).json({ message: 'Error registering new user.', error: err.message });
    }
});

app.post('/verify', async (req, res) => {
    const { email, verificationCode } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or verification code' });
        }

        if (user.verificationCode !== verificationCode || Date.now() > user.verificationCodeExpiry) {
            return res.status(400).json({ message: 'Invalid or expired verification code' });
        }

        user.isVerified = true;
        user.verificationCode = undefined;
        user.verificationCodeExpiry = undefined;
        await user.save();

        res.status(200).json({ message: 'Email verification successful. Registration complete.' });
    } catch (err) {
        console.error('Error verifying email:', err);
        res.status(500).json({ message: 'Error verifying email.', error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
