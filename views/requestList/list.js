define(["dojo/_base/declare", "dojo/_base/array", "dojo/has", "dojox/mobile/ListItem",
	"dojox/mobile/EdgeToEdgeStoreList", "dojox/mobile/FilteredListMixin"],
	function(declare, array, has, ListItem){
	var ContactListItem = declare(ListItem, {
		target: "requestItemDetails",
		clickable: true,
		// we don't get an arrow if we are on a two panes layout (tablet)
		noArrow: !has("phone"),
		postMixInProperties: function(){
			this.inherited(arguments);
			this.transitionOptions = {
				params: {
					"id" : this.id
				}
			}
		}
	});

	return {
		ContactListItem: ContactListItem,
		init: function(){
			var view = this;
			this.requests.on("add", function(item){
				// select the newly added element
				array.some(view.requests.getChildren(), function(child){
					if(child.id == item.id){
						view.requests.selectItem(child);
					}
					return false;
				});
			});
			this.add.on("click", function(){
				view.requests.deselectAll();
			});
		},
		beforeActivate: function(){
			// in tablet we want one to be selected at init
			if(!has("phone")){
				// check if something is selected
				var selected = array.some(this.requests.getChildren(), function(child){
					return child.get("selected");
				});
				if(!selected){
					var item = this.requests.getChildren()[0];
					this.requests.selectItem(item);
					// transition
					this.app.transitionToView(this.domNode, {
						target: "requestItemDetails",
						params: {
							id: item.id
						}
					});
				}
			}
		}
	};
});