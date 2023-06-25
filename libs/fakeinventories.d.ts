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

declare namespace java.util {
    declare type List<T> = globalThis.Array<T>;
    declare type Set<T> = globalThis.Set<T>;
    declare type Map<K, V> = globalThis.Map<K, V>;
}

declare namespace com.nukkitx.fakeinventories {
    declare class FakeInventoriesListener extends java.lang.Object implements cn.nukkit.event.Listener {
        public constructor(fakeInventories: com.nukkitx.fakeinventories.inventory.FakeInventories): void
        public onPacketSend(event: cn.nukkit.event.server.DataPacketSendEvent): void
        public onPacketRecieve(event: cn.nukkit.event.server.DataPacketReceiveEvent): void
        public onTransaction(event: cn.nukkit.event.inventory.InventoryTransactionEvent): void
        public constructor(): void
        static lambda$onTransaction$0(fakeInventory: com.nukkitx.fakeinventories.inventory.FakeInventory): java.util.List
        fakeInventories: com.nukkitx.fakeinventories.inventory.FakeInventories
        closingInventory: java.util.ArrayList<java.util.UUID>

    }
}

declare module "com.nukkitx.fakeinventories.FakeInventoriesListener" {
    declare const FakeInventoriesListener = com.nukkitx.fakeinventories.FakeInventoriesListener;
}

declare namespace com.nukkitx.fakeinventories {
    declare class FakeInventoriesPlugin extends cn.nukkit.plugin.PluginBase {
        public constructor(): void
        public onEnable(): void
        public onDisable(): void
        fakeInventories: com.nukkitx.fakeinventories.inventory.FakeInventories

    }
}

declare module "com.nukkitx.fakeinventories.FakeInventoriesPlugin" {
    declare const FakeInventoriesPlugin = com.nukkitx.fakeinventories.FakeInventoriesPlugin;
}

declare namespace com.nukkitx.fakeinventories.inventory {
    declare class AnvilFakeInventory extends com.nukkitx.fakeinventories.inventory.FakeInventory {
        public constructor(): void
        public constructor(holder: cn.nukkit.inventory.InventoryHolder): void
        public constructor(holder: cn.nukkit.inventory.InventoryHolder, title: string): void
        constructor(type: cn.nukkit.inventory.InventoryType, holder: cn.nukkit.inventory.InventoryHolder, title: string): void
        onOpenBlock(who: cn.nukkit.Player): java.util.List<cn.nukkit.math.BlockVector3>
        placeAnvil(who: cn.nukkit.Player, pos: cn.nukkit.math.BlockVector3): void
        static getNbt(pos: cn.nukkit.math.BlockVector3, name: string): byte[]
        public getName(): string
        public setName(name: string): void
        name: string

    }
}

declare module "com.nukkitx.fakeinventories.inventory.AnvilFakeInventory" {
    declare const AnvilFakeInventory = com.nukkitx.fakeinventories.inventory.AnvilFakeInventory;
}

declare namespace com.nukkitx.fakeinventories.inventory {
    declare class ChestFakeInventory extends com.nukkitx.fakeinventories.inventory.FakeInventory {
        public constructor(): void
        public constructor(holder: cn.nukkit.inventory.InventoryHolder): void
        public constructor(holder: cn.nukkit.inventory.InventoryHolder, title: string): void
        constructor(type: cn.nukkit.inventory.InventoryType, holder: cn.nukkit.inventory.InventoryHolder, title: string): void
        onOpenBlock(who: cn.nukkit.Player): java.util.List<cn.nukkit.math.BlockVector3>
        placeChest(who: cn.nukkit.Player, pos: cn.nukkit.math.BlockVector3): void
        static getNbt(pos: cn.nukkit.math.BlockVector3, name: string): byte[]
        public getName(): string
        public setName(name: string): void
        name: string

    }
}

declare module "com.nukkitx.fakeinventories.inventory.ChestFakeInventory" {
    declare const ChestFakeInventory = com.nukkitx.fakeinventories.inventory.ChestFakeInventory;
}

