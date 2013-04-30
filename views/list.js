define(["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/has", "dijit/registry", "dojox/mobile/ListItem",
	"dojox/mobile/EdgeToEdgeStoreList", "dojox/mobile/FilteredListMixin"],
	function(declare, lang, array, has, registry, ListItem){
	var RequestListItem = declare(ListItem, {
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
		RequestListItem: RequestListItem,
		init: function(){
			var view = this;
			this.requests.on("add", lang.hitch(this, function(item){
				// select the newly added element
				this.selectItemById(item.id);
			}));
		//	this.add.on("click", function(){
		//		view.requests.deselectAll();
		//	});
			this.createButton.on("click", lang.hitch(this, function(){
				view.requests.deselectAll();
				this.app.transitionToView(this.domNode, {
					target: "requestItemDetails"
				});
			}));

			this.searchButton.on("click", lang.hitch(this, function(){
				this.app.transitionToView(this.domNode, {
					target: "requestListSearch"
				});
			}));

			if(this.params && this.params.id){
				this.selectItemById(this.params.id);
			}
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
		},

		selectItemById: function (itemId){
			var requests = registry.byId("requestsList");
			array.some(requests.getChildren(), function(child){
				if(child.id == itemId){
					requests.selectItem(child);
					return true;
				}
				return false;
			});
		}

	};
});