trapIndexs = ["","Fire","Frost","Poison","Lightning","Strength","Condenser","Knowledge"];

var tdStringCode = (string) => {
	saveLayoutStringTo(string,-1);
    loadLayoutAtSlot(-1);
    //playerSpire.lootAvg.accumulator = 0;
    //playerSpire.lootAvg.average = 0;
    playerSpire.lootAvg.lastAvg = [];
    playerSpire.updateRsPs();
};

/**
 * Saves a layout to game
 * @param string swaq td layout String
 * @param slot layout slot to save to
 */
var saveLayoutStringTo = (string,slot) => {
    let s = new String(string);
    let index = s.indexOf("+",0);
    s = s.slice(0,index);
    let length = s.length;

    if (s.length > 200) return;

    var saveLayout = [];
    for (let i = 0; i < length; i++) {
        saveLayout.push(trapIndexs[s.charAt(i)]);
    }
    playerSpire['savedLayout' + slot] = saveLayout;
};

var loadLayoutAtSlot = (slot) => {
    var saveLayout = playerSpire["savedLayout" + slot];
    if ((playerSpire.runestones + playerSpire.getCurrentLayoutPrice()) < playerSpire.getSavedLayoutPrice(slot)) return false;
    playerSpire.resetTraps();
    for (var x = 0; x < saveLayout.length; x++){
        if (!saveLayout[x]) continue;
        playerSpire.buildTrap(x, saveLayout[x]);
    }
    return true;
};

var loadLayout

function getClipboardText(ev) {
  return ev.clipboardData.getData("text/plain").replace(/\s/g, '');
}

