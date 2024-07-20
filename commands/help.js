module.exports = {
    config: {
        name: 'help',
        aliases: [],
        version: '1.0',
        author: 'MILAN',
        countDown: 0,
        role: 0,
        category: 'system',
        description: {
            en: 'Shows the list of available commands and their descriptions.',
        },
        guide: {
            en: '{pn} [command_name]',
        },
    },
    onStart: async function ({ api, event, args }) {
        const { threadID, messageID } = event;
        const commands = global.getCommands();
        const prefix = global.getPrefix();

        if (args.length === 0) {
            let message = 'Available commands:\n';
            for (let cmd in commands) {
                if (commands.hasOwnProperty(cmd) && commands[cmd].config.name === cmd) {
                    message += `\n${prefix}${cmd}`;
                    if (commands[cmd].config.aliases.length) {
                        message += ` (aliases: ${commands[cmd].config.aliases.join(', ')})`;
                    }
               
                    const description = commands[cmd].config.description && commands[cmd].config.description.en ? commands[cmd].config.description.en : 'No description available.';
                    message += `: ${description}`;
                }
            }
            return api.sendMessage(message, threadID, messageID);
        }

        const commandName = args[0].toLowerCase();
        const command = commands[commandName] || Object.values(commands).find(cmd => cmd.config.aliases.includes(commandName));

        if (!command) {
            return api.sendMessage(`No command found with name or alias: ${commandName}`, threadID, messageID);
        }

        const { name, version, countDown, author, category, description, guide } = command.config;

        const detailedDescription = description && description.en ? description.en : 'No description available.';
        const detailedGuide = guide && guide.en ? guide.en.replace('{pn}', prefix + name) : 'No guide available.';

        const detailedMessage = `
Name: ${name}
Version: ${version}
Cooldown: ${countDown}
Author: ${author}
Category: ${category}
Description: ${detailedDescription}
Guide: ${detailedGuide}
        `;
        return api.sendMessage(detailedMessage, threadID, messageID);
    }
};
