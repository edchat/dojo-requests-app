define(["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/has", "dijit/registry", "dojox/mobile/ListItem",
	"dojox/mobile/EdgeToEdgeStoreList", "dojox/mobile/FilteredListMixin"],
	function(declare, lang, array, has, registry, ListItem){
	var RequestListItem = declare(ListItem, {
		target: "requestItemDetails",
		clickable: true,
		noArrow: false,
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