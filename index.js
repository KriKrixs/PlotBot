/* Modules */
import { ActivityType, Events } from "discord.js"
import SteamUser from "steam-user";
import CSGO from "globaloffensive"

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
import GlobalOffensive from "globaloffensive";

/**
 * PlotBot class
 */
class PlotBot {

    /**
     * PlotBot's constructor
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

        this.steamUser  = new SteamUser()
        this.csgo       = new CSGO(this.steamUser)

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

        this.steamUser.logOn({
            anonymous: true
        })

        // this.csgo.on("debug", async (e) => {
        //     await this.loggers.logger.log("INFO", this.constructor.name, e.message)
        // })
        //
        // this.steamUser.on("error", async (e) => {
        //     await this.loggers.logger.log("CRITICAL", this.constructor.name, e.message)
        // })



        this.steamUser.on("loggedOn", async () => {
            await this.loggers.logger.log("INFO", this.constructor.name, "Logged into steam")

            this.steamUser.setPersona(SteamUser.EPersonaState.Online)
            this.steamUser.gamesPlayed([730])

            this.csgo.on("connectionStatus", async (e) => {
                await this.loggers.logger.log("INFO", this.constructor.name, e.message)

                this.csgo.on("connectedToGC", async () => {
                    await this.loggers.logger.log("INFO", this.constructor.name, "Connected to CS Game Coordinator")
                })
            })
        })

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
new PlotBot()