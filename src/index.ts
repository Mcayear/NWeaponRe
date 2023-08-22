import { Player as JPlayer } from "cn.nukkit.Player";
import { Item as JItem } from "cn.nukkit.item.Item";
import { Server } from "cn.nukkit.Server";
import { Inventory } from "cn.nukkit.inventory.Inventory";
import { FakeInvName } from './enum/FakeInvEnum.js';

type JEntity = cn.nukkit.entity.Entity;
type JItem = cn.nukkit.item.Item;
type JPlayer = cn.nukkit.Player;
type CommadHandleRes = {
    action: string;
    codeName: string;
    playerName: string;
    CheckType: string;
    showId?: string;
    ItemType: string;
    ItemName: string;
    number?: number;
    runeAction?: string;
    clear?: 'clear';
    player: {
        _PNXEntity: JEntity
        name: string;
    };
    value: string | number;
    sec: string | number;
    attrName: string;
    currentTag: string;
    newTag: string;
};
type CommadHandleOut = {
    error: (arg0: string) => void;
    success: (arg0: string) => void;
    addMessage: (arg0: string) => any;
}

interface AttrObject {
    [key: string]: number[];
}

// TODO: sendRuneTakeWin
async function start() {
    const {
        version, getGradeSymbol, _C, TaskExecList,
        getItData, getArmorConfig, getGemConfig, getJewelryConfig, getPaperConfig, getRuneConfig, getWeaponConfig
    } = await import('./util/WeaponConfig.js');
    const { mc, File, ParamType, PermType } = await import('@LLSELib');
    const { Util: UtilClass } = await import('cn.vusv.njsutil.Util');
    const Tool = await import('./util/Tool.js');
    const { SetPlayerAttr, GetPlayerAttr } = await import('./improvements/AttrComp.js');
    const { ForgingFakeInvChange } = await import('./improvements/forging/ForgingFakeInvChange.js');
    const { NWeaponDecomposition } = await import('./improvements/Decomposition/NWeaponDecomposition.js');
    const { checkAttr } = await import('./improvements/check/check.js');
    const { sendGemInlayWin } = await import('./enhancements/gem/sendGemInlayWin.js');
    const { sendStrengthenWin } = await import('./enhancements/strength/sendStrengthenWin.js');
    const { toPerformedRuneWeapon } = await import('./improvements/rune/toPerformedRuneWeapon.js');
    const { sendRuneInlayWin } = await import('./enhancements/rune/sendRuneInlayWin.js');
    

    const blockitem = await import("./util/blockitem.js");
    const { inventory } = await import("cn.vusv.njsutil.inventory");

    const Util = new UtilClass();
    const server = Server.getInstance();
    const NWeaponSkill: any = null;

    if (!contain('NWeapon_C')) {// todo: 防止重复 NWeapon_C
        exposeObject('NWeapon_C', _C);
    }
    /**
     * 玩家锻造界面临时数据
     * 一般为锻造图配置
     */
    if (!contain('PlayerSmithingTempData')) {// 防止重复 PlayerSmithingTempData
        exposeObject('PlayerSmithingTempData', new Map());
    }

    /**
     * hook 虚拟物品栏关闭事件
     */
    if (!contain('FakeInvCloseEventHook')) {// 防止重复 FakeInvCloseEventHook
        exposeObject('FakeInvCloseEventHook', new Map());
    }

    // 仅存储在内存的数据
    var ShowObj = new Map<string, any>();
    var PlayerShowCount = new Map<string, number>();
    
    if (!contain('seikoFailedNum')) {// 精工失败次数 记录
        exposeObject('seikoFailedNum', new Map<string, number>());
    }

    if (!contain('strengthFailedNum')) {// 强化失败次数 记录
        exposeObject('strengthFailedNum', new Map<string, number>());
    }

    /**
     * 添加延时任务
     */
    function addTimeoutTask<T extends any[]>(timestamp: number, obj: {
        func: (uid: string) => void;
        args: T;
    }) {
        while (TaskExecList.has(timestamp)) {
            timestamp++;
        }
        TaskExecList.set(timestamp, obj);
        return timestamp;
    }
    /**
     * 命令处理
     * @param {Command} _cmd 自身的指令对象
     * @param {CommandOrigin} _ori 命令的执行者
     * @param {CommandOutput} out 向命令执行者输出命令的执行结果
     * @param {Object} res 结果
     * @returns 
     */
    function NWeaponCommandHandle(_cmd: any, _ori: { type: number; player: { _PNXEntity: JEntity; } }, out: CommadHandleOut, res: CommadHandleRes) {
        if (_ori.type != 0 && _ori.type != 7) {
            console.log("Wrong origin type: " + _ori.type);
            out.error("Wrong origin type: " + _ori.type);
            return;
        }
        const sender: JPlayer = _ori.type === 0 ? <any>_ori.player._PNXEntity : server.getConsoleSender();
        switch (res.action) {
            case "addnbt": {
                if (!sender.isOp()) {
                    return out.error("[NWeapon] Only OP.");
                }
                let item = blockitem.getItemInHand(sender);
                /** 使用传入的name或者随机生成4位数随机名字 */
                var keyName: string;
                if (res.codeName) {
                    keyName = res.codeName;
                } else {
                    keyName = Math.random().toString().substring(2, 6);
                }
                _C.NbtItem[keyName] = item.getId() + ":" + item.getDamage() + ":" + blockitem.getNBTString(item);
                out.success("[NWeapon] 已添加nbt: " + keyName);
                File.writeTo("./plugins/ItemNbt/NbtItem.yml", Util.JSONtoYAML(JSON.stringify(_C.NbtItem)));
                break;
            }
            case "delnbt": {
                // todo: 判断codeName不存在的情况
                if (!sender.isOp()) {
                    return out.error("[NWeapon] Only OP.");
                }
                if (!_C.NbtItem[res.codeName]) {
                    return out.error("[NWeapon] " + res.codeName + " §6不存在");
                }
                delete _C.NbtItem[res.codeName];
                out.success("[NWeapon] 已删除nbt: " + res.codeName);
                File.writeTo("./plugins/ItemNbt/NbtItem.yml", Util.JSONtoYAML(JSON.stringify(_C.NbtItem)));
                break;
            }
            case "分解": {
                NWeaponDecomposition(sender, [blockitem.getItemInHand(sender)]);
                break;
            }
            case "分解快捷栏": {
                /*
                if (LoadFunc.callbackString("getVIPLevel", 0, sender.getName()) < 1) {
                    return out.error("[NWeapon] 快捷栏分解仅VIP可用");
                }*/
                let bagitems = sender.getInventory();
                let itemlist: JItem[] = [];
                for (let i = 0; i < 9; i++) {
                    let item = bagitems.getItem(i);
                    if (item != null) {
                        itemlist.push(item);
                    }
                }
                NWeaponDecomposition(sender, itemlist);
                break;
            }
            case "inlay": {
                sendGemInlayWin(sender);
                break;
            }
            case "check": {
                let p = sender;
                if (res.playerName) {
                    p = server.getPlayer(res.playerName);
                    if (p === null) {
                        return out.error("[NWeapon] 玩家§8" + res.playerName + "§f不在线");
                    }
                }
                if (res.CheckType === "attr") {
                    checkAttr(sender, p, res.CheckType, GetPlayerAttr(p, 1));
                } else {
                    checkAttr(sender, p, res.CheckType);
                }
                break;
            }
            case "lock": {
                let item = blockitem.getItemInHand(sender);
                let name = item.getCustomName();
                if (_C.ArmorConfig[name] || _C.WeaponConfig[name]) {
                    if (item.getNamedTag().getString('lock')) {
                        return out.addMessage("[NWeapon] §c装备已锁定使用 `/nwe unlock` 解锁装备");
                    }
                    item.setNamedTag(item.getNamedTag().putString('lock', "1"));
                    blockitem.setItemInHand(sender, item);
                    out.success("[NWeapon] " + name + " §r§a锁定成功。解锁装备使用 /nwe unlock");
                } else {
                    out.error("[NWeapon] §c不可锁定非NWeapon物品");
                }
                break;
            }
            case "unlock": {
                let item = blockitem.getItemInHand(sender);
                let name = item.getCustomName();
                if (_C.ArmorConfig[name] || _C.WeaponConfig[name]) {
                    item.setNamedTag(item.getNamedTag().putString('lock', ""));
                    blockitem.setItemInHand(sender, item);
                    out.success("[NWeapon] " + name + " §r§a解锁成功");
                } else {
                    out.error("[NWeapon] §c不可操作非NWeapon物品");
                }
                break;
            }
            case "bind": {
                let item = blockitem.getItemInHand(sender);
                let name = item.getCustomName();
                if (_C.GemConfig[name] || _C.WeaponConfig[name] || _C.ArmorConfig[name]) {
                    item = Tool.itemBindPlayer(item, sender, false, true);
                    if (!item) {
                        return out.error("[NWeapon] §c绑定失败");
                    }
                    blockitem.setItemInHand(sender, item);
                    out.success("[NWeapon] §a绑定成功");
                } else {
                    out.error("[NWeapon] §c不可绑定非NWeapon物品");
                }
                break;
            }
            case "unbind": {
                if (!_C.MainConfig.unbind.enable) {
                    return out.error("[NWeapon] §c管理员未启用解绑系统");
                }
                let target = sender;
                if (res.playerName) {
                    target = server.getPlayer(res.playerName);
                    if (target === null) {
                        return out.error("[NWeapon] 玩家§8" + res.playerName + "§f不在线");
                    }
                }
                let item = blockitem.getItemInHand(target);
                const name = item.getCustomName();
                let data = _C.GemConfig[name] || _C.WeaponConfig[name] || _C.ArmorConfig[name];
                if (data.不可解绑 && Tool.isPlayer(sender) && !sender.isOp()) {
                    return target.sendMessage("[NWeapon] §c装备§r " + name + " §c不可解绑！");
                }
                if (data) {
                    let befor = Tool.itemUnbindPlayer(item, target);
                    if (befor) {
                        blockitem.setItemInHand(target, befor);
                        target.sendMessage("[NWeapon] §a装备解绑成功");
                        _C.MainConfig.unbind.succExec.forEach(function (v: string) {
                            server.dispatchCommand(<any>server.getConsoleSender(), v.replace("%p", target.getName()));
                        });
                        return;
                    }
                }
                _C.MainConfig.unbind.failExec.forEach(function (v: string) {
                    server.dispatchCommand(<any>server.getConsoleSender(), v.replace("%p", target.getName()));
                });
                target.sendMessage("[NWeapon] §c装备解绑失败");
                break;
            }
            case "dz": {
                sender.addWindow(new inventory().addInv(false, Java.to([], "cn.nukkit.item.Item[]"), FakeInvName.Forging+"锻造", ForgingFakeInvChange) as unknown as Inventory);
                break;
            }
            case "seiko": {
                if (_C.MainConfig.Seiko.enable) {
                    //TODO: sendSeikoWin(sender);
                } else {
                    out.error("[NWeapon] 管理员未启用精工");
                }
                break;
            }
            case "strengthen": {
                if (_C.MainConfig.Strengthen.enable) {
                    sendStrengthenWin(sender);
                } else {
                    out.error("[NWeapon] 管理员未启用淬炼");
                }
                break;
            }
            case "show": {
                if (res.showId) {
                    /**
                     * 分享的物品数据
                     */
                    let data: any = ShowObj.get(res.showId);
                    if (data === undefined) {
                        return out.error("[NWeapon] 不存在此id " + res.showId);
                    }
                    let win = mc.newCustomForm();
                    win.setTitle(data.player + ' 的物品展示 - ' + res.showId);
                    win.addLabel("# §6基本信息§r #");
                    win.addLabel(["物品名: " + data.name, "物品外形: " + data.id.join(":"), "物品标签: " + (data.NWeaponNameTag || "null"), "物品描述: \n" + data.lore].join("\n§r"));
                    if (data.bindinfo) {
                        win.addLabel("# §2灵魂绑定§r #\n" + data.bindinfo);
                    }
                    if (data.forging) {
                        win.addLabel("# §a锻造数据§r #");
                        let attr:AttrObject = data.forging.attr;
                        let str = "";
                        for (let i in attr) {
                            str += "\n  " + i + ": " + Tool.valueToString(attr[i], i);
                        }
                        win.addLabel(["锻造师: " + data.forging.info.player, "锻造师等级: " + data.forging.info.playerlv, "锻造强度: " + data.forging.info.intensity * 100 + "%", "锻造属性: " + str].join("\n§r"));
                    }
                    if (data.seikoinfo) {
                        let type = _C.WeaponConfig[data.name] || _C.ArmorConfig[data.name], str = "";;
                        type = type.类型 == "武器" ? 0 : 1;
                        let attr:AttrObject = _C.MainConfig.Seiko.attr[type][data.seikoinfo.level - 1];
                        for (let i in attr) {
                            str += "\n  " + i + ": " + Tool.valueToString(attr[i], i);
                        }
                        win.addLabel("# §6精工等级§r #\n" + data.seikoinfo.level + "级: " + getGradeSymbol.seiko(data.seikoinfo.level) + "\n属性: " + str);
                    }
                    if (data.strengthen) {
                        if (_C.MainConfig.Strengthen.model != 2) {
                            let type = _C.WeaponConfig[data.name] || _C.ArmorConfig[data.name], str = "";;
                            type = type.类型 == "武器" ? 0 : 1;
                            let attr:AttrObject = _C.MainConfig.Strengthen.attr[type][data.strengthen.level - 1];
                            for (let i in attr) {
                                str += "\n  " + i + ": " + Tool.valueToString(attr[i], i);
                            }
                            let str_lv = _C.MainConfig.Strengthen.style.firstList[data.strengthen.level] + Array(Number(data.strengthen.level) + 1).join(_C.MainConfig.Strengthen.style.icon);
                            win.addLabel("# §c强化等级§r #\n" + data.strengthen.level + "级: " + str_lv + "§r\n属性: " + str);
                        } else {
                            let str_lv = _C.MainConfig.Strengthen.style.firstList[data.strengthen.level] + Array(Number(data.strengthen.level) + 1).join(_C.MainConfig.Strengthen.style.icon);
                            win.addLabel("# §c强化等级§r #\n" + data.strengthen.level + "级: " + str_lv + "§r");
                        }
                    }
                    if (data.gemlist) {
                        win.addLabel("# §b宝石数据§r #");
                        let str = "§7槽位 | 镶嵌的宝石§r"
                        if (data.gemlist.info) {
                            for (let i = 0; i < data.gemlist.info.length; i++) {
                                str += "\n" + data.gemlist.info[i] + " | " + (data.gemlist.inlay[i] || "§7未镶嵌") + "§r";
                            }
                        }
                        win.addLabel(str);
                    }
                    if (data.runeBore) {
                        win.addLabel("# §l§7符文数据§r #");
                        let str = "";
                        for (let i = 0; i < data.runeBore.length; i++) {
                            str += "\n" + (data.runeBore[i] || "§7未镶嵌") + "§r";
                        }
                        win.addLabel(str);
                    }
                    mc.getPlayer(sender.getName())!.sendForm(win, ()=>{});
                    return;
                }
                let vipLv = 0;// LoadFunc.callbackString("getVIPLevel", 0, sender.getName());
                if (<number>PlayerShowCount.get(sender.getName()) > vipLv) {
                    return out.error("[NWeapon] 你最多只能展示" + (vipLv + 1) + "个，请隔60秒后重试");
                }
                let uid = String(Math.random()).substring(3, 6);// 取3位
                let item = blockitem.getItemInHand(sender);
                let lore = blockitem.getItemLore(item).replace(/;/g, "\n");
                if (item.getId() == 0) return out.addMessage("[NWeapon] 你分享了份空气 : )");
                ShowObj.set(uid, { player: sender.getName(), name: item.getCustomName() || item.getName(), NWeaponNameTag: item.getNamedTag() ? item.getNamedTag().getString('NWeaponNameTag') : "", id: [item.getId(), item.getDamage()], lore: lore });
                let gemlist: string;
                let forging: string;
                let bindinfo: string;
                let seikoinfo: string;
                let strengthen: string;
                let runeBore: cn.nukkit.nbt.tag.ListTag<any>;
                if (item.getNamedTag()) {
                    gemlist = item.getNamedTag().getString('GemList');
                    if (gemlist) {
                        ShowObj.get(uid)["gemlist"] = JSON.parse(gemlist);
                    }
                    forging = item.getNamedTag().getString('forging');
                    if (forging) {
                       ShowObj.get(uid)["forging"] = JSON.parse(forging);
                    }
                    bindinfo = item.getNamedTag().getString('PlayerBind');
                    if (bindinfo) {
                       ShowObj.get(uid)["bindinfo"] = JSON.parse(bindinfo).name;
                    }
                    seikoinfo = item.getNamedTag().getString('Seiko');
                    if (seikoinfo) {
                       ShowObj.get(uid)["seikoinfo"] = JSON.parse(seikoinfo);
                    }
                    strengthen = item.getNamedTag().getString('Strengthen');
                    if (strengthen) {
                       ShowObj.get(uid)["strengthen"] = JSON.parse(strengthen);
                    }
                    runeBore = item.getNamedTag().getList('runeBore');
                    if (runeBore && item.getNamedTag().contains('runeBore')) {// listTag需要使用contains判断是否存在
                       ShowObj.get(uid)["runeBore"] = runeBore.parseValue();
                    }
                }
                server.broadcastMessage('[NWeapon] ' +ShowObj.get(uid).player + ' 展示了 ' +ShowObj.get(uid).name + ' §r使用 §7/nwe show ' + uid + ' §r可查看详细页面');
                server.dispatchCommand(sender, 'nwe show ' + uid);
                if (!PlayerShowCount.has(ShowObj.get(uid).player)) {
                    PlayerShowCount.set(ShowObj.get(uid).player, 1);
                } else {
                    PlayerShowCount.set(ShowObj.get(uid).player, <number>PlayerShowCount.get(ShowObj.get(uid).player)+1);
                }
                // 一分钟后销毁分享
                addTimeoutTask(new Date().getTime() + 60000, {
                    func: function (uid: string) {
                        PlayerShowCount.set(ShowObj.get(uid).player, <number>PlayerShowCount.get(ShowObj.get(uid).player)-1);
                        let player = server.getPlayer(ShowObj.get(uid).player);
                        if (player != null) {
                            player.sendMessage("[NWeapon] §7您分享的 " +ShowObj.get(uid).name + " §r- " + uid + " §7已失效.");
                        }
                        ShowObj.delete(uid);
                    },
                    args: [uid]
                });
                break;
            }
            case "reload": {
                if (!sender.isOp()) {
                    out.error("[NWeapon] Only OP.");
                    break;
                }
                out.success("[NWeapon] 配置文件已重载.");
                _C.MainConfig = JSON.parse(Util.YAMLtoJSON(<string>File.readFrom("./plugins/NWeapon/Config.yml")));
                _C.PlayerData = {}, _C.GemConfig = {}, _C.RuneConfig = {}, _C.WeaponConfig = {}, _C.ArmorConfig = {}, _C.JewelryConfig = {}, _C.PaperConfig = {};
                getItData();
                getGemConfig();
                getRuneConfig();
                getWeaponConfig();
                getArmorConfig();
                getJewelryConfig();
                getPaperConfig();
                break;
            }
            case "give":
            case "drop": {
                let player = sender.isPlayer() ? sender.getPlayer() : sender;
                if (!player.isOp()) {
                    return player.sendMessage("[NWeapon] Only OP.");
                }
                let item = Tool.onlyNameGetItem(res.ItemType, res.ItemName, res.number || 1, player);
                if (!item) return;
                if (res.action === "give") {
                    if (res.playerName) {
                        let target = server.getPlayer(res.playerName);
                        if (target === null) {
                            return player.sendMessage("[NWeapon] 目标玩家不在线");
                        }
                        blockitem.addItemToPlayer(target, item);
                    } else {
                        blockitem.addItemToPlayer(player, item);
                    }
                } else if (res.action === "drop") {
                    if (res.playerName) {
                        let target = server.getPlayer(res.playerName);
                        if (target === null) {
                            return player.sendMessage("[NWeapon] 目标玩家不在线");
                        }
                        blockitem.makeDropItem(target.getPosition(), item);
                    } else {
                        blockitem.makeDropItem(player, item);
                    }
                }
                break;
            }
            case 'offhand': {
                let HandItem = sender.getInventory().getItemInHand();
                if (!HandItem.getNamedTag() || !HandItem.getNamedTag().getString('AllowOffhand')) {
                    return out.error("[NWeapon] " + (HandItem.getCustomName() || HandItem.getName()) + " §c不可副手持有");
                }
                let OffhandItem = sender.getOffhandInventory().getItem(0);
                sender.getOffhandInventory().setItem(0, HandItem);
                sender.getInventory().setItemInHand(OffhandItem);
                out.success("[NWeapon] " + (HandItem.getCustomName() || HandItem.getName()) + " §a成功装备至副手");
                break;
            }
            case "rune": {
                if (!_C.MainConfig.Rune.enable) {
                    out.error("[NWeapon] 管理员未启用符文");
                    break;
                }
                switch (res.runeAction) {
                    case "inlay": // 镶嵌
                        sendRuneInlayWin(sender);
                        break;
                    case "take": // 拆卸
                        //TODO: sendRuneTakeWin(sender);
                        break;
                    case "bore": { // 开孔，此操作仅用于符文开孔 [[ /nwe rune bore "Mcayear" ]]
                        let target = sender.getPlayer();// 仅玩家可执行
                        if (res.playerName) {
                            target = server.getPlayer(res.playerName);
                            if (target === null) {
                                return out.error("[NWeapon] §c目标玩家不在线");
                            }
                        }
                        const item = blockitem.getItemInHand(target);
                        if (!item.getCustomName() || !item.getNamedTag().getString('NWeaponNameTag')) {
                            return target.sendMessage("[NWeapon] §c非NWeapon物品");
                        }
                        const nTag = item.getNamedTag().getString('NWeaponNameTag').split(";");
                        const index = ["Weapon", "Armor"].indexOf(nTag[0]);
                        const HandItemName = item.getCustomName() || item.getName();
                        let HandItemData;
                        if (index === -1) {
                            return target.sendMessage("[NWeapon] §c请在第一格放入NWeapon装备");
                        } else if (index === 0) {
                            HandItemData = _C.WeaponConfig[nTag[1]];
                        } else if (index === 1) {
                            HandItemData = _C.ArmorConfig[nTag[1]];
                        }
                        if (!HandItemData) {
                            return target.sendMessage("[NWeapon] " + HandItemName + " §r§c的配置文件丢失");
                        }
                        if (!item.getNamedTag().contains('runeBore')) {
                            return target.sendMessage("[NWeapon] " + HandItemName + " §r§c无法开符文孔");
                        }
                        let runeBore = item.getNamedTag().getList('runeBore');
                        let boreCount = 0;
                        const MaxBoreCount = 6;
                        const beforeCount = runeBore.size()
                        if (beforeCount && !sender.isOp()) {// 不允许非op加孔
                            return;
                        }
                        if (MaxBoreCount === beforeCount) {
                            return target.sendMessage("[NWeapon] §r§c最大只能开6个符文孔");
                        } else if (!beforeCount) {
                            boreCount = Math.floor((HandItemData["品阶"] + 1) / 2);
                        } else {
                            boreCount = beforeCount + 1;
                        }
                        if (boreCount > 6) {
                            boreCount = 6;
                        }
                        const handItem = toPerformedRuneWeapon(item, boreCount);
                        blockitem.setItemInHand(target, handItem);
                        target.sendMessage("[NWeapon] §r§f符文槽 " + beforeCount + "§7->§a" + boreCount);
                        break;
                    }
                    default:
                        sendRuneInlayWin(sender);
                        break;
                }
                break;
            }
            case "effect": {
                if (!sender.isOp()) {
                    return out.error("[NWeapon] Only OP.");
                }
                if (res.clear) {
                    SetPlayerAttr(res.player.name, "Effect", { id: false });
                    out.success("[NWeapon] 已清除 " + res.player.name + " 的所有属性效果");
                    break;
                }
                if (!res.value) {
                    res.value = 0;
                }
                if (!res.sec) {
                    res.sec = 0;
                }
                SetPlayerAttr(res.player.name, "Effect", { id: res.attrName, level: res.value, time: res.sec });
                if (res.sec) {// res.sec
                    out.success("[NWeapon] 已设置 " + res.player.name + " " + res.attrName + " 属性效果等级为 " + res.value + " 持续时长 " + res.sec + "s");
                } else {
                    out.success("[NWeapon] 已清除 " + res.player.name + " 的 " + res.attrName + " 属性效果");
                }
                break;
            }
            case "fixtag": {
                let handItem = blockitem.getItemInHand(sender);
                const handItemName = handItem.getCustomName();
                let handItemLore = blockitem.getItemLore(handItem);
                // 使用原始方法判断是否具有NWeapon特征
                if (handItemName.substring(0, 2) === "§r" && handItemLore.indexOf("§r§4§l一一一一一一一一一一") > -1) {
                    let data = _C.WeaponConfig[handItemName], index = -1;
                    if (data) {
                        index = 0;
                    } else {
                        data = _C.ArmorConfig[handItemName];
                        if (data) {
                            index = 1;
                        }
                    }
                    if (data) {
                        handItem.getNamedTag().putString('NWeaponNameTag', _C.ItemTypeList[data.类型 as keyof typeof _C.ItemTypeList] + ";" + handItemName);
                        handItem.setNamedTag(handItem.getNamedTag());
                        blockitem.setItemInHand(sender, handItem);
                        return out.success("[NWeapon] §a物品NTag已更新");
                    }
                }
                out.error("[NWeapon] §c该物品无法修复NTag");
                break;
            }
            case "upgrade": {
                //TODO: sendNWeaponUpgrade(sender, res.currentTag, res.newTag);
                break;
            }
            case "skill": {
                if (!NWeaponSkill) {
                    return out.error("[NWeapon] §c未装载技能插件");
                }
                NWeaponSkill.cmdHandle(sender, res);
                break;
            }
        }
    }

    mc.listen("onServerStarted", () => {
        let cmd = mc.newCommand(
            "nwe",
            "NWeapon 年系列装备插件",
            PermType.Any
        );
        cmd.setEnum("ReloadAction", ["reload"]);
        cmd.setEnum("GiveAction", ["give", "drop"]);
        cmd.setEnum("DecAction", ["分解", "分解快捷栏"]);
        cmd.setEnum("dzAction", ["dz"]);// 打开锻造界面
        cmd.setEnum("ShowAction", ["show"]);// 展示手中物品
        cmd.setEnum("CheckAction", ["check"]);// 查询我或他人的数据
        cmd.setEnum("BindAction", ["bind", "unbind"]);// 绑定手中装备或宝石(无法被他人使用) / 解绑
        cmd.setEnum("NBTAction", ["addnbt", "delnbt"]);// 将手中物品以代号为名保存至NBT文件 / 删除
        cmd.setEnum("LockAction", ["lock", "unlock"]);// 上锁手持装备(不会被分解) / 解锁

        cmd.setEnum("RuneAction", ["rune"]);// 符文
        cmd.setEnum("RuneNextAction", ["inlay", "take", "锻造图"]);// 镶嵌符文 / 拆卸符文
        cmd.setEnum("RuneBoreAction", ["bore"]);// 为玩家手中装备打符文孔
        cmd.setEnum("UpgradeAction", ["upgrade"]);// 打开一个转换炉用于升级/更新装备
        cmd.setEnum("EffectAction", ["effect"]);// 打开一个转换炉用于升级/更新装备
        cmd.setEnum("SkillAction", ["skill"]);// 技能


        cmd.setEnum("UsuallyAction", ["seiko", "inlay", "strengthen", "offhand"]);// 精工装备, 装备宝石镶嵌, 装备强化, 将手持物品与副手调换, 
        cmd.setEnum("ItemType", ["gem", "armor", "weapon"]);
        cmd.setEnum("CheckType", ["attr", "dz"]);
        cmd.setEnum("clear", ["clear"]);
        cmd.setEnum("attrName", ["暴击倍率", "吸血倍率", "护甲强度", "反伤倍率", "经验加成", "暴击率", "吸血率", "破防率", "反伤率", "闪避率", "暴击抵抗", "吸血抵抗", "命中率", "伤害加成", "攻击加成", "防御加成", "生命加成",
            "破防攻击", "破甲攻击", "攻击力", "防御力", "经验加成", "每秒回复", "生命恢复"]);

        cmd.mandatory("action", ParamType.Enum, "ReloadAction", 1);
        cmd.mandatory("action", ParamType.Enum, "GiveAction", 1);
        cmd.mandatory("action", ParamType.Enum, "DecAction", 1);
        cmd.mandatory("action", ParamType.Enum, "dzAction", 1);
        cmd.mandatory("action", ParamType.Enum, "ShowAction", 1);
        cmd.mandatory("action", ParamType.Enum, "CheckAction", 1);
        cmd.mandatory("action", ParamType.Enum, "BindAction", 1);
        cmd.mandatory("action", ParamType.Enum, "NBTAction", 1);
        cmd.mandatory("action", ParamType.Enum, "LockAction", 1);
        cmd.mandatory("action", ParamType.Enum, "RuneAction", 1);
        cmd.mandatory("runeAction", ParamType.Enum, "RuneNextAction", 1);
        cmd.mandatory("runeAction", ParamType.Enum, "RuneBoreAction", 1);
        cmd.mandatory("action", ParamType.Enum, "UpgradeAction", 1);
        cmd.mandatory("action", ParamType.Enum, "EffectAction", 1);
        cmd.mandatory("action", ParamType.Enum, "SkillAction", 1);
        cmd.mandatory("action", ParamType.Enum, "UsuallyAction", 1);
        cmd.mandatory("clear", ParamType.Enum, "clear", 1);
        cmd.mandatory("attrName", ParamType.Enum, "attrName");

        cmd.mandatory("ItemType", ParamType.Enum, "ItemType", 0);
        cmd.mandatory("CheckType", ParamType.Enum, "CheckType", 1);
        cmd.mandatory("ItemName", ParamType.String);
        cmd.mandatory("player", ParamType.Player);
        cmd.optional("value", ParamType.Int);
        cmd.optional("sec", ParamType.Int);
        cmd.optional("playerName", ParamType.String);
        cmd.optional("number", ParamType.Int);
        cmd.optional("codeName", ParamType.String);
        cmd.optional("showId", ParamType.Int);

        cmd.mandatory("currentTag", ParamType.String);
        cmd.optional("newTag", ParamType.String);

        cmd.overload(["ReloadAction"]);
        cmd.overload(["DecAction"]);
        cmd.overload(["ShowAction", "showId"]);
        cmd.overload(["CheckAction", "CheckType", "playerName"]);
        cmd.overload(["dzAction"]);
        cmd.overload(["NBTAction", "codeName"]);
        cmd.overload(["BindAction", "playerName"]);
        cmd.overload(["LockAction"]);
        cmd.overload(["RuneAction", "RuneNextAction"]);
        cmd.overload(["RuneAction", "RuneBoreAction", "playerName"]);
        cmd.overload(["UpgradeAction", "currentTag", "newTag"]);
        cmd.overload(["EffectAction", "player", "clear"]);
        cmd.overload(["EffectAction", "player", "attrName", "value", "sec"]);
        cmd.overload(["UsuallyAction"]);
        cmd.overload(["GiveAction", "ItemType", "ItemName", "playerName", "number"]);
        //cmd.overload(["SkillAction"]);
        cmd.setCallback(NWeaponCommandHandle);
        cmd.setup();
    });
    import("healthapi.PlayerHealth")
        .then(({ PlayerHealth }) => {
        exposeObject('NWeapon_RSHealthAPI', PlayerHealth); // 获取血量核心插件
    })
        .catch((err) => {
        console.error(err.stack);
    });
    import("cn.ankele.plugin.MagicItem")
        .then(({ MagicItem }) => {
        exposeObject('NWeapon_MagicItem', MagicItem); // 获取魔法物品插件
    })
        .catch((err) => {
        console.error(err.stack);
    });
    import("com.smallaswater.littlemonster.entity.LittleNpc")
        .then(({ LittleNpc }) => {
        exposeObject('NWeapon_LittleNpc', LittleNpc); // 副本插件
    })
        .catch((err) => {
        console.error(err.stack);
    });
    import("com.smallaswater.npc.entitys.EntityRsNPC")
        .then(({ EntityRsNPC }) => {
        exposeObject('NWeapon_RsNPC', EntityRsNPC); // 获取若水NPC
    })
        .catch((err) => {
        console.error(err.stack);
    });
    import('./event/damage.js')
        .catch((err) => {
            console.warn(err.stack)
        console.error('./event/damage  loading failed.');
    });
    import('./event/playerItemHeld.js')
        .catch((err) => {
            console.warn(err.stack)
        console.error('./event/playerItemHeld  loading failed.');
    });
    import('./task/runPlayerLoopTask.js')
        .catch((err) => {
            console.warn(err.stack)
        console.error('./task/runPlayerLoopTask  loading failed.');
    });
    exposeObject('NWeapon_Skill', null);
}

export function main() {
    start()
        .then(() => {
            console.log("NWeapon start done!")
        })
        .catch((err) => {
            console.error("NWeapon start error:\n"+err.stack);
        });
}

export function close() {
    // 清除副作用
}