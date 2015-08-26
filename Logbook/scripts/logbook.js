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
 *  logbook.js
 *  KCLogbook
 *
 *  UI
 *
 *  Created by Master.G on 2015/8/3.
 *  Copyright (c) 2015 Master.G. All rights reserved.
 */

/*
 * TODO:
 * 1. add screen capture function, ref https://github.com/tlrobinson/element-capture
 * 2. refine battle analyze
 * 3. refine record management
 * 4. change amatsukaze avatar
 */

LBUtil = {};

LBUtil.MILLISECONDS_PER_SECOND = 1000;
LBUtil.MILLISECONDS_PER_MINUTE = LBUtil.MILLISECONDS_PER_SECOND * 60;
LBUtil.MILLISECONDS_PER_HOUR = LBUtil.MILLISECONDS_PER_MINUTE * 60;
LBUtil.MILLISECONDS_PER_DAY = LBUtil.MILLISECONDS_PER_HOUR * 24;
LBUtil.MILLISECONDS_PER_THREE_DAY = LBUtil.MILLISECONDS_PER_DAY * 3;

LBUtil.StringifyMilliseconds = function(ms) {
  var str = '';
  var hour = Math.floor(ms / LBUtil.MILLISECONDS_PER_HOUR);
  var minute = Math.floor(ms / LBUtil.MILLISECONDS_PER_MINUTE) % 60;
  var second = Math.floor(ms / LBUtil.MILLISECONDS_PER_SECOND) % 60;
  hour = hour.toString();
  minute = minute.toString();
  second = second.toString();

  if (minute.length < 2)
    minute = '0' + minute;

  if (second.length < 2)
    second = '0' + second;

  str = hour + ':' + minute + ':' + second;
  if (ms <= 0) {
    str = 'Done';
  }
  return str;
};

LBUtil.StringifyDate = function(d) {
  var daylabel = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  var hour = d.getHours().toString();
  var minutes = d.getMinutes().toString();
  var seconds = d.getSeconds().toString();

  if (hour.length < 2)
    hour = '0' + hour;
  if (minutes.length < 2)
    minutes = '0' + minutes;
  if (seconds.length < 2)
    seconds = '0' + seconds;

  return daylabel + ' ' + hour + ':' + minutes + ':' + seconds;
};

LBUtil.MagnifyMilliseconds = function(a, b) {
  var sa = a.toString();
  var sb = b.toString();

  var p = 0;

  if (sa.length != sb.length || a === b) {
    p = a / b;
  } else if (a >= b) {
    p = 1;
  } else {
    for (var i = 0; i < sa.length; i++) {
      if (sa[i] !== sb[i]) {
        sa = sa.substr(i);
        sb = sb.substr(i);

        p = parseInt(sa) / parseInt(sb);
        break;
      }
    }
  }

  if (p < 0 || p > 1)
    p = 1;

  p = Math.floor(p * 100);

  return p;
};

LBUtil.PercentColor = function(p) {
  if (p == 100) {
    // perfect
    return 'info';
  } else if (p >= 75) {
    // nothing
    return 'success';
  } else if (p < 75 && p > 50) {
    // minor
    return 'success';
  } else if (p <= 50 && p > 25) {
    // medium
    return 'warning';
  } else {
    // critical
    return 'danger';
  }
};

// ----------------------------------------------
// Port Tab
// ----------------------------------------------
LBPortTab = function() {};

