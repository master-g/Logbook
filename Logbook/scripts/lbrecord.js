var LB_KEY_PLAYER_RECORD = "lb_player_record";

LBRecord = function() {
  this.record = {};
  this.record.createitem = [];
  this.record.createship = [];
  this.record.battle = [];
  this.createship_dock = -1;
};

LBRecord.prototype = {
  save: function(callback) {
    var data = this.record;

    LocalStorage.save(LB_KEY_PLAYER_RECORD, data, function(result) {
      if (callback)
        callback(result);

      Console.info("Logbook | LBRecord data saved.");
    });
  },

  load: function(callback) {
    LocalStorage.load(LB_KEY_PLAYER_RECORD, function(result, data) {
      if (result) {
        LBRecord.getInstance().record = data;
        LBRecord.getInstance().record.createitem = data.createitem || [];
        LBRecord.getInstance().record.createship = data.createship || [];
        LBRecord.getInstance().record.battle = data.battle || [];

        LogbookWeb.getTab().getLogTab().setRecord(data);

        Console.info("Logbook | LBRecord data loaded.");
      } else {
        Console.info("Logbook | LBRecord data missing.");
      }

      if (callback) {
        callback(result);
      }
    });
  },

  clear: function() {
    this.record = {};
    this.record.createitem = [];
    this.record.createship = [];
    this.record.battle = [];

    this.save();

    LogbookWeb.getTab().getLogTab().setRecord(this.record);
  },

  setCreateShip: function(data) {
    for (var i in data) {
      var name = unescape(data[i].name);

      if (name == "api_kdock_id") {
        this.createship_dock = parseInt(data[i].value);
        break;
      }
    }
  },

  updateKDock: function(data) {
    if (data === undefined || data[0] === undefined) {
      return;
    }

    for (var i in data) {
      var ship = {};
      var dockId = data[i][KCK.ID];
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

        if (this.createship_dock != -1 && dockId === this.createship_dock) {
          // new ship
          ship.flagship = LBContext.getInstance().getFlagShipName();
          ship.createtime = Date.now();

          this.record.createship.push(ship);

          // cleanup the flag
          this.createship_dock = -1;

          this.save();

          LogbookWeb.getTab().getLogTab().addCreateShipRecord(ship);
        }
      }
    }
  },

  createSlotItem: function(data, params) {
    var createFlag = data[KCK.CREATE_FLAG];
    var shizaiFlag = data[KCK.SHIZAI_FLAG];

    // calculate cost
    var cost = [];
    for (var i in params) {
      var name = unescape(params[i].name);
      var pos = name.indexOf('api_item');
      if (pos != -1) {
        var idx = parseInt(name.replace('api_item', '')) - 1;
        cost[idx] = parseInt(params[i].value);
      }
    }

    var recordItem = {};
    recordItem.time = Date.now();
    recordItem.flagship = LBContext.getInstance().getFlagShipName();
    recordItem.cost = cost;
    recordItem.itemId = 0;
    recordItem.name = "N/A";

    if (createFlag !== 1 && shizaiFlag !== 1) {
      // Console.info("Logbook | Item create failed. :(");
      // return;
    } else {
      // add to record
      recordItem.itemId = data[KCK.SLOT_ITEM][KCK.SLOTITEM_ID];
      var equip = LBManifest.getInstance().getSlotItem(recordItem.itemId);
      recordItem.name = equip.name;
      LogbookWeb.getTab().getLogTab().addCreateItemRecord(recordItem);
      this.record.createitem.push(recordItem);

      this.save();
    }
  },

  updateMapInfo: function(data) {
    this.currentMapAreaId = data[KCK.MAPAREA_ID];
    this.currentMapInfoNo = data[KCK.MAPINFO_NO];
    this.currentMapCellNo = data[KCK.NO];
  },

  recordBattleResult: function(data) {
    if (data[KCK.ENEMY_INFO] !== undefined) {
      LogbookWeb.getTab().getBattleTab().setEnemyFleetName(data[KCK.ENEMY_INFO][KCK.DECK_NAME]);
    }

    if (data[KCK.GET_SHIP] && data[KCK.GET_SHIP][KCK.SHIP_NAME]) {
      var battle = {};
      battle.shipname = data[KCK.GET_SHIP][KCK.SHIP_NAME];
      battle.winrank = data[KCK.WIN_RANK];
      battle.location = this.currentMapAreaId + "-" + this.currentMapInfoNo + " " + this.currentMapCellNo;
      battle.time = Date.now();

      this.record.battle.push(battle);
      LogbookWeb.getTab().getLogTab().addBattleRecord(battle);

      this.save();
    }
  },

  dumpRecord: function() {
    return escape(JSON.stringify(this.record));
  },

  applyRecord: function(data) {
    try {
      var u = data.replace(/"/g, '');
      var p = JSON.parse(unescape(u));
      if (!p || !p.createitem || !p.createship || !p.battle) {
        return false;
      }

      this.record = p;
      this.record.createitem = p.createitem || [];
      this.record.createship = p.createship || [];
      this.record.battle = p.battle || [];

      LogbookWeb.getTab().getLogTab().setRecord(p);

      return true;
    } catch (e) {
      Console.error(e);
    }

    return false;
  },

  mergeRecord: function(data) {
    var i, j, r, shouldInsert;
    try {
      var u = data.replace(/"/g, '');
      var p = JSON.parse(unescape(u));

      if (!p || !p.createitem || !p.createship || !p.battle) {
        return false;
      }

      for (i in p.createitem) {
        r = p.createitem[i];
        shouldInsert = true;
        for (j in this.record.createitem) {
          if (this.record.createitem[j].time == r.time && this.createitem[j].itemId == r.itemId) {
            shouldInsert = false;
            break;
          }
        }

        if (shouldInsert) {
          this.record.createitem.push(r);
        }
      }

      for (i in p.createship) {
        r = p.createship[i];
        shouldInsert = true;
        for (j in this.record.createship) {
          if (this.record.createship[j].createtime == r.createtime && this.record.createship[j].id == r.id) {
            shouldInsert = false;
            break;
          }
        }

        if (shouldInsert) {
          this.record.createship.push(r);
        }
      }

      for (i in p.battle) {
        r = p.battle[i];
        shouldInsert = true;
        for (j in this.record.battle) {
          if (this.record.battle[j].time == r.time && this.record.battle[j].shipname == r.shipname) {
            shouldInsert = false;
            break;
          }
        }

        if (shouldInsert) {
          this.record.battle.push(r);
        }
      }

      LogbookWeb.getTab().getLogTab().setRecord(this.record);

      return true;
    } catch (e) {
      Console.error(e);
    }

    return false;
  }
};

LBRecord.prototype.constructor = LBRecord;

LBRecord.getInstance = function() {
  if (LBRecord.instance === undefined)
    LBRecord.instance = new LBRecord();

  return LBRecord.instance;
};
