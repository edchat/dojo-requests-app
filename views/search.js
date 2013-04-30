define(["dojo/_base/array", "dojo/_base/lang", "dojo/dom", "dojo/dom-construct", "dojo/has", "dojo/when", "dojo/query", "dijit/registry", "dojo/on", "dojo/date/stamp",
	"dojox/mobile/Button", "dojox/mobile/FormLayout", "dojox/mobile/TextArea"],
	function (array, lang, dom, domConstruct, has, when, query, registry, on, stamp, Select, ObjectStore){
		var _onResults = []; // events on array


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
				this._initSelectOptions();
			//	this.searchButton.set("label",this.nls.submitSearch);

				// setup initial searchObject
				opener = this.srchopener;
				var onResult = on(this.srchrequestedFinishFromDate, "click", lang.hitch(this, function(){
					if(this.srchrequestedFinishFromDate.get("value")){
						this.srchdatePicker2.set("value", this.srchrequestedFinishFromDate.get("value"));
					}
					this.activeDateField = this.srchrequestedFinishFromDate;
					this.srchopener.show(this.srchrequestedFinishFromDate.domNode, ['below-centered','above-centered','after','before']);
				}));
				_onResults.push(onResult);

				var onResult = on(this.srchrequestedFinishToDate, "click", lang.hitch(this, function(){
					if(this.srchrequestedFinishToDate.get("value")){
						this.srchdatePicker2.set("value", this.srchrequestedFinishToDate.get("value"));
					}
					this.activeDateField = this.srchrequestedFinishToDate;
					this.srchopener.show(this.srchrequestedFinishToDate.domNode, ['below-centered','above-centered','after','before']);
				}));
				_onResults.push(onResult);

				onResult = on(this.save, "click", lang.hitch(this, function(){
					this.srchopener.hide(true);
					date = this.srchdatePicker2.get("value");
					this.activeDateField.set("value",date);
				}));
				_onResults.push(onResult);

				onResult = on(this.cancel, "click", lang.hitch(this, function(){
					this.srchopener.hide(false);
				}));
				_onResults.push(onResult);

				// initialize the global Date variable as today
				date = stamp.toISOString(new Date(), {selector: "date"});
			},

			beforeActivate: function (previousView){
				//setup id select here because it may need to be updated with new/removed ids
				var sel = dom.byId("srchreqid");
				domConstruct.empty(sel);
				domConstruct.create("option", {
				            value: "any", label: "Any"
				        }, sel);
				array.forEach(this.loadedStores.requestsListStore.data, function(child){
					domConstruct.create("option", {
					            value: child.id, label: child.id
					        }, sel);
				});

				// we show/hide the back button based on whether we are on tablet or phone layout, as we have two panes
				// in tablet it makes no sense to get a back button
				this.backButton.domNode.style.display=has("phone")?"":"none";

				// let's fill the form with the currently selected contact
				// if nothing selected skip that part
				var view=this;
				var searchObject = this.searchObject;

			//	view.srchreqid.set("value", searchObject?searchObject.id:null);
		//		dom.byId("srchreqid").value = searchObject?searchObject.id:null;
		//		dom.byId("srchstatus").value = searchObject?searchObject.status:null;
				view.srchrequestedBy.set("value", searchObject?searchObject.requestedBy:null);
				view.srchrequestedFinishFromDate.set("value", searchObject?searchObject.requestedFinishFromDate:null);
				view.srchrequestedFinishToDate.set("value", searchObject?searchObject.requestedFinishToDate:null);
				view.srchassignedTo.set("value", searchObject?searchObject.assignedTo:null);
			},
			_initSelectOptions: function (){
				//setup status select here:
				domConstruct.create("option", {
				            value: "any", label: "Any", selected: "any"
				        }, dom.byId("srchstatus"));
				array.forEach(this.loadedStores.requestStatusStore.data, function(child){
					domConstruct.create("option", {
					            value: child.id, label: child.description
					        }, dom.byId("srchstatus"));
				});
				//setup sorts here:
				this._setupSearch("srchfirstSort", "srchfirstSortDir");
				this._setupSearch("srchsecondSort", "srchsecondSortDir");
			},

			_setupSearch: function (srchdomid, dirdomid){
				domConstruct.create("option", {
				            value: "none", label: "None", selected: "none"
				        }, dom.byId(srchdomid));
				array.forEach(this.app.searchFieldsData.items, function(child){
					domConstruct.create("option", {
					            value: child.id, label: child.label
					        }, dom.byId(srchdomid));
				});
				//setup unitType select here:
				domConstruct.create("option", {
					value: "ascending", label: "Ascending"
				}, dom.byId(dirdomid));
				domConstruct.create("option", {
					value: "descending", label: "Descending"
				}, dom.byId(dirdomid));
			},
			_saveForm: function (){
			//	var id=this.params.id || this.reqid.get("value");
				var view=this;
				// get the request on the store
				// otherwise update it
				view._saveSearchObject(this.searchObject);
				view._doSearch(this.searchObject);
			},
			_saveSearchObject: function(searchObject){
				// set back the values on the searchObject object
				this._setSearchObjectValueFromDom("srchreqid", searchObject, "id");
				this._setSearchObjectValueFromDom("srchstatus", searchObject, "srchstatus");
				this._setSearchObjectValue(this.srchrequestedBy, searchObject, "srchrequestedBy");
				this._setSearchObjectValue(this.srchrequestedFinishFromDate, searchObject, "requestedFinishFromDate");
				this._setSearchObjectValue(this.srchrequestedFinishToDate, searchObject, "requestedFinishToDate");
				this._setSearchObjectValue(this.srchassignedTo, searchObject, "srchassignedTo");

				this._setSearchObjectValueFromDom("srchfirstSort", searchObject, "srchfirstSort");
				this._setSearchObjectValueFromDom("srchsecondSort", searchObject, "srchsecondSort");
				this._setSearchObjectValueFromDom("srchfirstSortDir", searchObject, "srchfirstSortDir");
				this._setSearchObjectValueFromDom("srchsecondSortDir", searchObject, "srchsecondSortDir");
			},
			_setSearchObjectValue: function (widget, searchObject, reqfield){
				var value = widget.get("value");
				if(typeof value !== "undefined"){
					searchObject[reqfield]=value;
				}
			},
			_setSearchObjectValueFromDom: function (domid, searchObject, reqfield){
				var value = dom.byId(domid).value;
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
				//	array.some(list.getChildren(), function(child){
				//		if(child.id == searchObject.id){
				//			list.selectItem(child);
				//		}
				//		return false;
				//	});
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

					var sortObj = {};
					if(searchObject.srchfirstSort && searchObject.srchfirstSort !== "none"){
						sortObj.attribute = searchObject.srchfirstSort;
						if(searchObject.srchfirstSortDir && searchObject.srchfirstSortDir !== "ascending"){
							sortObj.descending = true;
						}
					}
					var sortObj2 = {};
					if(searchObject.srchsecondSort && searchObject.srchsecondSort !== "none"){ // a srchsecondSort was set use it
						sortObj2.attribute = searchObject.srchsecondSort;
						if(searchObject.srchsecondSortDir && searchObject.srchsecondSortDir !== "ascending"){
							sortObj2.descending = true;
						}
					}


				//	var data = this.loadedStores.requestsListStore.query(queryObj, {sort:[sortObj, sortObj2]});
				//	console.log("TEMP test data = ",data);
					var list = registry.byId("requestsList");

					list.setQuery(queryObj, {sort:[sortObj, sortObj2]});

					// in tablet we want one to be selected on search
					if(!has("phone")){
						var item = list.getChildren()[0];
						list.selectItem(item);
						// transition
						this.app.transitionToView(this.domNode, {
							target: "requestItemDetails",
							params: {
								id: item.id
							}
						});

					}else{
						// transition
						this.app.transitionToView(this.domNode, {
							target: "requestList"
						});
					}
				}
			}
		}
	});