var perked = false;
var prestiged = false;
enableDebug = false;

setInterval(
	function(){
		if(game.global.world>=80) {
			if( getEmpowerment() != "Wind" || game.global.mapsActive || game.empowerments.Wind.currentDebuffPower==200) {
				if (!(game.global.mapsActive && game.global.mapsOwnedArray[getMapIndex(game.global.currentMapId)].bonus == "lmc"))
				{
					setFormation(2);
				}
				if (getEmpowerment() != "Wind")
				{
					MODULES["maps"].enoughDamageCutoff = 4;
				}
			}
			else if (game.global.challengeActive == "Daily" && !game.global.spireActive) {
				setFormation(4);
				if (game.global.gridArray[game.global.lastClearedCell+1].corrupted == "corruptBleed" || game.global.gridArray[game.global.lastClearedCell+1].corrupted == "healthyBleed") {
					setFormation(2);
				}
				MODULES["maps"].enoughDamageCutoff = 20;
			}
		}
		if (game.global.soldierHealth == 0 && !(game.global.spireActive || (game.global.mapsActive && getCurrentMapObject().location == "Void") || game.global.preMapsActive)) {
			fightManual();
			buyArmors();
		}
		if (game.global.antiStacks != 45 && game.global.realBreedTime >= 45000 && !game.global.SpireActive) {
			forceAbandonTrimps();
        }
		if ((needPrestige || !enoughDamage) && game.global.world>=200 && (getEmpowerment() == "Ice" || (getEmpowerment() == "Wind" && game.global.realBreedTime >= 45000)) && !game.global.mapsActive && game.global.mapBonus != 10 && game.global.world!=game.options.menu.mapAtZone.setZone) {
			forceAbandonTrimps();
        }
		if (game.options.menu.mapAtZone.enabled == 1 && (game.global.world == game.options.menu.mapAtZone.setZone)){
			if (getPageSetting('AutoMaps') == 1 && game.global.mapsActive && !prestiged){
				toggleAutoMaps();
				game.global.repeatMap = false;
			}
			else if (!prestiged && game.global.preMapsActive) {
				game.options.menu.repeatUntil.enabled = 2;
				game.global.repeatMap = true
				plusPres();
				buyMap();
				selectMap(game.global.mapsOwnedArray[game.global.mapsOwnedArray.length-1].id);
				runMap();
				prestiged = true;
			}
			else if (prestiged && game.global.preMapsActive){
				recycleMap();
				game.options.menu.mapAtZone.setZone = game.options.menu.mapAtZone.setZone == 495?506:510;
				toggleAutoMaps();
			}
		}
		if (game.global.world == 496 || game.global.world == 507){
			prestiged = false;
		}
		
		
		//AutoAllocate Looting II
		if (game.global.world==230){
			perked = false;
			prestiged = false;
			game.options.menu.mapAtZone.setZone = 495;
		}
		if (!perked){
			viewPortalUpgrades();
			game.global.lastCustomAmt = 100000;
			numTab(5, true);
			if (getPortalUpgradePrice("Looting_II")+game.resources.helium.totalSpentTemp <= game.resources.helium.respecMax){
				buyPortalUpgrade('Looting_II');
				activateClicked();
				message("Bought 100k Looting II","Notices");
			}
			else{
				perked = true;
				setTimeout(cancelPortal(), 1000);
				message("Done buying Looting II","Notices");
			}
		}
	},500);
	
	function buyArmors(){
		numTab(3);
		buyEquipment('Boots');
		buyEquipment('Helmet');
		buyEquipment('Pants');
		buyEquipment('Shoulderguards');
		buyEquipment('Breastplate')
		buyEquipment('Gambeson')
	}
	
	
	function plusPres(){
		document.getElementById("biomeAdvMapsSelect").value = "Random";
		document.getElementById('advExtraLevelSelect').value = plusMapToRun(game.global.world);
		document.getElementById('advSpecialSelect').value = "p";
		document.getElementById("lootAdvMapsRange").value = 0;
		document.getElementById("difficultyAdvMapsRange").value = 9;
		document.getElementById("sizeAdvMapsRange").value = 9;
		document.getElementById('advPerfectCheckbox').checked = false;
		updateMapCost();
	}
	
function plusMapToRun(zone)
{
	var currentModifier = (zone-235)%15;
	if (currentModifier == 1){
		if ( zone%10 == 1){
			return 4;
		}
		else if ( zone%10 == 6)
		{
			return 5;
		}
	}
	else if (currentModifier == 5){
		if (zone%10 == 5) {
			return 6;
		}
		else if ( zone%10 == 0) {
			return 5;
		}
	}
	return 0;
}