LBPortTab.prototype = {
  activate: function() {
    $('#main_tabs a[href="#tab_port"]').tab('show');
  },

  setMission: function(data) {
    var shouldRefreshTooltip = true;
    if (this.mission !== undefined && JSON.stringify(this.mission) === JSON.stringify(data)) {
      shouldRefreshTooltip = false;
    }

    var now = Date.now();

    for (var i = 1; i < data.length; i++) {
      var pair = data[i];

      var prefix = '#mission_progress_';
      var progress_tag = prefix + i;
      var minw = '8em';
      var desc = '';
      var t = pair[0];
      var m = pair[1];
      var name = pair[2] || '';
      var percentage = 0;

      if (t === 0) {
        percentage = 0;
        minw = '0em';
      } else {
        minw = '4em';
        if (now >= t) {
          percentage = 1;
        } else {
          percentage = (m - (t - now)) / m;
        }

        if (percentage < 0)
          percentage = 0;
        if (percentage > 1)
          percentage = 1;

        if (percentage === 1) {
          desc = 'FINISH';
        } else {
          desc = LBUtil.StringifyMilliseconds(t - now);
        }

        percentage = Math.floor(percentage * 100);

        $(progress_tag).removeClass();
        if (percentage >= 100) {
          $(progress_tag).addClass('progress-bar progress-bar-info');
        } else {
          $(progress_tag).addClass('progress-bar progress-bar-success');
        }
      }

      $(progress_tag).css('width', percentage + '%');
      $(progress_tag).css('min-width', minw);
      $(progress_tag).html(desc);

      // tooltips
      if (shouldRefreshTooltip) {
        var tooltipTag = '#mission_tooltip_' + i;
        $(tooltipTag).tooltip('hide').attr('data-original-title', name);
      }
    }

    this.mission = data;
  },
  updateMission: function() {
    if (this.mission !== undefined) {
      this.setMission(this.mission);
    }
  },

  setNDock: function(info) {
    this.ndock_info = info;

    var now = Date.now();

    for (var i = 0; i < info.length; i++) {
      var ship = info[i];
      var dock_prefix = '#ndock_';
      var dock_name = dock_prefix + (i + 1);
      var dock_progress_name = dock_prefix + 'progress_' + (i + 1);
      var dock_progress_label_name = dock_prefix + 'progress_text_' + (i + 1);

      var desc = '';
      var time_desc = '';
      var minw = '4em';

      var percentage = 0;

      if (ship.id !== 0) {
        desc = '[' + ship.name + ' ' + ship.nowhp + '/' + ship.maxhp + ']';
        time_desc = LBUtil.StringifyMilliseconds(ship.complete_time - now);

        if (now >= ship.complete_time) {
          percentage = 100;
          time_desc = 'FINISH';
        } else {
          var t = ship.complete_time;
          var m = ship.require_time;
          percentage = (m - (t - now)) / m;

          percentage = Math.floor(percentage * 100);
        }
      } else {
        ship.complete_time = now;
        ship.nowhp = 0;
        ship.maxhp = 1;
        desc = '[N/A]';
        minw = '0em';
      }

      // set ship name
      $(dock_name).text(desc);

      if (ship.id === 0) {
        percentage = 0;
      }

      $(dock_progress_name).removeClass();
      $(dock_progress_name).addClass('progress-bar progress-bar-' + LBUtil.PercentColor(percentage));

      $(dock_progress_name).css('width', percentage + '%');
      $(dock_progress_name).css('min-width', minw);
      $(dock_progress_name).html(time_desc);
    }
  },
  updateNDock: function() {
    if (this.ndock_info !== undefined) {
      this.setNDock(this.ndock_info);
    }
  },

  setKDock: function(info) {
    this.kdock_info = info;
    var now = Date.now();

    for (var i = 0; i < info.length; i++) {
      var ship = info[i];
      var dock_prefix = '#kdock_';
      var dock_name = dock_prefix + (i + 1);
      var dock_progress_name = dock_prefix + 'progress_' + (i + 1);
      var dock_progress_label_name = dock_prefix + 'progress_text_' + (i + 1);

      var desc = '';
      var time_desc = '';
      var minw = '4em';

      var percentage = 0;

      if (ship.id !== 0) {
        desc = '[' + ship.name + ']';
        time_desc = LBUtil.StringifyMilliseconds(ship.complete_time - now);

        var m = ship.buildtime * LBUtil.MILLISECONDS_PER_MINUTE;
        var t = ship.complete_time;

        if (now >= t) {
          percentage = 1;
        } else {
          percentage = (m - (t - now)) / m;
        }

        if (percentage < 0)
          percentage = 0;
        if (percentage > 1)
          percentage = 1;

        if (percentage === 1) {
          time_desc = 'FINISH';
        } else {
          time_desc = LBUtil.StringifyMilliseconds(t - now);
        }

        percentage = Math.floor(percentage * 100);

        $(dock_progress_name).removeClass();
        if (percentage >= 100) {
          $(dock_progress_name).addClass('progress-bar progress-bar-info');
        } else {
          $(dock_progress_name).addClass('progress-bar progress-bar-success');
        }
      } else {
        ship.complete_time = now;
        desc = '[N/A]';
        minw = '0em';
      }

      // set ship name
      $(dock_name).text(desc);

      if (ship.id === 0) {
        percentage = 0;
      }

      $(dock_progress_name).css('width', percentage + '%');
      $(dock_progress_name).css('min-width', minw);
      $(dock_progress_name).html(time_desc);
    }
  },

  updateKDock: function() {
    if (this.kdock_info !== undefined) {
      this.setKDock(this.kdock_info);
    }
  },

  setMaterial: function(level, data) {
    var max = level * 250 + 750;
    var prefix = '#res_progress_';
    for (var i = 0; i < 4; i++) {
      var tag = prefix + (i + 1);
      var m = data[i];
      var percentage = m / max;

      if (percentage > 1 || percentage < 0) {
        percentage = 1;
      }

      // time desc
      var time_desc = '';
      if (m >= max) {
        // time_desc = m;
        time_desc = 'MAX';
      } else {
        var time_require = max - m;
        time_require *= ((i === 3) ? 3 : 1);

        var now = new Date();
        now.setMinutes(now.getMinutes() + time_require);
        time_desc = LBUtil.StringifyDate(now);
      }

      // color
      $(tag).removeClass();
      $(tag).addClass('progress-bar progress-bar-' + LBUtil.PercentColor(percentage * 100));

      // tooltips
      var tooltipTag = '#res_tooltip_' + (i + 1);
      $(tooltipTag).tooltip('hide').attr('data-original-title', time_desc);

      // set
      percentage = Math.floor(percentage * 100);
      $(tag).css('width', percentage + '%');
      $(tag).html(m >= max ? m : percentage + '%');
      // $(tag).html(m >= max ? 'MAX' : percentage + '%');
    }
  },

  update: function() {
    this.updateNDock();
    this.updateKDock();
    this.updateMission();
  },

  clearFleet: function() {
    var prefix = '#port_fleet_ship_';
    for (var i = 1; i < 7; i++) {
      var ship_tag = prefix + i;
      var name_tag = ship_tag + '_name';
      var exp_tag = ship_tag + '_exp';
      var exptext_tag = ship_tag + '_exp_text';
      var cond_tag = ship_tag + '_cond';
      var condtext_tag = ship_tag + '_cond_text';
      var condicon_tag = ship_tag + '_cond_icon';

      $(ship_tag).removeClass();
      $(ship_tag).addClass('list-group-item list-group-item-default');
      $(name_tag).html('N/A');

      $(exp_tag).removeClass();
      $(exp_tag).addClass('list-group-item list-group-item-default');
      $(exptext_tag).html('N/A');

      $(condtext_tag).html('N/A');
      $(condicon_tag).removeClass();
      $(condicon_tag).addClass('fa fa-smile-o');
      $(cond_tag).removeClass();
      $(cond_tag).addClass('list-group-item list-group-item-default');

      for (var j = 1; j < 6; j++) {
        $(ship_tag + '_slottext_' + j).html('N/A');
        $(ship_tag + '_slot_' + j).removeClass();
        $(ship_tag + '_slot_' + j).addClass('list-group-item list-group-item-default');
        $(ship_tag + '_sloticon_' + j).src = "";
      }
    }
  },
/*
  setFleet: function(idx, fleet) {
    this.clearFleet();

    var i;
    for (i = 1; i < 5; i++) {
      $('#port_fleet_' + i).removeClass();
    }

    $('#port_fleet_' + idx).addClass('active');

    var prefix = '#port_fleet_ship_';
    for (i = 0; i < fleet.length; i++) {
      var ship = fleet[i];
      var ship_tag = prefix + (i + 1);
      var name_tag = ship_tag + '_name';
      var exp_tag = ship_tag + '_exp';
      var exptext_tag = ship_tag + '_exp_text';
      var cond_tag = ship_tag + '_cond';
      var condicon_tag = ship_tag + '_cond_icon';
      var condtext_tag = ship_tag + '_cond_text';
      var itembg1_tag = ship_tag + '_slot_1';
      var itembg2_tag = ship_tag + '_slot_2';
      var itembg3_tag = ship_tag + '_slot_3';
      var itembg4_tag = ship_tag + '_slot_4';
      var item1_tag = ship_tag + '_slottext_1';
      var item2_tag = ship_tag + '_slottext_2';
      var item3_tag = ship_tag + '_slottext_3';
      var item4_tag = ship_tag + '_slottext_4';

      $(ship_tag).removeClass();
      var percentage = Math.floor(ship.realhp / ship.maxhp * 100);
      $(ship_tag).addClass('list-group-item list-group-item-' + LBUtil.PercentColor(percentage));

      $(name_tag).html(ship.name + ' ' + ship.nowhp + '/' + ship.maxhp);
      $(exp_tag).removeClass();
      $(exp_tag).addClass('list-group-item list-group-item-info');
      $(exptext_tag).html('Lv ' + ship.lv + ' ' + '<i class="fa fa-arrow-up"></i>' + ' ' + ship.lvupexp);

      $(condicon_tag).removeClass();
      $(cond_tag).removeClass();
      $(condtext_tag).html(' ' + ship.condition + '/100');
      if (ship.condition >= 50) {
        $(condicon_tag).addClass('fa fa-star-o');
        $(cond_tag).addClass('list-group-item list-group-item-info');
      } else if (ship.condition < 30 && ship.condition > 20) {
        $(condicon_tag).addClass('fa fa-frown-o');
        $(cond_tag).addClass('list-group-item list-group-item-warning');
      } else if (ship.condition <= 20) {
        $(condicon_tag).addClass('fa fa-frown-o');
        $(cond_tag).addClass('list-group-item list-group-item-danger');
      } else {
        $(condicon_tag).addClass('fa fa-smile-o');
        $(cond_tag).addClass('list-group-item list-group-item-success');
      }

      for (var j = 1; j < 5; j++) {
        if (ship.icon[j - 1]) {
          $(ship_tag + "_sloticon_" + j).src = "/icons/" + ship.icon[j - 1];
        }
        $(ship_tag + '_slottext_' + j).html(ship.slot[j - 1] || 'N/A');
        $(ship_tag + '_slot_' + j).removeClass();
        $(ship_tag + '_slot_' + j).addClass(ship.slot[j - 1] ? 'list-group-item list-group-item-warning' : 'list-group-item list-group-item-default');
      }

      $(ship_tag + '_slottext_' + 5).html(ship.slotex || 'N/A');
      $(ship_tag + '_slot_' + 5).removeClass();
      $(ship_tag + '_slot_' + 5).addClass(ship.slotex ? 'list-group-item list-group-item-warning' : 'list-group-item list-group-item-default');
    }
  }
  */
};

