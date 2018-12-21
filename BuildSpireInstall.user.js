// ==UserScript==
// @name         SpireBuilder
// @namespace    https://github.com/slivermasterz/TrimpScripts
// @version      1.0
// @updateURL    https://slivermasterz.github.io/TrimpScripts/BuildSpireInstall.user.js
// @description  Adds Import Spire Build
// @author       Sliverz
// @include        *trimps.github.io*
// @include        *kongregate.com/games/GreenSatellite/trimps
// @connect      self
// @grant        none
// ==/UserScript==

var script = document.createElement('script');
script.id = 'SpireBuilder-script';
script.src = 'https://slivermasterz.github.io/TrimpScripts/SpireBuilder.js';
script.setAttribute('crossorigin',"anonymous");
document.head.appendChild(script);
