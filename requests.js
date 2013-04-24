// we use define and not require to workaround Dojo build system limitation that prevents from making of this file
// a layer if it using require as it should be not define
define(["dojo/_base/window", "dojox/app/main", "dojo/sniff", "dojox/json/ref", "dojo/text!requestsApp/config.json", "dojo/text!./resources/data/request.json", "dojox/mobile/common"],
	function(win, Application, has, json, config, requestsListData, common){
		win.global.requestsApp = {};
		requestsApp.requestsListData = json.fromJson(requestsListData);

		// populate has flag on whether html5 history is correctly supported or not
		has.add("html5history", !has("ie") || has("ie") > 9);
		has.add("phone", ((window.innerWidth || document.documentElement.clientWidth) <= common.tabletSize));
		Application(json.fromJson(config));
	});