LBPortTab.prototype.constructor = LBPortTab;

// ----------------------------------------------
// Fleet Tab
// ----------------------------------------------
LBFleetTab = function() {};

LBFleetTab.prototype = {
  clearFleet: function() {
    var prefix = '#port_fleet_ship_';
    for (var i = 1; i < 7; i++) {
      var ship_tag = prefix + i;
      var name_tag = ship_tag + '_name';
      var exp_tag = ship_tag + '_exp';
      var exptext_tag = ship_tag + '_exp_text';
      var cond_tag = ship_tag + '_cond';
      var condtext_tag = ship_tag + '_cond_text';
      var condicon_tag = ship_tag + '_cond_icon';

      $(ship_tag).removeClass();
      $(ship_tag).addClass('list-group-item list-group-item-default');
      $(name_tag).html('N/A');

      $(exp_tag).removeClass();
      $(exp_tag).addClass('list-group-item list-group-item-default');
      $(exptext_tag).html('N/A');

      $(condtext_tag).html('N/A');
      $(condicon_tag).removeClass();
      $(condicon_tag).addClass('fa fa-smile-o');
      $(cond_tag).removeClass();
      $(cond_tag).addClass('list-group-item list-group-item-default');

      for (var j = 1; j < 6; j++) {
        $(ship_tag + '_slottext_' + j).html('N/A');
        $(ship_tag + '_slot_' + j).removeClass();
        $(ship_tag + '_slot_' + j).addClass('list-group-item list-group-item-default');

        $(ship_tag + '_sloticon_' + j).attr("src", "/icons/slotitem/0.png");
      }
    }
  },

  setFleet: function(idx, fleet) {
    this.clearFleet();

    var i;
    for (i = 1; i < 5; i++) {
      $('#port_fleet_' + i).removeClass();
    }

    $('#port_fleet_' + idx).addClass('active');

    var prefix = '#port_fleet_ship_';
    for (i = 0; i < fleet.length; i++) {
      var ship = fleet[i];
      var ship_tag = prefix + (i + 1);
      var name_tag = ship_tag + '_name';
      var exp_tag = ship_tag + '_exp';
      var exptext_tag = ship_tag + '_exp_text';
      var cond_tag = ship_tag + '_cond';
      var condicon_tag = ship_tag + '_cond_icon';
      var condtext_tag = ship_tag + '_cond_text';
      var itembg1_tag = ship_tag + '_slot_1';
      var itembg2_tag = ship_tag + '_slot_2';
      var itembg3_tag = ship_tag + '_slot_3';
      var itembg4_tag = ship_tag + '_slot_4';
      var item1_tag = ship_tag + '_slottext_1';
      var item2_tag = ship_tag + '_slottext_2';
      var item3_tag = ship_tag + '_slottext_3';
      var item4_tag = ship_tag + '_slottext_4';

      $(ship_tag).removeClass();
      var percentage = Math.floor(ship.realhp / ship.maxhp * 100);
      $(ship_tag).addClass('list-group-item list-group-item-' + LBUtil.PercentColor(percentage));

      $(name_tag).html(ship.name + ' ' + ship.nowhp + '/' + ship.maxhp);
      $(exp_tag).removeClass();
      $(exp_tag).addClass('list-group-item list-group-item-info');
      $(exptext_tag).html('Lv ' + ship.lv + ' ' + '<i class="fa fa-arrow-up"></i>' + ' ' + ship.lvupexp);

      $(condicon_tag).removeClass();
      $(cond_tag).removeClass();
      $(condtext_tag).html(' ' + ship.condition + '/100');
      if (ship.condition >= 50) {
        $(condicon_tag).addClass('fa fa-star-o');
        $(cond_tag).addClass('list-group-item list-group-item-info');
      } else if (ship.condition < 30 && ship.condition > 20) {
        $(condicon_tag).addClass('fa fa-frown-o');
        $(cond_tag).addClass('list-group-item list-group-item-warning');
      } else if (ship.condition <= 20) {
        $(condicon_tag).addClass('fa fa-frown-o');
        $(cond_tag).addClass('list-group-item list-group-item-danger');
      } else {
        $(condicon_tag).addClass('fa fa-smile-o');
        $(cond_tag).addClass('list-group-item list-group-item-success');
      }

      for (var j = 1; j < 5; j++) {
        if (ship.icon[j - 1]) {
          $(ship_tag + "_sloticon_" + j).attr("src", "/icons/slotitem/" + ship.icon[j - 1]);
        }

        $(ship_tag + '_slottext_' + j).html(ship.slot[j - 1] || 'N/A');
        $(ship_tag + '_slot_' + j).removeClass();
        $(ship_tag + '_slot_' + j).addClass(ship.slot[j - 1] ? 'list-group-item list-group-item-warning' : 'list-group-item list-group-item-default');
      }

      $(ship_tag + '_slottext_' + 5).html(ship.slotex || 'N/A');
      $(ship_tag + '_slot_' + 5).removeClass();
      $(ship_tag + '_slot_' + 5).addClass(ship.slotex ? 'list-group-item list-group-item-warning' : 'list-group-item list-group-item-default');
      if (ship.exicon && ship.exicon !== "") {
        $(ship_tag + "_sloticon_" + 5).attr("src", "/icons/slotitem/" + ship.exicon);
      } else {
        $(ship_tag + "_sloticon_" + 5).attr("src", "/icons/slotitem/0.png");
      }
    }
  }
};

