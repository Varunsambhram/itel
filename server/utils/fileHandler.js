const fs = require('fs');
const path = require('path');

// Path to the users.json file
const usersFilePath = path.join(__dirname, '../users.json');

// Function to read the users.json file
function readUsers() {
    try {
        if (!fs.existsSync(usersFilePath)) {
            fs.writeFileSync(usersFilePath, JSON.stringify([]));
        }
        const usersData = fs.readFileSync(usersFilePath);
        return JSON.parse(usersData);
    } catch (error) {
        console.error('Error reading users.json:', error);
        return [];
    }
}

// Function to write to the users.json file
function writeUsers(users) {
    try {
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    } catch (error) {
        console.error('Error writing to users.json:', error);
    }
}

module.exports = {
    readUsers,
    writeUsers
};
