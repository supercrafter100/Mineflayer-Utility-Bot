import CommandModule from "../classes/CommandModule";
import { Movements, goals } from "mineflayer-pathfinder";
import MinecraftData from "minecraft-data";
import { Vec3 } from "vec3";
import getFreeSlots from "../functions/getFreeSlots";
import { disposeItems } from "../functions/itemDisposer";
import { settings } from "..";

export default class DiggerModule extends CommandModule {
    
    public readonly commandName = "dig";

    private x1: number | undefined;
    private x2: number | undefined;
    private y1: number | undefined;
    private y2: number | undefined;
    private z1: number | undefined;
    private z2: number | undefined;

    private stopped = false;

    public onStop(): void {
        this.stopped = true;
    }
    
    public async onCommand(username: string, args: string[]) {
        
        if (args.length < 6 || args.some(arg => isNaN(parseFloat(arg)))) {
            return this.client.chat('You have to provide the x, y and z coordinates of the two corners!')
        } 

        this.x1 = parseFloat(args[0]);
        this.y1 = parseFloat(args[1]);
        this.z1 = parseFloat(args[2]);

        this.x2 = parseFloat(args[3]);
        this.y2 = parseFloat(args[4]);
        this.z2 = parseFloat(args[5]);

        this.stopped = false;
        this.startDigging();
    }
    

    private async startDigging() {
        if (!this.x1 || !this.x2 || !this.y1 || !this.y2 || !this.z1 || !this.z2) {
            throw new Error("Coordinates were not all set!");
        }

        // Loop from top to bottom
        const minX = Math.min(this.x1, this.x2);
        const maxX = Math.max(this.x1, this.x2);

        const minY = Math.min(this.y1, this.y2);
        const maxY = Math.max(this.y1, this.y2);

        const minZ = Math.min(this.z1, this.z2);
        const maxZ = Math.max(this.z1, this.z2);

        let xAscending = true;
        let zAscending = true;

        for (let y = maxY; y >= minY; y--) { 
            for (let x = xAscending ? minX : maxX; xAscending ? x <= maxX : x >= minX; xAscending ? x++ : x--) {
                for (let z = zAscending ? minZ: maxZ; zAscending ? z <= maxZ : z >= minZ; zAscending ? z++ : z--) {
                    await this.digBlock(x, y, z);
                }
                zAscending = !zAscending;
            }
            xAscending = !xAscending;
        }
        
        this.client.chat("Done digging!");
    }
    
    private async moveTo(x: number, y: number, z: number, lookAt = false) {
        try {
            // Set movements
            const defaultMove = new Movements(this.client, MinecraftData(this.client.version));
            this.client.pathfinder.setMovements(defaultMove);
    
            // Get & set goal
            const goal = lookAt ? new goals.GoalLookAtBlock(new Vec3(x, y, z), this.client.world, { reach: 1 }) : new goals.GoalNear(x, y, z, 1.5);
            await this.client.pathfinder.goto(goal)
        } catch (err) {
            // Ignore
        }
    }

    private async digBlock(x: number, y: number, z: number) {
        const mcData = MinecraftData(this.client.version);
        
        const xyz = new Vec3(x, y, z);
        const block = this.client.blockAt(xyz);
        if (!block) {
            throw new Error("Block was null");
        }
        
        if (block?.type !== mcData.blocksByName["air"].id) {
            if (block.position.distanceTo(this.client.entity.position) >= 4) {
                await this.moveTo(x, y, z, false);
            }
            const bestHarvestTool = this.client.pathfinder.bestHarvestTool(block);
            if (bestHarvestTool) await this.client.equip(bestHarvestTool, 'hand');
            
            await this.client.dig(block, true, 'auto');
        }
        if (getFreeSlots(this.client) <= 1) {
            const disposedItems = [
                mcData.itemsByName['dirt'].id,
                mcData.itemsByName['stone'].id,
                mcData.itemsByName['andesite'].id,
                mcData.itemsByName['diorite'].id,
                mcData.itemsByName['granite'].id,
                mcData.itemsByName['cobblestone'].id,
                mcData.itemsByName['iron_ore'].id,
                mcData.itemsByName['coal'].id,
                mcData.itemsByName['redstone'].id,
                mcData.itemsByName['gold_ore'].id,
                mcData.itemsByName['diamond'].id,
            ]
            await disposeItems(this.client, settings.chestsLocation, disposedItems);
        }
    }
}