LBFleetTab.prototype.constructor = LBFleetTab;

// ----------------------------------------------
// Battle Tab
// ----------------------------------------------
LBBattleTab = function() {};

LBBattleTab.prototype = {
  activate: function() {
    $('#main_tabs a[href="#tab_battle"]').tab('show');
  },
  setOurFleetName: function(name) {
    $('#our_fleet_name').text(name);
  },

  setEnemyFleetName: function(name) {
    $('#enemy_fleet_name').text(name);
  },

  clearOurFleet: function() {
    var i, tag, shipTag, iconTag;
    var prefix = '#our_fleet_';
    for (i = 1; i <= 6; i++) {
      tag = prefix + i;
      shipTag = prefix + 'ship_' + i;
      iconTag = prefix + 'icon_' + i;
      $(shipTag).text('N/A');
      $(tag).removeClass();
      $(tag).addClass('panel panel-default');
      $(iconTag).removeClass();
    }

    prefix = '#combined_fleet_';
    for (i = 1; i <= 6; i++) {
      tag = prefix + i;
      shipTag = prefix + 'ship_' + i;
      iconTag = prefix + 'icon_' + i;
      $(shipTag).text('N/A');
      $(tag).removeClass();
      $(tag).addClass('panel panel-default');
      $(iconTag).removeClass();
    }

    $('#combined_ship').hide();
  },

  clearEnemyFleet: function() {
    var prefix = '#enemy_fleet_';
    for (var i = 1; i <= 6; i++) {
      var tag = prefix + i;
      var shipTag = prefix + 'ship_' + i;
      var iconTag = prefix + 'icon_' + i;
      var tooltipTag = prefix + 'slot_' + i;
      $(shipTag).text('N/A');
      $(tag).removeClass();
      $(tag).addClass('panel panel-default');
      $(iconTag).removeClass();
      $(tooltipTag).tooltip('hide').attr('data-original-title', '');
    }
  },

  setFleet: function(fleet, our, combined) {
    var prefix = our ? '#our_fleet_' : '#enemy_fleet_';
    if (combined) {
      prefix = '#combined_fleet_';
    }

    for (var i = 0; i < fleet.length; i++) {
      var desc = '';
      var ship = fleet[i];
      var tag = prefix + (i + 1);
      var tagShip = prefix + 'ship_' + (i + 1);
      var iconTag = prefix + 'icon_' + (i + 1);

      if (!ship.escaped) {
        desc = ship.name + ' ' + ship.nowhp + '/' + ship.maxhp;
      } else {
        desc = ship.name + " Escaped";
      }
      $(tagShip).text(desc);

      var percentage = ship.realhp / ship.maxhp;

      $(tag).removeClass();
      if (percentage == 1 || Math.round(ship.realhp) == ship.maxhp) {
        // perfect
        $(tag).addClass('panel panel-info');
      } else if (percentage >= 0.75) {
        // nothing
        $(tag).addClass('panel panel-success');
      } else if (percentage < 0.75 && percentage > 0.5) {
        // minor
        $(tag).addClass('panel panel-success');
      } else if (percentage <= 0.5 && percentage > 0.25) {
        // medium
        $(tag).addClass('panel panel-warning');
      } else {
        // critical
        $(tag).addClass('panel panel-danger');
        // add icon
        if (our) {
          $(iconTag).removeClass();
          $(iconTag).addClass('fa fa-exclamation-triangle');
        } else if (ship.nowhp === 0) {
          $(tag).removeClass();
          $(tag).addClass('panel panel-default');

          $(iconTag).removeClass();
          $(iconTag).addClass('fa fa-fire');
        }
      }

      if (!our && ship.slot) {
        var tooltipId = "#enemy_fleet_slot_" + (i + 1);
        var slottext = '';
        for (var j = 0; j < ship.slot.length; j++) {
          slottext += ship.slot[j];
          slottext += "\n";
        }
        $(tooltipId).tooltip('hide').attr('data-original-title', slottext);
      }
    }
  },

  setOurFleet: function(fleet) {
    this.clearOurFleet();
    this.setFleet(fleet, true, false);
  },

  setEnemyFleet: function(fleet) {
    this.clearEnemyFleet();
    this.setFleet(fleet, false, false);
  },

  setCombinedFleet: function(fleet) {
    $('#combined_ship').show();
    this.setFleet(fleet, true, true);
  }

};

