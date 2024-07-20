const fs = require('fs');
const axios = require('axios');
const path = require('path');


const BANNED_USERS_FILE = path.join(__dirname, 'banned_users.json');
const ALLOWED_URL = 'https://raw.githubusercontent.com/milancodess/shinoBotG-ban/main/banned_users.json';

const bannedUsers = new Map();

const fetchBannedUsers = async () => {
    try {
        const response = await axios.get(ALLOWED_URL);
        const users = response.data;

        bannedUsers.clear();
        users.forEach(user => {
            bannedUsers.set(user.uid, {
                uid: user.uid,
                name: user.name,
                reason: user.reason,
                date: user.date
            });
        });

        fs.writeFileSync(BANNED_USERS_FILE, JSON.stringify([...bannedUsers.values()], null, 2), 'utf8');
        console.log("Banned users list updated.");
    } catch (error) {
        console.error("Failed to fetch banned users list:", error.message);
    }
};

const isUserBanned = async (userID, userName) => {
    const bannedUser = bannedUsers.get(userID);
    return bannedUser ? bannedUser : null;
};

const validateUrlInCodename = () => {
    try {
        const fileContent = fs.readFileSync(path.join(__dirname, 'codename.js'), 'utf8');
        const urlMatch = fileContent.match(/const ALLOWED_URL = ['"](.*?)['"]/);
        if (urlMatch && urlMatch[1]) {
            if (urlMatch[1] !== ALLOWED_URL) {
                console.error('Invalid URL detected in codename.js. Stopping the bot.');
                process.exit(1);
            }
        } else {
            throw new Error('URL not found in codename.js');
        }
    } catch (error) {
        console.error('Error reading codename.js:', error);
        process.exit(1); 
    }
};

const initialize = async () => {
    validateUrlInCodename();
    await fetchBannedUsers();
    setInterval(fetchBannedUsers, 3600000);
};

fs.watchFile(path.join(__dirname, 'codename.js'), (curr, prev) => {
    console.log('codename.js file changed, validating URL...');
    validateUrlInCodename();
});

module.exports = {
    initialize,
    isUserBanned
};
