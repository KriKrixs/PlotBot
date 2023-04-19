/* Modules */
import { SlashCommandBuilder } from 'discord.js'
import fs from 'fs'

/**
 * CSGO command's data
 * This command configure some CSGO related stuff
 * @returns {SlashCommandBuilder} SlashCommand
 */
export const data = () => {
    return new SlashCommandBuilder()
        .setName('csgo')
        .setDescription('Configure some CSGO options on the bot')
        .addStringOption(option =>
            option.setName("action")
                .setDescription("The action you want to perform")
                .setRequired(true)
                .addChoices(
                    { name: "Enable Game State Integration", value: "enableGSI" },
                    { name: "Disable Game State Integration", value: "disableGSI" }
                )
        )
}

/**
 * CSGO command execution
 * @param interaction       Discord interaction
 * @returns {Promise<void>} Nothing
 */
export const execute = async (interaction, opt) => {
    // Allow more time to handle the interaction
    await interaction.deferReply({ ephemeral: true });

    // Fetch command's options
    const action = interaction.options.getString('action')

    // Fetch the user in the database
    const discordUserInDb = await opt.clients.mongo.findDocuments("users", { discordId: interaction.user.id })

    // If an error occurred while finding the user in the database
    if(discordUserInDb === false) {
        await this.loggers.logger.log("WARNING", fileName, "Can't retrieve the user in the database")

        // Reply to the interaction
        return interaction.editReply("Something went wrong")
    }

    if(discordUserInDb.length === 0) {
        // Reply to the interaction
        return interaction.editReply("There is no Steam account linked to this user")
    }

    if(action === "enableGSI") {
        const gsiCfg = fs.readFileSync("./csgo/gamestate_integration_plotbot.cfg", "utf8")

        const result = await opt.clients.mongo.updateDocument("users", { discordId: interaction.user.id }, { $set: { csgogsi: true } })

        // If an error occurred while updating the user in the database
        if(result === false) {
            await this.loggers.logger.log("WARNING", fileName, "Can't update the user in the database")

            // Reply to the interaction
            return interaction.editReply("Something went wrong")
        }

        const content = "Game State Integration has been fully activated on the bot side.\n\n" +
            "You now have to setup a file into your csgo files directory.\n\n" +
            "- Open your csgo files directory (On Steam, you can right click on the game, go to the properties, local files, browse)\n" +
            "- Go into the csgo/cfg folder\n" +
            "- Create a new file called `gamestate_integration_plotbot.cfg`.\n" +
            "- Copy and paste the following code.\n\n" +
            "```\n" +
            gsiCfg +
            "```\n\n" +
            "You can now restart your game"

        await interaction.editReply(content)
    }

    if(action === "disableGSI") {
        const result = await opt.clients.mongo.updateDocument("users", { discordId: interaction.user.id }, { $set: { csgogsi: false } })

        // If an error occurred while updating the user in the database
        if(result === false) {
            await this.loggers.logger.log("WARNING", fileName, "Can't update the user in the database")

            // Reply to the interaction
            return interaction.editReply("Something went wrong")
        }

        const content = "Game State Integration has been fully deactivated on the bot side.\n\n" +
            "You can now remove the file in your csgo files directory.\n\n" +
            "- Open your csgo files directory (On Steam, you can right click on the game, go to the properties, local files, browse)\n" +
            "- Go into the csgo/cfg folder\n" +
            "- Delete the file called `gamestate_integration_plotbot.cfg`.\n\n" +
            "You can now restart your game"

        await interaction.editReply(content)
    }
}