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
 *  lbkeys.js
 *  KCLogbook
 *
 *  Constants
 *
 *  Created by Master.G on 2015/8/3.
 *  Copyright (c) 2015 Master.G. All rights reserved.
 */

var KCK = KCK || {};

KCK.RESULT = "api_result";
KCK.RESULT_MSG = "api_result_msg";
KCK.DATA = "api_data";

KCK.MST = {}; // manifest
KCK.MST.SHIP = "api_mst_ship";
KCK.ID = "api_id";
KCK.SORTNO = "api_sortno";
KCK.NAME = "api_name";
KCK.YOMI = "api_yomi"; // spell name
KCK.STYPE = "api_stype"; // ship type
KCK.AFTERLV = "api_afterlv"; // upgrade level
KCK.AFTERSHIPID = "api_aftershipid"; // upgrade ship id
KCK.TAIK = "api_taik"; // hp
KCK.SOUK = "api_souk"; // armor
KCK.HOUG = "api_houg"; // fire power
KCK.RAIG = "api_raig"; // torpedo
KCK.TYKU = "api_tyku"; // anti-air
KCK.LUCK = "api_luck"; // luck
KCK.SOKU = "api_soku"; // speed
KCK.LENG = "api_leng"; // fire range
KCK.SLOT_NUM = "api_slot_num"; // slot number
KCK.MAXEQ = "api_maxeq"; // maximum plane storage
KCK.BUILDTIME = "api_buildtime"; // build time
KCK.BROKEN = "api_broken"; // ?
KCK.POWUP = "api_powup"; // ?
KCK.BACKS = "api_backs"; // background ?
KCK.GETMES = "api_getmes"; // self introduction
KCK.AFTERFUEL = "api_afterfuel"; // ?
KCK.AFTERBULL = "api_afterbull"; // ?
KCK.FUEL_MAX = "api_fuel_max"; // maximum fuel
KCK.BULL_MAX = "api_bull_max"; // maximum bullet
KCK.VOICEF = "api_voicef"; // ?

KCK.MST.SHIPGRAPH = "api_mst_shipgraph";
KCK.FILENAME = "api_filename"; // swf filename
KCK.VERSION = "api_version"; // swf version

KCK.MST.SLOTITEM_EQUIPTYPE = "api_mst_slotitem_equiptype";
KCK.SHOW_FLG = "api_show_flg"; // ?

KCK.MST.STYPE = "api_mst_stype";
KCK.SCNT = "api_scnt"; // ?
KCK.KCNT = "api_kcnt"; // ?
KCK.EQUIP_TYPE = "api_equip_type"; // type of equipment that can be equip

KCK.MST.SLOTITEM = "api_mst_slotitem";
KCK.INFO = "api_info"; // item description
KCK.TYPE = "api_type";

KCK.MST.SLOTITEMGRAPH = "api_mst_slotitemgraph";

KCK.MST.FURNITURE = "api_mst_furniture";

KCK.MST.FURNITUREGRAPH = "api_mst_furnituregraph";

KCK.MST.USEITEM = "api_mst_useitem";
KCK.USETYPE = "api_usetype";
KCK.CATEGORY = "api_category";
KCK.DESCRIPTION = "api_description";
KCK.PRICE = "api_price";

KCK.MST.PAYITEM = "api_mst_payitem";

KCK.MST.ITEM_SHOP = "api_mst_item_shop";

KCK.MST.MAPAREA = "api_mst_maparea";

KCK.MST.MAPINFO = "api_mst_mapinfo";
KCK.MAPAREA_ID = "api_maparea_id";
KCK.LEVEL = "api_level";
KCK.OPETEXT = "api_opetext"; // operation text
KCK.INFOTEXT = "api_infotext"; // map description
KCK.ITEM = "api_item";
KCK.MAX_MAPHP = "api_max_maphp"; // map boss hp
KCK.REQUIRED_DEFEAT_COUNT = "api_required_defeat_count"; // how many times the map takes to be defeated
KCK.SALLY_FALG = "api_sally_flag"; // ?

KCK.MST.MAPBGM = "api_mst_mapbgm";

KCK.MST.MAPCELL = "api_mst_mapcell";
KCK.NO = "api_no";
KCK.MAP_NO = "api_map_no"; // the map area this cell belongs to
KCK.MAPINFO_NO = "api_mapinfo_no";
KCK.COLOR_NO = "api_color_no";

KCK.MST.MISSION = "api_mst_mission";
KCK.DETAILS = "api_details"; // mission description
KCK.TIME = "api_time";
KCK.DIFFICULTY = "api_difficulty";
KCK.USE_FUEL = "api_use_fuel"; // fuel consumption
KCK.USE_BULL = "api_use_bull"; // bullet consumption
KCK.WIN_ITEM1 = "api_win_item1";
KCK.WIN_ITEM2 = "api_win_item2";
KCK.RETURN_FLAG = "api_return_flag";

KCK.MST.CONST = "api_mst_const";
KCK.BOKO_MAX_SHIPS = "api_boko_max_ships";
KCK.STRING_VALUE = "api_string_value";
KCK.INT_VALUE = "api_int_value";

KCK.MST.SHIPUPGRADE = "api_mst_shipupgrade";

KCK.MST.BGM = "api_mst_bgm";

// basic

