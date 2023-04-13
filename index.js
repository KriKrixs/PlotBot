/* Modules */
import { ActivityType, Events } from "discord.js"

/* Clients */
import DiscordClient from "./clients/DiscordClient.js"
import MongoDBClient from "./clients/MongoDBClient.js"
import SteamClient from "./clients/SteamClient.js"

/* Managers */
import CommandsManager from "./managers/CommandsManager.js"

/* Loggers */
import Logger from "./loggers/Logger.js"

/* Config */
import config from "./config.json" assert {"type": "json"}

/**
 * CSTrackerDiscord class
 */
class CSTrackerDiscord {

    /**
     * CSTrackerDiscord's constructor
     */
    constructor() {
        this.config     = config

        this.loggers    = {
            logger: new Logger(this)
        }

        this.clients    = {
            discord : new DiscordClient(this),
            mongo   : new MongoDBClient(this),
            steam   : new SteamClient(this)
        }

        this.managers   = {
            commands: new CommandsManager(this)
        }

        this.init()
    }

    /**
     * Initialize the bot
     * @returns {Promise<void>}
     */
    async init() {
        await this.loggers.logger.log("INFO", this.constructor.name, "Starting the bot")

        // Login the discord & mongo client
        this.clients.discord.loginClient()
        await this.clients.mongo.loginClient()

        // When the discord client is ready
        this.clients.discord.getClient().once(Events.ClientReady, async () => {
            await this.loggers.logger.log("INFO", this.constructor.name, "Discord is ready")

            // Set the presence activity
            await this.clients.discord.getClient().user.setPresence({
                activities: [{ name: 'your CS stats', type: ActivityType.Watching }]
            })

            // Load all the commands
            await this.managers.commands.load()

            await this.loggers.logger.log("INFO", this.constructor.name, "Bot is up!")
        })
    }
}

// Create a new instance of the discord bot
new CSTrackerDiscord()