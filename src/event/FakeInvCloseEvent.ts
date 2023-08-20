import { EventPriority, PowerNukkitX as pnx } from ':powernukkitx';

// 虚拟物品栏关闭事件
pnx.listenEvent("cn.nukkit.event.inventory.InventoryCloseEvent", EventPriority.NORMAL, event => {
    let player = event.getPlayer();
    let inv = event.getInventory();
    let invName = inv.getName().substring(0, 6);
    if (event.isCancelled()) return;
	let FakeInvCloseEventHook = contain('FakeInvCloseEventHook');
    FakeInvCloseEventHook.has(invName) && FakeInvCloseEventHook.get(invName).call(this, event, player, inv);
});