KCK.MEMBER_ID = "api_member_id";
KCK.NICKNAME = "api_nickname";
KCK.NICKNAME_ID = "api_nickname_id";
KCK.ACTIVE_FLAG = "api_active_flag";
KCK.STARTTIME = "api_starttime";
KCK.RANK = "api_rank";
KCK.EXPERIENCE = "api_experience";
KCK.FLEETNAME = "api_fleetname";
KCK.COMMENT = "api_comment";
KCK.COMMENT_ID = "api_comment_id";
KCK.MAX_CHARA = "api_max_chara";
KCK.MAX_SLOTITEM = "api_max_slotitem";
KCK.MAX_KAGU = "api_max_kagu";
KCK.PLAYTIME = "api_playtime";
KCK.TUTORIAL = "api_tutorial";
KCK.FURNITURE = "api_furniture";
KCK.COUNT_DECK = "api_count_deck";
KCK.COUNT_KDOCK = "api_count_kdock";
KCK.COUNT_NDOCK = "api_count_ndock";
KCK.FCOIN = "api_fcoin";
KCK.ST_WIN = "api_st_win";
KCK.ST_LOSE = "api_st_lose";
KCK.MS_COUNT = "api_ms_count";
KCK.MS_SUCCESS = "api_ms_success";
KCK.PT_WIN = "api_pt_win";
KCK.PT_LOSE = "api_pt_lose";
KCK.PT_CHALLENGED = "api_pt_challenged";
KCK.pt_CHALLENGED_WIN = "api_pt_challenged_win";
KCK.FIRSTFLAG = "api_firstflag";
KCK.TUTORIAL_PROGRESS = "api_tutorial_progress";
KCK.PVP = "api_pvp";
KCK.MEDALS = "api_medals";

// slot_item
KCK.SLOT_ITEM = "api_slot_item";
KCK.SLOTITEM = "api_slotitem";
KCK.SLOTITEM_ID = "api_slotitem_id";
KCK.LOCKED = "api_locked";

// kdock
KCK.STATE = "api_state";
KCK.CREATED_SHIP_ID = "api_created_ship_id";
KCK.COMPLETE_TIME = "api_complete_time";
KCK.COMPLETE_TIME_STR = "api_complete_time_str";
KCK.ITEM1 = "api_item1";
KCK.ITEM2 = "api_item2";
KCK.ITEM3 = "api_item3";
KCK.ITEM4 = "api_item4";
KCK.ITEM5 = "api_item5";

// create item
KCK.CREATE_FLAG = "api_create_flag";
KCK.SHIZAI_FLAG = "api_shizai_flag";

// port
KCK.MATERIAL = "api_material";
KCK.DECK_PORT = "api_deck_port";
KCK.NDOCK = "api_ndock";
KCK.KDOCK = "api_kdock";
KCK.SHIP = "api_ship";
KCK.BASIC = "api_basic";
KCK.LOG = "api_log";
KCK.P_BGM_ID = "api_p_bgm_id";
KCK.VALUE = "api_value";
KCK.SHIP_ID = "api_ship_id";
KCK.NOWHP = "api_nowhp";
KCK.MAXHP = "api_maxhp";
KCK.NOWHPS = "api_nowhps";
KCK.MAXHPS = "api_maxhps";
KCK.FORMATION = "api_formation";
KCK.DOCK_ID = "api_dock_id";
KCK.SHIP_KE = "api_ship_ke";
KCK.KOUKU = "api_kouku"; // air raid
KCK.KOUKU2 = "api_kouku2";
KCK.SUPPORT_FLAG = "api_support_flag";
KCK.SUPPORT_INFO = "api_support_info";
KCK.SUPPORT_AIRATTACK = "api_support_airatack"; // there is a misspell in origin data
KCK.SUPPORT_HUORAI = "api_support_hourai";
KCK.OPENING_ATACK = "api_opening_atack";
KCK.HOUGEKI = "api_hougeki";
KCK.HOUGEKI1 = "api_hougeki1";
KCK.HOUGEKI2 = "api_hougeki2";
KCK.HOUGEKI3 = "api_hougeki3";
KCK.RAIGEKI = "api_raigeki";
KCK.DF_LIST = "api_df_list";
KCK.DAMAGE = "api_damage";
KCK.PLANE_FROM = "api_plane_from";
KCK.STAGE1 = "api_stage1";
KCK.STAGE2 = "api_stage2";
KCK.STAGE3 = "api_stage3";
KCK.FRAI_FLAG = "api_frai_flag";
KCK.ERAI_FLAG = "api_erai_flag";
KCK.FBAK_FLAG = "api_fbak_flag";
KCK.EBAK_FLAG = "api_ebak_flag";
KCK.FCL_FLAG = "api_fcl_flag";
KCK.ECL_FLAG = "api_ecl_flag";
KCK.FDAM = "api_fdam";
KCK.EDAM = "api_edam";
KCK.DECK_ID = "api_deck_id";
KCK.DECKNAME = "api_deckname";
KCK.ENEMY_INFO = "api_enemy_info";
KCK.DECK_NAME = "api_deck_name";
KCK.GET_SHIP = "api_get_ship";
KCK.SHIP_NAME = "api_ship_name";
KCK.MISSION = "api_mission";
KCK.LV = "api_lv";
KCK.WIN_RANK = "api_win_rank";
KCK.SHIP_DATA = "api_ship_data";
KCK.DECK_DATA = "api_deck_data";
KCK.EXP = "api_exp";
KCK.COND = "api_cond";
KCK.SLOT = "api_slot";
KCK.ESLOT = "api_eSlot";
KCK.SLOT_EX = "api_slot_ex";
KCK.NOWHPS_COMBINED = "api_nowhps_combined";
KCK.MAXHPS_COMBINED = "api_maxhps_combined";
KCK.STAGE3_COMBINED = "api_stage3_combined";

// ship
KCK.DATA_DECK = "api_data_deck";

KCK.ESCAPE_IDX = "api_escape_idx";
KCK.ESCAPE_IDX_COMBINED = "api_escape_idx_combined";
