import * as blockitem from '../../util/blockitem.js';
import * as Tool from '../../util/Tool.js';
import { FakeInvName } from '../../enum/FakeInvEnum.js';
import { EquipmentType, ForgingAttrType, _CType } from '../../interface/ConfigType.js';
import { EquipmentEntryType } from '../../interface/ForgeEntryType.js';

import { Server } from "cn.nukkit.Server";
import { getGradeSymbol } from 'src/util/WeaponConfig.js';

type JPlayer = cn.nukkit.Player;
type JItem = cn.nukkit.item.Item;
type JInventory = cn.nukkit.inventory.Inventory;

const server = Server.getInstance();
let closeEventMap = contain('FakeInvCloseEventHook');
closeEventMap.set(FakeInvName.Seiko, SeikoFakeInvClose);

const _C: _CType = contain('NWeapon_C');

const { money } = await import('@LLSELib');

/**
 * 精工 - 虚拟物品栏关闭事件处理
 * @param {any} event 
 * @returns 
 */
export function SeikoFakeInvClose(event: any, player: JPlayer, inv: JInventory) {
    let seikoFailedNum: Map<string, number> = contain('seikoFailedNum');
    let item = inv.getItem(0);
    if (item.getId() === 0) {
        return;
    }
    let backItem = function (msg: string) {
        if (msg) {
            player.sendMessage("[NWeapon] " + msg);
        }
        blockitem.addItemToPlayer(player, item);
    }
    if (!item.getCustomName() || !item.getNamedTag().getString('NWeaponNameTag')) {
        return backItem("§c非NWeapon物品");
    }
    var nTag = item.getNamedTag().getString('NWeaponNameTag').split(";");
    var index = ["Weapon", "Armor"].indexOf(nTag[0]);
    let HandItemData, HandItemName = item.getCustomName() || item.getName();
    if (index === -1) {
        return backItem("§c请在第一格放入NWeapon装备");
    } else if (index === 0) {
        HandItemData = _C.WeaponConfig[nTag[1]];
    } else if (index === 1) {
        HandItemData = _C.ArmorConfig[nTag[1]];
    }
    if (!HandItemData) {
        return backItem(HandItemName + " §r§c的配置文件丢失");
    }
    if (HandItemData.不可精工) {
        return backItem("§c装备 " + HandItemName + " §r§c不可精工");
    }
    let nbtStr = item.getNamedTag().getString('Seiko');
    let nbtObj;
    if (nbtObj === '') {
        nbtObj = { level: 0 };
        item.setNamedTag(item.getNamedTag().putString('Seiko', JSON.stringify(nbtObj)));
    } else {
        nbtObj = JSON.parse(nbtStr);
    }
    
    if (money.get(player.getName()) < _C.MainConfig.Seiko.needMoney[nbtObj.level]) {
        return backItem("§c金币不足，您至少需要 " + _C.MainConfig.Seiko.needMoney[nbtObj.level] + " 金钱");
    }
    money.reduce(player.getName(), _C.MainConfig.Seiko.needMoney[nbtObj.level]);
    let oldLore = blockitem.getItemLore(item);
    let probability = _C.MainConfig.Seiko.chance[nbtObj.level] + Tool.defineData(seikoFailedNum.get(player.getName())) * _C.MainConfig.Seiko.failedAddition;
    let failProtect = 0, straightUp = 0, luck = false;
    let bagitems = player.getInventory();
    for (var i = 0; i < 9; i++) {
        let seiko_item = bagitems.getItem(i);
        if (seiko_item.getCustomName() && seiko_item.getNamedTag().getString('NWeaponNameTag')) {
            let arr = seiko_item.getNamedTag().getString('NWeaponNameTag').split(";");
            if (arr[0] === _C.ItemTypeList["精工石"]) {
                let count = 1;
                let luck_ = seiko_item.getNamedTag().getFloat('Luck') || 0;
                let failProtect_ = seiko_item.getNamedTag().getByte('FailProtect') || 0;
                let straightUp_ = seiko_item.getNamedTag().getInt('StraightUp') || 0;
                if (straightUp && straightUp_) {``
                    continue;
                }
                if (straightUp_ > 0) {
                    if (straightUp_ > nbtObj.level) {
                        probability = 1;
                        straightUp = straightUp_;
                    } else {// 不符合消耗条件，跳过直升石
                        continue;
                    }
                }
                if (luck && luck_) {
                    continue;
                }
                if (!isNaN(luck_) && luck_ > 0) {
                    if (seiko_item.getNamedTag().getByte('stacking')) {
                        count = Math.ceil(1 / luck_);
                        if (seiko_item.getCount() < count) {
                            count = seiko_item.getCount();
                        }
                    }
                    probability += Number(luck_) * count;
                    luck = true;
                }
                if (failProtect && failProtect_) {
                    continue;
                }
                failProtect = !isNaN(failProtect_) ? Number(failProtect_) : 0;
                seiko_item.setCount(count);
                blockitem.removeItemFromPlayer(player, seiko_item);
                player.sendMessage("[NWeapon] §7你消耗了 " + seiko_item.getCustomName() + "§r§7 *" + count);
            }
        }
    }
    
    if (Tool.getProbabilisticResults(probability)) {
        if (straightUp) {
            nbtObj.level = straightUp;
        } else {
            nbtObj.level++;
        }
        if (oldLore.indexOf("§r§6§l精工等级:§e ") > -1) {
            oldLore = oldLore.replace(/§r§6§l精工等级:§e .+ §r/, "§r§6§l精工等级:§e " + getGradeSymbol.seiko(nbtObj.level) + " §r");
        } else {
            oldLore += "§r§6§l精工等级:§e " + getGradeSymbol.seiko(nbtObj.level) + " §r";
        }
        if (_C.MainConfig.Seiko.broadcastMessage && nbtObj.level >= _C.MainConfig.Seiko.broadcastMessage[0]) {
            server.broadcastMessage(_C.MainConfig.Seiko.broadcastMessage[1].replace("%p", player.getName()).replace("%lv", nbtObj.level).replace("%weapon", HandItemName));
        } else {
            console.log(player.getName() + "精工 " + HandItemName + " §r至 " + nbtObj.level + " 级");
        }
        seikoFailedNum.set(player.getName(), 0);
        player.sendTitle("§a§l+ 精工成功 +", "§e" + nbtObj.level + "级 §6" + getGradeSymbol.seiko(nbtObj.level));
        blockitem.setItemLore(item, oldLore);
        item.setNamedTag(item.getNamedTag().putString('Seiko', JSON.stringify(nbtObj)));
        blockitem.addItemToPlayer(player, item);
    } else {
        let num = 0;
        for (i = 0; i < _C.MainConfig.Seiko.failed.length; i++) {
            if (nbtObj.level <= _C.MainConfig.Seiko.failed[i][0]) {
                num = Tool.getArrayProbabilisticResults(_C.MainConfig.Seiko.failed[i], 1);
                break;
            }
        }
        if (Tool.getProbabilisticResults(failProtect) || num === -1) {
            player.sendTitle("§c§l- 精工失败 -", "§6本次受到保护");
            blockitem.addItemToPlayer(player, item);
        } else {
            let res = nbtObj.level - (num + 1);
            if (res < 1) {
                res = 1;
            }
            player.sendTitle("§c§l- 精工失败 -", "§4下降" + (nbtObj.level - res) + "级 §6" + getGradeSymbol.seiko(res));
            seikoFailedNum.set(player.getName(), (seikoFailedNum.get(player.getName()) || 0) + 1);
            nbtObj.level = res;
            oldLore = oldLore.replace(/§r§6§l精工等级:§e .+ §r/, "§r§6§l精工等级:§e " + getGradeSymbol.seiko(res) + " §r");
            blockitem.setItemLore(item, oldLore);
            item.setNamedTag(item.getNamedTag().putString('Seiko', JSON.stringify(nbtObj)));
            blockitem.addItemToPlayer(player, item);
        }
    }
    
}