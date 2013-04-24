define(["dojo/_base/lang", "dojo/dom", "dojo/on"],
function(lang, dom, on){

	var listStore = null;	//list data
	var currentItem = {};
	var _onResults = []; // events on array

	return {
		// show an item detail
		setDetailsContext: function(index){
			// only set the cursor if it is different and valid
			if(parseInt(index) < listStore.data.length){
				currentItem = listStore.data[index];
				this.id.set("value",currentItem.id);
				this.requestType.set("value",currentItem.requestType);
			//	this.description.set("value",currentItem.description);
				this.label.set("value",currentItem.label);
				this.status.set("value",currentItem.status);
				this.priority.set("value",currentItem.priority);
				this.requestedBy.set("value",currentItem.requestedBy);

			//	this.First.set("value",currentItem.First);
			//	this.Last.set("value",currentItem.Last);
			//	this.Email.set("value",currentItem.Email);
			//	this.Tel.set("value",currentItem.Tel);
			}
		},

		// list view init
		init: function(){
			listStore = this.loadedStores.requestListStore;

			onResult = this.save.on("click", lang.hitch(this, function(e){
				console.log("List on click hit ",e);
			/*	currentItem.label = this.First.get("value") + " " + this.Last.get("value");
				currentItem.First = this.First.get("value");
				currentItem.Last = this.Last.get("value");
				currentItem.Email = this.Email.get("value");
				currentItem.Tel = this.Tel.get("value");
			*/
			//	currentItem.description = this.description.get("value");
				currentItem.label = this.label.get("value");
				currentItem.requestType = this.requestType.get("value");
				currentItem.status = this.status.get("value");
				currentItem.priority = this.priority.get("value");
				currentItem.requestedBy = this.requestedBy.get("value");

				listStore.put(currentItem);
			}));
			_onResults.push(onResult);

		},

		beforeActivate: function(){
			// summary:
			//		view life cycle beforeActivate()
			//
			// if this.params["cursor"] is set use it to set the selected Details Context
			if(this.params["cursor"] || this.params["cursor"] == 0){
				this.setDetailsContext(this.params["cursor"]);
			}
		},

		beforeDeactivate: function(){
			// summary:
			//		view life cycle beforeDeactivate()
			//
			// put any updates back to the store
		/*	currentItem.label = this.First.get("value") + " " + this.Last.get("value");
			currentItem.First = this.First.get("value");
			currentItem.Last = this.Last.get("value");
			currentItem.Email = this.Email.get("value");
			currentItem.Tel = this.Tel.get("value");
			listStore.put(currentItem);
		*/
		}
	}
});
