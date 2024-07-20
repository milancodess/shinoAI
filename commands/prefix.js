module.exports = {
    config: {
        name: 'prefix',
        aliases: [],
        version: '1.0',
        author: 'MILAN',
        countDown: 0,
        role: 0,
        category: 'system',
        description: {
            en: 'Changes the command prefix.',
        },
        guide: {
            en: '{pn} [new_prefix]',
        },
    },
    onStart: async function ({ api, event, args }) {
        const { threadID, messageID } = event;
        if (args.length === 0) {
            return api.sendMessage(`Current prefix is: ${global.getPrefix()}`, threadID, messageID);
        }

        const newPrefix = args[0];
        if (!newPrefix) {
            return api.sendMessage('Invalid prefix.', threadID, messageID);
        }

        global.prefix = newPrefix;
        api.sendMessage(`Prefix changed to: ${newPrefix}`, threadID, messageID);
        console.log(colors.green(`Prefix changed to: ${newPrefix}`));
    }
};