declare namespace com.nukkitx.fakeinventories.inventory {
    declare class DoubleChestFakeInventory extends com.nukkitx.fakeinventories.inventory.ChestFakeInventory {
        public constructor(): void
        public constructor(holder: cn.nukkit.inventory.InventoryHolder): void
        public constructor(holder: cn.nukkit.inventory.InventoryHolder, title: string): void
        public onOpen(who: cn.nukkit.Player): void
        onOpenBlock(who: cn.nukkit.Player): java.util.List<cn.nukkit.math.BlockVector3>
        pair(who: cn.nukkit.Player, pos1: cn.nukkit.math.BlockVector3, pos2: cn.nukkit.math.BlockVector3): void
        static getDoubleNbt(pos: cn.nukkit.math.BlockVector3, pairPos: cn.nukkit.math.BlockVector3, name: string): byte[]
        lambda$onOpen$0(who: cn.nukkit.Player, blocks: java.util.List): void

    }
}

declare module "com.nukkitx.fakeinventories.inventory.DoubleChestFakeInventory" {
    declare const DoubleChestFakeInventory = com.nukkitx.fakeinventories.inventory.DoubleChestFakeInventory;
}

declare namespace com.nukkitx.fakeinventories.inventory {
    declare class DropperFakeInventory extends com.nukkitx.fakeinventories.inventory.FakeInventory {
        public constructor(): void
        public constructor(holder: cn.nukkit.inventory.InventoryHolder): void
        public constructor(holder: cn.nukkit.inventory.InventoryHolder, title: string): void
        constructor(type: cn.nukkit.inventory.InventoryType, holder: cn.nukkit.inventory.InventoryHolder, title: string): void
        onOpenBlock(who: cn.nukkit.Player): java.util.List<cn.nukkit.math.BlockVector3>
        placeDropper(who: cn.nukkit.Player, pos: cn.nukkit.math.BlockVector3): void
        static getNbt(pos: cn.nukkit.math.BlockVector3, name: string): byte[]
        public getName(): string
        public setName(name: string): void
        name: string

    }
}

declare module "com.nukkitx.fakeinventories.inventory.DropperFakeInventory" {
    declare const DropperFakeInventory = com.nukkitx.fakeinventories.inventory.DropperFakeInventory;
}

declare namespace com.nukkitx.fakeinventories.inventory {
    declare class FakeInventories extends java.lang.Object {
        public constructor(): void
        public getFakeInventoryPositions(player: cn.nukkit.Player): java.util.List<cn.nukkit.math.BlockVector3>
        public getFakeInventory(player: cn.nukkit.Player): java.util.Optional<com.nukkitx.fakeinventories.inventory.FakeInventory>
        public createAnvilInventory(): com.nukkitx.fakeinventories.inventory.AnvilFakeInventory
        public createChestInventory(): com.nukkitx.fakeinventories.inventory.ChestFakeInventory
        public createDoubleChestInventory(): com.nukkitx.fakeinventories.inventory.DoubleChestFakeInventory
        public createDropperInventory(): com.nukkitx.fakeinventories.inventory.DropperFakeInventory
        public createFurnaceInventory(): com.nukkitx.fakeinventories.inventory.FurnaceFakeInventory
        public createHopperInventory(): com.nukkitx.fakeinventories.inventory.HopperFakeInventory
        public createShulkerBoxInventory(): com.nukkitx.fakeinventories.inventory.ShulkerBoxFakeInventory
        public createWorkbenchInventory(): com.nukkitx.fakeinventories.inventory.WorkbenchFakeInventory
        public removeFakeInventory(inventory: com.nukkitx.fakeinventories.inventory.FakeInventory): void

    }
}

declare module "com.nukkitx.fakeinventories.inventory.FakeInventories" {
    declare const FakeInventories = com.nukkitx.fakeinventories.inventory.FakeInventories;
}

