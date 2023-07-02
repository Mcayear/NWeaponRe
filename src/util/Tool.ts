import { Item as JItem } from "cn.nukkit.item.Item";
import { Util as UtilClass } from 'cn.vusv.njsutil.Util';
import * as blockitem from "./blockitem.js";
import { File } from '@LLSELib';
import { Player as JPlayer } from 'cn.nukkit.Player';
import { Entity as JEntity } from "cn.nukkit.entity.Entity";
import { Inventory } from "cn.nukkit.inventory.Inventory";

type JPlayer = cn.nukkit.Player;
type JEntity = cn.nukkit.entity.Entity;
type JItem = cn.nukkit.item.Item;

const Util = new UtilClass();


export interface ItemConfigType {
    锻造属性: {
        [key: string]: number | string;
    }
    锻造属性主词条: {
        [key: string]: number | string;
    }
    锻造词条: string;
    外形: [string, number];
    名字: string;
    附魔: string[];
    属性: {
        [key: string]: number | string;
    }
    不显示属性: string;
    镶嵌: string[];
    可副手?: boolean;
    类型: string;
    限制等级: number;
    品阶: number;
    稀有度: number;
    介绍: string;
    可符文?: boolean;
    无限耐久?: boolean;
    耐久?: number;
    不可镶嵌属性?: string[];
    不可分解?: boolean;
    分解所得: string;

    符文?: string;
    符文类型?: string;
    类别?: string;
    套装?: string;
    定制者?: string;
    生效槽?: number[];

    直升?: number;
    幸运?: number;// float
    堆叠使用?: boolean;
    失败保护?: boolean;
    禁止上架?: boolean;
    染色?: {
        r: number
        g: number
        b: number
    }
    消耗?: boolean;
    强度?: number;// float
}
export interface PaperConfigType {
    限制等级: number;
    消耗?: boolean;
    可符文?: boolean;
}

/**
 * 将数字ID转为字符串id
 * @param {any} config 
 * @param {string} key
 * @returns {[boolean, object]}
*/
export function numberIdToStringId(config: any, key: string): [boolean]|[boolean, any] {
    if (isNaN(config[key][0])) {
        return [false];
    }
    config[key][0] = JItem.get(config[key][0]).getNamespaceId();
    return [true, config];
}

export function getNukkitItem(data: [number | string, number]): JItem;
export function getNukkitItem(data: [number | string, number], count: number): JItem;
/**
 * 通过id和damage获取物品
 * @param data {Array<number|string, number>} id可为字符串可为数字id，damage仅可为数字
 * @param count {?number} 数量
 * @returns {JItem}
*/
export function getNukkitItem(data: [number | string, number], count?: number): JItem {
    let item;
    if (typeof data[0] === 'string') {
        item = JItem.fromString(data[0]);
    } else {
        item = JItem.get(data[0]);
    }
    item.setDamage(data[1])
    item.setCount(count || 1);
    return item;
}

