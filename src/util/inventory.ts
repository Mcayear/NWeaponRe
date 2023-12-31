import { ChestFakeInventory } from 'com.nukkitx.fakeinventories.inventory.ChestFakeInventory';
import { DoubleChestFakeInventory } from 'com.nukkitx.fakeinventories.inventory.DoubleChestFakeInventory';
import { FakeInventory } from 'com.nukkitx.fakeinventories.inventory.FakeInventory';
import { HopperFakeInventory } from 'com.nukkitx.fakeinventories.inventory.HopperFakeInventory';
import { FakeInventoryListener } from 'com.nukkitx.fakeinventories.inventory.FakeInventoryListener';
import { Item as JItem } from "cn.nukkit.item.Item";
import { Entity as JEntity } from 'cn.nukkit.entity.Entity';
import { Player as JPlayer } from 'cn.nukkit.Player';
import { EntityHuman } from 'cn.nukkit.entity.EntityHuman';
import { Inventory } from 'cn.nukkit.inventory.Inventory';

type JPlayer = cn.nukkit.Player;
type JEntity = cn.nukkit.entity.Entity;
type JItem = cn.nukkit.item.Item;
type FakeInventory = com.nukkitx.fakeinventories.inventory.FakeInventory;
type ChestFakeInventory = com.nukkitx.fakeinventories.inventory.ChestFakeInventory;
type HopperFakeInventory = com.nukkitx.fakeinventories.inventory.HopperFakeInventory;
/**
 * 获取玩家的背包物品栏。
 *
 * @param {JPlayer} player - 玩家对象。
 * @param {onSlotChangeCallback} callback - The callback that handles the slotChange.
 * @returns {?Inventory} 玩家背包物品栏的拷贝。
 */
export function getPlayerInv(player: JPlayer): Inventory | null {
    const inv = new DoubleChestFakeInventory();
    if (!player || !player.getInventory() || !player.getInventory().getContents()) {
        return null;
    }
    inv.setContents(player.getInventory().getContents());
    return inv as unknown as Inventory;
}
/**
 * 设置玩家的物品栏
 * @param {JPlayer} player - 玩家对象
 * @param {Inventory} inv - 新的物品栏
 */
export function setPlayerInv(player: JPlayer, inv: Inventory) {
    player.getInventory().setContents(inv.getContents());
}

/**
 * 设置实体手中的物品
 * @param {JEntity} entity - 实体对象
 * @param {JItem} item - 物品对象
 */
export function setEntityItemInHand(entity: JEntity | JPlayer, item: JItem) {
    if (entity instanceof EntityHuman) {
        entity.getInventory().setItemInHand(item);
    }
}

/**
 * 设置实体副手中的物品
 * @param {JEntity} entity - 实体对象
 * @param {JItem} item - 物品对象
 */
export function setEntityItemInOffHand(entity: JEntity | JPlayer, item: JItem) {
    if (entity instanceof EntityHuman) {
        entity.getOffhandInventory().setItem(0, item);
    }
}

/**
 * 获取物品栏指定槽位上的物品。
 *
 * @param {Inventory} inv - 物品栏对象。
 * @param {number} slot - 槽位号。
 * @returns {JItem} 物品对象。
 */
export function getInventorySlot(inv: Inventory, slot: number): JItem {
    return inv.getItem(slot);
}

/**
* 向玩家展示虚拟物品栏。
*
* @param {Player} player - 要向展示的玩家。
* @param {FakeInventory} inv - 展示的虚拟物品栏。
*/
export function showFakeInv(player: JPlayer, inv: FakeInventory) {
    if (inv) {
        player.addWindow(inv as unknown as Inventory);
    }
}

/**
 * This callback type is called `onSlotChangeCallback` and is displayed as a global symbol.
 *
 * @callback onSlotChangeCallback
 * @param {com.nukkitx.fakeinventories.inventory.FakeSlotChangeEvent} event
 */

/**
 * 新建一个箱子物品栏。
 * @other callback并不是bn的方法
 * @param {boolean} isDoubleChest - 是否为大箱子。
 * @param {JItem[]} item - 包含的物品，需要使用 `Java.to` 函数转换。
 * @param {string} name - 物品栏标题。
 * @param {onSlotChangeCallback} callback - The callback that handles the slotChange.
 * @returns {ChestFakeInventory} 箱子物品栏。
export function addInv(isDoubleChest: boolean, item: JItem[], name: string, callback: Function): ChestFakeInventory {
    let inv;
    if (isDoubleChest) {
        inv = new DoubleChestFakeInventory();
    } else {
        inv = new ChestFakeInventory();
    }
    for (let i = 0; i < inv.getSize() && i < item.length; i++) {
        inv.setItem(i, item[i]);
    }
    if (name) {
        inv.setName(name);
    }
    if (callback) {
        const impl = new (Java.extend(FakeInventoryListener))({
            onSlotChange: function (event: com.nukkitx.fakeinventories.inventory.FakeSlotChangeEvent) {
                callback(event);
            }
        });
        inv.addListener(impl);//TODO: 未经测试
    }
    return inv;
}
 */

/**
 * 获取物品栏中的所有物品
 * @param {Inventory} inv 物品栏对象
 * @return {JItem[]} arrayList 返回的物品列表
 */
export function getItemsInInv(inv: Inventory): JItem[] {
    return Array.from(inv.getContents().values());
}

/**
 * 获取实体手中的物品
 * @param {JEntity} entity - 实体对象
 * @returns {?JItem} - 手持的物品
 */
export function getEntityItemInHand(entity: JEntity | JPlayer): JItem | null {
    if (entity instanceof EntityHuman) {
        return entity.getInventory().getItemInHand();
    } else {
        return null;
    }
}

/**
 * 获取实体副手中的物品
 * @param {JEntity} entity 
 * @return {?JItem} - 副手的物品
 */
export function getEntityItemInOffHand(entity: JEntity | JPlayer): JItem | null {
    if (entity instanceof EntityHuman) {
        return entity.getOffhandInventory().getItem(0);
    } else {
        return null;
    }
}

// 新建一个漏斗物品栏
/**
 * 
 * @param item 包含的物品，需要使用`Java.to`函数转换
 * @param name 物品栏标题
 * @returns 
 */
export function addHopperInv(item: JItem[], name: string): HopperFakeInventory {
    let inv = new HopperFakeInventory();
    for(let i = 0; i < inv.getSize() && i < item.length; i++){
        inv.setItem(i,item[i]);
    }
    if (!name?.length){
        inv.setName(name);
    }
    return inv;
}
