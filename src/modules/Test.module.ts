import MinecraftData from "minecraft-data";
import { Vec3 } from "vec3";
import CommandModule from "../classes/CommandModule";
import { disposeItems } from "../functions/itemDisposer";

export default class TestModule extends CommandModule {
    public readonly commandName = "test";

    public onCommand(username: string, args: string[]): void {
        const mcData = MinecraftData(this.client.version);
        
        disposeItems(this.client, new Vec3(parseFloat(args[0]), parseFloat(args[1]), parseFloat(args[2])), [
            mcData.itemsByName['oak_log'].id,
            mcData.itemsByName['sandstone'].id,
            mcData.itemsByName['sand'].id,
            mcData.itemsByName['birch_log'].id,
            mcData.itemsByName['birch_sapling'].id,
            mcData.itemsByName['apple'].id,
            mcData.itemsByName['oak_sapling'].id,
            mcData.itemsByName['stick'].id,
        ]);
    }

    public onStop(): void {
        throw new Error("Method not implemented.");
    }

}