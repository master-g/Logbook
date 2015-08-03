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
