// we use define and not require to workaround Dojo build system limitation that prevents from making of this file
// a layer if it using require as it should be not define
define(["dojo/_base/window", "dojox/app/main", "dojo/sniff", "dojox/json/ref", "dojo/text!requestsApp/config.json", "dojox/mobile/common",
	"dojo/text!./resources/data/request.json", "dojo/text!./resources/data/requesttype.json",
	"dojo/text!./resources/data/status.json", "dojo/text!./resources/data/priority.json",
	"dojo/text!./resources/data/unittype.json"],
	function(win, Application, has, json, config, common, requestsListData, requestsTypeData, requestsStatusData, requestsPriorityData, requestsUnitTypeData){
		win.global.requestsApp = {};

		// setup the data for the memory stores
		requestsApp.requestsListData = json.fromJson(requestsListData);
		requestsApp.requestsTypeData = json.fromJson(requestsTypeData);
		requestsApp.requestsStatusData = json.fromJson(requestsStatusData);
		requestsApp.requestsPriorityData = json.fromJson(requestsPriorityData);
		requestsApp.requestsUnitTypeData = json.fromJson(requestsUnitTypeData);

		// populate has flag on whether html5 history is correctly supported or not
		has.add("html5history", !has("ie") || has("ie") > 9);
		has.add("phone", ((window.innerWidth || document.documentElement.clientWidth) <= common.tabletSize));
		Application(json.fromJson(config));
	});