declare namespace com.nukkitx.fakeinventories.inventory {
    declare class FakeInventory extends cn.nukkit.inventory.ContainerInventory {
        public constructor(type: cn.nukkit.inventory.InventoryType): void
        public constructor(type: cn.nukkit.inventory.InventoryType, holder: cn.nukkit.inventory.InventoryHolder): void
        public constructor(type: cn.nukkit.inventory.InventoryType, holder: cn.nukkit.inventory.InventoryHolder, title: string): void
        public onOpen(who: cn.nukkit.Player): void
        onFakeOpen(who: cn.nukkit.Player, blocks: java.util.List<cn.nukkit.math.BlockVector3>): void
        onOpenBlock(var0: cn.nukkit.Player): java.util.List<cn.nukkit.math.BlockVector3>
        public onClose(who: cn.nukkit.Player): void
        public getPosition(player: cn.nukkit.Player): java.util.List<cn.nukkit.math.BlockVector3>
        public addListener(listener: com.nukkitx.fakeinventories.inventory.FakeInventoryListener): void
        public removeListener(listener: com.nukkitx.fakeinventories.inventory.FakeInventoryListener): void
        public onSlotChange(source: cn.nukkit.Player, action: cn.nukkit.inventory.transaction.action.SlotChangeAction): boolean
        checkForClosed(): void
        public close(): void
        public getTitle(): string
        public setTitle(title: string): void
        lambda$close$1(player: cn.nukkit.Player): void
        static lambda$onClose$0(blocks: java.util.List, index: int, who: cn.nukkit.Player): void
        static ZERO: cn.nukkit.math.BlockVector3
        static open: java.util.Map<cn.nukkit.Player, com.nukkitx.fakeinventories.inventory.FakeInventory>
        blockPositions: java.util.Map<cn.nukkit.Player, java.util.List<cn.nukkit.math.BlockVector3>>
        listeners: java.util.List<com.nukkitx.fakeinventories.inventory.FakeInventoryListener>
        closed: boolean
        title: string

    }
}

declare module "com.nukkitx.fakeinventories.inventory.FakeInventory" {
    declare const FakeInventory = com.nukkitx.fakeinventories.inventory.FakeInventory;
}

declare namespace com.nukkitx.fakeinventories.inventory {
    declare interface FakeInventoryListener {
        public onSlotChange(var0: com.nukkitx.fakeinventories.inventory.FakeSlotChangeEvent): void

    }
}

declare module "com.nukkitx.fakeinventories.inventory.FakeInventoryListener" {
    declare type FakeInventoryListener = com.nukkitx.fakeinventories.inventory.FakeInventoryListener;
}

declare namespace com.nukkitx.fakeinventories.inventory {
    declare class FakeSlotChangeEvent extends java.lang.Object implements cn.nukkit.event.Cancellable {
        constructor(player: cn.nukkit.Player, inventory: com.nukkitx.fakeinventories.inventory.FakeInventory, action: cn.nukkit.inventory.transaction.action.SlotChangeAction): void
        public setCancelled(): void
        public getPlayer(): cn.nukkit.Player
        public getInventory(): com.nukkitx.fakeinventories.inventory.FakeInventory
        public getAction(): cn.nukkit.inventory.transaction.action.SlotChangeAction
        public isCancelled(): boolean
        public setCancelled(cancelled: boolean): void
        player: cn.nukkit.Player
        inventory: com.nukkitx.fakeinventories.inventory.FakeInventory
        action: cn.nukkit.inventory.transaction.action.SlotChangeAction
        cancelled: boolean

    }
}

declare module "com.nukkitx.fakeinventories.inventory.FakeSlotChangeEvent" {
    declare const FakeSlotChangeEvent = com.nukkitx.fakeinventories.inventory.FakeSlotChangeEvent;
}

