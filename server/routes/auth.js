// Endpoint to handle user signup
router.post('/signup', async (req, res) => {
    const { email, firstName, lastName, dob, password } = req.body;
    const users = readUsers();
    
    // Check if email already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        res.status(400).send('Email already exists');
    } else {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = { email, firstName, lastName, dob, password: hashedPassword, username: email }; // Set username to email
        users.push(newUser);
        writeUsers(users);
        res.json({ message: 'Signup successful! Please log in.' });
    }
});
