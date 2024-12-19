const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// MySQL Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Replace with your MySQL username
    password: '', // Replace with your MySQL password
    database: 'web', // Replace with your database name
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Database Connection Error:', err);
        process.exit(1); // Exit the application if connection fails
    }
    console.log('Connected to MySQL database!');
});

// Default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // Assuming an index.html file exists
});

// Handle signup
app.post('/signup', (req, res) => {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    // Insert user into the database
    const query = 'INSERT INTO userm (name, email, password) VALUES (?, ?, ?)';
    db.query(query, [name, email, password], (err, results) => {
        if (err) {
            console.error('Database Error:', err);
            return res.status(500).json({ error: 'Failed to register user.' });
        }

        // Redirect to the landing page
        res.redirect('/landing.html');
    });
});

// Handle login
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const query = 'SELECT * FROM userm WHERE email = ?';
    db.query(query, [email], (err, results) => {
        if (err) {
            console.error('Database Error:', err);
            return res.status(500).json({ error: 'Failed to log in.' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const user = results[0];

        // Compare plain-text passwords
        if (password !== user.password) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        res.json({ message: 'Login successful.', redirect: '/landing.html' });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
