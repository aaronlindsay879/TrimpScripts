var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});
bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
       
        args = args.splice(1);
        switch(cmd) {
			/*
		   // !ping
            case 'ping':
                bot.sendMessage({
                    to: channelID,
                    message: 'Pong!'
                });
                break;
			*/
            case 'dailyAt':
                bot.sendMessage({
                    to: channelID,
                    message: "```" + (args.length === 2 ? getDailyAt(args[0], args[1]) : getDailyAt(args[0], args[1], args[2])) + "```"
                });
                break;
            case 'nextPush':
                bot.sendMessage({
                    to: channelID,
                    message: "```" + (args.length === 1 ? f(args[0]) : f(args[0], args[1])) + "```"
                });
                break;
            default:
                bot.sendMessage({
                    to: channelID,
                    message: 'Not a command'
                });
            // Just add any case commands if you want to..
         }
     }
});

//!dailyAt Month Day Year

function getDailyAt(Month, Day, Year) {
    let today = new Date();
    let date = new Date(Year, Month - 1, Day);
    return date.toUTCString() +"\n\n" + getDailyDescription(Date.daysBetween(today, date));
}

function getDailyAt(Month, Day) {
    let today = new Date();
    let date = new Date(today.getUTCFullYear(), Month - 1, Day);
    return date.toUTCString() +"\n\n" + getDailyDescription(Date.daysBetween(today, date));
}

Date.daysBetween = function (date1, date2) {
    //Get 1 day in milliseconds
    var one_day = 1000 * 60 * 60 * 24;

    // Convert both dates to milliseconds
    var date1_ms = date1.getTime();
    var date2_ms = date2.getTime();

    // Calculate the difference in milliseconds
    var difference_ms = date2_ms - date1_ms;

    // Convert back to days and return
    return Math.round(difference_ms / one_day);
}

function seededRandom(seed) {
    var x = Math.sin(seed++) * 10000;
    return parseFloat((x - Math.floor(x)).toFixed(7));
}

function getRandomIntSeeded(seed, minIncl, maxExcl) {
    var toReturn = Math.floor(seededRandom(seed) * (maxExcl - minIncl)) + minIncl;
    return (toReturn === maxExcl) ? minIncl : toReturn;
}

function everythingInArrayGreaterEqual(smaller, bigger) {
    if (bigger.length < smaller.length) return false;
    for (var x = 0; x < smaller.length; x++) {
        if (smaller[x] > bigger[x]) return false;
    }
    return true;
}

function prettifySub(number) {
    number = parseFloat(number);
    var floor = Math.floor(number);
    if (number === floor) // number is an integer, just show it as-is
        return number;
    var precision = 3 - floor.toString().length; // use the right number of digits

    return number.toFixed(3 - floor.toString().length);
}

function getDailyHeliumValue(weight) {
    //min 2, max 6
    var value = 75 * weight + 20;
    if (value < 100) value = 100;
    else if (value > 500) value = 500;
    value += 100; //Yes we assume Fluffy
    return value;
}

function countDailyWeight(dailyObj) {
    var weight = 0;
    for (var item in dailyObj) {
        if (item == "seed") continue;
        weight += dailyModifiers[item].getWeight(dailyObj[item].strength);
    }
    return weight;
}

function getDailyDescription(n) {
    let daily = getDailyChallengeAt(n);
    let returnText = "";
    for (var item in daily) {
        if (item == 'seed') continue;
        returnText += "- " +  dailyModifiers[item].description(daily[item].strength) + "\n";
    }
    returnText += "\nHelium Mod: +" + prettifySub(getDailyHeliumValue(countDailyWeight(daily))) + "%";
    return returnText;
}

