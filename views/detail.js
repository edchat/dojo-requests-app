define(["dojo/_base/array", "dojo/_base/lang", "dojo/has", "dojo/when", "dojo/query", "dijit/registry",
		"dojox/mobile/Button", "dojox/mobile/FormLayout", "dojox/mobile/TextArea"],
	function(array, lang, has, when, query, registry){

	var getStoreField = function(arr, type){
		var index = array.indexOf(arr, function(item){
			return (item.type == type);
		});
		if(index == -1){
			// create one
			arr.push({
				type: type
			});
			index = arr.length - 1;
		}
		return arr[index];
	};

	return {
		beforeActivate: function(previousView){
			// get the id of the displayed contact from the params
			var id = this.params.id;

			// we show/hide the back button based on whether we are on tablet or phone layout, as we have two panes
			// in tablet it makes no sense to get a back button
			this.backButton.domNode.style.display = has("phone")?"":"none";

			// are we in edit mode or not? if we are we need to slightly update the view for that
			var edit = this.params.edit;
			// change widgets readonly value based on that
			query("input", this.domNode).forEach(function(node){
				registry.byNode(node).set("readOnly", !edit);
			});
			query("textarea", this.domNode).forEach(function(node){
				registry.byNode(node).set("readOnly", !edit);
			});
			// in edit mode change the label and params of the edit button
			this.editButton.set("label", edit?this.nls.ok:this.nls.edit);
			// put a listener to save the form when we are editing if there is no
			if(!this._onHandler && edit){
				this._onHandler = this.editButton.on("click", lang.hitch(this, this._saveForm));
			}else if(this._onHandler && !edit){
				this._onHandler.remove();
				this._onHandler = null;
			}
			var editButtonOptions = this.editButton.transitionOptions;
			editButtonOptions.params.edit = !edit;
			// also update the edit & ok button to reference the currently displayed item
			editButtonOptions.params.id = id;
			var cancelButtonOptions = this.cancelButton.transitionOptions;
			if(typeof id === "undefined"){
				// if we cancel we want to go back to main view
				cancelButtonOptions.target = "list";
				if(cancelButtonOptions.params.id){
					delete cancelButtonOptions.params.id;
				}
			}else{
				cancelButtonOptions.target = "requestItemDetails";
				cancelButtonOptions.params.id = id;
			}
			// cancel button must be shown in edit mode only, same for delete button if we are not creating a new contact
			this.cancelButton.domNode.style.display = edit?"":"none";
		//	this.deleteButton.domNode.style.display = (edit&&(typeof id !== "undefined"))?"":"none";
			// if visible back button must be hidden in tablet mode (does not show up in phone anyway)
			if(edit && has("phone")){
				this.backButton.domNode.style.display = "none";
			}

			// let's fill the form with the currently selected contact
			// if nothing selected skip that part
			var view = this;
			var promise = null;
			if(typeof id !== "undefined"){
				id = id.toString();
				// get the contact on the store
				promise = this.loadedStores.requestsListStore.get(id);
			}
			when(promise, function(request){
				view.id.set("value", request ? request.id : null);
				view.requestType.set("value", request ? request.requestType : null);
				view.description.set("value", request ? request.label : null);
				view.status.set("value", request ? request.status : null);
				view.priority.set("value", request ? request.priority : null);
				view.requestedBy.set("value", request ? request.requestedBy : null);
				view.requestedFinishDate.set("value", request ? request.requestedFinishDate : null);
				view.assignedTo.set("value", request ? request.assignedTo : null);
				view.actualFinishDate.set("value", request ? request.actualFinishDate : null);
				view.estimatedUnits.set("value", request ? request.estimatedUnits : null);
				view.unitType.set("value", request ? request.unitType : null);
				view.createdDate.set("value", request ? request.createdDate : null);
				view.updatedDate.set("value", request ? request.updatedDate : null);
			});
		},
		_saveForm: function(){
			var id = this.params.id, view = this;
			// get the request on the store
			var promise = this.loadedStores.requestsListStore.get(id);
			when(promise, function(request){
				// if there is no request create one
				if(!request){
					view._createContact();
				}else{
					// otherwise update it
					view._saveContact(request);
					// save the updated item into the store
					view.loadedStores.requestsListStore.put(request);
				}
			});
		},
		_createContact: function(){
			var request = {
				"id": (Math.round(Math.random()*1000000)).toString(),
				"name": {},
				"displayName": "",
				"phoneNumbers": [],
				"emails": [],
				"organizations": []
			};
			// we created a new id update navigation
			var editButtonOptions = this.editButton.transitionOptions;
			editButtonOptions.params.id = request.id;
			this._saveContact(request);
			this.loadedStores.requestsListStore.add(request);
		},
		_saveContact: function(request){
			// set back the values on the request object
			var value, keys;
			// deal with name first
			value = this.description.value; //get("value");
			console.log("create :"+value);
			if(typeof value !== "undefined"){
				request.label = value;
			}
			value = this.requestType.get("value");
			if(typeof value !== "undefined"){
				request.requestType = value;
			}
			value = this.status.get("value");
			if(typeof value !== "undefined"){
				request.status = value;
			}
			value = this.priority.get("value");
			if(typeof value !== "undefined"){
				request.priority = value;
			}
			value = this.requestedBy.get("value");
			if(typeof value !== "undefined"){
				request.requestedBy = value;
			}
			value = this.requestedFinishDate.get("value");
			if(typeof value !== "undefined"){
				request.requestedFinishDate = value;
			}
			value = this.assignedTo.get("value");
			if(typeof value !== "undefined"){
				request.assignedTo = value;
			}
			value = this.actualFinishDate.get("value");
			if(typeof value !== "undefined"){
				request.actualFinishDate = value;
			}
			value = this.estimatedUnits.get("value");
			if(typeof value !== "undefined"){
				request.estimatedUnits = value;
			}
			value = this.unitType.get("value");
			if(typeof value !== "undefined"){
				request.unitType = value;
			}
			value = this.createdDate.get("value");
			if(typeof value !== "undefined"){
				request.createdDate = value;
			}
			value = this.updatedDate.get("value");
			if(typeof value !== "undefined"){
				request.updatedDate = value;
			}
		},
		_deleteContact: function(){
			this.loadedStores.requestsListStore.remove(this.params.id);
			// we want to be back to list
			this.app.transitionToView(this.domNode, { target: "requestList" });
		}
	}
});