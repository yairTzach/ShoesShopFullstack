const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb://127.0.0.1:27018/authDB')
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));

app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
    console.log('Received registration data:', { username, password, email });

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            username,
            password: hashedPassword,
            email
        });

        await user.save();
        res.status(201).json({ message: 'Registration successful. Good luck!' });
    } catch (err) {
        console.error('Error registering new user:', err);
        res.status(500).json({ message: 'Error registering new user.', error: err.message });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        res.status(200).json({ message: 'Login successful' });
    } catch (err) {
        res.status(500).json({ message: 'Error logging in' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
