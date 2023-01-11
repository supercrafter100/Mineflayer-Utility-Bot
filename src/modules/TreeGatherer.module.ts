import CommandModule from "../classes/CommandModule";
import { Movements, goals } from "mineflayer-pathfinder";
import MinecraftData, { Block, IndexedData } from "minecraft-data";
import { Vec3 } from "vec3";

export default class TreeGathererModule extends CommandModule {
    
    public readonly commandName = "tree";
    private readonly logNames = ["oak_log", "spruce_log", "birch_log", "jungle_log", "acacia_log", "dark_oak_log"];
    private readonly searchRadius = 30;

    private stopped = false;

    public async onCommand(username: string, args: string[]) {
        this.findTree();
        this.stopped = false;
    }

    private findTree(radius: number = 1) {
        const mcData = MinecraftData(this.client.version);

        const baseX = this.client.entity.position.x;
        const baseY = this.client.entity.position.y;
        const baseZ = this.client.entity.position.z;

        // Loop from top to bottom
        const minX = baseX - radius
        const maxX = baseX + radius

        const minY = baseY - 10
        const maxY = baseY + radius;

        const minZ = baseZ - radius;
        const maxZ = baseZ + radius;

        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                for (let z = minZ; z <= maxZ; z++) {
                    const xyz = new Vec3(x, y, z);
                    const block = this.client.blockAt(xyz);
                    if (!block) {
                        throw new Error("Block was null");
                    }
                    
                    if (this.isLog(block, mcData)) {
                        this.startMiningTree(x, y, z);
                        return;
                    }
                }
            }
        }

        if (radius < this.searchRadius) {
            this.findTree(radius + 1);
            return;
        }

        this.client.chat("No trees found within search radius")
    }
    
    private async startMiningTree(baseX: number, baseY: number, baseZ: number) {

        const mcData = MinecraftData(this.client.version);
        await this.moveTo(baseX, baseY, baseZ);

        // Loop from top to bottom
        const minX = baseX - 4
        const maxX = baseX + 4

        const minY = baseY - 5
        const maxY = baseY + 15

        const minZ = baseZ - 4;
        const maxZ = baseZ + 4;

        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                for (let z = minZ; z <= maxZ; z++) {
                    const xyz = new Vec3(x, y, z);
                    const block = this.client.blockAt(xyz);
                    if (!block) {
                        throw new Error("Block was null");
                    }
                    
                    if (this.isLog(block, mcData)) {
                        //await this.moveTo(x, y, z, true);
                        const bestHarvestTool = this.client.pathfinder.bestHarvestTool(block);
                        if (bestHarvestTool) await this.client.equip(bestHarvestTool, 'hand');
    
                        await this.client.dig(block, true, 'auto').catch(err => console.log(err));
                    }

                    if (this.stopped) {
                        return;
                    }
                }
            }
        }

        // Collect the items
        

        this.findTree();
    }

    private async moveTo(x: number, y: number, z: number, options: { lookAt: boolean, distance: number} = { lookAt: false, distance: 0 }) {
        // Set movements
        const defaultMove = new Movements(this.client, MinecraftData(this.client.version));
        this.client.pathfinder.setMovements(defaultMove);

        // Get & set goal
        const goal = options.lookAt ? new goals.GoalLookAtBlock(new Vec3(x, y, z), this.client.world, { reach: options.distance }) : new goals.GoalNear(x, y, z, options.distance);
        await this.client.pathfinder.goto(goal).catch(err => console.log("Pathfinding failed..."));
    }

    private isLog(block: any, mcData: IndexedData) {
        return this.logNames.some(b => block.type === mcData.blocksByName[b].id)
    }

    public onStop(): void {
        this.stopped = true;
    }
}