/**
* 获取装备武器物品
* @param name {string} 装备物品名字
* @param data {any} 配置文件数据
* @returns {JItem} nukkit的物品对象
*/
export function getItem(name: string | null, data: ItemConfigType): JItem {
    const _C = contain('NWeapon_C');
    let item = getNukkitItem(data.外形);
    name = name || data.名字;
    item.setCustomName(name);
    if (data.附魔) {
        for (var i = 0; i < data.附魔.length; i++) {
            let arr = data.附魔[i].split(":");
            blockitem.addItemEnchant(item, parseInt(arr[0]), parseInt(arr[1]));
        }
    }
    let 属性 = [];
    if (data.属性) {
        for (let i in data.属性) {
            if (typeof (data.属性[i]) == 'string' && (data.属性[i] as string).indexOf("-") > -1) {
                属性.push("§r§7" + i + ": §b" + data.属性[i]);
                continue;
            }
            if (_C.MainConfig.AttrDisplayPercent.indexOf(i) > -1) {
                属性.push("§r§7" + i + ": §b" + Math.round((data.属性[i] as number) * 100 * 10000) / 10000 + "%%");
            } else {
                属性.push("§r§7" + i + ": §b" + data.属性[i]);
            }
        }
    }
    if (data.不显示属性) {
        属性 = [data.不显示属性];
    }
    let rune = "", gemInlay = "", lore:string = "";
    if (data.镶嵌 && data.镶嵌.length > 0) {
        gemInlay += (data.稀有度 != undefined ? ';' : '') + "§r§4§l一一一一一一一一一一";
        for (var i = 0, len = data.镶嵌.length; i < len; i++) {
            gemInlay += ";§r§3[§7可镶嵌<" + data.镶嵌[i] + ">§3]";
        }
        item.getNamedTag().putString('GemList', JSON.stringify({ info: data.镶嵌, inlay: [] }));
    }
    let tempLore:string[];
    switch (data.类型) {
        case "武器": {
            if (_C.MainConfig["稀有度品阶排序"]) {
                tempLore = [
                    data.锻造属性 && data.可副手 ? "§r§f[§b" + data.类型 + "§f]§r            §e副手武器" : "§r§f[§b" + (data.可副手 ? "副手" : "") + data.类型 + "§f]§r            " + (data.品阶 != undefined ? _C.MainConfig.品阶[data.品阶] : ''),
                    "§r§4§l一一一一一一一一一一",
                    属性.join(";"),
                    "§r§4§l一一一一一一一一一一",
                    "§r§8装备等级: §b" + data.限制等级 + (data.介绍 ? ";§r" + data.介绍 : ''),
                    "§r" + (data.稀有度 != undefined ? _C.MainConfig.稀有度[data.稀有度] : '') + gemInlay
                ];
            } else {// 默认
                tempLore = [
                    data.锻造属性 && data.可副手 ? "§r§f[§b" + data.类型 + "§f]§r            §e副手武器" : "§r§f[§b" + (data.可副手 ? "副手" : "") + data.类型 + "§f]§r            " + (data.稀有度 != undefined ? _C.MainConfig.稀有度[data.稀有度] : ''),
                    "§r§4§l一一一一一一一一一一",
                    属性.join(";"),
                    "§r§4§l一一一一一一一一一一",
                    "§r§8装备等级: §b" + data.限制等级 + (data.介绍 ? ";§r" + data.介绍 : ''),
                    "§r" + (data.品阶 != undefined ? _C.MainConfig.品阶[data.品阶] : '') + gemInlay
                ];
            }
            if (tempLore[tempLore.length - 1] === "§r") {
                tempLore.length = tempLore.length - 1;
            }
            lore = tempLore.join(";");
            break;
        }
        case "饰品":
        case "护甲": {
            if (_C.MainConfig["稀有度品阶排序"]) {
                tempLore = [
                    "§r§f[§e" + data.类型 + "§f]§r            " + (data.品阶 != undefined ? _C.MainConfig.品阶[data.品阶] : ''),
                    "§r§4§l一一一一一一一一一一",
                    属性.join(";"),
                    "§r§4§l一一一一一一一一一一",
                    "§r§8装备等级: §b" + data.限制等级 + (data.介绍 ? ";§r" + data.介绍 : ''),
                    "§r" + (data.稀有度 != undefined ? _C.MainConfig.稀有度[data.稀有度] : '') + gemInlay
                ];
            } else {// 默认
                tempLore = [
                    "§r§f[§e" + data.类型 + "§f]§r            " + (data.稀有度 != undefined ? _C.MainConfig.稀有度[data.稀有度] : ''),
                    "§r§4§l一一一一一一一一一一",
                    属性.join(";"),
                    "§r§4§l一一一一一一一一一一",
                    "§r§8装备等级: §b" + data.限制等级 + (data.介绍 ? ";§r" + data.介绍 : ''),
                    "§r" + (data.品阶 != undefined ? _C.MainConfig.品阶[data.品阶] : '') + gemInlay
                ];
            }
            if (tempLore[tempLore.length - 1] === "§r") {
                tempLore.length = tempLore.length - 1;
            }
            lore = tempLore.join(";");
            break;
        }
        case "宝石": {
            lore = [
                "§r§f[" + data.类型 + "]§r            " + data.类别,
                属性.join(";")
            ].join(";");
            break;
        }
        case "图纸": {
            lore = [
                "",
                "§r§5需要锻造师等级:§f " + data.限制等级,
                "§r" + data.介绍,
                "§r§5消耗:§f " + data.消耗
            ].join(";");
            break;
        }
        case "锻造石": {
            lore = "§r" + data.介绍;
            if (data.强度) item.getNamedTag().putFloat('Strength', data.强度);
            break;
        }
        case "精工石":
        case "宝石券":
        case "强化石": {
            lore = "§r" + data.介绍;
            if (data.直升) item.getNamedTag().putInt('StraightUp', data.直升);
            if (data.幸运) item.getNamedTag().putFloat('Luck', data.幸运);
            if (data.堆叠使用) item.getNamedTag().putString('stacking', "1");
            if (data.失败保护) item.getNamedTag().putByte('FailProtect', data.失败保护? 1 : 0);
            break;
        }
        case "符文": {
            lore = [
                "§r§7「" + data.符文 + "§r§7」",
                "§r§7§l一一一一一一一一一一",
                "§r§7" + data.符文类型 + "        §9" + data.类别,
                "§r§7§l一一一一一一一一一一",
                "§r" + data.介绍,
                "§r§7§l一一一一一一一一一一"
            ].join(";");
            item.getNamedTag().putString('rune', data.符文!);
            item.getNamedTag().putString('runeType', data.符文类型!);
            item.getNamedTag().putString('type', data.类别!);
            break;
        }
    }
    if (_C.MainConfig.bind && _C.MainConfig.bind.enable && ["武器", "护甲"].indexOf(data.类型) > -1) {
        lore += "\n§r§l§2灵魂绑定§r§2:§r §7未绑定§b§i§n§d§r";
        item.getNamedTag().putString('PlayerBind', JSON.stringify({ name: false, past: false }));
    }
    if (data.可副手) {
        item.getNamedTag().putByte("AllowOffhand", 1);
    }
    if (data.耐久 && data.耐久 > 1) {
        item.getNamedTag().putByte("Unbreakable", 1);
        item.getNamedTag().putInt("Unbreaking", data.耐久);
        lore += "\n§r§l§2耐久§2:§7 " + data.耐久 + "/" + data.耐久 + "§n§j§r";
    } else if (data.无限耐久) {
        item.getNamedTag().putByte("Unbreakable", 1);
    }
    if (data.染色) {
        blockitem.setItemColor(item, data.染色.r, data.染色.g, data.染色.b);
    }
    item.setLore(lore.split(";"));
    item.getNamedTag().putString('NWeaponNameTag', _C.ItemTypeList[data.类型] + ";" + name);
    item.setNamedTag(item.getNamedTag());
    if (data.可符文) {
        item = toUnperformedRuneWeapon(item);
    }
    return item;
}

