import { Player as JPlayer } from 'cn.nukkit.Player';
import { Inventory } from "cn.nukkit.inventory.Inventory";
import { FakeInvName } from '../../enum/FakeInvEnum.js';
const blockitem = await import("../../util/blockitem.js");
const { inventory } = await import("cn.vusv.njsutil.inventory");

type JPlayer = cn.nukkit.Player;

/**
 * 
 * @param {JPlayer} player 
 * @returns 
 */
export function sendSeikoWin(player: JPlayer) {
    let hopperInv = [];
    hopperInv.push(blockitem.buildItem(0, 0, 0));
    let temp1 = blockitem.buildItem(160, 7, 1);
    temp1.setCustomName("§r§8分割线");
    let temp2 = blockitem.buildItem(160, 7, 1);
    temp2.setCustomName("§r§8分割线");
    blockitem.setItemLore(temp1, "§r精工会大幅提升装备的基础属性\n\n§a成功晋升1级\n§c失败随机下降0~3级\n§7每3级属性大幅提升\n\n§r幸运卷等,请放在背包快捷栏");
    hopperInv.push(temp1);
    hopperInv.push(temp2);
    hopperInv.push(temp2);
    hopperInv.push(temp2);
    player.addWindow(new inventory().addInv(false, Java.to(hopperInv, "cn.nukkit.item.Item[]"), FakeInvName.Seiko+"精工", function(event: com.nukkitx.fakeinventories.inventory.FakeSlotChangeEvent){ 
        var slot: number = event.getAction().getSlot();
        if (slot != 0) {
            return event.setCancelled(true);
        }
    }) as unknown as Inventory);
    return;
}