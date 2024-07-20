const { exec } = require('child_process');

const updateBot = () => {
    exec('git pull', (error, stdout, stderr) => {
        if (error) {
            console.error(`Update failed: ${error.message}`);
            return;
        }

        if (stderr) {
            console.error(`Error: ${stderr}`);
            return;
        }

        console.log(`Update successful:\n${stdout}`);

        exec('pm2 restart bot', (error, stdout, stderr) => {
            if (error) {
                console.error(`Failed to restart bot: ${error.message}`);
                return;
            }

            if (stderr) {
                console.error(`Error: ${stderr}`);
                return;
            }

            console.log(`Bot restarted successfully:\n${stdout}`);
        });
    });
};

updateBot();
