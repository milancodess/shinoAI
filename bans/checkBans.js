const fs = require('fs');
const https = require('https');
const path = require('path');
const localFilePath = path.join(__dirname, 'banned_users.json');

const ALLOWED_URL = 'https://raw.githubusercontent.com/milancodess/shinoBotG-ban/main/banned_users.json';

const fetchBannedUsers = () => {
    return new Promise((resolve, reject) => {
        https.get(ALLOWED_URL, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                
                const fetchedURL = res.headers.location || ALLOWED_URL;
                if (fetchedURL !== ALLOWED_URL) {
                    console.log('Invalid URL detected. Stopping the bot.');
                    process.exit(1);
                }
                resolve({ data: JSON.parse(data) });
            });
        }).on('error', reject);
    });
};

const readLocalFile = () => {
    if (fs.existsSync(localFilePath)) {
        return JSON.parse(fs.readFileSync(localFilePath, 'utf8'));
    }
    return null;
};

const compareBannedUsers = async () => {
    try {
        const remoteData = await fetchBannedUsers();
        const localData = readLocalFile();
        
        if (JSON.stringify(remoteData) !== JSON.stringify(localData)) {
            console.log('Banned users list has changed. Please update the local file.');
        } else {
            console.log('Banned users list is up to date.');
        }
    } catch (error) {
        console.error('Error fetching or comparing banned users:', error);
        process.exit(1); 
    }
};

setInterval(compareBannedUsers, 60000);

module.exports = {
    compareBannedUsers,
    fetchBannedUsers,
    readLocalFile
};
