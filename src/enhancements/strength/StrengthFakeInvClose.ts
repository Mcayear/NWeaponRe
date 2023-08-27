import * as blockitem from '../../util/blockitem.js';
import * as Tool from '../../util/Tool.js';
import { FakeInvName } from '../../enum/FakeInvEnum.js';
import { EquipmentType, ForgingAttrType, _CType } from '../../interface/ConfigType.js';
import { EquipmentEntryType } from '../../interface/ForgeEntryType.js';

import { Server } from "cn.nukkit.Server";

type JPlayer = cn.nukkit.Player;
type JItem = cn.nukkit.item.Item;
type JInventory = cn.nukkit.inventory.Inventory;

const server = Server.getInstance();
let closeEventMap = contain('FakeInvCloseEventHook');
closeEventMap.set(FakeInvName.Strangth, StrengthFakeInvClose);

const _C: _CType = contain('NWeapon_C');

const { mc } = await import('@LLSELib');

/**
 * 强化 - 虚拟物品栏关闭事件处理
 * @param {any} event 
 * @returns 
 */
export function StrengthFakeInvClose(event: any, player: JPlayer, inv: JInventory) {
    let HandItem = inv.getItem(0);
    if (HandItem.getId() === 0) {
        return;
    }
    let backItem = function (msg: string) {
        if (msg) {
            player.sendMessage("[NWeapon] " + msg);
        }
        blockitem.addItemToPlayer(player, HandItem);
    }
    if (!HandItem.getCustomName() || !HandItem.getNamedTag().getString('NWeaponNameTag')) {
        return backItem("§c非NWeapon物品");
    }
    var nTag = HandItem.getNamedTag().getString('NWeaponNameTag').split(";");
    var index = ["Weapon", "Armor"].indexOf(nTag[0]);
    let HandItemData, HandItemName = HandItem.getCustomName() || HandItem.getName();
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
    if (HandItemData.不可强化) {
        return backItem("§c装备 " + HandItemName + " §r§c不可强化");
    }
    let nbtStr = HandItem.getNamedTag().getString('Strengthen');
    let nbtObj;
    if (!nbtObj) {
        nbtObj = { level: 0 };
        HandItem.setNamedTag(HandItem.getNamedTag().putString('Strengthen', JSON.stringify(nbtObj)));
    } else {
        nbtObj = JSON.parse(nbtStr);
    }

    switch (_C.MainConfig.Strengthen.model) {
        case 2:
            {
                var hasEntry = HandItem.getNamedTag().getByte('entry');
                if (!hasEntry) {
                    return backItem("§c装备 " + HandItemName + " §r§c没有可以强化的词条");
                }

                let forgingAttr = HandItem.getNamedTag().getString('forging');
                if (!forgingAttr.length) {
                    return backItem("§c装备 " + HandItemName + " §r§c的词条已损坏");
                }
                if (nbtObj.level >= _C.MainConfig.Strengthen.need.length) {
                    return backItem("§c装备 " + HandItemName + "  §r§c已是最大强化等级");
                }
                if (!Tool.examineNeed(_C.MainConfig.Strengthen.need[nbtObj.level].split("||"), player.getInventory(), false, player)[0]) {
                    return blockitem.addItemToPlayer(player, HandItem);
                }
                let res = entryConfigToUpdate(HandItem.clone(), HandItemData, JSON.parse(forgingAttr), player);
                if (!res) {
                    return backItem("§c装备 " + HandItemName + "  §r§c已是最大强化等级。");
                }
                blockitem.addItemToPlayer(player, res);
            }
            break;
        default:
            {
                let strengthFailedNum: Map<string, number> = contain('strengthFailedNum');
                if (!Tool.examineNeed(_C.MainConfig.Strengthen.need[nbtObj.level].split("||"), player.getInventory(), false, player)[0]) {
                    return backItem("");
                }
                let oldLore = blockitem.getItemLore(HandItem),
                    probability = _C.MainConfig.Strengthen.chance[nbtObj.level] + Tool.defineData(strengthFailedNum.get(player.getName()) || 0) * _C.MainConfig.Strengthen.failedAddition,
                    failProtect = 0,
                    straightUp = 0,
                    luck = false;
                let bagitems = player.getInventory()
                for (var i = 0; i < 9; i++) {
                    let item = bagitems.getItem(i);
                    if (item.getCustomName() && item.getNamedTag().getString('NWeaponNameTag')) {
                        let arr: string[] = item.getNamedTag().getString('NWeaponNameTag').split(";");
                        if (arr[0] === _C.ItemTypeList["强化石"]) {
                            let count = 1;
                            let luck_ = item.getNamedTag().contains('Luck') ? Number(item.getNamedTag().getFloat('Luck')) : 0;
                            let failProtect_ = item.getNamedTag().contains('FailProtect') ? Number(item.getNamedTag().getByte('FailProtect')) : 0;
                            let straightUp_ = item.getNamedTag().contains('StraightUp') ? Number(item.getNamedTag().getInt('StraightUp')) : 0;
                            if (straightUp && straightUp_) {
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
                                if (item.getNamedTag().getByte('stacking')) {
                                    count = Math.ceil(1 / luck_);
                                    if (item.getCount() < count) {
                                        count = item.getCount();
                                    }
                                }
                                probability += Number(luck_) * count;
                                luck = true;
                            }
                            if (failProtect && failProtect_) {
                                continue;
                            }
                            failProtect = !isNaN(failProtect_) ? Number(failProtect_) : 0;
                            item.setCount(count);
                            blockitem.removeItemFromPlayer(player, item);
                            player.sendMessage("[NWeapon] §7你消耗了 " + item.getCustomName() + "§r§7 *" + count);
                        }
                    }
                }
                if (Tool.getProbabilisticResults(probability)) {
                    if (straightUp) {
                        nbtObj.level = straightUp;
                    } else {
                        nbtObj.level++;
                    }
                    if (oldLore.indexOf("§r§7§l======【 §c强化§7 】======;§r§fLv§e.") > -1) {
                        oldLore = oldLore.replace(/§r§7§l======【 §c强化§7 】======;§r§fLv§e\. .+ §r/, "§r§7§l======【 §c强化§7 】======;§r§fLv§e. " + getGradeSymbol.strengthen(nbtObj.level) + " §r");
                    } else {
                        oldLore += "§r§7§l======【 §c强化§7 】======;§r§fLv§e. " + getGradeSymbol.strengthen(nbtObj.level) + " §r";
                    }
                    if (_C.MainConfig.Strengthen.broadcastMessage && nbtObj.level >= _C.MainConfig.Strengthen.broadcastMessage[0]) {
                        server.broadcastMessage(_C.MainConfig.Strengthen.broadcastMessage[1].replace("%p", player.getName()).replace("%lv", nbtObj.level).replace("%weapon", HandItemName));
                    } else {
                        console.info(player.getName() + "淬炼 " + HandItemName + " §r至 " + nbtObj.level + " 级");
                    }
                    strengthFailedNum.set(player.getName(), 0);
                    player.sendTitle("§a§l+ 淬炼成功 +", "§e" + nbtObj.level + "级 §6" + getGradeSymbol.strengthen(nbtObj.level));
                    blockitem.setItemLore(HandItem, oldLore);
                    HandItem.setNamedTag(HandItem.getNamedTag().putString('Strengthen', JSON.stringify(nbtObj)));
                    blockitem.addItemToPlayer(player, HandItem);
                } else {
                    let num = 0;
                    for (i = 0; i < _C.MainConfig.Strengthen.failed.length; i++) {
                        if (nbtObj.level <= _C.MainConfig.Strengthen.failed[i][0]) {
                            num = Tool.getArrayProbabilisticResults(_C.MainConfig.Strengthen.failed[i], 1);
                            break;
                        }
                    }
                    if (Tool.getProbabilisticResults(failProtect) || num === -1) {
                        player.sendTitle("§c§l- 淬炼失败 -", "§6本次受到保护");
                        blockitem.addItemToPlayer(player, HandItem);
                    } else {
                        if (num === 0) {
                            player.sendTitle("§c§l- 淬炼失败 -", "§l§4武器在淬炼中损坏");[]
                        } else {
                            let res = nbtObj.level - num;
                            if (res < 1) {
                                res = 1;
                            }
                            player.sendTitle("§c§l- 淬炼失败 -", "§4下降" + (nbtObj.level - res) + "级 §6" + getGradeSymbol.strengthen(res));
                            strengthFailedNum.set(player.getName(), (strengthFailedNum.get(player.getName()) || 0) + 1);
                            nbtObj.level = res;
                            oldLore = oldLore.replace(/§r§7§l======【 §c强化§7 】======;§r§fLv§e\. .+ §r/, "§r§7§l======【 §c强化§7 】======;§r§fLv§e. " + getGradeSymbol.strengthen(res) + " §r");
                            blockitem.setItemLore(HandItem, oldLore);
                            HandItem.setNamedTag(HandItem.getNamedTag().putString('Strengthen', JSON.stringify(nbtObj)));
                            blockitem.addItemToPlayer(player, HandItem);
                        }
                    }
                }
            }
    }
}

