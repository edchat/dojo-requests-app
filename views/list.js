define(["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/query", "dojo/has", "dijit/registry", "dojox/mobile/ListItem",
	"dojox/mobile/TransitionEvent", "dojox/mobile/EdgeToEdgeStoreList", "dojox/mobile/FilteredListMixin"],
	function(declare, lang, array, query, has, registry, ListItem, TransitionEvent){
	var RequestListItem = declare(ListItem, {
	//	target: "requestItemDetails",
		clickable: true,
		// we don't get an arrow if we are on a two panes layout (tablet)
		noArrow: !has("phone"),
		postMixInProperties: function(){
			this.inherited(arguments);
		//	this.on("click", lang.hitch(this, function(e){
		//		console.log("_transition called");
		//		e.transitionOptions = this.transitionOptions;
		//		this.app.emit("requestsApp/details", e);
		//	}));
			this.transitionOptions = {
				params: {
					"id" : this.id
				}
			}
		}
	});

	return {
		RequestListItem: RequestListItem,
		setDetailsContext: function(index, e, params){
		//	if(params){
		//		params.cursor = index;
		//	}else{
		//		params = {"cursor":index};
		//	}
			console.log("in setDetailsContext");
			e.params = params;
			// transition to itemDetails view with the &cursor=index
		//	this.app.emit("requestsApp/details", e);

			//	var transOpts = {
			//	transition: "flip",
			//	title : "itemDetails",
			//	target : "listMain,itemDetails",
			//	url : "#listMain,itemDetails", // this is optional if not set it will be created from target
			//	params : params
			//};
			//this.app.transitionToView(e.target,transOpts,e);
		//	e.transitionOptions = this.transitionOptions;
		//	this.app.emit("requestsApp/details", e);

		},

		init: function(){
			var view = this;

			this.requests.on("click", lang.hitch(this, function(e){
				console.log("requests on click hit ",e);
			//	var item = this.requests.store.query({"label": e.target.innerHTML});
			//	var index = this.requests.store.index[item[0].id];
				var id = this.getSelectedItemId();
				if(id !== -1){
				//	var index = this.requests.store.index[id];
				//	console.log("index is "+index);
					e.params= {id: id};
					this.app.emit("requestsApp/details", e);
			//		this.setDetailsContext(index, e, this.params);
				}
			}));

			this.requests.on("add", lang.hitch(this, function(item){
				// select the newly added element
				if(!has("phone")){
					this.requests.deselectAll();
					this.selectItemById(item.id);
				}
			}));
		//	this.add.on("click", function(){
		//		view.requests.deselectAll();
		//	});
			this.createButton.on("click", lang.hitch(this, function(e){
				view.requests.deselectAll();
		//		this.app.transitionToView(this.domNode, {
		//			target: "requestItemDetails"
		//		});
				this.app.emit("requestsApp/details", e);
			}));

			this.searchButton.on("click", lang.hitch(this, function(e){
			//	this.app.transitionToView(this.domNode, {
			//		target: "requestListSearch"
			//	});
				this.app.emit("requestsApp/search", e);
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
			//		var transOpts= {};
			//		var ev = new TransitionEvent(this.domNode, transOpts);
			//		ev.params= {id: item.id};
			//		this.app.emit("requestsApp/details", ev);
				}
			}
		},

		getSelectedItemId: function (){
			var selNode = null;
			var selected = array.some(this.requests.getChildren(), function(child){
								if(child.get("selected")){
									selNode = child;
									return true;
								}
							});
			return selNode.id || -1;
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