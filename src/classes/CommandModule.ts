import { Bot } from "mineflayer";
import BaseModule from "./BaseModule";

export default abstract class CommandModule extends BaseModule {

    abstract readonly commandName: string;
    readonly prefix = "!";

    public register(): boolean {
        this.client.on("chat", (username, msg) => {

            if (!msg.startsWith(this.prefix)) return;
            const str = msg.slice(this.prefix.length);

            const args = str.split(/ +/g);
            const cmd = args.shift();

            if (this.commandName === cmd) {
                this.onCommand(username, args);
            }
        })
        return true;
    }

    public abstract onCommand(username: string, args: string[]) : void;
}