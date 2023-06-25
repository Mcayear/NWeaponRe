import { ListTag } from 'cn.nukkit.nbt.tag.ListTag';
import { StringTag } from 'cn.nukkit.nbt.tag.StringTag';
import { onlyNameGetItem } from '../../util/Tool.js';
import * as blockitem from "../../util/blockitem.js";
/**
 * 将物品转为 未打孔符文槽 的物品
 * @param item {JItem} 没有符文的物品（必须是NWeapon物品）
 * @returns {JItem}
 */
export function toUnperformedRuneWeapon(item) {
    if (item.getNamedTag().contains('runeBore')) { // 判断是否已经有 符文Tag
        return item;
    }
    let loreArray = blockitem.getItemLore(item).split("§r§4§l一一一一一一一一一一;");
    loreArray[3] = '§f§w§r§e⇨§9§l❁§r§e⇦§f§w§];' + loreArray[3];
    item.getNamedTag().putList(new ListTag('runeBore'));
    item.setNamedTag(item.getNamedTag());
    blockitem.setItemLore(item, loreArray.join("§r§4§l一一一一一一一一一一;"));
    return item;
}
/**
 * 将 未打孔物品 转为 有孔符文槽 的物品
 * 或设置物品符文槽数
 * @param item {JItem} 物品
 * @param count {?Number} 符文槽数量
 * @returns {JItem} 返回物品对象
 */
export function toPerformedRuneWeapon(item, count) {
    let runeBore = item.getNamedTag().getList('runeBore');
    let bore = ''; // 孔
    var count = !count ? runeBore.size() : count; // 如果没有传入count
    if (runeBore.size() < count) {
        for (let i = 0, len = count - runeBore.size(); i < len; i++) {
            runeBore.add(new StringTag('', ''));
        }
        item.setNamedTag(item.getNamedTag());
    }
    else if (runeBore.size() > count) { // TODO: 如果count小于原本的符文槽数量
    }
    for (let i = 0, len = runeBore.size(); i < len; i++) {
        let str = runeBore.get(i).parseValue(); // 存储的 符文名（文件名）
        if (str.length) {
            const rune = onlyNameGetItem('rune', str);
            if (rune) {
                str = rune.符文; // 通过文件名获取符文符号
                bore += '§r§7「' + str + '§r§7」';
                if (i != len) {
                    bore += ' ';
                }
                continue; // 下一个
            }
        }
        bore += '§r§7「§8✰§7」';
        if (i != len) {
            bore += ' ';
        }
    }
    let oldLore = blockitem.getItemLore(item);
    oldLore = oldLore.replace(/§f§w§r.+§f§w§]/, '§f§w§r§l' + bore + '§f§w§]');
    blockitem.setItemLore(item, oldLore);
    return item;
}
