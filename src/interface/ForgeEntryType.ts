interface Config {
    maxLevel: number;
    ubEntry: ConfigEntry;
}

interface ConfigEntry {
    defaultCount: number[];
    Update: number;
    MaxCount: number;
    updateAddCount: boolean;
}

interface Entry {
    list: string[];
    p: number[];
    add?: number[];
}

export interface EquipmentEntryType {
    mainEntry: Entry;
    ubEntry: Entry;
}

export default interface RootObject {
    Config: Config;
    [key: string]: EquipmentEntryType | Config;
}