export interface Equipment {
    名称: string;
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
    锻造属性?: {
        [key: string]: any;
    };
    锻造词条?: string;
    盔甲染色?: {
      r: number;
      g: number;
      b: number;
    }
    镶嵌: string[];
    无限耐久?: boolean;
    限制等级: number;
    是否在创造背包显示?: boolean;
    击杀提示?: string;
}

export interface forgingAttr {
    mAttr: {
        [key: string]: string;
    };
    attr: {
        [key: string]: string;
    };
}