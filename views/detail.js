define(["dojo/_base/array", "dojo/_base/lang", "dojo/has", "dojo/when", "dojo/query", "dijit/registry",
	"dojox/mobile/Button", "dojox/mobile/FormLayout", "dojox/mobile/TextArea"],
	function (array, lang, has, when, query, registry){

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
			beforeActivate: function (previousView){
				// get the id of the displayed contact from the params
				var id=this.params.id;

				// we show/hide the back button based on whether we are on tablet or phone layout, as we have two panes
				// in tablet it makes no sense to get a back button
				this.backButton.domNode.style.display=has("phone")?"":"none";

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
					view.requestType.set("value", request?request.requestType:null);
					view.description.set("value", request?request.label:null);
					view.status.set("value", request?request.status:null);
					view.priority.set("value", request?request.priority:null);
					view.requestedBy.set("value", request?request.requestedBy:null);
					view.requestedFinishDate.set("value", request?request.requestedFinishDate:null);
					view.assignedTo.set("value", request?request.assignedTo:null);
					view.actualFinishDate.set("value", request?request.actualFinishDate:null);
					view.estimatedUnits.set("value", request?request.estimatedUnits:null);
					view.unitType.set("value", request?request.unitType:null);
					view.createdDate.set("value", request?request.createdDate:null);
					view.updatedDate.set("value", request?request.updatedDate:null);
				});
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
			_saveRequest: function (request){
				// set back the values on the request object
				// deal with description first
				this._setRequestValue(this.description, request, "label");
				this._setRequestValue(this.requestType, request, "requestType");
				this._setRequestValue(this.status, request, "status");
				this._setRequestValue(this.priority, request, "priority");
				this._setRequestValue(this.requestedBy, request, "requestedBy");
				this._setRequestValue(this.requestedFinishDate, request, "requestedFinishDate");
				this._setRequestValue(this.actualFinishDate, request, "actualFinishDate");
				this._setRequestValue(this.estimatedUnits, request, "estimatedUnits");
				this._setRequestValue(this.unitType, request, "unitType");
				this._setRequestValue(this.createdDate, request, "createdDate");
				this._setRequestValue(this.updatedDate, request, "updatedDate");
			},
			_setRequestValue: function (widget, request, reqfield){
				value=widget.get("value");
				if(typeof value !== "undefined"){
					request[reqfield]=value;
				}
			},

			_deleteRequest: function (){
				var reqid=this.params.id || this.reqid.get("value");
				this.loadedStores.requestsListStore.remove(reqid);
				// we want to be back to list
				this.app.transitionToView(this.domNode, { target: "requestList" });
			}
		}
	});