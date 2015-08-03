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
 *  lbsetting.js
 *  KCLogbook
 *
 *  Configuration
 *
 *  Created by Master.G on 2015/8/3.
 *  Copyright (c) 2015 Master.G. All rights reserved.
 */

var LB_KEY_PLAYER_SETTING = "lb_player_setting";

LBSetting = function() {
  this.settings = {};
  this.settings.accept = false;
  this.settings.autoSwitchPort = false;
  this.settings.autoSwitchBattle = false;
  this.settings.allowNotification = false;
};

LBSetting.prototype = {
  save: function(callback) {
    var data = this.settings;

    LocalStorage.save(LB_KEY_PLAYER_SETTING, data, function(result) {
      if (callback) {
        callback(result);
      }

      Console.info("Logbook | LBSetting data saved.");
    });
  },

  load: function(callback) {
    LocalStorage.load(LB_KEY_PLAYER_SETTING, function(result, data) {
      if (result) {
        LBSetting.getInstance().settings = data;
        LogbookWeb.getTab().getSettingTab().applySetting(data);
        Console.info("Logbook | LBSetting data loaded.");
        if (LBSetting.getInstance().settings.accept) {
          LBSetting.getInstance().run();
        }
      } else {
        LogbookWeb.showAgreementModal();
        Console.info("Logbook | LBSetting data missing.");
      }

      if (callback) {
        callback(result);
      }
    });
  },

  acceptAgreement: function() {
    this.settings.accept = true;
    this.save();
    this.run();
  },

  run: function() {
    LogbookWeb.showLoadingModal();
    LBManifest.getInstance().load(function(manifestResult) {
      if (manifestResult) {
        LogbookWeb.hideModal();
        LBRecord.getInstance().load();
        LBContext.getInstance().load();
      } else {
        LogbookWeb.showRefreshModal();
      }
    });
  }
};

LBSetting.prototype.constructor = LBSetting;

LBSetting.getInstance = function() {
  if (LBSetting.instance === undefined) {
    LBSetting.instance = new LBSetting();
  }

  return LBSetting.instance;
};
