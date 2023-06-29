import * as blockitem from '../../util/blockitem.js';
import * as Tool from '../../util/Tool.js';
const { toPerformedRuneWeapon } = await import('../../improvements/rune/toPerformedRuneWeapon.js');
import {StringTag} from 'cn.nukkit.nbt.tag.StringTag';

import { mc } from '@LLSELib';

type JPlayer = cn.nukkit.Player;
type JItem = cn.nukkit.item.Item;

export function sendRuneInlayWin(player: JPlayer) {
    let HandItem = blockitem.getItemInHand(player);
    const HandItemName = HandItem.getCustomName();
    const HandItemData = Tool.getNWeaponConfig(HandItem.getNamedTag().getString('NWeaponNameTag'));
    if (!HandItemData) {
        return player.sendMessage("[NWeapon] §c请手持NWeapon装备,符文将镶嵌至手中装备");
    }
    if (!HandItem.getNamedTag().contains('runeBore')) {// 判断是否有 符文Tag
        return player.sendMessage("[NWeapon] " + HandItemName + " §r没有符文数据");
    }
    let runeBore = HandItem.getNamedTag().getList('runeBore');// ['runeName']
    const runeBoreCount = runeBore.size();
    if (!runeBoreCount) {// 符文是否开槽
        return player.sendMessage("[NWeapon] 请先将 " + HandItemName + " §r开槽");
    }
    let runeBoreIndex = -1;
    for (let i = 0; i < runeBore.size(); i++) {
        const str = runeBore.get(i).parseValue() as any as string;// 存储的 符文名
        if (!str.length) {
            runeBoreIndex = i;
            break;
        }
    }
    if (runeBoreIndex === -1) {// 符文是否有空位
        return player.sendMessage("[NWeapon] 装备 " + HandItemName + " §r没有空的符文槽位");
    }
    let invItems = player.getInventory().getContents();// 玩家背包
    // 遍历玩家背包将 可用的符文 添加到haveRuneList和usableRuneList
    let winx = mc.newSimpleForm();
    winx.setTitle("符文镶嵌");
    winx.setContent("符文镶嵌成功率100%%，且可拆卸");
    let usableRuneList:string[] = [];// 用于显示
    let haveRuneList:JItem[] = [];// 用于存储item对象
    const _C = contain('NWeapon_C');
    for (let [index, invItem] of invItems) {
        let data = _C.RuneConfig[invItem.getCustomName()];// 通过物品名获取配置数据
        if (data) {
            let bind = invItem.getNamedTag().getString('PlayerBind');
            if (bind && JSON.parse(bind).name != player.getName()) {// 检查物品绑定
                continue;
            }
            usableRuneList.push(invItem.getCustomName());
            winx.addButton(invItem.getCustomName(), '');
            invItem.setCount(1);
            haveRuneList.push(invItem);
        }
    }
    
    mc.getPlayer(player.getName())!.sendForm(winx, function (btnId:number) {
        const sel = winx._Form.getButtons().get(btnId).getText();
        if (sel === "请选择") {
            return player.sendMessage("[NWeapon] §7未选择符文，已取消镶嵌");
        }
        let rune = haveRuneList[usableRuneList.indexOf(sel)];
        if (!blockitem.hasItemToPlayer(player, rune)) {
            return player.sendMessage("[NWeapon] §c背包未携带该符文");
        }
        if (HandItemData.不可镶嵌属性) {
            const RuneData = Tool.getNWeaponConfig(rune.getNamedTag().getString('NWeaponNameTag'));
            if (!RuneData) {
                return player.sendMessage("[NWeapon] §c未能成功获取 §r" + rune.getCustomName() + " §r§c的符文信息");
            }
            for (let key in RuneData.属性) {
                if (HandItemData.不可镶嵌属性.indexOf(key) > -1) {
                    return player.sendMessage("[NWeapon] §c该装备不允许镶嵌 §r" + rune.getCustomName() + " §r§c符文，因为含有§6 " + key + " §c属性！");
                }
            }
        }
        if (!HandItem.equals(blockitem.getItemInHand(player))) {
            return player.sendMessage("[NWeapon] §c手持物品发生变更");
        }
        let runeData = Tool.onlyNameGetItem('rune', sel);
        runeBore.add(runeBoreIndex, new StringTag('', sel) as any);// sel是显示名字
        HandItem = toPerformedRuneWeapon(HandItem);// 更新物品lore
        blockitem.setItemInHand(player, HandItem);
        blockitem.removeItemFromPlayer(player, rune);
        player.sendMessage("[NWeapon] §a符文 §r" + runeData!.符文 + " §r§a镶嵌成功");
    });
}