/**
 * 通过类型和名字获取物品对象
 * @param type {string} 物品类型如：armor,weapon,gem
 * @param itemname {string} 物品名字，文件名或者配置文件中的“名字”项
 * @returns {JItem} nukkit的物品对象
 */
export function onlyNameGetItem(type: string, itemname: string): ItemConfigType|null;

export function onlyNameGetItem(type: string, itemname: string, count: number): JItem|null;
/**
 * 通过类型和名字获取物品对象
 * @param type {string} 物品类型如：armor,weapon,gem
 * @param itemname {string} 物品名字，文件名或者配置文件中的“名字”项
 * @param count {?number} 数量，返回物品的数量
 * @param sender {?JPlayer} 玩家，会对他发送回执信息
 * @returns {JItem} nukkit的物品对象
 */
export function onlyNameGetItem(type: string, itemname: string, count: number, sender: JPlayer): JItem|null;
export function onlyNameGetItem(type: string, itemname: string, count?: any, sender?: any): any {
    const _C = contain('NWeapon_C');
    let obj:ItemConfigType|null = null;
    let item:JItem;
    type = type.toLocaleLowerCase();
    switch (type) {
        case "护甲":
        case "防具":
        case "armor": {
            obj = _C.ArmorConfig[itemname] || File.readFrom("./plugins/NWeapon/Armor/" + itemname + ".yml");
            break;
        }
        case "武器":
        case "weapon": {
            obj = _C.WeaponConfig[itemname] || File.readFrom("./plugins/NWeapon/Weapon/" + itemname + ".yml");
            break;
        }
        case "宝石":
        case "gem": {
            obj = _C.GemConfig[itemname] || File.readFrom("./plugins/NWeapon/Gem/" + itemname + ".yml");
            break;
        }
        case "符文":
        case "rune": {
            obj = _C.RuneConfig[itemname] || File.readFrom("./plugins/NWeapon/Rune/" + itemname + ".yml");
            break;
        }
        case "饰品":
        case "jewelry": {
            obj = _C.JewelryConfig[itemname] || File.readFrom("./plugins/NWeapon/Jewelry/" + itemname + ".yml");
            break;
        }
        case "锻造图":
        case "paper": {
            obj = _C.PaperConfig[itemname] || File.readFrom("./plugins/NWeapon/锻造图/" + itemname + ".yml");
            break;
        }
        case "宝石券":
        case "精工石":
        case "强化石":
        case "锻造石": {
            const file = File.readFrom("./plugins/NWeapon/OtherItem/" + itemname + ".yml");
            if (file) {
                obj = JSON.parse(Util.YAMLtoJSON(<string>file));
                itemname = obj!.名字;
            }
            break;
        }
        default: {
            if (sender) sender.sendMessage("[NWeapon] §cUnknowed Item Type:§7 " + type);
            return null;
        }
    }
    if (obj === null) {
        if (sender) sender.sendMessage("[NWeapon] " + type + "物品 " + itemname + " §r不存在");
        return null;
    }
    if (typeof (obj) === "string") {
        obj = JSON.parse(Util.YAMLtoJSON(obj));
        itemname = obj!.名字;
    }
    if (arguments.length === 2) {
        return obj;// 如果只有 type, itemname 参数返回配置文件对象
    }
    item = getItem(itemname, obj!);
    if (typeof (item) === "undefined") {
        if (sender) sender.sendMessage("[NWeapon] " + type + "物品 " + itemname + " §r配置文件有误");
        return null;
    }
    if (count !=null && !isNaN(count)) {
        if (count > 64) {
            count = 64;
        } else if (count < 1) {
            count = 1
        }
        item.setCount(count);
    }
    return item;
}

