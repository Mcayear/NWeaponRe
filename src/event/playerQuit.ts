import { EventPriority, PowerNukkitX as pnx } from ':powernukkitx';
//import { File } from '@LLSELib';

pnx.listenEvent("cn.nukkit.event.player.PlayerQuitEvent", EventPriority.NORMAL, event => {
	let name = event.getPlayer().getName();
	let dataMap: Map<string, any> = contain("NWeapon_PlayerAttr");
    let seikoFailedNum = contain('seikoFailedNum');
    let strengthFailedNum = contain('strengthFailedNum');
	//let playerAttrData = JSON.stringify(dataMap.get(name.toLocaleLowerCase()));

    dataMap.delete(name.toLocaleLowerCase());
	delete seikoFailedNum[name];
	delete strengthFailedNum[name];
    /*
    // 为什么要存呢？
	manager.writeFile("./plugins/BlocklyNukkit/NWeapon/_PlayerData/attr/"+name+".json", playerAttrData);
    */
});