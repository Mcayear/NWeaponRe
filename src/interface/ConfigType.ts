export interface EquipmentType {
	名字: string;
	外形: [string, number];
	附魔: string[];
	类型: string;
	可副手?: boolean;
	可符文?: boolean;
	稀有度: number;
	品阶: number;
	分解所得?: string;
	介绍: string;
	属性: {
		[key: string]: any;
	};
	锻造属性主词条?: {
		[key: string]: any;
	};
	锻造属性: {
		[key: string]: any;
	};
	锻造词条?: string;
	限制等级: number;
	是否在创造背包显示?: boolean;
	不可强化?: boolean;
    不显示属性?: string;
    镶嵌?: string[];
	无限耐久?: boolean;
    不可分解?: boolean;
	染色?: {
		r: number;
		g: number;
		b: number;
	}
    套装?: string;
    定制者?: string;
    生效槽?: number[];

	类别?: string;
    强度?: number;// float
    直升?: number;
    幸运?: number;// float
    堆叠使用?: boolean;
    失败保护?: boolean;
    禁止上架?: boolean;
    符文?: string;
    符文类型?: string;
	耐久?: number;

	消耗: boolean;
    方案: [string[], string[]];
    获得经验: number;
}

export interface WeaponConfigType extends EquipmentType {
	击杀提示: string;
	镶嵌: string[];
	无限耐久?: boolean;
}

export interface ArmorConfigType extends EquipmentType {
	染色?: {
		r: number;
		g: number;
		b: number;
	}
	镶嵌: string[];
	无限耐久?: boolean;
}

export interface ForgeBlueprintType {
    类型: string;
    外形: [string, number];
    附魔: string[];
    名字: string;
    介绍: string;
    消耗: boolean;
    限制等级: number;
    方案: [string[], string[]];
    获得经验: number;
	可符文?: boolean;
}

export interface ForgingAttrType {
	mAttr: {
		[key: string]: string | number | number[];
	};
	attr: {
		[key: string]: string | number | number[];
	};
}

export interface MainConfigType {
	language: string;
	version: string;
	worldsDisabled: string;
	允许附魔: boolean;
	NeedFailedTips: string;
	品阶: string[];
	稀有度: string[];
	分解所得: [
		{[key: string]: string[]},
		string[]
	];
	锻造模式: number;
	锻造词条: boolean;
	锻造: Array<Array<string | number>>;
	锻造等级: {
		经验公式: string;
		等级公式: string;
		最大等级: number;
	};
	默认镶嵌概率: number;
	ForingExp: {
		onlySameLevel: boolean;
		nonSameLevelGive: number;
	};
	AttrDisplayPercent: string[];
	useHarmFloatWord: boolean;
	itemDefaultBind: boolean;
	defaultAttr: {[key: string]: number };
	Seiko: {
		enable: boolean;
		need: string[];
		failedAddition: number;
		attr: (string | number)[][][];
	};
	GradeSymbol: {
		enable: boolean;
		list: Array<Array<number | string>>;
	};
	unbind: {
		enable: boolean;
		onlyOp: boolean;
		failExec: string[];
		succExec: string[];
	};
	bind: {
		enable: boolean;
		defaultBind: boolean;
	};
	Strengthen: {
		enable: boolean;
		model: number;
		failedAddition: number;
		need: Array<string>;
		chance: number[];
		failed: Array<Array<number>>;
		broadcastMessage: [number, string];
		attr: { [key: string]: number | string }[][];
		style: {
			icon: string;
			firstList: string[];
		}
	};
	defaultCritMultiply: number;
	EffectSuit: {
		[key: string]: {
			attr: { [key: string]: number };
		};
	};
	稀有度品阶排序: boolean;
	Rune: {
		enable: boolean;
	};
}

export interface ItemTypeList {
	"武器": "Weapon",
	"护甲": "Armor",
	"饰品": "Jewelry",
	"宝石": "Gem",
	"图纸": "ForgeBlueprint",
	"符文": "Rune",
	"锻造石": "FStone",// Forging Stone
	"精工石": "SeikoStone",// Seiko Stone
	"宝石券": "GemTicket",// Gem Inlay Ticket
	"强化石": "Strengthen"// Strengthen Stone
};

import ForgeEntryType from "./ForgeEntryType.js";

export interface _CType {
	MainConfig: MainConfigType;
	ItemTypeList: ItemTypeList;
	ForgeEntry: ForgeEntryType;

    PlayerData: any,
    NbtItem: any,

    GemConfig: { [key: string]: EquipmentType };
    RuneConfig: { [key: string]: EquipmentType };
	WeaponConfig: { [key: string]: WeaponConfigType };
	ArmorConfig: { [key: string]: ArmorConfigType };
    JewelryConfig: { [key: string]: EquipmentType };
    ForgeBlueprintConfig: { [key: string]: ForgeBlueprintType };
}