LBBattleTab.prototype.constructor = LBBattleTab;

// ----------------------------------------------
// Statistics Tab
// ----------------------------------------------
LBStatTab = function() {
  this.init();
};

LBStatTab.prototype = {
  init: function() {
    this.shipTable = $('#ship_table').DataTable();
  },

  setShips: function(data) {
    this.shipTable.clear();
    for (var i in data) {
      var id = data[i].id;
      var ship_id = data[i].ship_id;
      var name = LBManifest.getInstance().getShip(ship_id).name;
      var stype = LBManifest.getInstance().getShip(ship_id).ship_type;
      var type = LBManifest.getInstance().getShipType(stype);
      var lv = data[i].lv;
      var hp = data[i].nowhp + '/' + data[i].maxhp;
      var cond = data[i].condition + '/100';
      var slot = [];
      var slotex, item;
      for (var j in data[i].slot) {
        var slotitemId = data[i].slot[j];
        if (slotitemId != -1) {
          item = LBContext.getInstance().slotitem[slotitemId];
          if (item)
            slot.push(LBManifest.getInstance().getSlotItem(item.slotitem_id).name);
          else
            slot.push('N/A');
        } else {
          slot.push('N/A');
        }
      }
      slotex = data[i].slotex;
      if (slotex !== 0 && slotex !== -1) {
        item = LBContext.getInstance().slotitem[slotex];
        slotex = LBManifest.getInstance().getSlotItem(item.slotitem_id).name;
      } else {
        slotex = 'N/A';
      }
      this.shipTable.row.add([
        id, name, type, lv, hp, cond, slot[0], slot[1], slot[2], slot[3], slotex
      ]);
    }
    this.shipTable.draw();
  }
};

