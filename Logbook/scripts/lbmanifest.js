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
    } else {
      item.id = 0;
      item.name = 'N/A';
      item.type = 0;
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
    this.ship = {};
    this.shiptype = {};
    this.slotitem = {};
    this.mission = {};

    // parse ship model data
    var ships = data[KCK.MST.SHIP];
    for (var i in ships) {
      var info = ships[i]
      var ship = this.parseShip(info);
      this.ship[ship.id] = ship;
    }

    // parse slot item data
    var items = data[KCK.MST.SLOTITEM];
    for (var i in items) {
      var info = items[i];
      var item = this.parseSlotItem(info);
      this.slotitem[item.id] = item;
    }

    // parse mission data
    var missions = data[KCK.MST.MISSION];
    for (var i in missions) {
      var info = missions[i];
      var mission = this.parseMission(info);
      this.mission[mission.id] = mission;
    }

    // parse ship type info
    var stype = data[KCK.MST.STYPE];
    for (var i in stype) {
      var info = stype[i];
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
    var data = {};
    data.ship = this.ship;
    data.slotitem = this.slotitem;
    data.mission = this.mission;
    data.shiptype = this.shiptype;

    LocalStorage.save(LB_KEY_API_START_DATA, data, function(result) {
      if (callback) {
        callback(result);
      }

      Console.info("Logbook | LBManifest data saved.");
    });
  },

  load: function(callback) {
    LocalStorage.load(LB_KEY_API_START_DATA, function(result, data) {
      if (result) {
        LBManifest.getInstance().ship = data.ship;
        LBManifest.getInstance().slotitem = data.slotitem;
        LBManifest.getInstance().mission = data.mission;
        LBManifest.getInstance().shiptype = data.shiptype;

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
