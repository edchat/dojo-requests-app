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

				this._initSelectOptions();

				this.backButton.on("click", lang.hitch(this, function(){
					this.app.transitionToView(this.domNode, {
						target: 'requestList', reverse: 'true'
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

				onResult = on(this.save, "click", lang.hitch(this, function(){
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
					}
				}));
				_onResults.push(onResult);

				onResult = on(this.cancel, "click", lang.hitch(this, function(){
					this.opener.hide(false);
				}));
				_onResults.push(onResult);

			//	query('input,textarea,select', theFormNode).on('change', function(e) { .. handle event here .. see e.currentTarget or e.target })

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
				if(_dateOpener){
					domClass.remove(this.datePicker2.domNode, "hidden");
					domClass.add(this.checklist.domNode, "hidden");
					this.openerHeader.set("label","Date Picker");
					this.datePicker2.set("value", _openerItem.get("value"));
				}else{
					domClass.add(this.datePicker2.domNode, "hidden");
					domClass.remove(this.checklist.domNode, "hidden");
					this.openerHeader.set("label","Select");
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

				// we show/hide the back button based on whether we are on tablet or phone layout, as we have two panes
				// in tablet it makes no sense to get a back button
				this.backButton.domNode.style.display=has("phone")?"":"none";
				// are we in edit mode or not? if we are we need to slightly update the view for that
				_editMode = this.params.edit;
				// are we in create mode
				var create = (typeof id === "undefined");
				// change widgets readonly value based on that
				query("input", this.domNode).forEach(function(node){
					registry.byNode(node).set("readOnly", !_editMode);
				});
				// in edit mode change the label and params of the edit button
				this.editButton.set("label", _editMode?this.nls.ok:this.nls.edit);
				// put a listener to save the form when we are editing if there is no
				if(!this._onHandler && _editMode){
					this._onHandler = this.editButton.on("click", lang.hitch(this, this._saveForm));
				}else if(this._onHandler && !_editMode){
					this._onHandler.remove();
					this._onHandler = null;
				}
				var editButtonOptions = this.editButton.transitionOptions;
				editButtonOptions.params.edit = !_editMode;
				// also update the edit & ok button to reference the currently displayed item
				editButtonOptions.params.id = id;
				var cancelButtonOptions = this.cancelButton.transitionOptions;
				if(create){
					// if we cancel we want to go back to main view
					cancelButtonOptions.target = "requestList";
					if(cancelButtonOptions.params.id){
						delete cancelButtonOptions.params.id;
					}
				}else{
					cancelButtonOptions.target = "requestItemDetails";
					cancelButtonOptions.params.id = id;
				}
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

			_initSelectOptions: function (){
				//setup requestType select here:
			//	array.forEach(this.loadedStores.requestTypeStore.data, function(child){
			//		domConstruct.create("option", {
			//		            value: child.id, label: child.description
			//		        }, dom.byId("requestType"));
			//	});
				//setup status select here:
			//	array.forEach(this.loadedStores.requestStatusStore.data, function(child){
			//		domConstruct.create("option", {
			//		            value: child.id, label: child.description
			//		        }, dom.byId("status"));
			//	});
				//setup priority select here:
			//	array.forEach(this.loadedStores.requestPriorityStore.data, function(child){
			//		domConstruct.create("option", {
			//		            value: child.id, label: child.description
			//		        }, dom.byId("priority"));
			//	});
				//setup unitType select here:
			//	array.forEach(this.loadedStores.requestUnitTypeStore.data, function(child){
			//		domConstruct.create("option", {
			//		            value: child.id, label: child.description
			//		        }, dom.byId("unitType"));
			//	});
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
			//	this.loadedStores.requestsListStore.add(request);
				this.app.transitionToView(this.domNode, {
					target: "requestItemDetails",
					params: {
						id: request.id
					}
				});
			//	var list = this.app.children.requestsApp_requestList;
			//	list.selectItemById(request.id);
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
				this._setRequestValueFromDom("status", request, "status");
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
				var value = widget.get("value");
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