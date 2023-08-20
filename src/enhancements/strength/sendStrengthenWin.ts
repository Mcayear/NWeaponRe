import { Player as JPlayer } from 'cn.nukkit.Player';
import { Inventory } from "cn.nukkit.inventory.Inventory";
const blockitem = await import("../../util/blockitem.js");
const { inventory } = await import("cn.vusv.njsutil.inventory");

type JPlayer = cn.nukkit.Player;
/**
 * 
 * @param {JPlayer} player 
 * @returns 
 */
export function sendStrengthenWin(player: JPlayer) {
    let hopperInv = [];
    hopperInv.push(blockitem.buildItem(0, 0, 0));
    let temp1 = blockitem.buildItem(160, 7, 1);
    temp1.setCustomName("§r§8分割线");
    let temp2 = blockitem.buildItem(160, 7, 1);
    temp2.setCustomName("§r§8分割线");
    blockitem.setItemLore(temp1, "§r淬炼会提升装备的 特殊 属性\n\n§a成功晋升1级\n§c5级后失败装备将会炸裂(消失)\n\n§r幸运卷等,请放在背包快捷栏");
    hopperInv.push(temp1);
    hopperInv.push(temp2);
    hopperInv.push(temp2);
    hopperInv.push(temp2);
    player.addWindow(new inventory().addInv(false, Java.to(hopperInv, "cn.nukkit.item.Item[]"), "强化", function(event: com.nukkitx.fakeinventories.inventory.FakeSlotChangeEvent){ 
        var slot: number = event.getAction().getSlot();
        if (slot != 0) {
            return event.setCancelled(true);
        }
    }) as unknown as Inventory);
    return;
}