declare namespace com.nukkitx.fakeinventories.inventory {
    declare class FurnaceFakeInventory extends com.nukkitx.fakeinventories.inventory.FakeInventory {
        public constructor(): void
        public constructor(holder: cn.nukkit.inventory.InventoryHolder): void
        public constructor(holder: cn.nukkit.inventory.InventoryHolder, title: string): void
        constructor(type: cn.nukkit.inventory.InventoryType, holder: cn.nukkit.inventory.InventoryHolder, title: string): void
        onOpenBlock(who: cn.nukkit.Player): java.util.List<cn.nukkit.math.BlockVector3>
        placeFurnace(who: cn.nukkit.Player, pos: cn.nukkit.math.BlockVector3): void
        static getNbt(pos: cn.nukkit.math.BlockVector3, name: string): byte[]
        public getName(): string
        public setName(name: string): void
        name: string

    }
}

declare module "com.nukkitx.fakeinventories.inventory.FurnaceFakeInventory" {
    declare const FurnaceFakeInventory = com.nukkitx.fakeinventories.inventory.FurnaceFakeInventory;
}

declare namespace com.nukkitx.fakeinventories.inventory {
    declare class HopperFakeInventory extends com.nukkitx.fakeinventories.inventory.FakeInventory {
        public constructor(): void
        public constructor(holder: cn.nukkit.inventory.InventoryHolder): void
        public constructor(holder: cn.nukkit.inventory.InventoryHolder, title: string): void
        constructor(type: cn.nukkit.inventory.InventoryType, holder: cn.nukkit.inventory.InventoryHolder, title: string): void
        onOpenBlock(who: cn.nukkit.Player): java.util.List<cn.nukkit.math.BlockVector3>
        placeHopper(who: cn.nukkit.Player, pos: cn.nukkit.math.BlockVector3): void
        static getNbt(pos: cn.nukkit.math.BlockVector3, name: string): byte[]
        public getName(): string
        public setName(name: string): void
        name: string

    }
}

declare module "com.nukkitx.fakeinventories.inventory.HopperFakeInventory" {
    declare const HopperFakeInventory = com.nukkitx.fakeinventories.inventory.HopperFakeInventory;
}

declare namespace com.nukkitx.fakeinventories.inventory {
    declare class ShulkerBoxFakeInventory extends com.nukkitx.fakeinventories.inventory.FakeInventory {
        public constructor(): void
        public constructor(holder: cn.nukkit.inventory.InventoryHolder): void
        public constructor(holder: cn.nukkit.inventory.InventoryHolder, title: string): void
        constructor(type: cn.nukkit.inventory.InventoryType, holder: cn.nukkit.inventory.InventoryHolder, title: string): void
        onOpenBlock(who: cn.nukkit.Player): java.util.List<cn.nukkit.math.BlockVector3>
        placeShulkerBox(who: cn.nukkit.Player, pos: cn.nukkit.math.BlockVector3): void
        static getNbt(pos: cn.nukkit.math.BlockVector3, name: string): byte[]
        public getName(): string
        public setName(name: string): void
        name: string

    }
}

declare module "com.nukkitx.fakeinventories.inventory.ShulkerBoxFakeInventory" {
    declare const ShulkerBoxFakeInventory = com.nukkitx.fakeinventories.inventory.ShulkerBoxFakeInventory;
}

declare namespace com.nukkitx.fakeinventories.inventory {
    declare class WorkbenchFakeInventory extends com.nukkitx.fakeinventories.inventory.FakeInventory {
        public constructor(): void
        public constructor(holder: cn.nukkit.inventory.InventoryHolder): void
        public constructor(holder: cn.nukkit.inventory.InventoryHolder, title: string): void
        constructor(type: cn.nukkit.inventory.InventoryType, holder: cn.nukkit.inventory.InventoryHolder, title: string): void
        onOpenBlock(who: cn.nukkit.Player): java.util.List<cn.nukkit.math.BlockVector3>
        placeWorkbench(who: cn.nukkit.Player, pos: cn.nukkit.math.BlockVector3): void
        static getNbt(pos: cn.nukkit.math.BlockVector3, name: string): byte[]
        public getName(): string
        public setName(name: string): void
        name: string

    }
}

declare module "com.nukkitx.fakeinventories.inventory.WorkbenchFakeInventory" {
    declare const WorkbenchFakeInventory = com.nukkitx.fakeinventories.inventory.WorkbenchFakeInventory;
}