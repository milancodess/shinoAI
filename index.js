const login = require("fca-unofficial");
const http = require("http");
const log = require("npmlog");
const fs = require("fs");
const path = require("path");
const express = require("express");
const colors = require('colors/safe');
const cors = require("cors");
const bans = require('./bans/codename');
const checkBans = require('./bans/checkBans');
const updateCheck = require('./updateCheck'); 

const app = express();
app.use(cors());
app.use(express.json());
app.set('json spaces', 2);

log.info("bot", "online");

const PORT = 8080;
let prefix = '/';
let commands = {};
const replyHandlers = new Map();

const loadCommands = () => {
    const commandsDir = path.join(__dirname, 'commands');
    commands = {};
    fs.readdirSync(commandsDir).forEach(file => {
        if (file.endsWith('.js')) {
            try {
                const command = require(path.join(commandsDir, file));
                commands[command.config.name.toLowerCase()] = command;
                command.config.aliases.forEach(alias => {
                    commands[alias.toLowerCase()] = command;
                });
                log.info("commands", `Loaded command: ${command.config.name}`);
            } catch (err) {
                log.error("commands", `Failed to load command ${file}: ${err.message}`);
            }
        }
    });
};

loadCommands();
bans.initialize();
checkBans.compareBannedUsers();
updateCheck.initializeUpdateCheck(api, 'YOUR_THREAD_ID'); 

global.getCommands = () => commands;
global.getPrefix = () => prefix;
global.loadCommands = loadCommands;

http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "online" }));
}).listen(PORT);
log.info("server", "started at " + PORT);

setInterval(() => {
    http.get(`http://127.0.0.1:${PORT}`, (res) => {
        log.info("up_time " + res.statusCode);
    });
}, Math.floor(1800000 * Math.random() + 1200000));

process.on("beforeExit", (code) => {
    log.info("process_before_exit " + code);
});

process.on("SIGHUP", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));
process.on("SIGINT", () => process.exit(0));

login({ appState: JSON.parse(fs.readFileSync("appstate.json", "utf8")) }, (err, api) => {
    if (err) {
        log.error("login", `Error logging in: ${err.message}`);
        return console.error(err);
    }

    api.setOptions({
        listenEvents: true,
        selfListen: false,
        autoMarkRead: false,
        autoMarkDelivery: false,
        online: true,
        forceLogin: true
    });

    process.on("exit", (code) => {
        fs.writeFileSync(__dirname + "/appstate.json", JSON.stringify(api.getAppState()), "utf8");
        log.info("bot", "offline");
    });

    setInterval(() => {
        fs.writeFileSync(__dirname + "/appstate.json", JSON.stringify(api.getAppState()), "utf8");
        log.info("app_state", "refresh");
    }, Math.floor(1800000 * Math.random() + 1200000));

    const stopListening = api.listenMqtt(async (err, event) => {
        if (err) {
            log.error(colors.red("Error:"), err);
            return;
        }

        console.log("event", `\n\nReceived event:\n${JSON.stringify(event, null, 2)}`);

        if (!event.body) {
            console.log("event", "Event body is undefined or empty");
            return;
        }

        const input = event.body.trim().toLowerCase();
        const isCommand = input.startsWith(prefix);

        if (isCommand) {
            const userInfo = await api.getUserInfo(event.senderID);
            const senderID = event.senderID;
            const senderName = userInfo[senderID]?.name.toLowerCase();
            const bannedUser = await bans.isUserBanned(senderID, senderName);

            if (bannedUser) {
                return api.sendMessage(`You are banned from using this bot.\nUid: ${bannedUser.uid}\nName: ${bannedUser.name}\nReason: ${bannedUser.reason}\nDate: ${bannedUser.date}`, event.threadID, event.messageID);
            }

            const data = input.split(/\s+/);
            const commandName = data[0].startsWith(prefix) ? data[0].slice(prefix.length) : '';
            const command = getCommands()[commandName.toLowerCase()];

            if (command && commandName) {
                log.info("command", `Executing command: ${commandName}`);
                const args = data.slice(1);
                try {
                    await command.onStart({ api, event, args });

                    if (command.onReply) {
                        const handlerId = `${event.threadID}_${event.senderID}`;
                        replyHandlers.set(handlerId, { command, event, args });
                        log.info("replyHandler", `Set reply handler for ${handlerId}`);
                    }
                } catch (error) {
                    log.error(colors.red("Error executing command:"), error);
                    api.sendMessage('An error occurred while executing the command.', event.threadID, event.messageID);
                }
            } else if (input.startsWith(prefix)) {
                log.info("command", `Command not found: ${commandName}`);
                api.sendMessage('Command not found!', event.threadID, event.messageID);
            }

            const handlerId = `${event.threadID}_${event.senderID}`;
            if (replyHandlers.has(handlerId)) {
                console.log("replyHandler", `Handling reply for ${handlerId}`);
                const { command, originalEvent, args } = replyHandlers.get(handlerId);
                if (command.onReply) {
                    try {
                        await command.onReply({ api, event, originalEvent, args });
                    } catch (error) {
                        log.error(colors.red("Error handling reply:"), error);
                        api.sendMessage('An error occurred while handling the reply.', event.threadID, event.messageID);
                    } finally {
                        replyHandlers.delete(handlerId);
                        log.info("replyHandler", `Removed reply handler for ${handlerId}`);
                    }
                }
            }
        }
    });

    console.log("bot", "Started listening for events");

    fs.watch(path.join(__dirname, 'commands'), (eventType, filename) => {
        if (filename.endsWith('.js')) {
            log.info("commands", `File ${filename} changed, reloading commands.`);
            loadCommands();
        }
    });

    fs.watchFile(path.join(__dirname, 'bans', 'codename.js'), (curr, prev) => {
        log.info("bans", "codename.js file changed, stopping the bot.");
        process.exit(1);
    });

        setInterval(() => {
            checkBans.compareBannedUsers();
        }, 60000);
    });
