define(["dojo/_base/array", "dojo/_base/lang", "dojo/dom", "dojo/dom-construct", "dojo/dom-class", "dojo/has", "dojo/when", "dojo/query",
	"dijit/registry", "dojo/on", "dojo/date/stamp", "dojo/store/Memory",
	"dojox/mobile/Button", "dojox/mobile/FormLayout", "dojox/mobile/TextArea"],
	function (array, lang, dom, domConstruct, domClass, has, when, query, registry, on, stamp, Memory){
		var _onResults = []; // events on array
		var _openerType = "";
		var _openerItem = null;
		var _openerStore = null;
		var _statusSearchStore = null;
		var _idSearchStore = null;
		var _sortDirStore = null;


		var getStoreField=function (arr, type){
			var index=array.indexOf(arr, function (item){
				return (item.type == type);
			});
			if(index == -1){
				// create one
				arr.push({
					type: type
				});
				index=arr.length - 1;
			}
			return arr[index];
		};

		return {
			searchObject : {},
			activeDateField : null,
			init: function(){

				this.backButton.on("click", lang.hitch(this, function(){
					// I thought about using history.back here, but it does not work if you have done a copy or an edit
					this.app.transitionToView(this.domNode, {
						target: 'requestList', reverse : true
					});
					return false; // return false to stop the toolbarButton or listItem from doing a defaultClickAction
				}));

				// setup _sortDirStore
				var _sortDirdata = {"identifier": "key","items":[{key: "ascending", label: "Ascending"}, {key: "descending", label: "Descending"}]};
				_sortDirStore = new Memory({data: _sortDirdata});

				// setup _statusSearchStore
				var statusdata = [{"description":"Any", "key":"any"}];
				array.forEach(this.loadedStores.requestStatusStore.data, function(child){
					statusdata.push({"description":child.description, "key":child.key});
				});
				var statusStoreData = {"identifier": "key","items": statusdata};

				_statusSearchStore = new Memory({data: statusStoreData});

				// setup _idSearchStore
				var iddata = [{"description":"Any"}];
				array.forEach(this.loadedStores.requestsListStore.data, function(child){
					iddata.push({"description":child.id, "key":child.id});
				});
				_idSearchStore = new Memory({data: iddata});

				opener = this.srchopener;
				var onResult = on(this.srchrequestedFinishFromDate, "click", lang.hitch(this, function(){
					this._setupOpener(this.srchrequestedFinishFromDate, "date", null);

				}));
				_onResults.push(onResult);

				var onResult = on(this.srchreqid, "click", lang.hitch(this, function(){
					var iddata = [{"description":"Any"}];
					array.forEach(this.loadedStores.requestsListStore.data, function(child){
						iddata.push({"description":child.id, "key":child.id});
					});
					_idSearchStore = new Memory({data: iddata});
					this._setupOpener(this.srchreqid, "search", _idSearchStore);
				}));

				var onResult = on(this.srchstatus, "click", lang.hitch(this, function(){
					this._setupOpener(this.srchstatus, "search", _statusSearchStore);
				}));

				var onResult = on(this.srchfirstSort, "click", lang.hitch(this, function(){
					this._setupOpener(this.srchfirstSort, "sort", this.app.loadedStores.searchFieldsStore);
				}));

				var onResult = on(this.srchfirstSortDir, "click", lang.hitch(this, function(){
					this._setupOpener(this.srchfirstSortDir, "sort", _sortDirStore);
				}));

				var onResult = on(this.srchsecondSort, "click", lang.hitch(this, function(){
					this._setupOpener(this.srchsecondSort, "sort", this.app.loadedStores.searchFieldsStore);
				}));

				var onResult = on(this.srchsecondSortDir, "click", lang.hitch(this, function(){
					this._setupOpener(this.srchsecondSortDir, "sort", _sortDirStore);
				}));
				var onResult = on(this.srchrequestedFinishToDate, "click", lang.hitch(this, function(){
					this._setupOpener(this.srchrequestedFinishToDate, "date", null);
				}));
				_onResults.push(onResult);

				this.srchchecklist.on("click", lang.hitch(this, function(e){
					this._handleOpenerClick();
				}));

				this.srchsortlist.on("click", lang.hitch(this, function(e){
					this._handleOpenerClick();
				}));

				onResult = on(this.save, "click", lang.hitch(this, function(){
					this._handleOpenerClick();
				}));
				_onResults.push(onResult);


				onResult = on(this.cancel, "click", lang.hitch(this, function(){
					this.srchopener.hide(false);
				}));
				_onResults.push(onResult);

				// initialize the global Date variable as today
				date = stamp.toISOString(new Date(), {selector: "date"});
			},

			_handleOpenerClick: function (){
				this.srchopener.hide(true);
				if(_openerType == "date"){
					date = this.srchdatePicker2.get("value");
					_openerItem.set("value",date);
				}else if(_openerType == "sort"){
					var selVal = "";
					query(".mblListItemChecked", this.srchsortlist.domNode).forEach(function(node){
						selVal = lang.trim(node.innerText || node.textContent || '');
					});
					var test = _openerStore.query({label: selVal});
					if(test){
						_openerItem.searchkey=test[0].key;
					}
					_openerItem.set("value",selVal);
				}else{
					var selVal = "";
					query(".mblListItemChecked", this.srchchecklist.domNode).forEach(function(node){
						selVal = lang.trim(node.innerText || node.textContent || '');
					});
					var test = _openerStore.query({description: selVal});
					if(test){
						_openerItem.searchkey=test[0].key;
					}
					_openerItem.set("value",selVal);
				}
			},

			_setupOpener: function (theItem, openerType, theStore){
				_openerItem = theItem;
				_openerStore = theStore;
				_openerType = openerType;
				this.openerHeader.set("label",_openerItem.get("placeHolder"));
				if(_openerType == "date"){
					domClass.remove(this.srchdatePicker2.domNode, "hidden");
					domClass.remove(this.save.domNode, "hidden");
					domClass.remove(this.cancel.domNode, "hidden");
					domClass.add(this.srchchecklist.domNode, "hidden");
					domClass.add(this.srchsortlist.domNode, "hidden");
					var dateval = _openerItem.get("value") || stamp.toISOString(new Date(), {selector: "date"});
					this.srchdatePicker2.set("value", dateval);
				}else if(_openerType == "sort"){
					domClass.add(this.srchdatePicker2.domNode, "hidden");
					domClass.remove(this.srchsortlist.domNode, "hidden");
					domClass.add(this.srchchecklist.domNode, "hidden");
					domClass.add(this.save.domNode, "hidden");
					domClass.add(this.cancel.domNode, "hidden");
					this.srchsortlist.setStore(_openerStore);

					var selval = _openerItem.get("value");
					array.some(this.srchchecklist.getChildren(), function(child){
						if(child.label == selval){
							child.set("checked",true);
						}
					});
				}else{
					domClass.add(this.srchdatePicker2.domNode, "hidden");
					domClass.add(this.save.domNode, "hidden");
					domClass.add(this.cancel.domNode, "hidden");
					domClass.add(this.srchsortlist.domNode, "hidden");
					domClass.remove(this.srchchecklist.domNode, "hidden");
					this.srchchecklist.setStore(_openerStore);

					var selval = _openerItem.get("value");
					array.some(this.srchchecklist.getChildren(), function(child){
						if(child.label == selval){
							child.set("checked",true);
						}
					});
				}
				this.srchopener.show(_openerItem.domNode, ['below-centered','above-centered','after','before']);
			},

			beforeActivate: function (previousView){

				// let's fill the form with the currently selected request
				var view=this;
				var searchObject = this.searchObject;

				view.srchreqid.set("value", searchObject && searchObject.id?searchObject.id:"Any");
				view.srchrequestedBy.set("value", searchObject?searchObject.requestedBy:null);
				view.srchrequestedFinishFromDate.set("value", searchObject?searchObject.requestedFinishFromDate:null);
				view.srchrequestedFinishToDate.set("value", searchObject?searchObject.requestedFinishToDate:null);
				view.srchassignedTo.set("value", searchObject?searchObject.assignedTo:null);

				view._initFieldValue(searchObject, "srchstatus", _statusSearchStore, "any", "description");
				view._initFieldValue(searchObject, "srchfirstSort", this.app.loadedStores.searchFieldsStore, "none", "label");
				view._initFieldValue(searchObject, "srchfirstSortDir", _sortDirStore, "ascending", "label");
				view._initFieldValue(searchObject, "srchsecondSort", this.app.loadedStores.searchFieldsStore, "none", "label");
				view._initFieldValue(searchObject, "srchsecondSortDir", _sortDirStore, "ascending", "label");

			},


			_initFieldValue: function (request, itemkey, itemstore, defaultValue, labelKey){
				var reqTypeVal = request && request[itemkey]?request[itemkey]:defaultValue;
				if(reqTypeVal && itemstore){
					var reqTypeLabel=itemstore.get(reqTypeVal)?itemstore.get(reqTypeVal)[labelKey]:reqTypeVal;
					this[itemkey].set("value", reqTypeLabel?reqTypeLabel:defaultValue);
				} else{
					this[itemkey].set("value", reqTypeVal);
				}

			},

			_saveForm: function (){
				var view=this;
				// get the request on the store
				// otherwise update it
				view._saveSearchObject(this.searchObject);
				view._doSearch(this.searchObject);
			},
			_saveSearchObject: function(searchObject){
				// set back the values on the searchObject object
				this._setSearchObjectValue(this.srchreqid, searchObject, "id", "Any");
				this._setSearchObjectValue(this.srchstatus, searchObject, "srchstatus", "Any");
				this._setSearchObjectValue(this.srchrequestedBy, searchObject, "srchrequestedBy");
				this._setSearchObjectValue(this.srchrequestedFinishFromDate, searchObject, "requestedFinishFromDate");
				this._setSearchObjectValue(this.srchrequestedFinishToDate, searchObject, "requestedFinishToDate");
				this._setSearchObjectValue(this.srchassignedTo, searchObject, "srchassignedTo");

				this._setSearchObjectValue(this.srchfirstSort, searchObject, "srchfirstSort");
				this._setSearchObjectValue(this.srchsecondSort, searchObject, "srchsecondSort");
				this._setSearchObjectValue(this.srchfirstSortDir, searchObject, "srchfirstSortDir");
				this._setSearchObjectValue(this.srchsecondSortDir, searchObject, "srchsecondSortDir");
			},
			_setSearchObjectValue: function (widget, searchObject, reqfield, ignoreVal){
				var searchkey = widget.get("searchkey");
				var value = widget.get("searchkey") || widget.get("value");
				if(ignoreVal && value == ignoreVal){
					value=undefined;
				}
				if(typeof value !== "undefined"){
					searchObject[reqfield]=value;
				}else{
					searchObject[reqfield]="";
				}
			},
			_setSearchObjectValueFromDom: function (domid, searchObject, reqfield, ignoreVal){
				var value = dom.byId(domid).value;
				if(value == ignoreVal){
					value=undefined;
				}

				if(value !== "undefined"){
					searchObject[reqfield]=value;
				}
			},
			_doSearch: function (searchObject){
				if(searchObject && searchObject.id && searchObject.id !== "any"){ // an id was set, so that is the only search param that matters
					this.app.transitionToView(this.domNode, {
						target: "requestItemDetails",
						params: {
							id: searchObject.id
						}
					});
					var list = this.app.children.requestsApp_requestList;
					list.selectItemById(searchObject.id);
				}else{
					// setup the query
					var queryObj = {};
					if(!searchObject){
						return;
					}
					if(searchObject.srchstatus && searchObject.srchstatus !== "any"){ // a srchstatus was set use it
						queryObj.status = searchObject.srchstatus;
					}
					if(searchObject.srchrequestedBy){ // a srchstatus was set use it
						queryObj.requestedBy = new RegExp(searchObject.srchrequestedBy+"*");
					}
					if(searchObject.srchassignedTo){ // a srchstatus was set use it
						queryObj.assignedTo = new RegExp(searchObject.srchassignedTo+"*");
					}

					var sortObj = [];
					var sortObj1 = {};
					if(searchObject.srchfirstSort && searchObject.srchfirstSort !== "none"){
						sortObj1.attribute = searchObject.srchfirstSort;
						if(searchObject.srchfirstSortDir && searchObject.srchfirstSortDir == "descending"){
							sortObj1.descending = true;
						}
						sortObj.push(sortObj1);
					}
					var sortObj2 = {};
					if(searchObject.srchsecondSort && searchObject.srchsecondSort !== "none"){ // a srchsecondSort was set use it
						sortObj2.attribute = searchObject.srchsecondSort;
						if(searchObject.srchsecondSortDir && searchObject.srchsecondSortDir == "descending"){
							sortObj2.descending = true;
						}
						sortObj.push(sortObj2);
					}
					var list = registry.byId("requestsList");
					list.setQuery(queryObj, {sort:sortObj});

					// transition
					this.app.transitionToView(this.domNode, {
						target: "requestList"
					});
				}
			}
		}
	});