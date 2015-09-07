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
 *  lbdispatch.js
 *  KCLogbook
 *
 *  Main dispatch center
 *
 *  Created by Master.G on 2015/8/3.
 *  Copyright (c) 2015 Master.G. All rights reserved.
 */

// ----------------------------------------------
// Main Entry
// ----------------------------------------------

function LogbookDispatch(obj) {
  var code = obj.response.status;
  if (code !== 200)
    return;

  var url = obj.request.url;
  var urlComp = url.split('?');
  var urlResult = analyzeURL(urlComp[0]);

  if (!urlResult.success)
    return;

  obj.getContent(function(content, encoding) {
    try {
      dispatchURL(urlResult.path, content, obj);
    } catch (e) {
      Console.error(e.toString());
    }
  });
}

// ----------------------------------------------
// Analyze URL
// ----------------------------------------------

function analyzeURL(url) {
  var result = {};
  result.success = false;
  var match = url.match(
    /^([^:]+):\/\/([^\/:]*)(?::([\d]+))?(?:(\/[^#]*)(?:#(.*))?)?$/i);
  if (!match)
    return result;

  result.success = true;
  result.scheme = match[1].toLowerCase();
  result.host = match[2];
  result.port = match[3];
  result.path = match[4] || "/";
  result.fragment = match[5];

  return result;
}

// ----------------------------------------------
// Content preprocessor
// ----------------------------------------------
function contentPreprocessor(content) {
  var after = content.replace(K_DATA_HEADER, "");
  return JSON.parse(after);
}

function getData(content) {
  return content[KCK.DATA];
}

// ----------------------------------------------
// Dispatcher
// ----------------------------------------------
var K_DATA_HEADER = "svdata=";
var K_API = "/kcsapi/";
var K_API_START_2 = "api_start2";
var K_API_PORT = "api_port/port";
var K_API_BASIC = "api_get_member/basic";
var K_API_SLOT_ITEM = "api_get_member/slot_item";
var K_API_NDOCK = "api_get_member/ndock";
var K_API_KDOCK = "api_get_member/kdock";
var K_API_PRATICE = "api_get_member/practice";
var K_API_DECK = "api_get_member/deck";
var K_API_MATERIAL = "api_get_member/material";
var K_API_SHIP_2 = "api_get_member/ship2";
var K_API_SHIP_3 = "api_get_member/ship3";
var K_API_CHANGE = "api_req_hensei/change";
var K_API_GET_SHIP = "api_req_kousyou/getship";
var K_API_CREATESHIP = "api_req_kousyou/createship";
var K_API_CREATEITEM = "api_req_kousyou/createitem";
var K_API_DESTORYSHIP = "api_req_kousyou/destroyship";
var K_API_CHARGE = "api_req_hokyu/charge";
var K_API_SPEEDCHANGE = "api_req_nyukyo/speedchange";


var K_API_PRATICE_ENEMY_INFO = "api_req_member/get_practice_enemyinfo";
var K_API_MAP_START = "api_req_map/start";
var K_API_NEXT = "api_req_map/next";
var K_API_BATTLE = "api_req_sortie/battle";
var K_API_MIDNIGHT = "api_req_battle_midnight/battle";
var K_API_SP_MIDNIGHT = "api_req_battle_midnight/sp_midnight";
var K_API_AIRBATTLE = "api_req_sortie/airbattle";
var K_API_PRATICE_BATTLE = "api_req_practice/battle";
var K_API_PRATICE_MIDNIGHT = "api_req_practice/midnight_battle";
var K_API_COMBINE_BATTLE = "api_req_combined_battle/battle";
var K_API_COMBINE_MIDNIGHT = "api_req_combined_battle/midnight_battle";
var K_API_COMBINE_BATTLE_WATER = "api_req_combined_battle/battle_water";
var K_API_COMBINE_SP_MIDNIGHT = "api_req_combined_battle/sp_midnight";
var K_API_COMBINE_AIRBATTLE = "api_req_combined_battle/airbattle";  // TODO
var K_API_BATTLE_RESULT = "api_req_sortie/battleresult";

var gDispatchTable = {};

gDispatchTable[K_API_START_2]     = proc_api_start2;
gDispatchTable[K_API_PORT]        = proc_api_port;
gDispatchTable[K_API_BASIC]       = proc_api_basic;
gDispatchTable[K_API_SLOT_ITEM]   = proc_api_slot_item;
gDispatchTable[K_API_NDOCK]       = proc_api_ndock;
gDispatchTable[K_API_KDOCK]       = proc_api_kdock;
gDispatchTable[K_API_PRATICE]     = proc_api_practice;
gDispatchTable[K_API_DECK]        = proc_api_deck;
gDispatchTable[K_API_MATERIAL]    = proc_api_material;
gDispatchTable[K_API_SHIP_2]      = proc_api_ship2;
gDispatchTable[K_API_SHIP_3]      = proc_api_ship3;
gDispatchTable[K_API_GET_SHIP]    = proc_api_getship;
gDispatchTable[K_API_CREATESHIP]  = proc_api_createship;
gDispatchTable[K_API_CREATEITEM]  = proc_api_createitem;
gDispatchTable[K_API_DESTORYSHIP] = proc_api_destoryship;
gDispatchTable[K_API_CHANGE]      = proc_api_change;
gDispatchTable[K_API_CHARGE]      = proc_api_charge;
gDispatchTable[K_API_SPEEDCHANGE] = proc_api_speedchange;

gDispatchTable[K_API_NEXT]        = proc_api_next;
gDispatchTable[K_API_MAP_START]   = proc_api_map_start;
gDispatchTable[K_API_PRATICE_ENEMY_INFO] = proc_api_pratice_enemy_info;

gDispatchTable[K_API_BATTLE]                = proc_api_battle;
gDispatchTable[K_API_PRATICE_BATTLE]        = proc_api_battle;
gDispatchTable[K_API_MIDNIGHT]              = proc_api_midnight;
gDispatchTable[K_API_SP_MIDNIGHT]           = proc_api_sp_midnight;
gDispatchTable[K_API_AIRBATTLE]             = proc_api_airbattle;
gDispatchTable[K_API_PRATICE_MIDNIGHT]      = proc_api_midnight;
gDispatchTable[K_API_COMBINE_BATTLE]        = proc_api_combined_battle;
gDispatchTable[K_API_COMBINE_MIDNIGHT]      = proc_api_combined_midnight;
gDispatchTable[K_API_COMBINE_BATTLE_WATER]  = proc_api_combined_battle_water;
gDispatchTable[K_API_COMBINE_SP_MIDNIGHT]   = proc_api_combined_sp_midnight;
gDispatchTable[K_API_COMBINE_AIRBATTLE]     = proc_api_combined_airbattle;
gDispatchTable[K_API_BATTLE_RESULT]         = proc_api_battle_result;

function do_test() {
  try {
    var d = JSON.parse(raw_support)[KCK.DATA];
    LBBattle.getInstance().getDetailReport(d);
    // LBBattle.getInstance().inspectBattle(d);
  } catch (e) {
    Console.log('hi');
    Console.log(e.message);
    Console.log(e.name);
    Console.log(e.fileName);
    Console.log(e.lineNumber);
    Console.log(e.columnNumber);
    Console.log(e.stack);
  }
}

function notification(content, type) {
  if (LBSetting.getInstance().settings.allowNotification)
    $.notify(content, type);
}

function dispatchURL(path, content, obj) {
  // do_test();

  var comp = path.split(K_API);
  if (path.indexOf(K_API) > -1 && gDispatchTable[comp[1]]) {
    var json = contentPreprocessor(content);
    if (json[KCK.RESULT] != 1) {
      Console.error("Logbook | Error Request on " + path);
      return;
    }

    // api_start2 data missing
    if (!LBManifest.getInstance().ready && comp[1] != K_API_START_2) {
      return;
    }

    notification(comp[1], 'success');

    Console.info("Logbook | Dispatching " + comp[1]);

    // get post data
    var evil = {};
    if (obj.request && obj.request.postData && obj.request.postData.params)
      evil = obj.request.postData.params;

    // dispatch
    try {
      gDispatchTable[comp[1]](json, evil);
      // LBContext.getInstance().updateShips(data[KCK.SHIP]);
    } catch (e) {
      Console.log(e.message);
      Console.log(e.name);
      Console.log(e.fileName);
      Console.log(e.lineNumber);
      Console.log(e.columnNumber);
      Console.log(e.stack);
    }
    // gDispatchTable[comp[1]](json, evil);

    Console.info("Logbook | " + comp[1] + " dispatched.");
  }
}

// ----------------------------------------------
// Procedurals
// ----------------------------------------------

function proc_api_start2(json, params) {
  LBManifest.getInstance().init(getData(json));
  LogbookWeb.hideModal();
}

function proc_api_basic(json, params) {
  LBContext.getInstance().updatePlayerInfo(getData(json));
}

function proc_api_slot_item(json, params) {
  LBContext.getInstance().updateSlotItem(getData(json));
}

function proc_api_kdock(json, params) {
  LBContext.getInstance().updateKDock(getData(json));
  LBContext.getInstance().save();

  LBRecord.getInstance().updateKDock(getData(json));
}

function proc_api_ndock(json, params) {
  LBContext.getInstance().updateNDock(getData(json));
  LBContext.getInstance().save();
}

function proc_api_practice(json, params) {
  if (LBSetting.getInstance().settings.autoSwitchBattle) {
    LogbookWeb.getTab().getBattleTab().activate();
  }
}

function proc_api_getship(json, params) {
  var data = getData(json);
  LBContext.getInstance().updateKDock(data[KCK.KDOCK]);
  LBContext.getInstance().addSlotItem(data[KCK.SLOTITEM]);
  LBContext.getInstance().save();
  LBRecord.getInstance().updateKDock(data[KCK.KDOCK]);
}

function proc_api_createship(json, params) {
  LBRecord.getInstance().setCreateShip(params);
}

function proc_api_createitem(json, params) {
  var data = getData(json);
  LBContext.getInstance().createSlotItem(data, params);
  LBRecord.getInstance().createSlotItem(data, params);
}

function proc_api_destoryship(json, params) {
  proc_api_charge(json);
}

function proc_api_change(json, params) {
  LBContext.getInstance().changeShip(params);
}

function proc_api_charge(json, params) {
  var data = getData(json);
  var lv = LBContext.getInstance().level;
  var materials = data[KCK.MATERIAL];
  LogbookWeb.getTab().getPortTab().setMaterial(lv, materials);
}

function proc_api_speedchange(json, params) {
  LBContext.getInstance().speedChange(params);
}

function proc_api_deck(json, params) {
  LBContext.getInstance().updateDeck(getData(json));
  LBContext.getInstance().save();
}

function proc_api_port(json, params) {
  var data = getData(json);
  // init player ships, this operation *MUST* be done before updateDeck
  LBContext.getInstance().updateShips(data[KCK.SHIP]);
  // init player deck port info, this operation *MUST* be done after initShips
  LBContext.getInstance().updateDeck(data[KCK.DECK_PORT]);
  // update repair dock info
  LBContext.getInstance().updateNDock(data[KCK.NDOCK]);
  // port data contains api_basic info
  LBContext.getInstance().updatePlayerInfo(data[KCK.BASIC]);
  // record material data
  LBContext.getInstance().updateMaterial(data[KCK.MATERIAL]);
  // save data

  LBContext.getInstance().save();
  // clear battle data
  LogbookWeb.getTab().getBattleTab().clearOurFleet();
  LogbookWeb.getTab().getBattleTab().setOurFleetName('Our Fleet');
  LogbookWeb.getTab().getBattleTab().clearEnemyFleet();
  LogbookWeb.getTab().getBattleTab().setEnemyFleetName('Enemy Fleet');
  LBBattle.getInstance().clear();

  // activate port tab
  if (LBSetting.getInstance().settings.autoSwitchPort) {
    LogbookWeb.getTab().getPortTab().activate();
  }

  if (LBContext.getInstance().curFleet === undefined) {
    LBContext.getInstance().curFleet = 1;
  }

  var fleet = LBContext.getInstance().getFleet(LBContext.getInstance().curFleet);
  LogbookWeb.getTab().getFleetTab().setFleet(LBContext.getInstance().curFleet, fleet);
}

function proc_api_material(json, params) {
  LBContext.getInstance().updateMaterial(getData(json));
  LBContext.getInstance().save();
}

function proc_api_ship2(json, params) {
  LBContext.getInstance().updateShips(json[KCK.DATA]);
  LBContext.getInstance().updateDeck(json[KCK.DATA_DECK]);
  LBBattle.getInstance().updateShips();
  LBContext.getInstance().save();

  if (LBContext.getInstance().curFleet === undefined) {
    LBContext.getInstance().curFleet = 1;
  }
  var fleet = LBContext.getInstance().getFleet(LBContext.getInstance().curFleet);
  LogbookWeb.getTab().getFleetTab().setFleet(LBContext.getInstance().curFleet, fleet);
}

function proc_api_ship3(json, params) {
  var data = getData(json);
  LBContext.getInstance().updateShips(data[KCK.SHIP_DATA]);
  LBContext.getInstance().updateDeck(data[KCK.DECK_DATA]);
  LBContext.getInstance().save();

  if (LBContext.getInstance().curFleet === undefined) {
    LBContext.getInstance().curFleet = 1;
  }
  var fleet = LBContext.getInstance().getFleet(LBContext.getInstance().curFleet);
  LogbookWeb.getTab().getFleetTab().setFleet(LBContext.getInstance().curFleet, fleet);
}

function proc_api_next(json, params) {
  LBRecord.getInstance().updateMapInfo(getData(json));

  LogbookWeb.getTab().getBattleTab().clearEnemyFleet();
  LogbookWeb.getTab().getBattleTab().setEnemyFleetName('Enemy Fleet');
}

function proc_api_map_start(json, params) {
  for (var i in params) {
    var name = unescape(params[i].name);
    if (name == 'api_deck_id') {
      var deckId = parseInt(params[i].value);
      var fleet = LBContext.getInstance().getFleet(deckId);
      var fleetName = LBContext.getInstance().getFleetName(deckId);

      LogbookWeb.getTab().getBattleTab().setOurFleet(fleet);
      LogbookWeb.getTab().getBattleTab().setOurFleetName(fleetName);

      break;
    }
  }

  LBRecord.getInstance().updateMapInfo(getData(json));

  if (LBSetting.getInstance().settings.autoSwitchBattle) {
    LogbookWeb.getTab().getBattleTab().activate();
  }
}

function proc_api_pratice_enemy_info(json, params) {
  var data = getData(json);
  LogbookWeb.getTab().getBattleTab().setEnemyFleetName(data[KCK.DECKNAME]);
}

function proc_api_battle(json, params) {
  LBBattle.getInstance().inspectBattle(getData(json));
}

function proc_api_midnight(json, params) {
  LBBattle.getInstance().inspectMidnightBattle(getData(json));
}

function proc_api_sp_midnight(json, params) {
  LBBattle.getInstance().inspectSPMidnightBattle(getData(json));
}

function proc_api_airbattle(json, params) {
  LBBattle.getInstance().inspectAirBattle(getData(json));
}

function proc_api_combined_battle(json, params) {
  LBBattle.getInstance().inspectCombinedBattle(getData(json));
}

function proc_api_combined_midnight(json, params) {
  LBBattle.getInstance().inspectCombinedMidnight(getData(json));
}

function proc_api_combined_battle_water(json, params) {
  LBBattle.getInstance().inspectCombinedBattleWater(getData(json));
}

function proc_api_combined_sp_midnight(json, params) {
  LBBattle.getInstance().inspectCombinedSPMidnightBattle(getData(json));
}

function proc_api_combined_airbattle(json, param) {
  LBBattle.getInstance().inspectCombinedAirBattle(getData(json));
}

function proc_api_battle_result(json, params) {
  LBRecord.getInstance().recordBattleResult(getData(json));
}
