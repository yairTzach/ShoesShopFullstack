const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallbackSecretKey',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/myDatabase', {
    connectTimeoutMS: 30000, // 30 seconds
    socketTimeoutMS: 30000, // 30 seconds
})
.then(() => {
    console.log('Connected to MongoDB');
})
.catch(err => {
    console.error('Error connecting to MongoDB:', err);
});

// User schema and model
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true }
});

userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);

// Input validation middleware
const validateLoginInput = (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    next();
};

const validateRegisterInput = (req, res, next) => {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
        return res.status(400).json({ message: 'Username, password, and email are required' });
    }
    next();
};

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});

app.post('/login', validateLoginInput, async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });

        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        req.session.userId = user._id;
        res.json({ message: 'Login successful' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'An error occurred during login' });
    }
});

app.post('/register', validateRegisterInput, async (req, res) => {
    const { username, password, email } = req.body;

    if (!validateEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    if (!validatePassword(password)) {
        return res.status(400).json({
            message: 'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one number'
        });
    }

    try {
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            const field = existingUser.username === username ? 'Username' : 'Email';
            return res.status(400).json({ message: `${field} already exists` });
        }

        const hashedPassword = bcrypt.hashSync(password, 8);
        const newUser = new User({ username, password: hashedPassword, email });
        await newUser.save();

        res.json({ message: 'Registration successful' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'An error occurred during registration' });
    }
});

// Helper functions
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validatePassword(password) {
    const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
    return regex.test(password);
}

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}).on('error', (error) => {
    console.error('Error starting server:', error);
});