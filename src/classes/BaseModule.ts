import { Bot } from "mineflayer";

export default abstract class BaseModule {

    public client: Bot;

    constructor(client: Bot) {
        this.client = client;
    }

    public abstract register() : boolean;

    public abstract onStop() : void;
}