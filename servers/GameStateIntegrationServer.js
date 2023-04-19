import CSGOGSI from "node-csgo-gsi"

export default class GameStateIntegrationServer {

    constructor(opt) {
        this.gsi = new CSGOGSI({
            port: opt.config.csgo.gsi.port,
            authToken: opt.config.csgo.gsi.authToken
        })
    }

    listen() {
        this.gsi.on("gameMap", (map) => {
            console.log(map)
        })
    }
}