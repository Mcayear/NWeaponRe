import * as inventory from '../util/inventory.js';
import * as blockitem from '../util/blockitem.js';
import { getNWeaponConfig, itemBindPlayer, onlyNameGetItem } from '../util/Tool.js';
import { SetPlayerAttr, GetPlayerAttr } from './AttrComp.js';
export default function getAttributeMain(player) {
    const _C = contain("NWeapon_C");
    let result = {};
    let ItemList = [blockitem.getItemInHand(player)];
    let inv = inventory.getPlayerInv(player);
    if (!inv)
        return {};
    let SlotList = [player.getInventory().getHeldItemIndex(), 36, 37, 38, 39];
    var effectSuit = {};
    let EquipAttrCore = function (item, attrList) {
        let suitName = attrList.套装;
        if (suitName) {
            if (effectSuit[suitName]) {
                effectSuit[suitName]++;
            }
            else {
                effectSuit[suitName] = 1;
            }
        }
        for (let key in attrList.属性) {
            let attr;
            attr = attrList.属性[key];
            if (typeof (attr) === "string") {
                let arr = attr.split("-");
                attr = [Number(arr[0]), Number(arr[1])];
            }
            result[key] = MergeAttrValue(result[key], attr);
        }
        let forgingAttrTag = item.getNamedTag().getString('forging');
        if (forgingAttrTag != "") { // 锻造属性解析
            let forgingAttr = JSON.parse(forgingAttrTag);
            for (let key in forgingAttr.attr) {
                let value = forgingAttr.attr[key];
                result[key] = MergeAttrValue(result[key], (value.length === 1) ? value[0] : value, forgingAttr.info.intensity);
            }
            let entry = item.getNamedTag().getByte('entry');
            if (entry) {
                for (let key in forgingAttr.mAttr) {
                    let value = forgingAttr.mAttr[key];
                    result[key] = MergeAttrValue(result[key], (value.length === 1) ? value[0] : value, forgingAttr.info.intensity);
                }
            }
        }
        let gemListTag = item.getNamedTag().getString('GemList');
        if (!gemListTag) { // 宝石属性解析
            let gemList = JSON.parse(gemListTag);
            for (var i = 0; i < gemList.inlay.length; i++) {
                let GemData = _C.GemConfig[gemList.inlay[i]];
                if (!GemData) {
                    continue;
                }
                for (let key in GemData.属性) {
                    let attr = GemData.属性[key];
                    if (typeof (attr) === "string") {
                        const arr = attr.split("-");
                        attr = [Number(arr[0]), Number(arr[1])];
                    }
                    result[key] = MergeAttrValue(result[key], attr);
                }
            }
        }
        let seikoTag = item.getNamedTag().getString('Seiko');
        if (!seikoTag) { // 精工属性解析
            let seiko = JSON.parse(seikoTag);
            let type = attrList.类型 == "武器" ? 0 : 1;
            let attrdata = _C.MainConfig.Seiko.attr[type][seiko.level - 1];
            for (let key in attrdata) {
                let attr = attrdata[key];
                if (typeof (attr) === "string") {
                    const arr = attr.split("-");
                    attr = [Number(arr[0]), Number(arr[1])];
                }
                result[key] = MergeAttrValue(result[key], attr);
            }
        }
        let strengthenTag = item.getNamedTag().getString('Strengthen');
        if (strengthenTag != "" && _C.MainConfig.Strengthen.model != 2) { // 强化属性解析
            let strengthen = JSON.parse(strengthenTag);
            let type = attrList.类型 == "武器" ? 0 : 1;
            let attrdata = _C.MainConfig.Strengthen.attr[type][strengthen.level - 1];
            for (let key in attrdata) {
                let attr = attrdata[key];
                if (typeof (attr) === "string") {
                    const arr = attr.split("-");
                    attr = [Number(arr[0]), Number(arr[1])];
                }
                result[key] = MergeAttrValue(result[key], attr);
            }
        }
        let runeBore = item.getNamedTag().getList('runeBore');
        let hasRune = item.getNamedTag().contains('runeBore');
        if (hasRune) { // 符文属性解析
            for (let i = 0; i < runeBore.size(); i++) {
                const str = runeBore.get(i).parseValue(); // 存储的 符文名（文件名）
                if (!str.length) {
                    continue;
                }
                const rune = onlyNameGetItem('rune', str);
                if (rune) {
                    let attrdata = rune.属性; // 通过文件名获取符文符号
                    for (let key in attrdata) {
                        let attr = attrdata[key];
                        if (typeof (attr) === "string") {
                            const arr = attr.split("-");
                            attr = [Number(arr[0]), Number(arr[1])];
                        }
                        result[key] = MergeAttrValue(result[key], attr);
                    }
                }
            }
        }
    };
    let unavailableTips = [];
    let isChange = false;
    const funcCore = function (item, type, slot, Callback) {
        if (item.getId() === 0) {
            return;
        }
        const name = item.getCustomName();
        let attr = getNWeaponConfig(type + ";" + name);
        if (!attr) {
            return;
        }
        if (attr.限制等级 > player.getExperienceLevel()) {
            unavailableTips.push(name + "§r§f, 使用等级不足");
            return;
        }
        if (attr.定制者 && attr.定制者 != player.getName() && !player.isOp()) {
            unavailableTips.push("你不是" + name + "§r的定制者");
            return;
        }
        if (attr.生效槽 && attr.生效槽.indexOf(slot) === -1) {
            return;
        }
        if (_C.MainConfig.bind) {
            if (_C.MainConfig.bind.defaultBind) {
                let itemAfter = itemBindPlayer(item, player, true, false);
                if (itemAfter) {
                    Callback(itemAfter);
                }
            }
            let bindObjTag = item.getNamedTag().getString('PlayerBind');
            if (bindObjTag) {
                let bindObj = JSON.parse(bindObjTag);
                if (!bindObj.name) {
                    unavailableTips.push(name + "§r§f, 您需绑定后可使用");
                    return;
                }
                else if (bindObj.name != player.getName()) {
                    unavailableTips.push(name + "§r§f, 您不是该装备的主人");
                    return;
                }
            }
            else if (_C.MainConfig.bind.enable) {
                unavailableTips.push(name + "§r§f, 您需绑定后可使用");
                return;
            }
        }
        if (_C.MainConfig.允许附魔 || blockitem.getItemEnchant(item).length == 0) {
            EquipAttrCore(item, attr);
        }
    };
    // 主手武器
    funcCore(inventory.getEntityItemInHand(player), "Weapon", player.getInventory().getHeldItemIndex(), function (itemAfter) {
        inventory.setEntityItemInHand(player, itemAfter);
    });
    // 副手武器
    funcCore(inventory.getEntityItemInOffHand(player), "Weapon", null, function (itemAfter) {
        inventory.setEntityItemInOffHand(player, itemAfter);
    });
    // 护甲槽 36,37,38,39
    for (let i = 36; i < 40; i++) {
        funcCore(inventory.getInventorySlot(inv, i), "Armor", i, function (itemAfter) {
            inv.setItem(i, itemAfter);
            isChange = true;
        });
    }
    // 配饰槽 9 - 35
    for (let i = 9; i < 36; i++) {
        funcCore(inventory.getInventorySlot(inv, i), "Jewelry", i, function (itemAfter) {
            inv.setItem(i, itemAfter);
            isChange = true;
        });
    }
    if (isChange) {
        inventory.setPlayerInv(player, inv);
    }
    if (unavailableTips.length) {
        player.sendPopup("§c§l您佩戴了无法使用的装备§r：\n" + unavailableTips.join("\n"));
    }
    // 套装属性
    var eventChangeSuit = [];
    var MainAttrForSuit = GetPlayerAttr(player, 1).EffectSuit;
    var hasMainAttrForSuit = [];
    if (!MainAttrForSuit)
        return result;
    var newList = [];
    for (let suitName in effectSuit) {
        const suitTag = suitName + ":" + effectSuit[suitName];
        newList.push(suitTag);
        // mainAttr中不存在,添加属性
        if (MainAttrForSuit.indexOf(suitTag) === -1 && _C.MainConfig.EffectSuit[suitTag]) {
            hasMainAttrForSuit.push(suitTag);
            SetPlayerAttr(player, suitTag, _C.MainConfig.EffectSuit[suitTag].attr);
            eventChangeSuit.push("§r§f你感受到了 §l" + suitTag + " §r§f的§d套装§f属性！");
        }
    }
    MainAttrForSuit.forEach(v => {
        // 删除属性
        if (newList.indexOf(v) === -1) {
            SetPlayerAttr(player, v, {});
            eventChangeSuit.push("§r§f§l" + v + " §r§f套装§f属性已经流失...");
        }
    });
    MainAttrForSuit = hasMainAttrForSuit;
    if (eventChangeSuit.length) {
        SetPlayerAttr(player, "EffectSuit", MainAttrForSuit);
        player.sendPopup(eventChangeSuit.join("\n"));
    }
    return result;
}
/**
 * 合并属性的值
 * @param obj {number | [number, number]} 原属性的值
 * @param value {string | number | [number, number]} 配置中属性的值
 * @param forging {?number} 锻造强度
 * @returns {[number, number]} 返回数组 [min, max]
 */
function MergeAttrValue(obj, value, forging) {
    if (!forging) {
        forging = 1;
    }
    if (!obj) {
        if (typeof (value) === "object") {
            obj = [0, 0];
        }
        else {
            obj = 0;
        }
    }
    if (typeof (value) === "string") { // "1-100"
        let arr = value.split("-");
        value = [Number(arr[0]), Number(arr[1])];
    }
    if (typeof (value) === "object") {
        if (typeof (obj) != "object") {
            obj = [obj, obj];
        }
        obj[0] += Number(Number(value[0] * forging).toFixed(4));
        obj[1] += Number(Number(value[1] * forging).toFixed(4));
        return obj;
    }
    else if (typeof (obj) === "object") {
        obj[0] += Number(Number(value * forging).toFixed(4));
        obj[1] += Number(Number(value * forging).toFixed(4));
        return obj;
    }
    else {
        obj += value * forging;
        return obj;
    }
}