const getGradeSymbol = {
    seiko: function (level: number) {
        let str = "";
        let loop = function (lv: number) {
            for (let i = 0; i < _C.MainConfig.GradeSymbol.list[0].length; i++) {
                let v = Number(_C.MainConfig.GradeSymbol.list[0][i]);
                if (lv >= v) {
                    str += _C.MainConfig.GradeSymbol.list[1][i];
                    return loop(lv - v);
                }
            }
        }
        loop(level);
        return str;
    },
    strengthen: function (lv: number) {
        return _C.MainConfig.Strengthen.style.firstList[lv] + Array(Number(lv) + 1).join(_C.MainConfig.Strengthen.style.icon);
    }
}

/**
 * 更新装备的词条 用于升级
 * 一般精工时会使用
 * @param item {item} 物品
 * @param itemConfig {Object} 物品配置文件
 * @param forgingAttr {Object} 通过读取nbt获得的对象
 * @param player {?Player} 玩家对象，用于发送属性更改信息
 */
function entryConfigToUpdate(item: JItem, itemConfig: EquipmentType, forgingAttr: ForgingAttrType, player: JPlayer) {
    let nbtStr = item.getNamedTag().getString('Strengthen');
    let nbtObj;
    if (nbtStr.length) {
        nbtObj = JSON.parse(nbtStr);
        if (nbtObj.level >= _C.ForgeEntry.Config.maxLevel) {
            return null;
        }
    }
    const content = [item.getNamedTag().getString('NWeaponNameTag').split(';')[1] + " §r§l+" + (nbtObj.level + 1), "\n§r# 升级 #"];
    const AttrLore = [];
    if (!itemConfig.锻造词条) {
        return;
    }
    // 主词条
    let mainEntry = (_C.ForgeEntry[itemConfig.锻造词条] as EquipmentEntryType).mainEntry;
    var arr1: string[] = Tool.cloneObjectFn(mainEntry.list);
    var arr2: number[] = Tool.cloneObjectFn(mainEntry.p);
    var addList: number[] = Tool.cloneObjectFn(mainEntry.add || []);
    var arr3 = Object.keys(forgingAttr.mAttr);
    var temp = minusArray(arr1, arr3);
    temp.forEach((tempV) => {// 开始重新分配概率
        let index = arr1.indexOf(tempV);
        arr1.splice(index, 1);
        addList.splice(index, 1);// 这是每个属性每级的增长值
        let p = arr2.splice(index, 1)[0];
        let add = p / arr2.length;
        arr2.forEach(function (v, arr2i) {
            arr2[arr2i] = v + add;
        });
    });
    let arrIndex = Tool.getArrayProbabilisticResults(arr2);
    let oldMAttr = Tool.cloneObjectFn(forgingAttr.mAttr);
    forgingAttr.mAttr[arr1[arrIndex]] = MergeAttrValue(forgingAttr.mAttr[arr1[arrIndex]], addList[arrIndex]);
    for (let key in forgingAttr.mAttr) {
        AttrLore.push("§r§a□ " + key + ":§d " + Tool.valueToString(forgingAttr.mAttr[key] as number[], key));
        content.push("§r□ " + key + ":§f " + Tool.valueToString(oldMAttr[key] as number[], key) + " -> §6" + Tool.valueToString(forgingAttr.mAttr[key] as number[], key) + "§a ▲");
    }
    nbtObj.level++;
    item.setNamedTag(item.getNamedTag().putString('Strengthen', JSON.stringify(nbtObj)));
    arr1 = [];
    arr2 = [];
    addList = [];
    // 次词条
    let ubEntry = (_C.ForgeEntry[itemConfig.锻造词条] as EquipmentEntryType).mainEntry;
    var arr1: string[] = Tool.cloneObjectFn(ubEntry.list);
    var arr2: number[] = Tool.cloneObjectFn(ubEntry.p);
    var addList: number[] = Tool.cloneObjectFn(ubEntry.add || []);
    let attrMainEntryConfig = itemConfig.锻造属性主词条 || itemConfig.锻造属性 || {};
    var arr3 = Object.keys(forgingAttr.attr);
    if (!(nbtObj.level % (_C.ForgeEntry.Config.ubEntry.Update || 3))) {// 判断是否升级次词条
        if (arr3.length < _C.ForgeEntry.Config.ubEntry.MaxCount) {
            // 判断是否新增次词条
            let canAddEntry = minusArray(Object.keys(attrMainEntryConfig), arr3);
            if (canAddEntry.length) {
                // 因为是新增，所以需要乘锻造品质的系数
                let getForgingAttr = function (value: number) {
                    let ForgingAttrNbt = JSON.parse(item.getNamedTag().getString('forging'));
                    let index = ForgingAttrNbt.quality;
                    let arr = [_C.MainConfig.锻造[2][index]];
                    if (typeof (arr[0]) === "string") {
                        arr = arr[0].split("-");
                    }
                    return Math.round((value * 1000) * Tool.getRandomNum(arr as number[])) / 1000;
                }
                minusArray(arr1, canAddEntry).forEach((tempV) => {// 开始重新分配概率
                    let index = arr1.indexOf(tempV);
                    arr1.splice(index, 1);
                    let p = arr2.splice(index, 1)[0];
                    let add = p / arr2.length;
                    arr2.forEach(function (v, arr2i) {
                        arr2[arr2i] = v + add;
                    });
                });
                let arrIndex = Tool.getArrayProbabilisticResults(arr2);
                let mainAttrValue = attrMainEntryConfig[arr1[arrIndex]];
                let key = arr1[arrIndex];
                if (typeof (mainAttrValue) === 'string') {
                    let arr = mainAttrValue.split("-");
                    forgingAttr.attr[key] = [getForgingAttr(Number(arr[0])), getForgingAttr(Number(arr[1]))];
                } else {
                    forgingAttr.attr[key] = [getForgingAttr(mainAttrValue)];
                }
                content.push("§r§l§6  " + key + ": " + Tool.valueToString(forgingAttr.attr[key] as number[], key));
            }
        } else {
            // 提升次词条属性
            minusArray(arr1, arr3).forEach((tempV) => {// 开始重新分配概率
                let index = arr1.indexOf(tempV);
                arr1.splice(index, 1);
                addList.splice(index, 1);// 这是每个属性每级的增长值
                let p = arr2.splice(index, 1)[0];
                let add = p / arr2.length;
                arr2.forEach(function (v, arr2i) {
                    arr2[arr2i] = v + add;
                });
            });
            let arrIndex = Tool.getArrayProbabilisticResults(arr2);
            let key = arr1[arrIndex];
            let oldAttr = Tool.cloneObjectFn(forgingAttr.attr[key]);
            forgingAttr.attr[key] = MergeAttrValue(forgingAttr.attr[key], addList[arrIndex]);
            content.push("§r  " + key + ":§f " + Tool.valueToString(oldAttr as number[], key) + " -> §6" + Tool.valueToString(forgingAttr.attr[key] as number[], key) + "§a ▲");
        }
    }
    for (let key in forgingAttr.attr) {
        AttrLore.push("§r§a" + key + ":§d " + Tool.valueToString(forgingAttr.attr[key] as number[], key));
    }
    const LoreList = ["§r§2锻造属性:",
        AttrLore.join(";"),
        "§r§4§l一一一"];
    item.getNamedTag().putString('forging', JSON.stringify(forgingAttr));
    blockitem.setItemLore(item, blockitem.getItemLore(item).replace(/§r§2锻造属性.+?§r§4§l一一一/, LoreList.join(";")));
    if (player) {
        let winx = mc.newSimpleForm();
        winx.setTitle("§e词条属性更新");
        winx.setContent(content.join("\n"));
        mc.getPlayer(player.getName())!.sendForm(winx, ()=>{});
    }
    return item;
}

