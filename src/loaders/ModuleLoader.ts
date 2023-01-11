import chalk from 'chalk';
import EventEmitter from 'events';
import { Bot } from 'mineflayer';
import { basename } from 'path';
import BaseModule from '../classes/BaseModule';
import Logger from '../classes/Logger';
import { directoryScanner } from '../functions/directoryScanner';

export default class extends EventEmitter {

    private client: Bot;
    private logger = new Logger();
    public modules: BaseModule[] = [];

    constructor(client: Bot) {
        super();
        this.client = client;
        this.logger.prefix = chalk.blue("MODULE")
    }

    
    public loadFrom(dir: string) {

        // Scan the directory for files and folders
        const files = directoryScanner(dir, true, "module");

        for (const file of files) {
            this.registerModule(file);
        }
    }

    private registerModule(path: string) {
        const moduleConstructor = this.getModule(path);
        const module = new moduleConstructor(this.client) as BaseModule;
        const success = module.register();
        if (!success) throw new Error("Failed to register module " + path);
        
        this.modules.push(module);
        this.logger.info("Loaded module " + chalk.yellow(basename(path)));
    }

    private getModule(file: string) {
        let _a;
        return ((_a = require(file)).default ?? _a);
    }
}