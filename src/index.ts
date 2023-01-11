import { createBot } from "mineflayer";
import { join } from "path";
import ModuleLoader from "./loaders/ModuleLoader";
import { pathfinder } from "mineflayer-pathfinder";
import Settings from "./misc/Settings";

const settings = new Settings();

(async () => {
    const bot = createBot({
        username: 'TestBot',
        host: 'localhost',
        port: 25565
    });

    // Loading plugins
    bot.loadPlugin(pathfinder);

    // Temporary events
    bot.on('kicked', reason => console.log("kicked: " + reason));
    bot.on('error', err => console.log("error: " + err));
    
    // Load modules
    const moduleLoader = new ModuleLoader(bot);
    moduleLoader.loadFrom(join(__dirname, 'modules'));
})();

export { 
    settings
}