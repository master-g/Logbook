// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

const tab_log = function(json_args) {
	var args = JSON.parse(unescape(json_args));
	console[args[0]].apply(console, Array.prototype.slice.call(args, 1));
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.command === 'sendToConsole') {
		chrome.tabs.executeScript(request.tabId, {
			code: "(" + tab_log + ")('" + request.args + "');",
		});
	} else if (request.command === 'loadFromStorage') {
		var key = request.args.key;

		if (!key)
			return false;

		chrome.storage.local.get(key, function(items) {
			var item = items ? items[key] : undefined;
			if (chrome.runtime.lastError || item === undefined) {
				sendResponse({
					'key': key
				});
			} else {
				sendResponse({
					'key': key,
					data: item
				});
			}
		});

		return true;
	} else if (request.command === 'saveToStorage') {
		var key = request.args.key;
		var data = request.args.data;

		if (!key || !data) {
			return false;
		}

		var item = {};
		item[key] = data;

		chrome.storage.local.set(item, function() {
			sendResponse({
				'key': key,
				'data': data
			});
		});

		return true;
	}
});