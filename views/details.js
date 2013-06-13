define(["dojo/_base/array", "dojo/_base/lang", "dojo/dom", "dojo/dom-construct", "dojo/dom-class", "dojo/has", "dojo/when", "dojo/query", "dijit/registry", "dojo/on", "dojo/date/stamp",
	"dojox/mobile/Button", "dojox/mobile/FormLayout", "dojox/mobile/TextArea"],
	function (array, lang, dom, domConstruct, domClass, has, when, query, registry, on, stamp, Select, ObjectStore){
		var _onResults = []; // events on array
		var _dateOpener = false;
		var _openerItem = null;
		var _openerStore = null;
		var _editMode = false;

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
			init: function(){

				this.backButton.on("click", lang.hitch(this, function(){
					// I thought about using history.back here, but it does not work if you have done a copy or an edit
					this.app.transitionToView(this.domNode, {
						target: 'requestList', reverse : true
					});
					return false; // return false to stop the toolbarButton or listItem from doing a defaultClickAction
				}));

				this.editButton.on("click", lang.hitch(this, function(){
					var id=this.params.id;
					var editparm = true;
					if(_editMode){
						this._saveForm();
						editparm = false;
					}
					// are we in create mode
					var create = (typeof id === "undefined");
					if(!create){
						this.app.transitionToView(this.domNode, {
							target: "requestItemDetails",
							params: {
								edit: editparm,
								id: id
							}
						});
					}
				}));

				this.cancelButton.on("click", lang.hitch(this, function(){
					var id=this.params.id;
					var target = id?"requestItemDetails":"requestList"
					this.app.transitionToView(this.domNode, {
						target: target,
						params: {
							edit: false,
							id: id
						}
					});
				}));

				opener = this.opener;
				var onResult = on(this.requestedFinishDate, "click", lang.hitch(this, function(){
					this._setupOpener(this.requestedFinishDate, true, null);
				}));
				_onResults.push(onResult);

				var onResult = on(this.requestType, "click", lang.hitch(this, function(){
					this._setupOpener(this.requestType, false, this.loadedStores.requestTypeStore);
				}));

				var onResult = on(this.status, "click", lang.hitch(this, function(){
					this._setupOpener(this.status, false, this.loadedStores.requestStatusStore);
				}));

				var onResult = on(this.priority, "click", lang.hitch(this, function(){
					this._setupOpener(this.priority, false, this.loadedStores.requestPriorityStore);
				}));

				var onResult = on(this.unitType, "click", lang.hitch(this, function(){
					this._setupOpener(this.unitType, false, this.loadedStores.requestUnitTypeStore);
				}));

				this.checklist.on("click", lang.hitch(this, function(e){
						this.opener.hide(true);
						if(_dateOpener){
							date = this.datePicker2.get("value");
							_openerItem.set("value",date);
						}else{
							var selVal = "";
							query(".mblListItemChecked", this.checklist.domNode).forEach(function(node){
								//domClass.remove(node, "readOnlyHidden");
								selVal = lang.trim(node.innerText || node.textContent || '');
							});
							_openerItem.set("value",selVal);
							var test = _openerStore.query({description: selVal});
							if(test){
								_openerItem.valueStoreKey=test[0].key;
							}
						}
				}));

				onResult = on(this.save, "click", lang.hitch(this, function(){
					this.opener.hide(true);
					if(_dateOpener){
						date = this.datePicker2.get("value");
						_openerItem.set("value",date);
					}else{
						var selVal = "";
						query(".mblListItemChecked", this.checklist.domNode).forEach(function(node){
							selVal = lang.trim(node.innerText || node.textContent || '');
						});
						_openerItem.set("value",selVal);
					}
				}));
				_onResults.push(onResult);

				onResult = on(this.cancel, "click", lang.hitch(this, function(){
					this.opener.hide(false);
				}));
				_onResults.push(onResult);

				// initialize the global Date variable as today
				date = stamp.toISOString(new Date(), {selector: "date"});
			},

			_setupOpener: function (theItem, dateOpener, theStore){
				_openerItem = theItem;
				_openerStore = theStore;
				_dateOpener = dateOpener;
				if(!_editMode){  // only show the opener in edit mode
					return;
				}
				this.openerHeader.set("label",_openerItem.get("placeHolder"));
				if(_dateOpener){
					domClass.remove(this.datePicker2.domNode, "hidden");
					domClass.remove(this.save.domNode, "hidden");
					domClass.remove(this.cancel.domNode, "hidden");
					domClass.add(this.checklist.domNode, "hidden");
					var dateval = _openerItem.get("value") || stamp.toISOString(new Date(), {selector: "date"});
					this.datePicker2.set("value", dateval);
				}else{
					domClass.add(this.datePicker2.domNode, "hidden");
					domClass.add(this.save.domNode, "hidden");
					domClass.add(this.cancel.domNode, "hidden");
					domClass.remove(this.checklist.domNode, "hidden");
					this.checklist.setStore(_openerStore);

					var selval = _openerItem.get("value");
					array.some(this.checklist.getChildren(), function(child){
						if(child.label == selval){
							child.set("checked",true);
						}
					});
				}
				this.opener.show(_openerItem.domNode, ['below-centered','above-centered','after','before']);
			},

			beforeActivate: function (previousView){
				// get the id of the displayed contact from the params
				var id=this.params.id;

				// are we in create mode
				var create = (typeof id === "undefined");
				// are we in edit mode or not? if we are we need to slightly update the view for that
				_editMode = (this.params.edit && this.params.edit !== "false") || create;

				// change widgets readonly value based on that
				query("input", this.domNode).forEach(function(node){
					if(registry.byNode(node) && node.id !== "reqid" && !registry.byNode(node).usesOpener){
						registry.byNode(node).set("readOnly", !_editMode);
					}
				});
				this.description.set("readOnly", !_editMode);  // also set it for the description

				// in edit mode change the label and params of the edit button
				this.editButton.set("label", _editMode?this.nls.ok:this.nls.edit);

				// hide back button in edit mode
				if(_editMode){
					domClass.add(this.backButton.domNode, "hidden");
					domClass.remove(this.formLayout.domNode, "mblFormLayoutReadOnly");
				}else{
					domClass.remove(this.backButton.domNode, "hidden");
					domClass.add(this.formLayout.domNode, "mblFormLayoutReadOnly");
				}
				// cancel button must be shown in edit mode only, same for delete button if we are not creating a new contact
				this.cancelButton.domNode.style.display = _editMode?"":"none";
				this.deleteButton.domNode.style.display = (_editMode&&(typeof id !== "undefined"))?"":"none";

				// let's fill the form with the currently selected contact
				// if nothing selected skip that part
				var view=this;
				var promise=null;
				if(typeof id !== "undefined"){
					id=id.toString();
					// get the contact on the store
					promise=this.loadedStores.requestsListStore.get(id);
				}
				when(promise, function (request){
					view.reqid.set("value", request?request.id:null);
					view._initFieldValue(request, "requestType", view.loadedStores.requestTypeStore);
					view.description.set("value", request?request.label:null);
					view._initFieldValue(request, "status", view.loadedStores.requestStatusStore);
					view._initFieldValue(request, "priority", view.loadedStores.requestPriorityStore);

					view.requestedBy.set("value", request?request.requestedBy:null);
					view.requestedFinishDate.set("value", request?request.requestedFinishDate:null);
					view.assignedTo.set("value", request?request.assignedTo:null);
					view.actualFinishDate.set("value", request?request.actualFinishDate:null);
					view.estimatedUnits.set("value", request?request.estimatedUnits:null);
					view._initFieldValue(request, "unitType", view.loadedStores.requestUnitTypeStore);
					view.createdDate.set("value", request?request.createdDate:null);
					view.updatedDate.set("value", request?request.updatedDate:null);
					if(!_editMode){
						view._hideEmptyFields(view);
					}
				});
			},

			_initFieldValue: function (request, itemkey, itemstore){
				var reqTypeVal = request?request[itemkey]:null;
				if(reqTypeVal && itemstore){
					var reqTypeLabel = itemstore.get(reqTypeVal)?itemstore.get(reqTypeVal).description:reqTypeVal;
					dom.byId(itemkey).value = reqTypeLabel?reqTypeLabel:null;
				}else{
					dom.byId(itemkey).value = request?request[itemkey]:null;
				}

			},

			_saveForm: function (){
				var id=this.params.id || this.reqid.get("value");
				var view=this;
				// get the request on the store
				var promise=this.loadedStores.requestsListStore.get(id);
				when(promise, function (request){
					// if there is no request create one
					if(!request){
						request=view._createRequest();
						view.reqid.set("value", request?request.id:null);
						view.app.transitionToView(view.domNode, {
							target: "requestItemDetails",
							params: {
								id: request.id
							}
						});
					} else{
						// otherwise update it
						view._saveRequest(request);
						// save the updated item into the store
						view.loadedStores.requestsListStore.put(request);
					}
				});
			},

			_copyForm: function (){
				var id=this.params.id || this.reqid.get("value");
				var view=this;
				// get the updates
				var request = {};
				request = view._copyRequest();
				this.app.transitionToView(this.domNode, {
					target: "requestItemDetails",
					params: {
						id: request.id
					}
				});
			},
			_createRequest: function (){
				var request={
					"id": (Math.round(Math.random() * 1000000)).toString(),
					"name": {},
					"displayName": "",
					"phoneNumbers": [],
					"emails": [],
					"organizations": []
				};
				// we created a new id update navigation
				this._saveRequest(request);
				this.loadedStores.requestsListStore.add(request);
				return request;
			},
			_copyRequest: function (){
				var request = {};
				request.id = (Math.round(Math.random() * 1000000)).toString();
				// get the rest of the values from the form
				this._saveRequest(request);
				this.loadedStores.requestsListStore.add(request);
				return request;
			},
			_saveRequest: function (request){
				// set back the values on the request object
				// deal with description first
				this._setRequestValue(this.description, request, "label");
				this._setRequestValueFromDom("requestType", request, "requestType");
				this._setRequestValue(this.status, request, "status");
				this._setRequestValueFromDom("priority", request, "priority");
				this._setRequestValue(this.requestedBy, request, "requestedBy");
				this._setRequestValue(this.requestedFinishDate, request, "requestedFinishDate");
				this._setRequestValue(this.actualFinishDate, request, "actualFinishDate");
				this._setRequestValue(this.estimatedUnits, request, "estimatedUnits");
				this._setRequestValueFromDom("unitType", request, "unitType");
				this._setRequestValue(this.createdDate, request, "createdDate");
				this._setRequestValue(this.updatedDate, request, "updatedDate");
			},
			_setRequestValue: function (widget, request, reqfield){
				var value = widget.get("valueStoreKey") || widget.get("value");
				if(typeof value !== "undefined"){
					request[reqfield]=value;
				}
			},
			_setRequestValueFromDom: function (domid, request, reqfield){
				var value = dom.byId(domid).value;
				if(value !== "undefined"){
					request[reqfield]=value;
				}
			},
			_hideEmptyFields: function(view){
				query(".readOnlyHidden", view.formLayout.domNode).forEach(function(node){
					domClass.remove(node, "readOnlyHidden");
				});
				query("input", view.formLayout.domNode).forEach(function(node){
					var val = registry.byNode(node).get("value");
					if(!val && node.parentNode.parentNode && node.id !== "firstname" && node.id !== "lastname"){
						domClass.add(node.parentNode.parentNode, "readOnlyHidden");
					}
				});
			},
			_deleteRequest: function (){
			var view = this;
			when(this.loadedStores.requestsListStore.remove(this.params.id.toString()), function(){
				// we want to be back to list
				view.app.transitionToView(view.domNode, { target: 'requestList', reverse: 'true' });
			});
		}
	}
});