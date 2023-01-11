import MinecraftData from "minecraft-data";
import { Vec3 } from "vec3";
import { settings } from "..";
import CommandModule from "../classes/CommandModule";
import { disposeItems } from "../functions/itemDisposer";

export default class TestModule extends CommandModule {
    public readonly commandName = "setting";

    public onCommand(username: string, args: string[]): void {

        const setting = (args[0] ?? "").toLowerCase();
        const values = args.slice(1);

        if (setting == "chests") {
            const location = values[2] ? new Vec3(parseFloat(values[0]), parseFloat(values[1]), parseFloat(values[2])) : this.client.players[username].entity.position;
            settings.chestsLocation = location;

            this.client.chat("Chest location changed to " + location.toString());
            return;
        }

        this.client.chat("Available settings are: ")
        this.client.chat("------------------------")
        this.client.chat(this.prefix + "chests [location] - sets the chests dropoff location to the specified location or your location")




        // const mcData = MinecraftData(this.client.version);
        
        // disposeItems(this.client, new Vec3(parseFloat(args[0]), parseFloat(args[1]), parseFloat(args[2])), [
        //     mcData.itemsByName['oak_log'].id,
        //     mcData.itemsByName['sandstone'].id,
        //     mcData.itemsByName['sand'].id,
        //     mcData.itemsByName['birch_log'].id,
        //     mcData.itemsByName['birch_sapling'].id,
        //     mcData.itemsByName['apple'].id,
        //     mcData.itemsByName['oak_sapling'].id,
        //     mcData.itemsByName['stick'].id,
        // ]);
    }

    public onStop(): void {
        throw new Error("Method not implemented.");
    }

}