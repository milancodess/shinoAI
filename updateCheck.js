const axios = require('axios');
const { exec } = require('child_process');

const REPO_OWNER = 'milancodess';
const REPO_NAME = 'shinoAI';
const GITHUB_API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/commits/main`;

const checkForUpdates = async (api, threadID) => {
    try {
        const response = await axios.get(GITHUB_API_URL);
        const latestCommit = response.data.sha;

        let currentCommit;
        try {
            currentCommit = fs.readFileSync('current_commit.txt', 'utf8').trim();
        } catch (err) {
            currentCommit = null;
        }

        if (latestCommit !== currentCommit) {
            fs.writeFileSync('current_commit.txt', latestCommit, 'utf8');

            api.sendMessage('An update is available. Run "node update" to update the bot.', threadID);
        }
    } catch (error) {
        console.error('Failed to check for updates:', error.message);
    }
};

const initializeUpdateCheck = (api, threadID) => {
    checkForUpdates(api, threadID);
    setInterval(() => checkForUpdates(api, threadID), 3600000); 
};

module.exports = {
    initializeUpdateCheck
};
