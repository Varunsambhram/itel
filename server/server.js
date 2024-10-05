const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Utility function to read users from file
const readUsersFromFile = () => {
    const usersFilePath = path.join(__dirname, 'users.json');
    const usersData = fs.readFileSync(usersFilePath, 'utf-8');
    return JSON.parse(usersData);
};

// Utility function to write users to file
const writeUsersToFile = (users) => {
    const usersFilePath = path.join(__dirname, 'users.json');
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
};

// API endpoint for login
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const users = readUsersFromFile();

    const user = users.find(user => user.email === username && user.password === password);
    if (user) {
        res.json({ message: 'Login successful', redirectUrl: '/index.html' });
    } else {
        console.log(`Invalid login attempt: ${username}`);  // Log invalid attempts for troubleshooting
        res.status(401).send('Invalid username or password');
    }
});

// API endpoint for signup
app.post('/api/auth/signup', (req, res) => {
    const { email, firstName, lastName, dob, password } = req.body;
    const users = readUsersFromFile();

    if (users.find(user => user.email === email)) {
        res.status(400).send('Email already exists');
        return;
    }

    const newUser = { email, firstName, lastName, dob, password };
    users.push(newUser);

    writeUsersToFile(users);
    res.json({ message: 'Signup successful' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