/**
 * 获取装备的配置
 * @param {string} itemTag 类似 Weapon;鬼墨的大保剑
 * @returns 
 */
export function getNWeaponConfig(itemTag: string): ItemConfigType | null {
    const _C = contain('NWeapon_C');
	const index_ = itemTag.indexOf(";");
	const arr = [itemTag.substr(0, index_), itemTag.substr(index_+1)];
	switch (arr[0]) {
		case "Weapon": {
			if (_C.WeaponConfig[arr[1]]) {
				return _C.WeaponConfig[arr[1]] || null;
			}
			return null;
		}
		case "Armor": {
			if (_C.ArmorConfig[arr[1]]) {
				return _C.ArmorConfig[arr[1]] || null;
			}
			return null;
		}
		case "Gem": {
			if (_C.GemConfig[arr[1]]) {
				return _C.GemConfig[arr[1]] || null;
			}
			return null;
		}
		case "Jewelry": {
			if (_C.JewelryConfig[arr[1]]) {
				return _C.JewelryConfig[arr[1]] || null;
			}
			return null;
		}
		default: {
			return null;
		}
	}
}

export function valueToString(data: number[]): string;
export function valueToString(data: number[], i?: string): string;
/**
 * 将数据可视化，输入data,属性输出min-max或x%
 * @param {number[]} data 类似 `[1,2]`
 * @param {string} i 类似 `攻击力`
 * @returns {string} min-max 或 x%
 */
export function valueToString(data: number[], i?: string): string {
    const _C = contain('NWeapon_C');
    let back = "";
    let valueData: number = 0;
    if (typeof (data) === "object") {
        if (data[0] == data[1]) {
            valueData = Number(data[0].toFixed(2));
        } else if (data.length === 1) {
            valueData = data[0];
        } else {
            return data[0] + " - " + data[1];
        }
    }
    if (_C.MainConfig.AttrDisplayPercent.indexOf(i) > -1) {
        let tempDataStr: string = (valueData * 100).toFixed(2) + [];
        if (tempDataStr.substring(data.length - 3) === ".00") {
            valueData = Number((valueData - 0).toFixed(0));
        }
        back = valueData + "%%";
    } else {
        back = valueData+"";
    }
    if (valueData == 0) {
        back = '0';
    }
    return back;
}


export function getArrayProbabilisticResults(array: number[]): number;
/**
 * 获取数组概率结果，传入总和为1的数组返回选中概率的下标(下标从0开始)
 * @param {number[]} array 数组
 * @param {number} [index=0] 下标（默认为0）
 * @returns {number} 被选中的下标
 * @example
 *   getArrayProbabilisticResults(['xx', 0.1, 0.2, 0.7], 1);
 */
