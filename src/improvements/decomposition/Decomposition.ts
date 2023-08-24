import { Item as JItem } from "cn.nukkit.item.Item";
import { Server } from 'cn.nukkit.Server';
import * as blockitem from '../../util/blockitem.js';
import { getNWeaponConfig } from '../../util/Tool.js';
import { PlayerBindNBTType } from '../GetAttributeMain.js' ;
import { _CType } from '../../interface/ConfigType.js';

type JItem = cn.nukkit.item.Item;
type JPlayer = cn.nukkit.Player;

const server = Server.getInstance();
/**
 * 分解NWeapon物品
 * @param {JPlayer} player 玩家对象
 * @param {JItem[]} list 待分解的物品列表
 */
export function decomposition(player: JPlayer, list: JItem[]) {
    const _C: _CType = contain("NWeapon_C");
    for (let i = 0; i < list.length; i++) {
        const name = list[i].getCustomName() || list[i].getName();
        if (list[i].getNamedTag() == null) {
            player.sendMessage("[NWeapon] " + name + " §r不是NWeapon装备");
            continue;
        }
        const obj = getNWeaponConfig(list[i].getNamedTag().getString('NWeaponNameTag'));
        if (!obj) {
            player.sendMessage("[NWeapon] " + name + " §r不是NWeapon装备");
            continue;
        }
        if (obj.不可分解) {
            player.sendMessage("[NWeapon] " + name + " §r不可分解");
            continue;
        }
        if (list[i].getNamedTag().getString('lock') != "") {
            player.sendMessage("[NWeapon] " + name + " §r已被锁定，用§7/nwe unlock§r解锁后尝试");
            continue;
        }
        if (_C.MainConfig.bind.enable) {
            let bindObjTag = list[i].getNamedTag().getString('PlayerBind');
            if (bindObjTag) {
                let bindObj: PlayerBindNBTType = JSON.parse(bindObjTag);
                if (bindObj.name && bindObj.name != player.getName()) {
                    player.sendMessage("[NWeapon] " + name + " §r是 " + bindObj.name + " 的灵魂绑定装备");
                    continue;
                }
            }
        }
        let cmdlist1 = obj.分解所得;
        let cmdlist2 = _C.MainConfig.分解所得[1] ? _C.MainConfig.分解所得[1][obj.品阶] : null;
        if (cmdlist1) {
            let cmdlist = _C.MainConfig.分解所得[0][cmdlist1];
            for (let n in cmdlist) {
                server.dispatchCommand(server.getConsoleSender(), cmdlist[n].replace("{player}", player.getName()));
            }
            blockitem.removeItemFromPlayer(player, list[i]);
        } else if (cmdlist2) {
            let cmdlist = cmdlist2.split("\n");
            for (let n in cmdlist) {
                server.dispatchCommand(server.getConsoleSender(), cmdlist[n].replace("{player}", player.getName()));
            }
            blockitem.removeItemFromPlayer(player, list[i]);
        } else {
            player.sendMessage("[NWeapon] " + name + " §r没有分解方案");
        }
    }
}