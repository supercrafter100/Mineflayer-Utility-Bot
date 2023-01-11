import { Bot } from "mineflayer";

export default function getFreeSlots(client: Bot) {
    const inventorySlots = client.inventory.slots.slice(client.inventory.inventoryStart, client.inventory.inventoryEnd);
    const freeSlots = inventorySlots.filter(i => i === null).length
    return freeSlots;
}