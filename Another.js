var numAnother = 3;
var another = "another ";

function cacheReward(resourceName, time, cacheName){
	if (resourceName == "random"){
		var eligible = ["food", "wood", "metal"];
		var roll = Math.floor(Math.random() * eligible.length);
		resourceName = eligible[roll];
	}
	var amt = simpleSeconds(resourceName, time);
	amt = scaleToCurrentMap(amt);
	addResCheckMax(resourceName, amt, null, null, true);
	message("You open the " + cacheName + " at the end of the map to find " + prettify(amt) + " " + resourceName + "!", "Loot", "*dice", null, "cache");
	if (Fluffy.isRewardActive("lucky")){
		if (Math.floor(Math.random() * 100) < 25) {
			addResCheckMax(resourceName, amt, null, null, true);
			anotherMessage(resourceName,amt,cacheName);
		}
	}
}

function anotherMessage(resourceName, amt, cacheName) {
	var strings = [	"Fluffy found another " + cacheName + " with another " + prettify(amt) + " " + resourceName,
					"Fluffy found another " + cacheName + " with another another " + prettify(amt) + " " + resourceName,
					"Fluffy found another another " + cacheName + " with another " + prettify(amt) + " " + resourceName,
					"Fluffy found a " + cacheName + " with " + prettify(amt) + " " + resourceName,
					"Fluffers found another thing with another x amount of stuff",
					"Fluffy gives you another hideous look when he realizes that you have found another^another XeX " + resourceName + "... this is getting you another another heavy time",
					"Looking under another rock, Fluffy found another cache with another " + prettify(amt) + " " + resourceName + ", adding another another to this sentence because I heard you like another so we put another another in your another so your anothers could have another another",
					"フラフィー様がもう一つLMCの中で" + prettify(amt) + "金額を見つかれました"
	]
	
	var string = strings[getRandomInt(strings.length)];
	if ((game.global.formation == 3))
	{
		string = strings[strings.length-1];
	}
	var string = "Fluffy found another " + cacheName + " with " + another + "" + prettify(amt) + " " + resourceName;
	string = "Fluffy found another " + cacheName + " with " + another + "" + prettify(amt) + " " + resourceName; 
	message(string + "!", "Loot", "*dice", null, "cache");
	message("Another Fluffy found another another " + cacheName + " with " + "another another " + "" + prettify(amt) + " " + resourceName + "!", "Loot", "*dice", null, "cache");
}

function setNumAnother(n)
{
	numAnother = n>10?10:n;
	another = "";
	for (i = 0; i<numAnother; i++)
	{
		another += "another "
	}
}

function setAnother()
{
	var n = prompt("Set number of anothers","1");
	if  (parseInt(n) != NaN)
	{
		setNumAnother(n);
	}
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}