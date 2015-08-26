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
 *  lbcontext.js
 *  KCLogbook
 *
 *  Game session context management module
 *
 *  Created by Master.G on 2015/8/3.
 *  Copyright (c) 2015 Master.G. All rights reserved.
 */

var LB_KEY_CONTEXT_DATA = "lb_context_data";

LBContext = function() {
  this.ships = {};
  this.fleets = {};
  this.deck = [];
  this.materials = [];
  this.kdock = {};
  this.ndock = {};
  this.level = 1;
  this.slotitem = {};
};

LBContext.prototype = {
  save: function(callback) {
    var save = {};
    save.ships = this.ships;
    save.fleets = this.fleets;
    save.deck = this.deck;
    save.materials = this.materials;
    save.kdock = this.kdock;
    save.ndock = this.ndock;
    save.level = this.level;
    save.slotitem = this.slotitem;
    save.shipinfo = this.shipinfo;

    LocalStorage.save(LB_KEY_CONTEXT_DATA, save, function(result) {
      if (callback) {
        callback(result);
      }

      Console.info("Logbook | LBContext data saved.");
    });
  },

  load: function(callback) {
    LocalStorage.load(LB_KEY_CONTEXT_DATA, function(result, data) {
      if (result) {
        LBContext.getInstance().ships = data.ships;
        LBContext.getInstance().fleets = data.fleets;
        LBContext.getInstance().deck = data.deck;
        LBContext.getInstance().materials = data.materials;
        LBContext.getInstance().kdock = data.kdock;
        LBContext.getInstance().ndock = data.ndock;
        LBContext.getInstance().level = data.level;
        LBContext.getInstance().slotitem = data.slotitem;

        LBContext.getInstance().updateNDock(data.ndock);
        LBContext.getInstance().updateDeck(data.deck);
        LBContext.getInstance().updateKDock(data.kdock);

        LogbookWeb.getTab().getPortTab().setMaterial(data.level, data.materials);
        var fleet = LBContext.getInstance().getFleet(1);
        LBContext.getInstance().curFleet = 1;
        LogbookWeb.getTab().getFleetTab().setFleet(1, fleet);

        LBContext.getInstance().updateShips(data.shipinfo);

        Console.info("Logbook | LBContext data loaded.");
      } else {
        Console.info("Logbook | LBContext data missing.");
      }

      if (callback) {
        callback(result);
      }
    });
  },

  getFleetName: function(fleetId) {
    var fleet = this.fleets[fleetId];
    if (fleet) {
      return fleet.name;
    } else {
      return 'Our Fleet';
    }
  },

  getFlagShipName: function() {
    var name = 'N/A';
    if (this.fleets === undefined || this.fleets[1] === undefined) {} else if (this.fleets[1].ship === undefined || this.fleets[1].ship[0] === undefined) {} else {
      var shipid = this.ships[this.fleets[1].ship[0]].ship_id;
      name = LBManifest.getInstance().getShip(shipid).name;
    }

    return name;
  },

  // this api is not a part of api_port, but we just put it here
  updateSlotItem: function(data) {
    this.slotitem = {};
    for (var i in data) {
      var item = {};
      item.id = data[i][KCK.ID];
      item.slotitem_id = data[i][KCK.SLOTITEM_ID];
      this.slotitem[item.id] = item;
    }

    this.save();
  },

  // add new slot item
  createSlotItem: function(data) {
    var createFlag = data[KCK.CREATE_FLAG];
    var shizaiFlag = data[KCK.SHIZAI_FLAG];
    if (createFlag !== 1 && shizaiFlag !== 1) {
      return;
    } else {
      var item = {};
      item.id = data[KCK.SLOT_ITEM][KCK.ID];
      item.slotitem_id = data[KCK.SLOT_ITEM][KCK.SLOTITEM_ID];
      this.slotitem[item.id] = item;

      this.save();
    }

    this.materials = data[KCK.MATERIAL].slice(0);
    LogbookWeb.getTab().getPortTab().setMaterial(this.level, this.materials);
  },

  // create ship will bring new slot item into the game
  addSlotItem: function(data) {
    if (data) {
      for (var i in data) {
        var item = {};
        item.id = data[i][KCK.ID];
        item.slotitem_id = data[i][KCK.SLOTITEM_ID];

        this.slotitem[item.id] = item;
      }
    }
  },

  updateShips: function(data) {
    if (!data) {
      return;
    }
    this.shipinfo = data;

    for (var i in data) {
      var info = data[i];
      var ship = {};
      ship.id = info[KCK.ID];
      ship.ship_id = info[KCK.SHIP_ID];
      ship.nowhp = info[KCK.NOWHP];
      ship.maxhp = info[KCK.MAXHP];
      ship.lv = info[KCK.LV];
      ship.lvupexp = info[KCK.EXP][1];
      ship.condition = info[KCK.COND];
      ship.slot = info[KCK.SLOT].slice(0);
      ship.slotex = info[KCK.SLOT_EX];

      ship.realhp = ship.nowhp;
      this.ships[ship.id] = ship;
    }

    LogbookWeb.getTab().getStatisticsTab().setShips(this.ships);
  },

  updateDeck: function(data) {
    this.deck = data;

    if (data === undefined || data[0] === undefined) {
      return;
    }

    this.fleets = {};
    var missions = [];
    for (var i in data) {
      var info = data[i];
      var fleet = {};
      fleet.id = info[KCK.ID];
      fleet.name = info[KCK.NAME];
      fleet.ship = info[KCK.SHIP].slice(0);
      fleet.mission = info[KCK.MISSION].slice(0);

      var missionId = fleet.mission[1];
      var missionTime = fleet.mission[2];
      var pair = [];
      pair[0] = missionTime;
      pair[1] = 0;
      pair[2] = '';

      if (missionId !== 0) {
        pair[1] = LBManifest.getInstance().getMission(missionId).time * 60 * 1000;
        pair[2] = LBManifest.getInstance().getMission(missionId).name;
      }

      missions.push(pair);
      this.fleets[fleet.id] = fleet;
    }

    LogbookWeb.getTab().getPortTab().setMission(missions);
  },

  // repair dock
  updateNDock: function(data) {
    this.ndock = data;

    if (data === undefined || data[0] === undefined) {
      return;
    }

    var dockInfoArr = [];
    for (var i in data) {
      var dock = data[i];
      var dockInfo = {};

      dockInfo.id = dock[KCK.SHIP_ID];
      if (dockInfo.id !== 0) {
        var ship = this.ships[dockInfo.id];
        dockInfo.ship_id = ship.ship_id;
        dockInfo.nowhp = ship.nowhp;
        dockInfo.maxhp = ship.maxhp;
        dockInfo.lv = ship.lv;
        dockInfo.name = LBManifest.getInstance().getShip(ship.ship_id).name;
        dockInfo.stype = LBManifest.getInstance().getShip(ship.ship_id).ship_type;
        dockInfo.complete_time = dock[KCK.COMPLETE_TIME];

        dockInfo.require_time = 0;
        //           [0, 1,   2,   3,   4,   5,   6,   7,   8,   9,   10,  11,  12,  13,  14,  15,  16,  17,  18,  19,  20,  21]
        var factor = [0, 0.5, 1.0, 1.0, 1.0, 1.5, 1.5, 1.5, 1.5, 2.0, 2.0, 2.0, 1.5, 0.5, 1.0, 2.0, 1.0, 1.0, 2.0, 2.0, 1.5, 1.0];
        if (dockInfo.lv < 12) {
          dockInfo.require_time = dockInfo.lv * 10 * factor[dockInfo.stype] * (dockInfo.maxhp - dockInfo.nowhp) + 30;
        } else {
          var a = Math.floor(Math.sqrt(dockInfo.lv - 11)) * 10 + 50;
          dockInfo.require_time = (dockInfo.lv * 5 + a) * factor[dockInfo.stype] * (dockInfo.maxhp - dockInfo.nowhp) + 30;
        }
        dockInfo.require_time *= 1000;
      } else {
        dockInfo.ship_id = 0;
        dockInfo.nowhp = 0;
        dockInfo.maxhp = 0;
        dockInfo.name = 'N/A';
        dockInfo.require_time = 0;
      }

      dockInfoArr.push(dockInfo);
    }

    LogbookWeb.getTab().getPortTab().setNDock(dockInfoArr);
  },

  speedChange: function(data) {
    var dock_id = 0;
    for (var i in data) {
      var name = unescape(data[i].name);

      if (name == "api_ndock_id") {
        dock_id = parseInt(data[i].value);
      }
    }

    if (dock_id === 0 || this.ndock === undefined || this.ndock[0] === undefined)
      return;

    for (var i in this.ndock) {
      var dock = this.ndock[i];
      if (dock[KCK.ID] == dock_id) {
        dock[KCK.SHIP_ID] = 0;
        break;
      }
    }

    this.updateNDock(this.ndock);
  },

  // construction dock
  updateKDock: function(data) {
    this.kdock = data;
    if (data === undefined || data[0] === undefined) {
      return;
    }

    var dockArr = [];
    for (var i in data) {
      var ship = {};
      ship.id = data[i][KCK.CREATED_SHIP_ID];
      ship.complete_time = data[i][KCK.COMPLETE_TIME];
      if (ship.id !== 0) {
        var s = LBManifest.getInstance().getShip(ship.id);
        ship.name = s.name;
        ship.buildtime = s.buildtime;
        ship.cost = [];
        ship.cost[0] = data[i][KCK.ITEM1];
        ship.cost[1] = data[i][KCK.ITEM2];
        ship.cost[2] = data[i][KCK.ITEM3];
        ship.cost[3] = data[i][KCK.ITEM4];
        ship.cost[4] = data[i][KCK.ITEM5];
      } else {
        ship.name = '';
      }

      dockArr.push(ship);
    }
    LogbookWeb.getTab().getPortTab().setKDock(dockArr);
  },

  updatePlayerInfo: function(data) {
    this.level = data[KCK.LEVEL];
  },

  updateMaterial: function(data) {
    this.materials = [];
    // 0: oil, 1: ammo, 2: steel, 3: aluminum
    // 4: gas bottle, 5: bucket, 6: Laver, 7: screw
    for (var i in data) {
      var m = data[i];
      this.materials.push(m[KCK.VALUE]);
    }

    LogbookWeb.getTab().getPortTab().setMaterial(this.level, this.materials);
  },

  getFleet: function(deckId) {
    var ships = [];

    var fleet = this.fleets[deckId];

    if (!fleet) {
      return ships;
    }

    var shipIdArr = fleet.ship.slice(0);
    for (var i in shipIdArr) {
      if (shipIdArr[i] === -1) {
        continue;
      }

      var ship = {};
      ship.id = shipIdArr[i];
      var s = this.ships[ship.id];
      ship.ship_id = s.ship_id;
      ship.lv = s.lv;
      ship.name = LBManifest.getInstance().getShip(ship.ship_id).name;
      ship.nowhp = s.nowhp;
      ship.maxhp = s.maxhp;
      ship.realhp = s.nowhp;
      ship.condition = s.condition;
      ship.lvupexp = s.lvupexp;
      ship.slot = [];
      ship.icon = [];
      for (var j in s.slot) {
        var itemId = s.slot[j];
        if (itemId == -1) {
          continue;
        }

        var slotitem_id = this.slotitem[itemId].slotitem_id;
        var itemName = LBManifest.getInstance().getSlotItem(slotitem_id).name;
        var itemIcon = LBManifest.getInstance().getSlotItem(slotitem_id).icon;
        ship.slot.push(itemName);
        ship.icon.push(itemIcon);
      }

      if (s.slotex !== 0 && s.slotex !== -1) {
        var exslot_id = this.slotitem[s.slotex].slotitem_id;
        var exname = LBManifest.getInstance().getSlotItem(exslot_id).name;
        var exicon = LBManifest.getInstance().getSlotItem(exslot_id).icon;
        ship.slotex = exname;
        ship.exicon = exicon;
      } else {
        ship.slotex = 0;
        ship.exicon = "";
      }

      ships.push(ship);
    }

    return ships;
  },

  // change ship
  changeShip: function(data) {
    var ship_id = 0;
    var deck_id = 0;
    var ship_idx = 0;
    var i, fleet;

    for (i in data) {
      var name = unescape(data[i].name);
      var value = unescape(data[i].value);

      if (name == "api_ship_id") {
        ship_id = parseInt(value);
      }

      if (name == "api_id") {
        deck_id = parseInt(value);
      }

      if (name == "api_ship_idx") {
        ship_idx = parseInt(value);
      }
    }

    if (this.fleets[deck_id] !== undefined && this.fleets[deck_id].ship[ship_idx] !== undefined) {

      var shouldSwap = false;
      var fid, idx;

      for (i in this.fleets) {
        fleet = this.fleets[i];
        for (var j in fleet.ship) {
          if (fleet.ship[j] == ship_id) {
            fid = i;
            idx = j;
            shouldSwap = true;
            break;
          }
        }
      }

      if (shouldSwap) {
        var src = this.fleets[fid].ship[idx];
        this.fleets[fid].ship[idx] = this.fleets[deck_id].ship[ship_idx];
      }

      this.fleets[deck_id].ship[ship_idx] = ship_id;
      if (this.curFleet === undefined) {
        this.curFleet = 1;
      }
      fleet = this.getFleet(this.curFleet);
      LogbookWeb.getTab().getFleetTab().setFleet(this.curFleet, fleet);
    } else if (this.fleets[deck_id] !== undefined && ship_id === -2 && ship_idx === -1) {
      var ships = this.fleets[deck_id].ship;
      for (i = 1; i < ships.length; i++) {
        ships[i] = -1;
      }
      fleet = this.getFleet(this.curFleet);
      LogbookWeb.getTab().getFleetTab().setFleet(this.curFleet, fleet);
    }
  },

};

LBContext.prototype.constructor = LBContext;

LBContext.getInstance = function() {
  if (LBContext.instance === undefined) {
    LBContext.instance = new LBContext();
  }
  return LBContext.instance;
};