function getDailyTimeString(add, makePretty, getDayOfWeek) {
    var today = new Date();
    if (!add) add = 0;
    let lastAdd = 0;
    today.setUTCDate(today.getUTCDate() + add + lastAdd);
    var year = today.getUTCFullYear();
    var month = today.getUTCMonth() + 1; //For some reason January is month 0? Why u do dis?
    if (month < 10) month = "0" + month;
    var day = today.getUTCDate();
    if (day < 10) day = "0" + day;
    var seedStr = String(year) + String(month) + String(day);
    seedStr = parseInt(seedStr, 10);
    return seedStr;
}

function getDailyChallengeAt(add) {
    var now = new Date().getTime();
    var dateSeed = getDailyTimeString(add);
    var returnText = "";

    var seedStr = getRandomIntSeeded(dateSeed + 2, 1, 1e9);

    var weightTarget = getRandomIntSeeded(seedStr++, 25, 51) / 10;

    var modifierList = [];
    var totalChance = 0;
    var dailyObject = {};

    for (var item in dailyModifiers) {
        modifierList.push(item);
        totalChance += dailyModifiers[item].chance;
    }
    var chanceMod = 1000 / totalChance;
    var currentWeight = 0;
    var maxLoops = modifierList.length;
    var sizeCount = [0, 0, 0];// < 0.3, < 1, >= 1
    var sizeTarget = [getRandomIntSeeded(seedStr++, 0, 2), getRandomIntSeeded(seedStr++, 1, 5), getRandomIntSeeded(seedStr++, 2, 6)]
    if (weightTarget < 2.75) {
        sizeTarget[2] = 0; sizeTarget[0] += 2;
    }
    mainLoop:
    for (var x = 0; x < maxLoops; x++) {
        var maxZLoops = modifierList.length;
        var firstChoice = [];
        modLoop:
        for (var z = 0; z < maxZLoops; z++) {
            var roll = getRandomIntSeeded(seedStr++, 0, 1000);
            var selectedIndex;
            var checkedTotal = 0;
            lookupLoop:
            for (var y = 0; y < modifierList.length; y++) {
                checkedTotal += dailyModifiers[modifierList[y]].chance * chanceMod;
                if ((roll < checkedTotal) || y == modifierList.length - 1) {
                    totalChance -= dailyModifiers[modifierList[y]].chance;
                    chanceMod = 1000 / totalChance;
                    selectedIndex = y;
                    break lookupLoop;
                }
            }
            var selectedMod = modifierList[selectedIndex];
            var modObj = dailyModifiers[selectedMod];
            var str = modObj.minMaxStep[0] + (getRandomIntSeeded(seedStr++, 0, Math.floor(((modObj.minMaxStep[1] + modObj.minMaxStep[2]) * (1 / modObj.minMaxStep[2]))) - modObj.minMaxStep[0]) * modObj.minMaxStep[2]);
            var modWeight = modObj.getWeight(str);
            var modSize = (modWeight < 0.85) ? 0 : ((modWeight < 1.85) ? 1 : 2);
            if ((modWeight + currentWeight > weightTarget + 1)) continue;
            if (everythingInArrayGreaterEqual(sizeTarget, sizeCount)) {
                //use it and stuff
            }
            else if (sizeCount[modSize] >= sizeTarget[modSize] && z != maxZLoops - 1) {
                if (!firstChoice.length) firstChoice = [selectedMod, str, selectedIndex, modSize, modWeight];
                continue modLoop;
            }
            else if (z == maxZLoops - 1 && firstChoice.length) {
                selectedMod = firstChoice[0];
                modObj = dailyModifiers[selectedMod];
                selectedIndex = firstChoice[2];
                str = firstChoice[1];
                modSize = firstChoice[3];
                modWeight = firstChoice[4];
            }

            //It's been officially selected by this point
            sizeCount[modSize]++;
            dailyObject[modifierList[selectedIndex]] = { strength: str, stacks: 0 };
            currentWeight += modWeight;
            if (x > 0 && (currentWeight > weightTarget || (currentWeight >= weightTarget - 0.5 && currentWeight <= weightTarget + 0.5))) {
                break mainLoop;
            }
            modifierList.splice(selectedIndex, 1);
            if (modObj.incompatible) {
                for (var x = 0; x < modObj.incompatible.length; x++) {
                    var incompatibleIndex = modifierList.indexOf(modObj.incompatible[x]);
                    if (incompatibleIndex >= 0) {
                        modifierList.splice(incompatibleIndex, 1);
                    }
                }
            }
            break modLoop;
        }

    }
    dailyObject.seed = dateSeed;
    return dailyObject;
}

