function updateMapCost(getValue){
	var mapLevel =  parseInt(document.getElementById("mapLevelInput").value, 10);
	var baseCost = 0;
	if (mapLevel > game.global.world || mapLevel < 6 || isNaN(mapLevel)) return;
	//Sliders: 27 total * 0.74 = ~20
	baseCost += getMapSliderValue("size");
	baseCost += getMapSliderValue("loot");
	baseCost += getMapSliderValue("difficulty");
	baseCost *= (game.global.world >= 60) ? 0.74 : 1;
	//Special Modifier
	var specialModifier = getSpecialModifierSetting();
	if (specialModifier != "0"){
		baseCost += mapSpecialModifierConfig[specialModifier].costIncrease;
	}
	//Perfect Checkbox
	if (checkPerfectChecked()){
		baseCost += 6;
	}
	//Extra Levels
	var extraLevels = getExtraMapLevels();
	if (extraLevels > 0){
		baseCost += (10 * extraLevels);
	}
	baseCost += mapLevel;
	baseCost = Math.floor((((baseCost / 150) * (Math.pow(1.14, baseCost - 1))) * mapLevel * 2) * Math.pow((1.03 + (mapLevel / 50000)), mapLevel));
	if (document.getElementById("biomeAdvMapsSelect").value != "Random") baseCost *= 2;
	if (getValue) return baseCost;
	document.getElementById("mapCostFragmentCost").innerHTML = prettify(baseCost);
}

autoTrimpSettings["VoidMaps"].value = 495;

newSelectHeirloom(0, 'heirloomsExtra', this);
equipHeirloom();

newSelectHeirloom(-1,'ShieldEquipped', this)
unequipHeirloom();

calculateDamage(game.global.soldierCurrentAttack, true, true).split('-')[1] * 19.89; //Trimp Max Damage

var breed_speed = 0.00085 * Math.pow(1.1,game.upgrades.Potency.done) * Math.pow(1.01,game.buildings.Nursery.owned) * (1 + 0.1*game.portal.Pheromones.level) * Math.pow(1.003,game.unlocks.impCount.Venimp);
Math.floor(Math.log(45 * breed_speed * game.resources.trimps.owned / game.resources.trimps.soldiers) / -Math.log(0.98));


settingChanged("BuyJobs");

numTab(6);
setMax(.1);
game.global.firing = true;
buyJob('Lumberjack',true,true);

var breed_speed = 0.00085 * Math.pow(1.1,game.upgrades.Potency.done) * Math.pow(1.01,game.buildings.Nursery.owned) * (1 + 0.1*game.portal.Pheromones.level) * Math.pow(1.003,game.unlocks.impCount.Venimp);
var genesToHire = (Math.floor(Math.log(45 * breed_speed * game.resources.trimps.owned / game.resources.trimps.soldiers) / -Math.log(0.98)))- game.jobs.Geneticist.owned;
game.global.lastCustomAmt = genesToHire;
numTab(5, true);
game.global.firing = false; 
buyJob('Geneticist',true,true);

function buyGenes()
{
	settingChanged("BuyJobs");
	numTab(6);
	setMax(1);
	game.global.firing = true;
	buyJob('Lumberjack',true,true);
	game.global.firing = false; 
	var breed_speed = 0.00085 * Math.pow(1.1,game.upgrades.Potency.done) * Math.pow(1.01,game.buildings.Nursery.owned) * (1 + 0.1*game.portal.Pheromones.level) * Math.pow(1.003,game.unlocks.impCount.Venimp);
	var genesToHire = (Math.floor(Math.log(45 * breed_speed * game.resources.trimps.owned / game.resources.trimps.soldiers) / -Math.log(0.98))) - game.jobs.Geneticist.owned;
	if (genesToHire != undefined && genesToHire != 0 && genesToHire != Infinity)
	{
		game.global.firing = true;
		game.global.lastCustomAmt = 100000;
		numTab(5, true);
		buyJob('Geneticist',true,true);
		game.global.firing = false;
	}
	settingChanged("BuyJobs");
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

var notified = false;
var notificationZone = game.options.menu.mapAtZone.setZone;

if (!notified && game.global.world == game.options.menu.mapAtZone.setZone)
{
	notifyMe();
	notified = true;
}
if (game.options.menu.mapAtZone != notificationZone)
{
	if (notified)
	{
		notified = false;
	}
	notificationZone = game.options.menu.mapAtZone;
}