/**
 * 合并属性的值
 * @param obj {Array|number} 原属性的值
 * @param value {Array|number} 配置中属性的值
 * @param forging {?number} 锻造强度
 * @returns {Array} 返回数组 [min, max]
 */
function MergeAttrValue(
    obj: number[] | number | string,
    value: number[] | number | string,
    forging?: number
  ): number[] | number {
    if (!forging) {
      forging = 1;
    }
    if (!obj) {
      if (typeof value === "object") {
        obj = [0, 0];
      } else {
        obj = 0;
      }
    }
  
    if (typeof value === "string") {
      // "1-100"
      let arr = (value as string).split("-");
      value = [Number(arr[0]), Number(arr[1])];
    }
    if (Array.isArray(value)) {
      if (typeof obj !== "object") {
        obj = [Number(obj), Number(obj)];
      }
      obj[0] += Number(Number(value[0] * forging).toFixed(4));
      obj[1] += Number(Number(value[1] * forging).toFixed(4));
    } else if (Array.isArray(obj)) {
      if (obj.length === 1) {
        obj[1] = obj[0];
      }
      obj[0] += Number(Number(value as number * forging).toFixed(4));
      obj[1] += Number(Number(value as number * forging).toFixed(4));
    } else {
      obj = Number(obj) + Number(value as number * forging);
    }
    return obj;
  }

/**
 * 获取arr1中不存在于arr2数组内的元素
 * @param arr1 {Array} 数组1
 * @param arr2 {Array} 数组2
 * @return {Array} 返回数组的差集
 * @example
 * minusArray(["a", "b", "c", "aaa"], ["a", "b", "c"]);
 * ["aaa"]
 */
function minusArray(arr1: string[], arr2: string[]) {
    //var temp = arr1.concat(arr3).filter(item => !arr3.includes(item));
    var temp: string[] = [], tempArr = JSON.parse(JSON.stringify(arr1));
    tempArr.push.apply(tempArr, arr2);
    tempArr.forEach((item: string) => !(arr2.indexOf(item) > -1) ? temp.push(item) : null);// 在配置文件中不存在的属性
    return temp;
}