var dailyModifiers = {
    minDamage: {
        description: function (str) {
            return "Trimp min damage reduced by " + prettifySub(this.getMult(str) * 100) + "% (additive).";
        },
        getMult: function (str) {
            return 0.1 + ((str - 1) * 0.01);
        },
        getWeight: function (str) {
            return (1 / ((1.2 + (1 - this.getMult(str))) / 2 / 1.1)) - 1;
        },
        minMaxStep: [41, 90, 1],
        chance: 1
    },
    maxDamage: {
        description: function (str) {
            return "Trimp max damage increased by " + prettifySub(this.getMult(str) * 100) + "% (additive).";
        },
        getMult: function (str) {
            return str;
        },
        getWeight: function (str) {
            return (1 - ((1.2 + (1 + str)) / 2 / 1.1));
        },
        minMaxStep: [1, 5, 0.25],
        chance: 1
    },
    plague: { //Half of electricity
        description: function (str) {
            return "Enemies stack a debuff with each attack, damaging Trimps for " + prettifySub(this.getMult(str, 1) * 100) + "% of total health per turn per stack, resets on Trimp death."
        },
        getMult: function (str, stacks) {
            return 0.01 * str * stacks;
        },
        getWeight: function (str) {
            var count = Math.ceil((1 + Math.sqrt(1 + 800 / str)) / 2);
            return (6 - (0.1 * count) + (0.8 / count) + (str / 8)) / 1.75;
        },
        minMaxStep: [1, 10, 1],
        chance: 0.3,
        icon: "*bug2",
        incompatible: ["rampage", "weakness"],
        stackDesc: function (str, stacks) {
            return "Your Trimps are taking " + prettifySub(this.getMult(str, stacks) * 100) + "% damage after each attack.";
        }
    },
    weakness: {
        description: function (str) {
            return "Enemies stack a debuff with each attack, reducing Trimp attack by " + prettifySub(100 - this.getMult(str, 1) * 100) + "% per stack. Stacks cap at 9 and reset on Trimp death.";
        },
        getMult: function (str, stacks) {
            return 1 - (0.01 * str * stacks);
        },
        getWeight: function (str) {
            return str / 4;
        },
        minMaxStep: [1, 10, 1],
        chance: 0.6,
        icon: "fire",
        incompatible: ["bogged", "plague"],
        stackDesc: function (str, stacks) {
            return "Your Trimps have " + prettifySub(100 - this.getMult(str, stacks) * 100) + "% less attack.";
        }
    },
    large: {
        description: function (str) {
            return "All housing can store " + prettifySub(100 - this.getMult(str) * 100) + "% fewer Trimps";
        },
        getMult: function (str) {
            return 1 - (0.01 * str);
        },
        getWeight: function (str) {
            return (1 / this.getMult(str) - 1) * 2;
        },
        start: function (str) {
            game.resources.trimps.maxMod = this.getMult(str);
        },
        abandon: function (str) {
            game.resources.trimps.maxMod = 1;
        },
        minMaxStep: [10, 60, 1],
        chance: 1
    },
    dedication: {
        description: function (str) {
            return "Gain " + prettifySub((this.getMult(str) * 100) - 100) + "% more resources from gathering";
        },
        getMult: function (str) {
            return 1 + (0.1 * str);
        },
        getWeight: function (str) {
            return 0.075 * str * -1;
        },
        incompatible: ["famine"],
        minMaxStep: [5, 40, 1],
        chance: 0.75
    },
    famine: {
        description: function (str) {
            return "Gain " + prettifySub(100 - (this.getMult(str) * 100)) + "% less Metal, Food, Wood, and Gems from all sources";
        },
        getMult: function (str) {
            return 1 - (0.01 * str);
        },
        getWeight: function (str) {
            return (1 / this.getMult(str) - 1) / 2;
        },
        incompatible: ["dedication"],
        minMaxStep: [40, 80, 1],
        chance: 2
    },
    badStrength: {
        description: function (str) {
            return "Enemy attack increased by " + prettifySub((this.getMult(str) * 100) - 100) + "%.";
        },
        getMult: function (str) {
            return 1 + (0.2 * str);
        },
        getWeight: function (str) {
            return 0.1 * str;
        },
        minMaxStep: [5, 15, 1],
        chance: 1
    },
    badHealth: {
        description: function (str) {
            return "Enemy health increased by " + prettifySub((this.getMult(str) * 100) - 100) + "%.";
        },
        getMult: function (str) {
            return 1 + (0.2 * str);
        },
        getWeight: function (str) {
            return 0.2 * str;
        },
        minMaxStep: [3, 15, 1],
        chance: 1
    },
    badMapStrength: {
        description: function (str) {
            return "Enemy attack in maps increased by " + prettifySub((this.getMult(str) * 100) - 100) + "%.";
        },
        getMult: function (str) {
            return 1 + (0.3 * str);
        },
        getWeight: function (str) {
            return (0.1 * (1 + 1 / 3)) * str;
        },
        minMaxStep: [3, 15, 1],
        chance: 1
    },
    badMapHealth: {
        description: function (str) {
            return "Enemy health in maps increased by " + prettifySub((this.getMult(str) * 100) - 100) + "%.";
        },
        getMult: function (str) {
            return 1 + (0.3 * str);
        },
        getWeight: function (str) {
            return (0.3 * str) * (5 / 8);
        },
        minMaxStep: [3, 10, 1],
        chance: 1
    },
    crits: {
        description: function (str) {
            return "Enemies have a 25% chance to crit for " + prettifySub(this.getMult(str) * 100) + "% of normal damage.";
        },
        getMult: function (str) {
            return 1 + (0.5 * str);
        },
        getWeight: function (str) {
            return 0.15 * this.getMult(str);
        },
        minMaxStep: [1, 24, 1],
        chance: 0.75
    },
    trimpCritChanceUp: {
        description: function (str) {
            return "Your Trimps have +" + prettifySub(this.getMult(str) * 100) + "% Crit Chance.";
        },
        getMult: function (str) {
            return str / 10;
        },
        getWeight: function (str) {
            return .25 * str * -1;
        },
        minMaxStep: [5, 10, 1],
        incompatible: ["trimpCritChanceDown"],
        chance: 1.25
    },
    trimpCritChanceDown: {
        description: function (str) {
            return "Your Trimps have -" + prettifySub(this.getMult(str) * 100) + "% Crit Chance.";
        },
        getMult: function (str) {
            return str / 10;
        },
        getWeight: function (str) {
            return (str / 4.5);
        },
        minMaxStep: [2, 7, 1],
        incompatible: ["trimpCritChanceUp"],
        chance: 0.75
    },
    bogged: {
        description: function (str) {
            return "Your Trimps lose " + prettifySub(this.getMult(str) * 100) + "% of their max health after each attack.";
        },
        getMult: function (str) {
            return 0.01 * str;
        },
        getWeight: function (str) {
            var count = Math.ceil(1 / this.getMult(str));
            return (6 - ((0.2 * (count > 60 ? 60 : count) / 2)) + ((((500 * count + 400) / count) / 500) - 1)) / 1.5;
        },
        incompatible: ["rampage", "weakness"],
        minMaxStep: [1, 5, 1],
        chance: 0.3
    },
    dysfunctional: {
        description: function (str) {
            return "Your Trimps breed " + prettifySub(100 - (this.getMult(str) * 100)) + "% slower";
        },
        getMult: function (str) {
            return 1 - (str * 0.05);
        },
        getWeight: function (str) {
            return ((1 / this.getMult(str)) - 1) / 6;
        },
        minMaxStep: [10, 18, 1],
        chance: 1
    },
    oddTrimpNerf: {
        description: function (str) {
            return "Trimps have " + prettifySub(100 - (this.getMult(str) * 100)) + "% less attack on odd numbered Zones";
        },
        getMult: function (str) {
            return 1 - (str * 0.02);
        },
        getWeight: function (str) {
            return (1 / this.getMult(str) - 1) / 1.5;
        },
        minMaxStep: [15, 40, 1],
        chance: 1
    },
    evenTrimpBuff: {
        description: function (str) {
            return "Trimps have " + prettifySub((this.getMult(str) * 100) - 100) + "% more attack on even numbered Zones";
        },
        getMult: function (str) {
            return 1 + (str * 0.2);
        },
        getWeight: function (str) {
            return (this.getMult(str) - 1) * -1;
        },
        minMaxStep: [1, 10, 1],
        chance: 1
    },
    karma: {
        description: function (str) {
            return 'Gain a stack after killing an enemy, increasing all non Helium loot by ' + prettifySub((this.getMult(str, 1) * 100) - 100) + '%. Stacks cap at ' + this.getMaxStacks(str) + ', and reset after clearing a Zone.';
        },
        stackDesc: function (str, stacks) {
            return "Your Trimps are finding " + prettifySub((this.getMult(str, stacks) * 100) - 100) + "% more loot!";
        },
        getMaxStacks: function (str) {
            return Math.floor((str % 9) * 25) + 300;
        },
        getMult: function (str, stacks) {
            var realStrength = Math.ceil(str / 9);
            return 1 + (0.0015 * realStrength * stacks);
        },
        getWeight: function (str) {
            return (this.getMult(str, this.getMaxStacks(str)) - 1) / -2;
        },
        icon: "*arrow-up",
        minMaxStep: [1, 45, 1],
        chance: 1
    },
    toxic: {
        description: function (str) {
            return "Gain a stack after killing an enemy, reducing breed speed by " + prettifySub(100 - (this.getMult(str, 1) * 100)) + '% (compounding). Stacks cap at ' + this.getMaxStacks(str) + ', and reset after clearing a Zone.';
        },
        stackDesc: function (str, stacks) {
            return "Your Trimps are breeding " + prettifySub(100 - (this.getMult(str, stacks) * 100)) + "% slower.";
        },
        getMaxStacks: function (str) {
            return Math.floor((str % 9) * 25) + 300;
        },
        getMult: function (str, stacks) {
            var realStrength = Math.ceil(str / 9);
            return Math.pow((1 - 0.001 * realStrength), stacks);
        },
        getWeight: function (str) {
            return (1 / this.getMult(str, this.getMaxStacks(str)) - 1) / 6;
        },
        icon: "*radioactive",
        minMaxStep: [1, 45, 1],
        chance: 1
    },
    bloodthirst: {
        description: function (str) {
            return "Enemies gain a stack of Bloodthirst whenever Trimps die. Every " + this.getFreq(str) + " stacks, enemies will heal to full and gain an additive 50% attack. Stacks cap at " + this.getMaxStacks(str) + " and reset after killing an enemy.";
        },
        stackDesc: function (str, stacks) {
            var freq = this.getFreq(str);
            var max = this.getMaxStacks(str);
            var text = "This Bad Guy";
            if (stacks < max) {
                var next = (freq - (stacks % freq));
                text += " will heal to full and gain attack in " + next + " stack" + ((next == 1) ? "" : "s") + ", " + ((stacks >= freq) ? "" : " and") + " gains 1 stack whenever Trimps die";
            }
            if (stacks >= freq) {
                if (stacks < max) text += ", and";
                text += " currently has " + prettifySub((this.getMult(str, stacks) * 100) - 100) + "% more attack";
            }
            text += ".";
            return text;
        },
        getMaxStacks: function (str) {
            return (this.getFreq(str) * (2 + Math.floor(str / 2)));
        },
        getFreq: function (str) {
            return 10 - str;
        },
        getMult: function (str, stacks) {
            var count = Math.floor(stacks / this.getFreq(str));
            return 1 + (0.5 * count);
        },
        getWeight: function (str) {
            return 0.5 + (0.25 * Math.floor(str / 2));
        },
        minMaxStep: [1, 7, 1],
        chance: 1,
        icon: "*flask",
        iconOnEnemy: true
    },
    explosive: {
        description: function (str) {
            var text = "Enemies instantly deal " + prettifySub(this.getMult(str) * 100) + "% of their attack damage when killed";
            if (str > 15) {
                text += " unless your block is as high as your maximum health";
            }
            text += ".";
            return text;
        },
        getMult: function (str) {
            return str;
        },
        getWeight: function (str) {
            var mult = this.getMult(str);
            if (str <= 15) {
                return (3 / 20 * mult) + (1 / 4);
            }
            else {
                return (1 / 14 * mult) - (1 / 7);
            }
        },
        minMaxStep: [5, 30, 1],
        chance: 1
    },
    slippery: {
        description: function (str) {
            return "Enemies have a " + prettifySub(this.getMult(str) * 100) + "% chance to dodge your attacks on " + ((str <= 15) ? "odd" : "even") + " Zones.";
        },
        getMult: function (str) {
            if (str > 15) str -= 15;
            return 0.02 * str;
        },
        getWeight: function (str) {
            return (1 / (1 - this.getMult(str)) - 1) * 10 / 1.5;
        },
        minMaxStep: [1, 30, 1],
        chance: 1
    },
    rampage: {
        description: function (str) {
            return "Gain a stack after killing an enemy, increasing Trimp attack by " + prettifySub((this.getMult(str, 1) * 100) - 100) + '% (additive). Stacks cap at ' + this.getMaxStacks(str) + ', and reset when your Trimps die.';
        },
        stackDesc: function (str, stacks) {
            return "Your Trimps are dealing " + prettifySub((this.getMult(str, stacks) * 100) - 100) + "% more damage.";
        },
        getMaxStacks: function (str) {
            return Math.floor((str % 10 + 1) * 10);
        },
        getMult: function (str, stacks) {
            var realStrength = Math.ceil(str / 10);
            return 1 + (0.01 * realStrength * stacks);
        },
        getWeight: function (str) {
            return (1 - this.getMult(str, 1)) * this.getMaxStacks(str);
        },
        icon: "*fire",
        incompatible: ["plague", "bogged"],
        minMaxStep: [1, 40, 1],
        chance: 1
    },
    mutimps: {
        description: function (str) {
            var size = str % 5;
            if (size == 0) size = "";
            else size = "the first " + prettifySub(size * 2) + " rows of";

            var name = (str < 4) ? "Mutimps" : "Hulking Mutimps";
            return "40% of Bad Guys in " + size + " the World will be mutated into " + name + ".";
        },
        getWeight: function (str) {
            return (str / 10) * 1.5;
        },
        getMaxCellNum: function (str) {
            if (str > 5) str -= 5;
            str--;
            var values = [19, 39, 59, 79, 99];
            return values[str];
        },
        minMaxStep: [1, 10, 1],
        chance: 1
    },
    empower: {
        description: function (str) {
            var s = (str == 1) ? "" : "s";
            return "All enemies gain " + str + " stack" + s + " of Empower whenever your Trimps die in the World. Empower increases the attack and health of Bad Guys in the World by 0.2% per stack, can stack to 9999, and never resets.";
        },
        getWeight: function (str) {
            return (str / 6) * 2;
        },
        stackDesc: function (str, stacks) {
            return "This Bad Guy is Empowered and has " + prettifySub((this.getMult(str, stacks) * 100) - 100) + "% more health and attack.";
        },
        stacksToAdd: function (str) {
            return str;
        },
        getMult: function (str, stacks) {
            return 1 + (0.002 * stacks);
        },
        getMaxStacks: function (str) {
            return 9999;
        },
        worldStacksOnly: true,
        iconOnEnemy: true,
        icon: "baby-formula",
        minMaxStep: [1, 10, 1],
        chance: 1
    },
    pressure: {
        description: function (str) {
            return "Trimps gain a stack of Pressure every " + Math.round(this.timePerStack(str)) + " seconds. Each stack of pressure reduces Trimp health by 1%. Max of " + Math.round(this.getMaxStacks(str)) + " stacks, stacks reset after clearing a Zone.";
        },
        getWeight: function (str) {
            var time = (105 - this.timePerStack(str));
            var stacks = this.getMaxStacks(str);
            return (((time * 1.3) + stacks) / 200);
        },
        getMult: function (str, stacks) {
            return Math.pow(0.99, stacks);
        },
        addSecond: function () {
            var modifier = game.global.dailyChallenge.pressure;
            modifier.timer = (modifier.timer) ? modifier.timer + 1 : 1;
            if (modifier.timer >= 60) {
                this.addStack();
                modifier.timer = 0;
            }
            updateDailyStacks('pressure');
        },
        addStack: function () {
            var global = game.global;
            var challenge = global.dailyChallenge.pressure;
            if (this.getMaxStacks(challenge.strength) <= challenge.stacks) {
                return;
            }
            challenge.stacks++;
            if (global.fighting) {
                global.soldierHealthMax *= 0.99;
                if (global.soldierHealthMax < global.soldierHealth)
                    global.soldierHealth = global.soldierHealthMax;
                if (global.soldierHealth < 0)
                    global.soldierHealth = 0;
            }
        },
        timePerStack: function (str) {
            var thisStr = Math.ceil(str / 4) - 1;
            return (45 + (thisStr * 5));
        },
        resetTimer: function () {
            var modifier = game.global.dailyChallenge.pressure;
            modifier.timer = 0;
            modifier.stacks = 0;
            updateDailyStacks('pressure');
        },
        stackDesc: function (str, stacks) {
            return "Your Trimps are under a lot of pressure. Maximum health is reduced by " + prettifySub((1 - this.getMult(str, stacks)) * 100) + "%.";
        },
        getMaxStacks: function (str) {
            var thisStr = Math.floor(str % 4);
            return (45 + (thisStr * 5));
        },
        icon: "*heart3",
        minMaxStep: [1, 16, 1],
        chance: 1
    },
    mirrored: {
        description: function (str) {
            var reflectChance = this.getReflectChance(str);
            return "Enemies have a" + (reflectChance.toString()[0] == '8' ? 'n' : '') + " " + prettifySub(reflectChance) + "% chance to reflect an attack, dealing " + prettifySub(this.getMult(str) * 100) + "% of damage taken back to your Trimps.";
        },
        getReflectChance: function (str) {
            return (Math.ceil(str / 10)) * 10;
        },
        getMult: function (str) {
            return ((str % 10) + 1) / 10;
        },
        getWeight: function (str) {
            return ((((this.getReflectChance(str) + 90) / 100) * 0.85) * ((this.getMult(str) + 0.9) * 0.85));
        },
        testWeights: function () {
            var min = 0;
            var max = 0;
            var results = [];
            for (var x = this.minMaxStep[0]; x <= this.minMaxStep[1]; x += this.minMaxStep[2]) {
                var result = this.getWeight(x);
                if (min == 0)
                    min = result;
                else if (result < min)
                    min = result;
                if (result > max)
                    max = result;
                results.push(result);
            }
            console.log(results);
            return "Min: " + min + ", Max: " + max;
        },
        reflectDamage: function (str, attack) {
            if (Math.floor(Math.random() * 100) >= this.getReflectChance(str))
                return 0;
            return this.getMult(str) * attack;
        },
        minMaxStep: [1, 100, 1],
        chance: 1
    },
    metallicThumb: {
        description: function (str) {
            return "Equipment is " + prettifySub((1 - this.getMult(str)) * 100) + "% cheaper.";
        },
        getWeight: function (str) {
            return ((str + 3) / 26);
        },
        getMult: function (str) {
            return 1 - (str / 100 * 5);
        },
        minMaxStep: [1, 10, 1],
        chance: 1
    }
};

