/*
The MIT License (MIT)

Copyright (c) 2015 Master.G

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/*
 *  lbbattle.js
 *  KCLogbook
 *
 *  Battle analyze module
 *
 *  Created by Master.G on 2015/8/3.
 *  Copyright (c) 2015 Master.G. All rights reserved.
 */

LBBattle = function() {

};

LBBattle.prototype = {
  checkFormation: function(data) {
    var formationStr = [undefined, '同航戦', '反航戦', 'T字有利', 'T字不利'];
    var formation = data[KCK.FORMATION];
    if (formation) {
      return formationStr[formation[2]];
    } else {
      return formationStr[0];
    }
  },

  clear: function() {
    this.fleetID = undefined;
  },

  regulateHP: function(ships) {
    for (var i in ships) {
      var ship = ships[i];
      ship.realhp = ship.nowhp;
      ship.nowhp = Math.round(ship.nowhp);
      if (ship.realhp < 0)
        ship.realhp = 0;
      if (ship.nowhp < 0)
        ship.nowhp = 0;
    }
  },

  buildFleetInfo: function(data) {
    var info = {};
    info.ourShips = [];
    info.enemyShips = [];
    info.ships = {};
    info.enemies = {};
    info.ourFleetName = '';

    var context = LBContext.getInstance();

    // get ship id info
    var fleetID = parseInt(data[KCK.DOCK_ID]);
    if (!fleetID) {
      fleetID = parseInt(data[KCK.DECK_ID]);
    }

    this.fleetID = fleetID;

    info.ourFleetName = context.fleets[fleetID].name;
    var ourShipID = context.fleets[fleetID].ship.slice(0);
    var enemyShipID = data[KCK.SHIP_KE].slice(0);
    enemyShipID.shift();

    // get HP info
    var nowHPs = data[KCK.NOWHPS];
    var maxHPs = data[KCK.MAXHPS];
    nowHPs.shift();
    maxHPs.shift();

    // get fleet ship info
    var i = 0;
    var j = 0;
    var ship = {};
    var slotitem_id;
    for (i = 0; i < ourShipID.length; i++) {
      if (ourShipID[i] !== -1) {
        ship = {};
        ship.id = ourShipID[i];
        ship.ship_id = context.ships[ship.id].ship_id;
        ship.name = LBManifest.getInstance().getShip(ship.ship_id).name;
        ship.nowhp = nowHPs[i];
        ship.maxhp = maxHPs[i];

        // get slot info
        ship.slot = context.ships[ship.id].slot.slice(0);
        for (j in ship.slot) {
          var itemId = ship.slot[j];
          if (itemId != -1) {
            slotitem_id = context.slotitem[itemId].slotitem_id;
            ship.slot[j] = LBManifest.getInstance().getSlotItem(slotitem_id).name;
          }
        }

        // store
        info.ourShips.push(ship);

        info.ships[i + 1] = ship;
      }
    }

    // find enemy id start index (almost 7)
    var enemyIndex = 0;
    for (j = i; j < nowHPs.length; i++) {
      if (nowHPs[j] !== -1) {
        enemyIndex = j;
        break;
      }
    }

    // get enemy info
    for (j = 0; j < enemyShipID.length; j++) {
      if (enemyShipID[j] !== -1) {
        ship = {};
        ship.id = j;
        ship.ship_id = enemyShipID[j];
        ship.name = LBManifest.getInstance().getShip(ship.ship_id).name;
        ship.nowhp = nowHPs[j + enemyIndex];
        ship.maxhp = maxHPs[j + enemyIndex];
        ship.slot = [];

        info.enemyShips.push(ship);

        info.ships[j + enemyIndex + 1] = ship;

        info.enemies[j + enemyIndex + 1] = ship;
      }
    }

    // get enemy slot info
    if (data[KCK.ESLOT]) {
      for (i = 0; i < info.enemyShips.length; i++) {
        var s = info.enemyShips[i];
        var slot = data[KCK.ESLOT][i];
        for (j in slot) {
          slotitem_id = slot[j];
          if (slotitem_id != -1) {
            s.slot.push(LBManifest.getInstance().getSlotItem(slotitem_id).name);
          }
        }
      }
    }

    Console.log(info);

    return info;
  },

  getDetailReport: function(data) {
    var report = {};
    // fleet info
    var fleetInfo = this.buildFleetInfo(data);
    var shipMap = fleetInfo.ships;
    // formation
    report.formation = this.checkFormation(data);

    // air raid phase
    report.phase_air = {};
    report.phase_air.our = [];
    report.phase_air.enemy = [];
    var kouku = data[KCK.KOUKU];
    if (kouku) {
      // get source
      var plane_from = kouku[KCK.PLANE_FROM];
      if (plane_from) {
        var our_plane = plane_from[0].slice(0);
        var enemy_plane = plane_from[1].slice(0);
        // TODO, design data scheme
        var i = 0;
        for (i in our_plane) {
          if (our_plane[i] != -1) {
            report.phase_air.our.push(shipMap[our_plane[i]].name);
          }
        }
        for (i in enemy_plane) {
          if (enemy_plane[i] != -1) {
            report.phase_air.enemy.push(shipMap[enemy_plane[i]].name);
          }
        }
      }
    }

    Console.log(report);
    return report;
  },

  calculateSimpleDamage: function(ourDamage, enemyDamage, data) {
    var ed = data[KCK.EDAM];
    var fd = data[KCK.FDAM];
    ed.shift();
    fd.shift();

    var i;
    for (i = 0; i < ourDamage.length; i++) {
      ourDamage[i] += fd[i];
    }

    for (i = 0; i < enemyDamage.length; i++) {
      enemyDamage[i] += ed[i];
    }
  },

  calculateCannonDamage: function(arr, data) {
    var targets = data[KCK.DF_LIST];
    var damages = data[KCK.DAMAGE];
    targets.shift();
    damages.shift();

    for (var i in targets) {
      var tar = targets[i];
      var dam = damages[i];

      for (var j in tar) {
        if (tar[j] != -1) {
          var p = {};
          p.target = tar[j];
          p.damage = dam[j];

          arr.push(p);
        }
      }
    }
  },

  inspectBattle: function(data) {
    var ourShips = [];
    var enemyShips = [];
    var shipMap = {};

    var info = this.buildFleetInfo(data);
    ourShips = info.ourShips;
    enemyShips = info.enemyShips;
    shipMap = info.ships;
    LogbookWeb.getTab().getBattleTab().setOurFleetName(info.ourFleetName);

    // calculate damage

    var ourTotalDamage = [];
    var enemyTotalDamage = [];

    for (i = 0; i < ourShips.length; i++) {
      ourTotalDamage[i] = 0;
    }

    for (i = 0; i < enemyShips.length; i++) {
      enemyTotalDamage[i] = 0;
    }

    // air-raid phase
    var phaseAirRaid = data[KCK.KOUKU];
    if (phaseAirRaid !== null && phaseAirRaid[KCK.STAGE3]) {
      var stage3 = phaseAirRaid[KCK.STAGE3];
      this.calculateSimpleDamage(ourTotalDamage, enemyTotalDamage, stage3);
    }

    // opening attack
    var phaseOpeningAttack = data[KCK.OPENING_ATACK];
    if (phaseOpeningAttack !== null) {
      this.calculateSimpleDamage(ourTotalDamage, enemyTotalDamage, phaseOpeningAttack);
    }

    // cannon attack
    var damageObjArray = [];

    var cannon1 = data[KCK.HOUGEKI1];
    if (cannon1 !== null) {
      this.calculateCannonDamage(damageObjArray, cannon1);
    }

    var cannon2 = data[KCK.HOUGEKI2];
    if (cannon2 !== null) {
      this.calculateCannonDamage(damageObjArray, cannon2);
    }

    var cannon3 = data[KCK.HOUGEKI3];
    if (cannon3 !== null) {
      this.calculateCannonDamage(damageObjArray, cannon3);
    }

    // torpedo attack
    var torpedoAttack = data[KCK.RAIGEKI];
    if (torpedoAttack !== null) {
      this.calculateSimpleDamage(ourTotalDamage, enemyTotalDamage, torpedoAttack);
    }

    // apply damage
    for (i = 0; i < ourShips.length; i++) {
      ourShips[i].nowhp -= ourTotalDamage[i];
    }

    for (i = 0; i < enemyShips.length; i++) {
      enemyShips[i].nowhp -= enemyTotalDamage[i];
    }

    var j, p, o, ship;
    for (j in damageObjArray) {
      p = damageObjArray[j];
      shipMap[p.target].nowhp -= p.damage;
    }

    // regulate HP
    this.regulateHP(shipMap);

    // display result
    var desc = "";
    for (o in ourShips) {
      ship = ourShips[o];
      desc += "[" + ship.name + " " + ship.nowhp + "/" + ship.maxhp + "] ";
    }
    // Console.info("Logbook | " + desc);
    LogbookWeb.getTab().getBattleTab().setOurFleet(ourShips);

    desc = "";
    for (var e in enemyShips) {
      ship = enemyShips[e];
      desc += "[" + ship.name + " " + ship.nowhp + "/" + ship.maxhp + "] ";
    }
    // Console.info("Logbook | " + desc);
    LogbookWeb.getTab().getBattleTab().setEnemyFleet(enemyShips);
  },

  inspectMidnightBattle: function(data) {
    var ourShips = [];
    var enemyShips = [];
    var shipMap = {};

    var info = this.buildFleetInfo(data);
    ourShips = info.ourShips;
    enemyShips = info.enemyShips;
    shipMap = info.ships;
    LogbookWeb.getTab().getBattleTab().setOurFleetName(info.ourFleetName);

    // cannon attack
    var damageObjArray = [];

    var cannon = data[KCK.HOUGEKI];
    if (cannon !== null) {
      this.calculateCannonDamage(damageObjArray, cannon);
    }

    // apply damage
    for (var j in damageObjArray) {
      var p = damageObjArray[j];
      shipMap[p.target].nowhp -= p.damage;
    }

    // regulate HP
    this.regulateHP(shipMap);

    // display result
    var desc = "";
    var ship;
    for (var o in ourShips) {
      ship = ourShips[o];
      desc += "[" + ship.name + " " + ship.nowhp + "/" + ship.maxhp + "] ";
    }
    // Console.info("Logbook | " + desc);
    LogbookWeb.getTab().getBattleTab().setOurFleet(ourShips);

    desc = "";
    for (var e in enemyShips) {
      ship = enemyShips[e];
      desc += "[" + ship.name + " " + ship.nowhp + "/" + ship.maxhp + "] ";
    }
    // Console.info("Logbook | " + desc);
    LogbookWeb.getTab().getBattleTab().setEnemyFleet(enemyShips);
  },

  inspectCombinedSPMidnightBattle: function(data) {
    // data[KCK.DECK_ID] = "2";
    this.inspectMidnightBattle(data);
  },

  inspectSPMidnightBattle: function(data) {
    this.inspectMidnightBattle(data);
  },

  inspectAirBattle: function(data) {
    var ourShips = [];
    var enemyShips = [];
    var shipMap = {};

    var info = this.buildFleetInfo(data);
    ourShips = info.ourShips;
    enemyShips = info.enemyShips;
    shipMap = info.ships;
    LogbookWeb.getTab().getBattleTab().setOurFleetName(info.ourFleetName);

    // calculate damage

    var ourTotalDamage = [];
    var enemyTotalDamage = [];

    for (i = 0; i < ourShips.length; i++) {
      ourTotalDamage[i] = 0;
    }

    for (i = 0; i < enemyShips.length; i++) {
      enemyTotalDamage[i] = 0;
    }

    // kouku attack
    var damageObjArray = [];

    var phaseAirRaid = data[KCK.KOUKU];
    var stage3;
    if (phaseAirRaid !== null && phaseAirRaid[KCK.STAGE3]) {
      stage3 = phaseAirRaid[KCK.STAGE3];
      this.calculateSimpleDamage(ourTotalDamage, enemyTotalDamage, stage3);
    }

    phaseAirRaid = data[KCK.KOUKU2];
    if (phaseAirRaid !== null && phaseAirRaid[KCK.STAGE3]) {
      stage3 = phaseAirRaid[KCK.STAGE3];
      this.calculateSimpleDamage(ourTotalDamage, enemyTotalDamage, stage3);
    }

    // apply damage
    for (i = 0; i < ourShips.length; i++) {
      ourShips[i].nowhp -= ourTotalDamage[i];
    }

    for (i = 0; i < enemyShips.length; i++) {
      enemyShips[i].nowhp -= enemyTotalDamage[i];
    }

    for (var j in damageObjArray) {
      var p = damageObjArray[j];
      shipMap[p.target].nowhp -= p.damage;
    }

    // regulate HP
    this.regulateHP(shipMap);

    // display result
    var desc = "";
    var ship;
    for (var o in ourShips) {
      ship = ourShips[o];
      desc += "[" + ship.name + " " + ship.nowhp + "/" + ship.maxhp + "] ";
    }
    // Console.info("Logbook | " + desc);
    LogbookWeb.getTab().getBattleTab().setOurFleet(ourShips);

    desc = "";
    for (var e in enemyShips) {
      ship = enemyShips[e];
      desc += "[" + ship.name + " " + ship.nowhp + "/" + ship.maxhp + "] ";
    }
    // Console.info("Logbook | " + desc);
    LogbookWeb.getTab().getBattleTab().setEnemyFleet(enemyShips);
  },

  buildCombinedFleetInfo: function(data) {
    var info = {};
    info.combinedShips = [];
    info.ships = {};

    var context = LBContext.getInstance();

    // get ship id info
    var fleetID = 2;

    var ourShipID = context.fleets[fleetID].ship.slice(0);

    // get HP info
    var nowHPs = data[KCK.NOWHPS_COMBINED];
    var maxHPs = data[KCK.MAXHPS_COMBINED];
    nowHPs.shift();
    maxHPs.shift();

    // get fleet ship info
    var ships = context.getFleet(fleetID);
    var i = 0;
    for (i = 0; i < ships.length; i++) {
      var ship = {};
      ship.id = ships[i].id;
      ship.ship_id = ships[i].ship_id;
      ship.name = ships[i].name;
      ship.nowhp = nowHPs.shift();
      ship.maxhp = maxHPs.shift();
      ship.realhp = 0;
      ship.slot = ships[i].slot.slice(0);

      info.combinedShips.push(ship);
      info.ships[i + 1] = ship;
    }

    return info;
  },

  calculateCombinedSimpleDamage: function(ourDamage, data) {
    var fd = data[KCK.FDAM];
    fd.shift();

    for (var i = 0; i < ourDamage.length; i++) {
      ourDamage[i] += fd[i];
    }
  },

  inspectCombinedBattle: function(data) {
    var info = this.buildFleetInfo(data);
    var combinedInfo = this.buildCombinedFleetInfo(data);

    var ourShips = [];
    var enemyShips = [];
    var shipMap = {};
    var combinedShips = [];
    var combinedShipMap = {};

    ourShips = info.ourShips;
    enemyShips = info.enemyShips;
    shipMap = info.ships;
    combinedShips = combinedInfo.combinedShips;
    combinedShipMap = combinedInfo.ships;
    LogbookWeb.getTab().getBattleTab().setOurFleetName(info.ourFleetName);

    // copy enemy ships into combined ship map
    for (var i in info.enemies) {
      combinedShipMap[i] = info.enemies[i];
    }

    // calculate damage
    var ourTotalDamage = [];
    var combinedTotalDamage = [];
    var enemyTotalDamage = [];

    for (i = 0; i < ourShips.length; i++) {
      ourTotalDamage[i] = 0;
    }

    for (i = 0; i < combinedShips.length; i++) {
      combinedTotalDamage[i] = 0;
    }

    for (i = 0; i < enemyShips.length; i++) {
      enemyTotalDamage[i] = 0;
    }

    var phaseAirRaid = data[KCK.KOUKU];
    if (phaseAirRaid && phaseAirRaid[KCK.STAGE3]) {
      var stage3 = phaseAirRaid[KCK.STAGE3];
      this.calculateSimpleDamage(ourTotalDamage, enemyTotalDamage, stage3);
    }

    if (phaseAirRaid && phaseAirRaid[KCK.STAGE3_COMBINED]) {
      var stage3_combined = phaseAirRaid[KCK.STAGE3_COMBINED];
      this.calculateCombinedSimpleDamage(combinedTotalDamage, stage3_combined);
    }

    // TODO: support stage missing

    // opening attack
    var phaseOpeningAttack = data[KCK.OPENING_ATACK];
    if (phaseOpeningAttack) {
      this.calculateSimpleDamage(combinedTotalDamage, enemyTotalDamage, phaseOpeningAttack);
    }

    // cannon attack
    var combinedDamageObjArr = [];

    var cannon1 = data[KCK.HOUGEKI1];
    if (cannon1) {
      this.calculateCannonDamage(combinedDamageObjArr, cannon1);
    }

    // torpedo attack
    var torpedoAttack = data[KCK.RAIGEKI];
    if (torpedoAttack) {
      this.calculateSimpleDamage(combinedTotalDamage, enemyTotalDamage, torpedoAttack);
    }

    var damageObjArray = [];

    var cannon2 = data[KCK.HOUGEKI2];
    if (cannon2) {
      this.calculateCannonDamage(damageObjArray, cannon2);
    }

    var cannon3 = data[KCK.HOUGEKI3];
    if (cannon3) {
      this.calculateCannonDamage(damageObjArray, cannon3);
    }

    // apply damage
    for (i = 0; i < ourShips.length; i++) {
      ourShips[i].nowhp -= ourTotalDamage[i];
    }

    for (i = 0; i < combinedShips.length; i++) {
      combinedShips[i].nowhp -= combinedTotalDamage[i];
    }

    for (i = 0; i < enemyShips.length; i++) {
      enemyShips[i].nowhp -= enemyTotalDamage[i];
    }

    var j, p, o;
    for (j in damageObjArray) {
      p = damageObjArray[j];
      shipMap[p.target].nowhp -= p.damage;
    }

    for (j in combinedDamageObjArr) {
      p = combinedDamageObjArr[j];
      combinedShipMap[p.target].nowhp -= p.damage;
    }

    // regulate HP
    this.regulateHP(ourShips);
    this.regulateHP(enemyShips);
    this.regulateHP(combinedShips);

    // display result
    var desc = "";
    var ship;
    for (o in ourShips) {
      ship = ourShips[o];
      desc += "[" + ship.name + " " + ship.nowhp + "/" + ship.maxhp + "] ";
    }
    LogbookWeb.getTab().getBattleTab().setOurFleet(ourShips);

    desc = "";
    for (o in combinedShips) {
      ship = combinedShips[o];
      desc += "[" + ship.name + " " + ship.nowhp + "/" + ship.maxhp + "] ";
    }
    LogbookWeb.getTab().getBattleTab().setCombinedFleet(combinedShips);

    desc = "";
    for (var e in enemyShips) {
      ship = enemyShips[e];
      desc += "[" + ship.name + " " + ship.nowhp + "/" + ship.maxhp + "] ";
    }
    LogbookWeb.getTab().getBattleTab().setEnemyFleet(enemyShips);
  },

  inspectCombinedMidnight: function(data) {
    var info = this.buildFleetInfo(data);
    var combinedInfo = this.buildCombinedFleetInfo(data);

    var ourShips = [];
    var enemyShips = [];
    var shipMap = {};
    var combinedShips = [];
    var combinedShipMap = {};

    ourShips = info.ourShips;
    enemyShips = info.enemyShips;
    shipMap = info.ships;
    combinedShips = combinedInfo.combinedShips;
    combinedShipMap = combinedInfo.ships;
    LogbookWeb.getTab().getBattleTab().setOurFleetName(info.ourFleetName);

    // copy enemy ships into combined ship map
    for (var i in info.enemies) {
      combinedShipMap[i] = info.enemies[i];
    }

    // cannon attack
    var damageObjArray = [];

    var cannon = data[KCK.HOUGEKI];
    if (cannon !== null) {
      this.calculateCannonDamage(damageObjArray, cannon);
    }

    // apply damage
    for (var j in damageObjArray) {
      var p = damageObjArray[j];
      combinedShipMap[p.target].nowhp -= p.damage;
    }

    // regulate HP
    this.regulateHP(ourShips);
    this.regulateHP(enemyShips);
    this.regulateHP(combinedShips);

    // display result
    var desc = "";
    var o, ship;
    for (o in ourShips) {
      ship = ourShips[o];
      desc += "[" + ship.name + " " + ship.nowhp + "/" + ship.maxhp + "] ";
    }
    LogbookWeb.getTab().getBattleTab().setOurFleet(ourShips);

    desc = "";
    for (o in combinedShips) {
      ship = combinedShips[o];
      desc += "[" + ship.name + " " + ship.nowhp + "/" + ship.maxhp + "] ";
    }
    LogbookWeb.getTab().getBattleTab().setCombinedFleet(combinedShips);

    desc = "";
    for (var e in enemyShips) {
      ship = enemyShips[e];
      desc += "[" + ship.name + " " + ship.nowhp + "/" + ship.maxhp + "] ";
    }
    LogbookWeb.getTab().getBattleTab().setEnemyFleet(enemyShips);
  },

  inspectCombinedBattleWater: function(data) {
    var info = this.buildFleetInfo(data);
    var combinedInfo = this.buildCombinedFleetInfo(data);

    var ourShips = [];
    var enemyShips = [];
    var shipMap = {};
    var combinedShips = [];
    var combinedShipMap = {};

    ourShips = info.ourShips;
    enemyShips = info.enemyShips;
    shipMap = info.ships;
    combinedShips = combinedInfo.combinedShips;
    combinedShipMap = combinedInfo.ships;
    LogbookWeb.getTab().getBattleTab().setOurFleetName(info.ourFleetName);

    // copy enemy ships into combined ship map
    for (var i in info.enemies) {
      combinedShipMap[i] = info.enemies[i];
    }

    // calculate damage
    var ourTotalDamage = [];
    var combinedTotalDamage = [];
    var enemyTotalDamage = [];

    for (i = 0; i < ourShips.length; i++) {
      ourTotalDamage[i] = 0;
    }

    for (i = 0; i < combinedShips.length; i++) {
      combinedTotalDamage[i] = 0;
    }

    for (i = 0; i < enemyShips.length; i++) {
      enemyTotalDamage[i] = 0;
    }

    // air-raid phase
    var phaseAirRaid = data[KCK.KOUKU];
    if (phaseAirRaid && phaseAirRaid[KCK.STAGE3]) {
      var stage3 = phaseAirRaid[KCK.STAGE3];
      this.calculateSimpleDamage(ourTotalDamage, enemyTotalDamage, stage3);
    }

    if (phaseAirRaid && phaseAirRaid[KCK.STAGE3_COMBINED]) {
      var stage3_combined = phaseAirRaid[KCK.STAGE3_COMBINED];
      this.calculateCombinedSimpleDamage(combinedTotalDamage, stage3_combined);
    }

    // opening attack
    var phaseOpeningAttack = data[KCK.OPENING_ATACK];
    if (phaseOpeningAttack) {
      this.calculateSimpleDamage(combinedTotalDamage, enemyTotalDamage, phaseOpeningAttack);
    }

    // TODO: support stage missing

    // cannon attack
    var damageObjArray = [];

    var cannon1 = data[KCK.HOUGEKI1];
    if (cannon1) {
      this.calculateCannonDamage(damageObjArray, cannon1);
    }

    var cannon2 = data[KCK.HOUGEKI2];
    if (cannon2) {
      this.calculateCannonDamage(damageObjArray, cannon2);
    }

    var combinedDamageObjArr = [];

    var cannon3 = data[KCK.HOUGEKI3];
    if (cannon3) {
      this.calculateCannonDamage(combinedDamageObjArr, cannon3);
    }

    // torpedo attack
    var torpedoAttack = data[KCK.RAIGEKI];
    if (torpedoAttack) {
      this.calculateSimpleDamage(combinedTotalDamage, enemyTotalDamage, torpedoAttack);
    }

    // apply damage
    for (i = 0; i < ourShips.length; i++) {
      ourShips[i].nowhp -= ourTotalDamage[i];
    }

    for (i = 0; i < combinedShips.length; i++) {
      combinedShips[i].nowhp -= combinedTotalDamage[i];
    }

    for (i = 0; i < enemyShips.length; i++) {
      enemyShips[i].nowhp -= enemyTotalDamage[i];
    }

    var j, o, p, ship;
    for (j in damageObjArray) {
      p = damageObjArray[j];
      shipMap[p.target].nowhp -= p.damage;
    }

    for (j in combinedDamageObjArr) {
      p = combinedDamageObjArr[j];
      combinedShipMap[p.target].nowhp -= p.damage;
    }

    // regulate HP
    this.regulateHP(ourShips);
    this.regulateHP(enemyShips);
    this.regulateHP(combinedShips);

    // display result
    var desc = "";
    for (o in ourShips) {
      ship = ourShips[o];
      desc += "[" + ship.name + " " + ship.nowhp + "/" + ship.maxhp + "] ";
    }
    LogbookWeb.getTab().getBattleTab().setOurFleet(ourShips);

    desc = "";
    for (o in combinedShips) {
      ship = combinedShips[o];
      desc += "[" + ship.name + " " + ship.nowhp + "/" + ship.maxhp + "] ";
    }
    LogbookWeb.getTab().getBattleTab().setCombinedFleet(combinedShips);

    desc = "";
    for (var e in enemyShips) {
      ship = enemyShips[e];
      desc += "[" + ship.name + " " + ship.nowhp + "/" + ship.maxhp + "] ";
    }
    LogbookWeb.getTab().getBattleTab().setEnemyFleet(enemyShips);
  },

  inspectCombinedAirBattle: function(data) {
    var info = this.buildFleetInfo(data);
    var combinedInfo = this.buildCombinedFleetInfo(data);

    var ourShips = [];
    var enemyShips = [];
    var shipMap = {};
    var combinedShips = [];
    var combinedShipMap = {};

    ourShips = info.ourShips;
    enemyShips = info.enemyShips;
    shipMap = info.ships;
    combinedShips = combinedInfo.combinedShips;
    combinedShipMap = combinedInfo.ships;
    LogbookWeb.getTab().getBattleTab().setOurFleetName(info.ourFleetName);

    // copy enemy ships into combined ship map
    for (var i in info.enemies) {
      combinedShipMap[i] = info.enemies[i];
    }

    // calculate damage
    var ourTotalDamage = [];
    var combinedTotalDamage = [];
    var enemyTotalDamage = [];

    for (i = 0; i < ourShips.length; i++) {
      ourTotalDamage[i] = 0;
    }

    for (i = 0; i < combinedShips.length; i++) {
      combinedTotalDamage[i] = 0;
    }

    for (i = 0; i < enemyShips.length; i++) {
      enemyTotalDamage[i] = 0;
    }

    // air-raid phase
    var stage3, stage3_combined;
    var phaseAirRaid = data[KCK.KOUKU];
    if (phaseAirRaid && phaseAirRaid[KCK.STAGE3]) {
      stage3 = phaseAirRaid[KCK.STAGE3];
      this.calculateSimpleDamage(ourTotalDamage, enemyTotalDamage, stage3);
    }

    if (phaseAirRaid && phaseAirRaid[KCK.STAGE3_COMBINED]) {
      stage3_combined = phaseAirRaid[KCK.STAGE3_COMBINED];
      this.calculateCombinedSimpleDamage(combinedTotalDamage, stage3_combined);
    }

    // air-raid phase 2
    var phaseAirRaid2 = data[KCK.KOUKU2];
    if (phaseAirRaid2 && phaseAirRaid2[KCK.STAGE3]) {
      stage3 = phaseAirRaid2[KCK.STAGE3];
      this.calculateSimpleDamage(ourTotalDamage, enemyTotalDamage, stage3);
    }

    if (phaseAirRaid2 && phaseAirRaid2[KCK.STAGE3_COMBINED]) {
      stage3_combined = phaseAirRaid2[KCK.STAGE3_COMBINED];
      this.calculateCombinedSimpleDamage(combinedTotalDamage, stage3_combined);
    }

    // TODO: support stage missing

    // apply damage
    for (i = 0; i < ourShips.length; i++) {
      ourShips[i].nowhp -= ourTotalDamage[i];
    }

    for (i = 0; i < combinedShips.length; i++) {
      combinedShips[i].nowhp -= combinedTotalDamage[i];
    }

    for (i = 0; i < enemyShips.length; i++) {
      enemyShips[i].nowhp -= enemyTotalDamage[i];
    }

    // regulate HP
    this.regulateHP(ourShips);
    this.regulateHP(enemyShips);
    this.regulateHP(combinedShips);

    // display result
    var desc = "";
    var o, ship;
    for (o in ourShips) {
      ship = ourShips[o];
      desc += "[" + ship.name + " " + ship.nowhp + "/" + ship.maxhp + "] ";
    }
    LogbookWeb.getTab().getBattleTab().setOurFleet(ourShips);

    desc = "";
    for (o in combinedShips) {
      ship = combinedShips[o];
      desc += "[" + ship.name + " " + ship.nowhp + "/" + ship.maxhp + "] ";
    }
    LogbookWeb.getTab().getBattleTab().setCombinedFleet(combinedShips);

    desc = "";
    for (var e in enemyShips) {
      ship = enemyShips[e];
      desc += "[" + ship.name + " " + ship.nowhp + "/" + ship.maxhp + "] ";
    }
    LogbookWeb.getTab().getBattleTab().setEnemyFleet(enemyShips);
  },

  updateShips: function() {
    if (!this.fleetID)
      return;

    var fleet = LBContext.getInstance().getFleet(this.fleetID);
    var fleetName = LBContext.getInstance().getFleetName(this.fleetID);
    LogbookWeb.getTab().getBattleTab().setOurFleetName(fleetName);
    LogbookWeb.getTab().getBattleTab().setOurFleet(fleet);
  }
};

LBBattle.prototype.constructor = LBBattle;

LBBattle.getInstance = function() {
  if (LBBattle.instance === undefined) {
    LBBattle.instance = new LBBattle();
  }

  return LBBattle.instance;
};