// ----------------------------------------------
// Log Tab
// ----------------------------------------------
LBLogTab = function() {
  this.init();
};

LBLogTab.prototype = {
  init: function() {
    this.itemTable = $('#create_item_table').DataTable();
    this.shipTable = $('#construction_table').DataTable();
    this.battleTable = $('#battle_table').DataTable();
  },

  setRecord: function(records) {
    var i, record;
    var date = new Date();

    // create item table
    var createitem = records.createitem;
    this.itemTable.clear();
    for (i in createitem) {
      record = createitem[i];
      date.setTime(record.time);
      this.itemTable.row.add([
        LBUtil.StringifyDate(date),
        record.flagship || 'N/A',
        record.cost[0],
        record.cost[1],
        record.cost[2],
        record.cost[3],
        record.name,
        record.itemId
      ]);
    }
    this.itemTable.draw();

    // construction table
    var ships = records.createship;
    this.shipTable.clear();
    for (i in ships) {
      record = ships[i];
      date.setTime(record.createtime);

      this.shipTable.row.add([
        LBUtil.StringifyDate(date),
        record.flagship || 'N/A',
        record.cost[0],
        record.cost[1],
        record.cost[2],
        record.cost[3],
        record.cost[4],
        record.name,
        record.id
      ]);
    }
    this.shipTable.draw();

    // battle table
    var battles = records.battle;
    this.battleTable.clear();
    for (i in battles) {
      record = battles[i];
      date.setTime(record.time);

      this.battleTable.row.add([
        LBUtil.StringifyDate(date),
        record.location,
        record.winrank,
        record.shipname
      ]);
    }
    this.battleTable.draw();
  },

  addCreateItemRecord: function(record) {
    var date = new Date(record.time);
    this.itemTable.row.add([
      LBUtil.StringifyDate(date),
      record.flagship || 'N/A',
      record.cost[0],
      record.cost[1],
      record.cost[2],
      record.cost[3],
      record.name,
      record.itemId
    ]).draw();
  },

  addCreateShipRecord: function(record) {
    var date = new Date(record.createtime);
    this.shipTable.row.add([
      LBUtil.StringifyDate(date),
      record.flagship || 'N/A',
      record.cost[0],
      record.cost[1],
      record.cost[2],
      record.cost[3],
      record.cost[4],
      record.name,
      record.id
    ]).draw();
  },

  addBattleRecord: function(record) {
    var date = new Date(record.time);
    this.battleTable.row.add([
      LBUtil.StringifyDate(date),
      record.location,
      record.winrank,
      record.shipname
    ]).draw();
  }
};

LBLogTab.prototype.constructor = LBLogTab;

// ----------------------------------------------
// Setting Tab
// ----------------------------------------------
LBSettingTab = function() {};

LBSettingTab.prototype = {
  applySetting: function(setting) {
    if (setting === undefined) {
      setting = {};
    }

    setting.autoSwitchPort = setting.autoSwitchPort || false;
    setting.autoSwitchBattle = setting.autoSwitchBattle || false;
    setting.allowNotification = setting.allowNotification || false;

    $('#autoSwitchPort').prop('checked', setting.autoSwitchPort);
    $('#autoSwitchBattle').prop('checked', setting.autoSwitchBattle);
    $('#notificationCheckbox').prop('checked', setting.allowNotification);
  }
};

LBSettingTab.prototype.constructor = LBSettingTab;

// ----------------------------------------------
// Info Tab
// ----------------------------------------------
LBInfoTab = function() {};

LBInfoTab.prototype = {
  setVersion: function(content) {
    $('#badge_version').text(content);
  }
};

LBInfoTab.prototype.constructor = LBInfoTab;

// ----------------------------------------------
// Tabs
// ----------------------------------------------
LBTab = function() {
  this.portMsgCount = 0;
  this.battleMsgCount = 0;
  this.statMsgCount = 0;
  this.logMsgCount = 0;
  this.settingMsgCount = 0;
  this.infoMsgCount = 0;
};

