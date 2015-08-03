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
 *  chrome_interface.js
 *  KCLogbook
 *
 *  Deal with Chrome the Dark Master
 *
 *  Created by Master.G on 2015/8/3.
 *  Copyright (c) 2015 Master.G. All rights reserved.
 */

function Console() {}

Console.Type = {
  LOG: "log",
  DEBUG: "debug",
  INFO: "info",
  WARN: "warn",
  ERROR: "error",
  GROUP: "group",
  GROUP_COLLAPSED: "groupCollapsed",
  GROUP_END: "groupEnd"
};

Console.addMessage = function(type, format, args) {
  chrome.runtime.sendMessage({
    command: "sendToConsole",
    tabId: chrome.devtools.tabId,
    args: escape(JSON.stringify(Array.prototype.slice.call(arguments, 0)))
  });
};
(function() {
  var console_types = Object.getOwnPropertyNames(Console.Type);
  for (var type = 0; type < console_types.length; ++type) {
    var method_name = Console.Type[console_types[type]];
    Console[method_name] = Console.addMessage.bind(Console, method_name);
  }
})();

// ----------------------------------------------
// Chrome local storage
// ----------------------------------------------
LocalStorage = {};

LocalStorage.CMD_SAVE = "saveToStorage";
LocalStorage.CMD_LOAD = "loadFromStorage";

LocalStorage.save = function(key, data, callback) {
  if (data === undefined) {
    callback(false);
    return;
  }

  var msg = {};
  msg.command = LocalStorage.CMD_SAVE;
  msg.args = {};
  msg.args.key = key;
  msg.args.data = escape(JSON.stringify(data));

  chrome.runtime.sendMessage(msg,
    function(response) {
      callback(true);
    });
};

LocalStorage.load = function(key, callback) {
  var msg = {};
  msg.command = LocalStorage.CMD_LOAD;
  msg.args = {};
  msg.args.key = key;

  chrome.runtime.sendMessage(msg,
    function(response) {
      if (response.data) {
        try {
          var data = JSON.parse(unescape(response.data));
          callback(true, data);
        } catch (e) {}
      } else {
        callback(false, undefined);
      }
    });
};

// ----------------------------------------------
// Chrome network listener
// ----------------------------------------------

chrome.devtools.network.getHAR(function(result) {

  var entries = result.entries;
  if (!entries.length) {
    Console.warn("KanColle Logbook suggests you reload the page to track" +
      " game messages for all the requests");
  }

  LogbookWeb.getTab().getInfoTab().setVersion(chrome.runtime.getManifest().version);

  LBSetting.getInstance().load();

  chrome.devtools.network.onRequestFinished.addListener(LogbookDispatch);

  Console.info("KanColle Logbook at your service!");
});
