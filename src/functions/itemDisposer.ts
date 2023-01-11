import MinecraftData from "minecraft-data";
import { Bot } from "mineflayer";
import { goals, Movements } from "mineflayer-pathfinder";
import { Vec3 } from "vec3";
import { Window } from "prismarine-windows";

export async function disposeItems(client: Bot, location: Vec3, items: number[]) {
    const mcData = MinecraftData(client.version);
    const defaultMove = new Movements(client, mcData);
    defaultMove.placeCost = 5; // Encourage digging instead of placing
    client.pathfinder.setMovements(defaultMove);

    const goal = new goals.GoalNear(location.x, location.y, location.z, 5);
    await client.pathfinder.goto(goal).catch(err => console.log(err)) ;

    // Get a list of chests near this location
    const chests = client.findBlocks({
        matching: mcData.blocksByName.chest.id,
        maxDistance: 16,
        count: 99999999 // As many as possible
    })

    while (true) {
        const chest = getClosestChest(client, chests);
        if (chest == null) {
            client.chat('No chests found to put items in!')
            return;
        }

        const hasRemaining = await tryEmptyInventory(client, chest, items);
        if (!hasRemaining) return;
    }
}

const tryEmptyInventory = async (bot: Bot, chestLocation: Vec3, items: number[]) => {
    await gotoChest(bot, chestLocation);
    return await placeItems(bot, chestLocation, items);
}

const gotoChest = async (bot: Bot, location: Vec3) => {
    await bot.pathfinder.goto(new goals.GoalGetToBlock(location.x, location.y, location.z)).catch(err => console.log(err)) ;
}

const placeItems = async (bot: Bot, chestPos: Vec3, items: number[]) => {
    const chestBlock = bot.blockAt(chestPos);
    if (chestBlock == null) {
        bot.chat("Chest is in an unloaded chunk!")
        return;
    }

    const chest = await bot.openChest(chestBlock);
    for (const item of bot.inventory.items()) {
        if (!items.find(c => c === item.type)) continue;

        if (!hasFreeSlots(chest as any)) {
            return true;
        }
        await chest.deposit(item.type, item.metadata, item.count).catch(err => console.log(err));
    }
    bot.closeWindow(chest as any);

    return false;
}

const getClosestChest = (client: Bot, chests: Vec3[]) => {
    let chest = null;
    let distance = 0;

    for (const c of chests) {
        const dist = c.distanceTo(client.entity.position);
        if (chest == null || dist < distance) {
            chest = c;
            distance = dist;
        }
    }

    if (chest != null) {
        chests.splice(chests.indexOf(chest), 1);
    }

    return chest;
}

const hasFreeSlots = (chest: Window) => {
    const chestSlots = chest.slots.slice(0, chest.inventoryStart);
    if (chestSlots.some(c => c == null)) return true;
    return false;
}