var dmgMod = 1;
var min = 1;
var max = 1.2;
var daily;

function f(n) {
    return findNextPush(n, 1, false);
}

function f(n, mult) {
    return findNextPush(n, mult, false);
}

var findNextPush = (n, mult, rtnArr) => {
    let i = 0;
    let nCount = 0;
    let arr = [];
    console.log(n + " " + mult + " " + rtnArr);
    while (true) {
        daily = getDailyChallengeAt(i);
        dmgMod = 1;
        min = 1;
        max = 1.2;
        for (let item in daily) {
            if (item === 'seed' && getAvg() > mult) {
                if (nCount++ < n) continue;
                let result = new Date(new Date().getTime() + i * 1000 * 60 * 60 * 24).toUTCString() + "\n\n";
                return result + getDailyDescription(i) + "\nDamage Mod: " + getAvg();
            }
            evalMod(item);
        }
        i++;
    }
};

var getAvg = () => (dmgMod * min + dmgMod * max) / 2.2;

var evalMult = (item) => dailyModifiers[item].getMult(daily[item].strength);

var evalMod = function (item) {
    switch (item) {
        case "minDamage":
            min *= 1 - evalMult(item);
            break;
        case "maxDamage":
            max *= 1 + evalMult(item);
            break;
        case "plague": //losing health
            dmgMod *= 0;
            break;
        case "weakness":
            dmgMod *= dailyModifiers[item].getMult(daily[item].strength, 9);
            break;
        case "large":
            break;
        case "dedication":
            break;
        case "famine":
            break;
        case "badStrength":
            break;
        case "badHealth":
            dmgMod /= evalMult(item);
            break;
        case "badMapStrength":
            break;
        case "badMapHealth":
            dmgMod /= evalMult(item);
            break;
        case "crits":
            break;
        case "trimpCritChanceUp":
            base = 8 * .5 + 64 * .5;
            cChance = .5 + evalMult(item);
			if (cChance <= 1) {
				dmgMod *= ((1 - cChance) * 8 + cChance * 64) / base;
			}
			else {
				dmgMod *= ((2 - cChance) * 64 + (cChance - 1) * 512) / base;
			}
            break;
        case "trimpCritChanceDown":
            base = 8 * .5 + 64 * .5;
            cChance = Math.ceil(100 * (.5 - evalMult(item))) / 100;
            dmgMod *= (cChance > 0 ? ((1 - cChance) * 8 + cChance * 64) : (cChance + 1) * 8 + (cChance * -1)) / base;
            break;
        case "bogged": //losing health
            dmgMod *= evalMult(item) > .3 ? 0 : .9;
            break;
        case "dysfunctional":
            break;
        case "oddTrimpNerf":
            dmgMod *= 1 - ((1 - evalMult(item)) / 2);
            break;
        case "evenTrimpBuff":
            dmgMod *= evalMult(item);
            break;
        case "karma":
            break;
        case "toxic":
            break;
        case "bloodthirst":
            break;
        case "explosive":
            break;
        case "slippery":
            dmgMod *= 1 - evalMult(item) / 2;
            break;
        case "rampage":
            let str = daily[item].strength;
            dmgMod *= dailyModifiers[item].getMult(str, Math.floor((str % 10 + 1) * 10));
            break;
        case "mutimps":
            break;
        case "empower":
            break;
        case "pressure":
            break;
        case "mirrored":
            break;
        case "metallicThumb":
            break;
        default:
            break;
    }
};