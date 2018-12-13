String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

var tdString = (string) => {
	s = new String(string);
	s=s.replaceAll(" ","");
	s=s.replaceAll("_",0)
	s=s.replaceAll("F",1);
	s=s.replaceAll("Z",2);
	s=s.replaceAll("P",3);
	s=s.replaceAll("L",4);
	s=s.replaceAll("S",5);
	s=s.replaceAll("C",6);
	s=s.replaceAll("K",7);
	return s;
}

var upgrades = (string) => {
	s = new String(string);
	s = s.replaceAll(",","");
	return s;
}

function importLayout(string) {
  var oldSelect = selectedTrap;
  char c = string.charAt(0);
  if ( c == 'F'|| c == 'Z' || c == 'P' || c == 'L' || c == 'S' || c == 'C' || c == 'K' || c == '_')
  {
	  let newString = tdString(string);
	  string = newString+"+"+upgrades(importedTrapLevels.toString())+"+"+newString.length/5;
  }
  firstSplit = string.split("+");
  if (firstSplit.length != 3) return;
  
  importedLayout = firstSplit[0].split("");
  importedTrapLevels = firstSplit[1].split("");
  importedRows = firstSplit[2];

  if (importedRows < 0 || importedRows > 20) return;
  if (importedLayout.length != importedRows * 5) return;
  if (importedTrapLevels.length != upgradeableTraps.length) return;
  
  document.getElementById("spireRows").value = importedRows; // sets rows from layout
  buildSpire();

  // sets Trap
  for (var x in importedLayout) {
    cell = Number(x);
    if (cell == NaN || exportIndexes[importedLayout[cell]] == undefined) continue;
    selectedTrap = exportIndexes[importedLayout[cell]];
    setTrap(cell, true);
  }
  // set Trap Levels
  for (var t in importedTrapLevels) {
    trapLevel = Number(importedTrapLevels[t]);
    if (trapLevel == NaN || upgradeableTraps[t] == undefined || importedTrapLevels[t] == undefined) continue;
    updateTrapDamage(upgradeableTraps[t], trapLevel, true);
  }

  runInformation();
  getCostOfUpgrades();
  selectedTrap = oldSelect;
}
