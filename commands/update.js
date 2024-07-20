module.exports = {
    config: {
        name: 'update',
        aliases: [],
        version: '1.0',
        author: 'MILAN',
        countDown: 0,
        role: 0,
        category: 'system',
        description: {
            en: 'Updates the bot to the latest version.',
        },
        guide: {
            en: '{pn} update',
        },
    },
    onStart: async function ({ api, event }) {
        const { threadID, messageID } = event;

        const { exec } = require('child_process');
        exec('node update.js', (error, stdout, stderr) => {
            if (error) {
                console.error(`Update failed: ${error.message}`);
                return api.sendMessage('Update failed.', threadID, messageID);
            }

            if (stderr) {
                console.error(`Error: ${stderr}`);
                return api.sendMessage('Update failed.', threadID, messageID);
            }

            console.log(`Update successful:\n${stdout}`);
            return api.sendMessage('Bot updated successfully. Restarting...', threadID, messageID);
        });
    }
};