export function getArrayProbabilisticResults(array: number[], index?: number): number {
    if (index) {
        array = JSON.parse(JSON.stringify(array));
        array.splice(0, index);
    }
    if (array.length === 1) {
        return 0;
    }
    let length = 0, total = 0, random:number;
    array.forEach(function (v) {
        total += Number(v);
        let num = (v + "").length - 2;
        if (length < num) length = num;
    });
    if (total < 0.999 || total > 1.001) {
        console.warn("getArrayProbabilisticResults() has a error data: " + JSON.stringify(array));
        console.info(total)
        return -1;
    }
    total = 0;
    random = Number(Math.random().toFixed(length).substring(2)) - 0 + 1;
    for (let i = 0; i < array.length; i++) {
        total += array[i] * Math.pow(10, length);
        if (total >= random) return i;
    }
    return 0;
}
/**
 * 获取一个数组范围内的随机数
 * @param {[number,number]} array - 一个包含两个数字的数组，表示最小值和最大值
 * @return {number} - 返回一个在最小值和最大值之间的随机数，保留两位小数
 */
export function getRandomNum(array: number[]): number{
	let length = 0;
	if (array.length === 1 && array[0] === array[1]) {
		return array[0];
	}
	array.forEach(function (v){
		let last = (v + "").split(".")[1];
		if (last && length < last.length) {
			length = last.length;
		}
	});
	length = Math.pow(10, length + 2);
	let minNum = array[0] * length;
	let maxNum = array[1] * length;
	return parseInt(String(Math.random() * (maxNum - minNum + 1) + minNum) ,10) / length;
}
/**
 * 对象复制，去除其关联性
 * @param obj {any} 对象
 * @returns {any}
 * @example
 *   cloneObjectFn({a:1});
 */
export function cloneObjectFn<T>(obj: T): T {
    return Object.assign({}, obj);
}

const ListTag = Java.type('cn.nukkit.nbt.tag.ListTag');
const StringTag = Java.type('cn.nukkit.nbt.tag.StringTag');
/**
 * 将物品转为 未打孔符文槽 的物品
 * @param {JItem} item 没有符文的物品（必须是NWeapon物品）
 * @returns {JItem}
 */