LBTab.prototype = {
  // set
  setPortBadge: function(content) {
    $('#badge_port').text(content);
  },
  setBattleBadge: function(content) {
    $('#badge_battle').text(content);
  },
  setStatisticsBadge: function(content) {
    $('#badge_statistics').text(content);
  },
  setLogBadge: function(content) {
    $('#badge_log').text(content);
  },
  setSettingBadge: function(content) {
    $('#badge_setting').text(content);
  },
  setInfoBadge: function(content) {
    $('#badge_info').text(content);
  },

  // poke
  addPortBadge: function() {
    this.portMsgCount++;
    this.setPortBadge(this.portMsgCount);
  },
  addBattleTab: function() {
    this.battleMsgCount++;
    this.setBattleBadge(this.battleMsgCount);
  },
  addStatisticTab: function() {
    this.statMsgCount++;
    this.setStatisticsBadge(this.statMsgCount);
  },
  addLogTab: function() {
    this.logMsgCount++;
    this.setLogBadge(this.logMsgCount);
  },
  addSettingTab: function() {
    this.settingMsgCount++;
    this.setSettingBadge(this.settingMsgCount);
  },
  addInfoTab: function() {
    this.infoMsgCount++;
    this.setInfoBadge(this.infoMsgCount);
  },

  // clear
  clearPortBadge: function() {
    this.portMsgCount = 0;
    this.setPortBadge('');
  },
  clearBattleBadge: function() {
    this.battleMsgCount = 0;
    this.setBattleBadge('');
  },
  clearStatisticsBadge: function() {
    this.statMsgCount = 0;
    this.setStatisticsBadge('');
  },
  clearLogBadge: function() {
    this.logMsgCount = 0;
    this.setLogBadge('');
  },
  clearSettingBadge: function() {
    this.settingMsgCount = 0;
    this.setSettingBadge('');
  },
  clearInfoBadge: function() {
    this.infoMsgCount = 0;
    this.setInfoBadge('');
  },

  // get tabs
  getPortTab: function() {
    if (this.portTab === undefined) {
      this.portTab = new LBPortTab();
    }
    return this.portTab;
  },
  getFleetTab: function() {
    if (this.fleetTab === undefined) {
      this.fleetTab = new LBFleetTab();
    }
    return this.fleetTab;
  },
  getBattleTab: function() {
    if (this.battleTab === undefined) {
      this.battleTab = new LBBattleTab();
    }
    return this.battleTab;
  },
  getStatisticsTab: function() {
    if (this.statTab === undefined) {
      this.statTab = new LBStatTab();
    }
    return this.statTab;
  },
  getLogTab: function() {
    if (this.logTab === undefined) {
      this.logTab = new LBLogTab();
    }
    return this.logTab;
  },
  getSettingTab: function() {
    if (this.settingTab === undefined) {
      this.settingTab = new LBSettingTab();
    }
    return this.settingTab;
  },
  getInfoTab: function() {
    if (this.infoTab === undefined) {
      this.infoTab = new LBInfoTab();
    }
    return this.infoTab;
  }
};

LBTab.prototype.constructor = LBTab;

// ----------------------------------------------
// Main Page
// ----------------------------------------------

LogbookWeb = function() {};

LogbookWeb.prototype = {};

LogbookWeb.prototype.constructor = LogbookWeb;

LogbookWeb.getTab = function() {
  if (LogbookWeb.tab === undefined)
    LogbookWeb.tab = new LBTab();

  return LogbookWeb.tab;
};

LogbookWeb.showAgreementModal = function() {
  $('#agreementModal').modal('show');
};

LogbookWeb.hideAgreementModal = function() {
  $('#agreementModal').modal('hide');
};

LogbookWeb.showLoadingModal = function() {
  $('#mainModalTitle').text('Loading Data...');
  $('#mainModalIcon').removeClass();
  $('#mainModalIcon').addClass('glyphicon glyphicon-paste');

  $('#modalReloadPrompt').hide();
  $('#mainModal').modal('show');
};

LogbookWeb.showRefreshModal = function() {
  $('#mainModalTitle').text('MANIFEST DATA MISSING');
  $('#mainModalIcon').removeClass();
  $('#mainModalIcon').addClass('glyphicon glyphicon-exclamation-sign');

  $('#modalReloadPrompt').show();
  $('#mainModal').modal('show');
};

LogbookWeb.hideModal = function() {
  $('#mainModal').modal('hide');
};

LogbookWeb.showExchangeDumpModal = function(data) {
  $('#exchangeLabel').text('Record Dump');
  $('#exchangeInput').val(data);
  $('#exchangeMerge').hide();
  $('#exchangeClearApply').hide();
  $('#exchangeAlert').hide();
  $('#exchangeSuccess').hide();
  $('#exchangeInput').show();
  $('#exchangeModal').modal('show');
};

LogbookWeb.showExchangeLoadModal = function() {
  $('#exchangeLabel').text('Load Record');
  $('#exchangeInput').val('paste your record here...');
  $('#exchangeMerge').show();
  $('#exchangeClearApply').show();
  $('#exchangeAlert').hide();
  $('#exchangeSuccess').hide();
  $('#exchangeInput').show();
  $('#exchangeModal').modal('show');
};

