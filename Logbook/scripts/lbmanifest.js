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
 *  lbmanifest.js
 *  KCLogbook
 *
 *  Game manifest data management module
 *
 *  Created by Master.G on 2015/8/3.
 *  Copyright (c) 2015 Master.G. All rights reserved.
 */

var LB_KEY_API_START_DATA = "lb_api_start_data";

LBManifest = function() {
  this.ship = {};
  this.shiptype = {};
  this.slotitem = {};
  this.mission = {};
  this.ready = false;
};

LBManifest.prototype = {
  parseShip: function(data) {
    var ship = {};
    if (data) {
      ship.id = data[KCK.ID];
      ship.name = data[KCK.NAME];
      ship.ship_type = data[KCK.STYPE];
      ship.buildtime = data[KCK.BUILDTIME];
    } else {
      ship.id = 0;
      ship.name = 'N/A';
      ship.ship_type = 0;
      ship.buildtime = 0;
    }

    return ship;
  },

  parseSlotItem: function(data) {
    var item = {};
    if (data) {
      item.id = data[KCK.ID];
      item.name = data[KCK.NAME];
      item.type = data[KCK.TYPE];
      var iconid = item.type[3] * 2 + 72;
      item.icon = iconid + ".png";
    } else {
      item.id = 0;
      item.name = 'N/A';
      item.type = [0, 0, 0, 0];
      item.icon = "0.png";
    }

    return item;
  },

  parseMission: function(data) {
    var mission = {};
    if (data) {
      mission.id = data[KCK.ID];
      mission.name = data[KCK.NAME];
      mission.time = data[KCK.TIME];
    } else {
      mission.id = 0;
      mission.name = 'N/A';
      mission.time = 0;
    }

    return mission;
  },

  init: function(data) {
    this.raw = data;

    this.ship = {};
    this.shiptype = {};
    this.slotitem = {};
    this.mission = {};

    var i, info;
    // parse ship model data
    var ships = data[KCK.MST.SHIP];
    for (i in ships) {
      info = ships[i];
      var ship = this.parseShip(info);
      this.ship[ship.id] = ship;
    }

    // parse slot item data
    var items = data[KCK.MST.SLOTITEM];
    for (i in items) {
      info = items[i];
      var item = this.parseSlotItem(info);
      this.slotitem[item.id] = item;
    }

    // parse mission data
    var missions = data[KCK.MST.MISSION];
    for (i in missions) {
      info = missions[i];
      var mission = this.parseMission(info);
      this.mission[mission.id] = mission;
    }

    // parse ship type info
    var stype = data[KCK.MST.STYPE];
    for (i in stype) {
      info = stype[i];
      this.shiptype[info[KCK.ID]] = info[KCK.NAME];
    }

    this.ready = true;

    this.save();
  },

  cloneObj: function(proto) {
    var clone = {};
    for (var i in proto) {
      clone[i] = proto[i];
    }

    return clone;
  },

  getShip: function(id) {
    var ship = this.ship[id];
    var clone = {};
    if (!ship) {
      clone = this.parseShip();
    } else {
      clone = this.cloneObj(ship);
    }

    return clone;
  },

  getShipType: function(id) {
    var name = this.shiptype[id];
    if (!name) {
      return 'N/A';
    } else {
      return name;
    }
  },

  getSlotItem: function(id) {
    var item = this.slotitem[id];
    var clone = {};
    if (!item) {
      clone = this.parseSlotItem();
    } else {
      clone = this.cloneObj(item);
    }

    return clone;
  },

  getMission: function(id) {
    var mission = this.mission[id];
    if (!mission) {
      mission = this.parseMission();
    }

    return mission;
  },

  save: function(callback) {
    LocalStorage.save(LB_KEY_API_START_DATA, this.raw, function(result) {
      if (callback) {
        callback(result);
      }

      Console.info("Logbook | LBManifest data saved.");
    });
  },

  load: function(callback) {
    LocalStorage.load(LB_KEY_API_START_DATA, function(result, data) {
      if (result) {
        LBManifest.getInstance().init(data);

        Console.info("Logbook | LBManifest data loaded.");
        LBManifest.getInstance().ready = true;
      } else {
        Console.info("Logbook | LBManifest data missing.");
      }

      if (callback) {
        callback(result);
      }
    });
  }
};

LBManifest.prototype.constructor = LBManifest;

LBManifest.getInstance = function() {
  if (LBManifest.instance === undefined)
    LBManifest.instance = new LBManifest();

  return LBManifest.instance;
};