export function toUnperformedRuneWeapon(item: JItem): JItem {
    if (item.getNamedTag().contains('runeBore')) {// 判断是否已经有 符文Tag
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
 * @param {JItem} item 物品
 * @param {?number} count 符文槽数量
 * @returns {JItem} 返回物品对象
 */
export function toPerformedRuneWeapon(item: JItem, count: any): JItem {
    let runeBore = item.getNamedTag().getList('runeBore');
    let bore = '';// 孔
    var count = !count ? runeBore.size() : count;// 如果没有传入count
    if (runeBore.size() < count) {
        for (let i = 0, len = count - runeBore.size(); i < len; i++) {
            runeBore.add(new StringTag('', ''));
        }
        item.setNamedTag(item.getNamedTag());
    } else if (runeBore.size() > count) {// TODO: 如果count小于原本的符文槽数量

    }
    for (let i = 0, len = runeBore.size(); i < len; i++) {
        let str = runeBore.get(i).parseValue() as unknown as string;// 存储的 符文名（文件名）
        if (str.length) {
            const rune = onlyNameGetItem('rune', str);
            if (rune) {
                str = rune.符文 as string;// 通过文件名获取符文符号
                bore += '§r§7「' + str + '§r§7」';
                if (i != len) {
                    bore += ' ';
                }
                continue;// 下一个
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
/**
 * 获取概率结果，传入数值返回布尔值
 * @param value {number} 介于 0,1 之间的浮点数 
 * @returns {Boolean}
 * @example
 *   getProbabilisticResults(0.0012);
 */
export function getProbabilisticResults(value:number) {
    if (isNaN(value)) {
        return false;
    } else {
        value = Number(value.toFixed(5));
    }
    let length = 0;
    let strValue = value + "";
    if (value <= 0) {
        return false;
    } else if (value < 1) {
        length = strValue.length - 2;
        value = value * Math.pow(10, length);
    } else if (value >= 1) {
        return true;
    }
    if (Number((Math.random() + "").substring(3, length + 3)) - 0 + 1 > value) return false;
    return true;
}
/**
 * 判断是不是玩家
 * @param {JEntity|JPlayer} entity
 * @returns {boolean}
 */
export function isPlayer(entity: JEntity | JPlayer): boolean {
    return entity instanceof JPlayer;
}
/**
 * 将传入的参数转换为数字类型
 * @param {any} d - 待转换的参数
 * @return {number} - 转换后的数字，如果传入参数为空则返回0
 */
export function defineData(d: any): number {
    return d ? Number(d) : 0;
}
/**
 * 装备灵魂解绑
 * @param {JItem} item 
 * @param {JPlayer} player 
 * @returns 
 */
export function itemUnbindPlayer(item: JItem, player: JPlayer) {
	let name = player.getName();
	let oldLore = blockitem.getItemLore(item);
	if (item.getNamedTag().getString('PlayerBind')) {
		let bindObj = JSON.parse(item.getNamedTag().getString('PlayerBind'));
		if (bindObj.name && (player.isOp() || bindObj.name === name)) {
			bindObj.past = name;
			bindObj.name = false;
			oldLore = oldLore.replace(/§r§l§2灵魂绑定§r§2:§r .+§b§i§n§d§r/, "§r§l§2灵魂绑定§r§2:§r §7未绑定§b§i§n§d§r");
			item.setNamedTag(item.getNamedTag().putString('PlayerBind', JSON.stringify(bindObj)));
		} else {
			return false;
		}
	} else {
		return false;
	}
	blockitem.setItemLore(item, oldLore);
	return item;
}

export function itemBindPlayer(item: JItem, player: JPlayer, noTips: boolean, onlyBind: boolean): JItem;
/**
 * 装备灵魂绑定
 * @param {JItem} item 
 * @param {JPlayer} player 
 * @param {boolean} noTips 为 true 时,不提示装备已被绑定
 * @param {boolean} onlyBind 
 * @returns 
 */
export function itemBindPlayer(item: JItem, player: JPlayer, noTips: boolean, onlyBind?: boolean): JItem | number {
	let name = player.getName();
	if (!item.getNamedTag().getString('PlayerBind')) {
		item.setNamedTag(item.getNamedTag().putString('PlayerBind', JSON.stringify({name: name, past: name})));
	} else {
		let bindObj = JSON.parse(item.getNamedTag().getString('PlayerBind'));
		if (bindObj.name) {
			if (!noTips) {
				player.sendMessage("[NWeapon] §c该装备已被绑定");
			}
			return 0;
		}
		if (!bindObj.past) {
			bindObj.past = name;
		} else {
			if (!onlyBind) return 1;
		}
		bindObj.name = name;
		item.setNamedTag(item.getNamedTag().putString('PlayerBind', JSON.stringify(bindObj)));
	}
	let bindStr = "§a"+name+"§b§i§n§d§r";
	let oldLore = blockitem.getItemLore(item);
	if (!oldLore || oldLore.indexOf("§r§l§2灵魂绑定§r§2:§r ") === -1) {
		blockitem.setItemLore(item, oldLore+"§r§l§2灵魂绑定§r§2:§r "+bindStr);
	} else {
		blockitem.setItemLore(item, oldLore.replace(/§r§l§2灵魂绑定§r§2:§r .+§b§i§n§d§r/, "§r§l§2灵魂绑定§r§2:§r "+bindStr));
	}
	return item;
}


export function examineNeed(needArray: string[], inv: Inventory, isCheck: boolean):[false, string | null]|[true, Inventory| null];
/**
 * 检查并扣除需求，输入Array 输出Boolean
 * @param needArray {string[]} 需求数组
 * @param inv {inventory} 容器对象
 * @param isCheck {?boolean} 是否扣除
 * @param player {?player} 玩家对象
 * @returns {Array<boolean, ?string>} 是否成功，缺少的物品字符串
 * @example
 *   examineNeed(["item@1:0:64", "mi@1:宝石碎片", "money@10000"], player.getInventory(), true, player);
 */
export function examineNeed(needArray: string[], inv: Inventory, isCheck: boolean, player?: JPlayer):[false, string | null]|[true, Inventory | null] {
    const MagicItem = contain("NWeapon_MagicItem");
    const _C = contain("_C");
    let itemNeedList: string[] = [];
    let itemList: JItem[] = [];
    let NeedMoney = 0;
    for (var i = 0; i < needArray.length; i++) {
        let item: JItem | null = null;
        let type = needArray[i].split("@");
        let arr = type[1].split(";");
        let info = arr[1];
        let count = 1;
        let itemDataArr:string[] = arr[0].split(":");// Item Data.
        if (type[0] === "item") {
            if (isNaN(parseInt(itemDataArr[0]))) {
                item = getNukkitItem([arr[0]+':'+arr[1], parseInt(arr[2])], parseInt(arr[3]));
                count = parseInt(arr[3]);
            } else {
                item = blockitem.buildItem(parseInt(arr[0]), parseInt(arr[1]), parseInt(arr[2]));
                count = parseInt(arr[2]);
            }
        } else if (type[0] === "mi") {
            if (!MagicItem) {
                console.warn("你没有使用 MagicItem 插件却在试图获取它的物品：" + arr[1]);
                continue;
            }
            const items: java.util.HashMap<string, JItem> = MagicItem.getItemsMap();
            const otherItems: java.util.HashMap<string, JItem> = MagicItem.getOthers();

            if (items.containsKey(arr[1])) {
                item = items.get(arr[1]) as JItem;
                item.setCount(parseInt(arr[0]));
            } else if (otherItems.containsKey(arr[1])) {
                item = otherItems.get(arr[1]);
                item.setCount(parseInt(arr[0]));
            } else {
                console.info("MagicItem物品不存在：" + arr[1]);
                continue;
            }
            count = parseInt(arr[0]);
        } else if (type[0] === "money") {
            NeedMoney += Number(arr[0]);
            continue;
        } else if (type[0] === "nweapon") {
            item = onlyNameGetItem(arr[0], arr[1], 1);
            tag1:
            if (item) {
                let ntag = item.getNamedTag().getString('NWeaponNameTag');
                for (let v of [...inv.getContents().values()] as JItem[]) {
                    let iNbt = v.getNamedTag();
                    if (!iNbt || !iNbt.getString('NWeaponNameTag')) {
                        continue;
                    }
                    if (iNbt.getString('NWeaponNameTag') != ntag) {
                        continue;
                    }
                    itemList.push(v);
                    break tag1;
                }
                itemNeedList.push("§7(" + arr[0] + ")§r" + item.getCustomName());
                return [false, null];
            }
        }
        if (!item) {
            console.warn("配置文件中需求有误: " + needArray[i]);
            return [false, "配置文件中需求有误"];
        }
        if (inv.contains(item)) {
            itemList.push(item);
        } else {
            itemNeedList.push((info || item.getCustomName() || item.getName()) + " *" + count);
            continue;
        }
    }
    if (itemNeedList.length > 0) {
        let tips = itemNeedList.join("、");
        player && _C.MainConfig.NeedFailedTips && player.sendMessage(_C.MainConfig.NeedFailedTips.replace("%1", tips));
        return [false, tips];
    }
    /*
    if (player) {
        if (manager.getMoney(player) < NeedMoney) {
            let tips = "Money *" + (NeedMoney - manager.getMoney(player));
            _C.MainConfig.NeedFailedTips && player.sendMessage(_C.MainConfig.NeedFailedTips.replace("%1", tips));
            return [false, tips]
        }
        if (isCheck) {
            return [true, null];
        }
        manager.reduceMoney(player, NeedMoney);
    }*/
    if (isCheck) {
        return [true, null];
    }
    itemList.forEach(function (v) {
        inv.removeItem(v);
    });
    if (player) {
        player.getInventory().setContents(inv.getContents());
    }
    return [true, inv];
}
/**
 * 在数组中按概率随机选择指定数量个
 * @param num {number} 传入要抽几个
 * @param arr1 {Array} 内容数组
 * @param arr2 {Array} 概率数组
 * @return {?Array}
 * @example
 *   randChooes(2, ["a", "b", "c", "d", "e"], [0.1, 0.2, 0.3, 0.15, 0.25]);
*/
export function randChooes<T>(num: number, arr1: T[], arr2: number[]): T[]{
    if (arr1.length !== arr2.length) throw "The length of arr1 is not equal to the length of arr2";
    if (num < 1) throw "num is not allowed less than 1";
    if (num >= arr2.length) return arr1;
    const res: T[] = [];
    for (let i = 0; i < num; i++) {
        let index = getArrayProbabilisticResults(arr2);
        res.push(arr1[index]);
        arr1.splice(index, 1);
        let p = arr2.splice(index, 1)[0];
        let add = p / arr2.length;
        arr2.forEach(function (v, arr2i) {
            arr2[arr2i] = v + add;
        });
    }
    return res;
}