playerSpire.drawInfo = function() {
        if (!this.popupOpen) return;
        if (this.smallMode){
            this.drawSmallInfo();
            return;
        }
        var elem = document.getElementById('playerSpireInfoPanel');
        var infoHtml = "";
        infoHtml += "<div id='playerSpireInfoTop'>";
        infoHtml += "<span onmouseover='playerSpire.infoTooltip(\"Runestones\", event)' onmouseout='tooltip(\"hide\")'>Runestones: <span id='playerSpireRunestones'>" + prettify(this.runestones) + "</span><br/>Runestones per Second: <span id='RsPs'>" + prettify(this.getRsPs()) + "</span></span>";
        infoHtml += "<br/><span onmouseover='playerSpire.infoTooltip(\"Enemies\", event)' onmouseout='tooltip(\"hide\")'>Enemies: <span id='playerSpireCurrentEnemies'>" + this.currentEnemies + "</span> / <span id='playerSpireMaxEnemies'>" + this.maxEnemies + "</span></span>";
        infoHtml += "<br/><span onmouseover='playerSpire.infoTooltip(\"Spirestones\", event)' onmouseout='tooltip(\"hide\")' id='spirestoneBox'>" + this.getSpirestoneHtml() + "</span><br/><span onmouseover='playerSpire.infoTooltip(\"Threat\", event)' onmouseout='tooltip(\"hide\")' id='playerSpireDifficulty'>" + this.getDifficultyHtml() + "</span></div>";
        infoHtml += "<div id='spireTrapsWindow'>";
        infoHtml += "<div onclick='playerSpire.shrink()' id='shrinkSpireBox' class='spireControlBox'>Shrink Window</div>";
        infoHtml += "<div onclick='playerSpire.settingsTooltip()' id='spireSettingsBox' class='spireControlBox'>Settings</div>"
        infoHtml += "<div onclick='tooltip(\"confirm\", null, \"update\", \"Are you sure you want to sell all Traps and Towers? You will get back 100% of Runestones spent on them.<br/><br/>" + ((this.paused) ? "" : "<b>Protip:</b> Pause your Spire before selling your defenses if you want to avoid leaking!") + "\", \"playerSpire.resetTraps()\", \"Sell All?\")' class='spireControlBox'>Sell All</div>";
        infoHtml += "<div onclick='playerSpire.togglePause()' id='pauseSpireBtn' class='spireControlBox spirePaused" + ((this.paused) ? "Yes'>Unpause" : "'>Pause Spire") + "</div>";      
        infoHtml += "<div class='spireControlBoxDbl'><div onclick='playerSpire.presetTooltip(1)'>Layout 1</div><div onclick='playerSpire.presetTooltip(2)'>Layout 2</div></div>"
        infoHtml += "<div onclick='playerSpire.selectTrap(\"shiftUp\")' onmouseout='tooltip(\"hide\")' onmouseover='playerSpire.trapTooltip(\"shiftUp\", event)' id='sellTrapBox' class='spireControlBox" + ((this.selectedTrap == "shiftUp") ? " selected" : "") + "'>Shift Up</div>";
        infoHtml += "<div onclick='playerSpire.selectTrap(\"shiftDown\")' onmouseout='tooltip(\"hide\")' onmouseover='playerSpire.trapTooltip(\"shiftDown\", event)' id='sellTrapBox' class='spireControlBox" + ((this.selectedTrap == "shiftDown") ? " selected" : "") + "'>Shift Down</div>";
		infoHtml += "<input id=exportString placeholder=Import onpaste=tdStringCode(getClipboardText(event))>"
        
        // infoHtml += "<div onclick='playerSpire.resetUpgrades()' class='spireControlBox'>Reset Upgrades</div>";
        // infoHtml += "<div onclick='tooltip(\"confirm\", null, \"update\", \"Are you sure you want to reset EVERYTHING? This includes Floors, upgrades, and runestones!\", \"playerSpire.init()\", \"Reset Spire?\")' class='spireControlBox'>Reset EVERYTHING</div>";
        // infoHtml += "<div onclick='playerSpire.clearEnemies()' class='spireControlBox'>Clear Enemies</div>";

        infoHtml += "<br/><hr/>"
        infoHtml += "<div onclick='playerSpire.selectTrap(\"sell\")' onmouseout='tooltip(\"hide\")' onmouseover='playerSpire.trapTooltip(\"sell\", event)' style='padding-top: 1.35vw' id='sellTrapBox' class='spireTrapBox" + ((this.selectedTrap == "sell") ? " selected" : "") + "'>Sell a Trap/Tower</div>";
        var cheapestTrap = -1;
        for (var item in playerSpireTraps){
            var trap = playerSpireTraps[item];
            if (trap.locked) continue;
            var trapText = trap.isTower ? "Tower" : "Trap";
            trapText += " " + romanNumeral(trap.level);
            var trapIcon = "";
            if (this.settings.trapIcons) trapIcon = "<span class='icomoon icon-" + trap.icon + "'></span> ";
            var cost = this.getTrapCost(item);
            var color = (this.runestones >= cost) ? trap.color : "grey";
            infoHtml += "<div style='background-color: " + color + "' onmouseout='tooltip(\"hide\")' onmouseover='playerSpire.trapTooltip(\"" + item + "\", event)' onclick='playerSpire.selectTrap(\"" + item + "\")' id='" + item + "TrapBox' class='spireTrapBox" + ((item == this.selectedTrap) ? " selected" : "") + "'>" + trapIcon + item + " " + trapText + "<br/>" + prettify(this.getTrapCost(item)) + " Rs</div>"
            if (this.runestones < cost && (cheapestTrap == -1 || cost < cheapestTrap)) cheapestTrap = cost;
        }
        this.nextTrap = cheapestTrap;
        infoHtml += "</div><hr/>"; //spireTrapsWindow
        infoHtml += "<span id='playerSpireCloseBtn' class='icomoon icon-close' onclick='playerSpire.closePopup()'></span>";
        infoHtml += "<div id='playerSpireUpgradesArea'>";
        infoHtml += this.getUpgradesHtml();
        infoHtml += "</div>"; //playerSpireUpgradesArea
        elem.innerHTML = infoHtml;
    };


/*
var tdQueue = [];

var addLayout = (string) => {
    saveLayoutStringTo(string,-1);
};
*/