// fleet
$('#port_fleet_1').on('click', function() {
  var fleet = LBContext.getInstance().getFleet(1);
  LBContext.getInstance().curFleet = 1;
  LogbookWeb.getTab().getFleetTab().setFleet(1, fleet);
});

$('#port_fleet_2').on('click', function() {
  var fleet = LBContext.getInstance().getFleet(2);
  LBContext.getInstance().curFleet = 2;
  LogbookWeb.getTab().getFleetTab().setFleet(2, fleet);
});

$('#port_fleet_3').on('click', function() {
  var fleet = LBContext.getInstance().getFleet(3);
  LBContext.getInstance().curFleet = 3;
  LogbookWeb.getTab().getFleetTab().setFleet(3, fleet);
});

$('#port_fleet_4').on('click', function() {
  var fleet = LBContext.getInstance().getFleet(4);
  LBContext.getInstance().curFleet = 4;
  LogbookWeb.getTab().getFleetTab().setFleet(4, fleet);
});

// agreements
$('#agreementDeny').on('click', function() {
  $('#content').hide();
});

$('#agreementAccept').on('click', function() {
  LBSetting.getInstance().acceptAgreement();
});

// main tabs
$('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
  var href = $(e.target).attr('href').replace('#tab_', '');
  var methodName = 'clear' + href[0].toUpperCase() + href.substr(1) + 'Badge';

  LogbookWeb.getTab()[methodName]();
});

// dropdown
$(".dropdown-menu li a").click(function() {
  var dropdownTable = {};
  dropdownTable[' Item Creation'] = '#create_item_table_container';
  dropdownTable[' Construction'] = '#construction_table_container';
  dropdownTable[' Battle'] = '#battle_table_container';

  var iconTable = {};
  iconTable[' Item Creation'] = '<i class="fa fa-wrench"></i>';
  iconTable[' Construction'] = '<i class="fa fa-ship"></i>';
  iconTable[' Battle'] = '<i class="fa fa-anchor"></i>';

  var selText = $(this).text();
  $(this).parents('.btn-group').find('.dropdown-toggle').html(iconTable[selText] + selText + ' <span class="caret"></span>');

  $('#log_table_container').show();

  if (dropdownTable[selText] !== undefined) {
    for (var i in dropdownTable) {
      if (i != selText) {
        $(dropdownTable[i]).hide();
      }
    }

    $(dropdownTable[selText]).show();
  }
});

// setting
$('#autoSwitchPort').click(function() {
  if ($(this).is(':checked')) {
    LBSetting.getInstance().settings.autoSwitchPort = true;
  } else {
    LBSetting.getInstance().settings.autoSwitchPort = false;
  }

  LBSetting.getInstance().save();
});

$('#autoSwitchBattle').click(function() {
  if ($(this).is(':checked')) {
    LBSetting.getInstance().settings.autoSwitchBattle = true;
  } else {
    LBSetting.getInstance().settings.autoSwitchBattle = false;
  }

  LBSetting.getInstance().save();
});

$('#notificationCheckbox').click(function() {
  if ($(this).is(':checked')) {
    LBSetting.getInstance().settings.allowNotification = true;
    $.notify("Notification enabled.", "success");
  } else {
    LBSetting.getInstance().settings.allowNotification = false;
    $.notify("Notification disabled.", "success");
  }

  LBSetting.getInstance().save();
});

$('#dumpBtn').on('click', function() {
  var $btn = $(this).button('loading');
  // business logic...
  var data = JSON.stringify(LBRecord.getInstance().dumpRecord());
  LogbookWeb.showExchangeDumpModal(data);

  $btn.button('reset');
});

$('#loadBtn').on('click', function() {
  var $btn = $(this).button('loading');
  // business logic...
  LogbookWeb.showExchangeLoadModal();
  $btn.button('reset');
});

$('#clearBtn').on('click', function() {
  // TODO: add confirm dialog here
  LBRecord.getInstance().clear();
});

$('#exchangeInput').click(function() {
  this.select();
});

$('#exchangeMerge').click(function() {
  var data = $('#exchangeInput').val();

  if (!LBRecord.getInstance().mergeRecord(data)) {
    $('#exchangeAlert').show();
  } else {
    $('#exchangeSuccess').show();
    $('#exchangeMerge').hide();
    $('#exchangeClearApply').hide();
    $('#exchangeInput').hide();
  }
});

$('#exchangeClearApply').click(function() {
  var data = $('#exchangeInput').val();

  if (!LBRecord.getInstance().applyRecord(data)) {
    $('#exchangeAlert').show();
  } else {
    $('#exchangeSuccess').show();
    $('#exchangeMerge').hide();
    $('#exchangeClearApply').hide();
    $('#exchangeInput').hide();
  }
});

//

jQuery(document).ready(function($) {
  $('#main_tabs').tab();
  $('[data-toggle="tooltip"]').tooltip();

  // timer
  setInterval(function() {
    LogbookWeb.getTab().getPortTab().update();
  }, 1000);

  LogbookWeb.getTab().getLogTab().init();

  LogbookWeb.getTab().getBattleTab().clearOurFleet();
});
