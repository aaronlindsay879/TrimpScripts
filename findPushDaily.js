var dmgMod = 1;
var min = 1;
var max = 1.2;
var daily;
var f = (n) => {
    let i = 0;
    let nCount = 0;
    while (true) {
        daily = getDailyChallengeAt(i);
        dmgMod = 1;
        min = 1;
        max = 1.2;
        for (let item in daily) {
            if (item == 'seed' && getAvg() > 1) {
                if (nCount++ != n) continue;
                let result = new Date(new Date().getTime() + i * 1000 * 60 * 60 * 24) + "\n";
                return result + getDailyDescription(i);
            }
            evalMod(item);
        }
        i++;
    }
};

var getAvg = () => (dmgMod * min + dmgMod * max)/2.2;

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
            cChance = .5 + evalMult(item));
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