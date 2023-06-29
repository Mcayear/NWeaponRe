// @ts-nocheck
declare type byte = number;
declare type char = number;
declare type short = number;
declare type int = number;
declare type long = number;
declare type float = number;
declare type double = number;

declare namespace java.lang {
    declare type Object = globalThis.Object;
}

declare namespace cn.vusv.njsutil {
    declare class FloatTextEntity extends cn.nukkit.entity.mob.EntityMob {
        public constructor(chunk: cn.nukkit.level.format.FullChunk, nbt: cn.nukkit.nbt.tag.CompoundTag): void
        public getSurvivalTick(): int
        public setSurvivalTick(survivalTick: int): void
        public getNetworkId(): int
        public getWidth(): float
        public getLength(): float
        public getHeight(): float
        public attack(source: cn.nukkit.event.entity.EntityDamageEvent): boolean
        public getGravity(): float
        public getDrag(): float
        public lookAt(pos: cn.nukkit.level.Position): void
        public onUpdate(currentTick: int): boolean
        public close(): void
        survivalTick: int
        NetWorkId: int

    }
}

declare module "cn.vusv.njsutil.FloatTextEntity" {
    declare const FloatTextEntity = cn.vusv.njsutil.FloatTextEntity;
}

declare namespace cn.vusv.njsutil {
    declare class inventory extends java.lang.Object {
        public constructor(): void
        public addInv(isDoubleChest: boolean, items: cn.nukkit.item.Item[], name: string, eventHandler: org.graalvm.polyglot.proxy.ProxyExecutable): com.nukkitx.fakeinventories.inventory.ChestFakeInventory
        onSlotChange(event: com.nukkitx.fakeinventories.inventory.FakeSlotChangeEvent, eventHandler: org.graalvm.polyglot.proxy.ProxyExecutable): void
        lambda$addInv$0(eventHandler: org.graalvm.polyglot.proxy.ProxyExecutable, event: com.nukkitx.fakeinventories.inventory.FakeSlotChangeEvent): void

    }
}

declare module "cn.vusv.njsutil.inventory" {
    declare const inventory = cn.vusv.njsutil.inventory;
}

declare namespace cn.vusv.njsutil {
    declare class Main extends cn.nukkit.plugin.PluginBase implements cn.nukkit.event.Listener {
        public constructor(): void
        public onLoad(): void
        public onEnable(): void
        public onDisable(): void
        log: cn.nukkit.plugin.PluginLogger

    }
}

declare module "cn.vusv.njsutil.Main" {
    declare const Main = cn.vusv.njsutil.Main;
}

declare namespace cn.vusv.njsutil {
    declare class Util$1 extends com.google.gson.reflect.TypeToken {
        constructor(this$0: cn.vusv.njsutil.Util): void
        this$0: cn.vusv.njsutil.Util

    }
}

declare module "cn.vusv.njsutil.Util$1" {
    declare const Util$1 = cn.vusv.njsutil.Util$1;
}

declare namespace cn.vusv.njsutil {
    declare class Util extends java.lang.Object {
        public constructor(): void
        public JSONtoYAML(json: string): string
        public YAMLtoJSON(yaml: string): string
        public formatJSON(json: string): string

    }
}

declare module "cn.vusv.njsutil.Util" {
    declare const Util = cn.vusv.njsutil.Util;
}