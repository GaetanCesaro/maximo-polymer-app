/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */

/*
A search bar component.
 */
Polymer({
	is: 'maximo-searchbar',
  	behaviors: [BaseComponent],
	properties : {
		/**
		 * collection to be automatically have it's filter values set when the value changes.  If this is not set,
		 * then a 'maximo-searchbar-filter-changed' event will be fired with the id of this control and the value
		 * as a parameter
		 */
		collection: {
			type: Object,
			value : null
		},		
		value : {
			type: String,
			notify:true
		},
		placeholder : {
			type: String,
			value: '',
			notify: true
		}
	},
  	created : function(){  		
  	},
  	attached: function(){  		
  		//if(!this.collection.baseURI){
  		//	$j(this.$.outerdiv).remove();
  		//}
  		if(this.placeholder === ''){
  			this.placeholder = this.localize('uitext', 'mxapibase', 'Search');
  		}
  	},
  	dofocus : function () {
  		$j(this.$.outerdiv).toggleClass('outerDivFocus', true);  		
  	},
  	doblur : function () {
		$j(this.$.outerdiv).toggleClass('outerDivFocus', false );
  	},
  	song2: function(blur){
  		$j(this).parent().toggleClass('song2',blur);
  	},
  	doFilter : function (forceRefresh) {
  		if(!(forceRefresh===true) && this.filterValue === this.$.inputval.value){
  			return;
  		}
		window.clearTimeout(this.filterTimer);
		var searchBar = this;
		searchBar.song2(true);
		this.filterTimer = setTimeout(function(){
	  		if (searchBar.collection) {
	  			if(!Array.isArray(searchBar.collection)){
					searchBar.collection = [searchBar.collection];
					
				}
	  			searchBar.collection.forEach(function(collection){
	  				collection.useSearchTerms=true;
	  				collection.searchTermValue = searchBar.$.inputval.value;
	  				collection.refreshRecords().then(function(){
		  				searchBar.async(function(){
		  					searchBar.song2(false);	
		  				}, 100);
		  			});	
	  			});
	  		}
	  		else {
	  			searchBar.song2(false);
	  			var param = { id: searchBar.id, value: searchBar.$.inputval.value};
	  			searchBar.fire('maximo-searchbar-filter-changed', param);
	  		}
	  		searchBar.filterValue = searchBar.$.inputval.value;
	  		$M.hideKeyboard(searchBar.$.inputval);
		}, 250);
  	},
  	changeValue : function(){
  		$j(this.$.searchicon).toggleClass('ready',($j(this.$.inputval).val()!==''));
  		this.changed = true;
  	},
  	cleared : function(){
  		var my = this;
  		this.async($j.proxy(my.changeValue, my), 200);
  	},
  	clear: function(forceRefresh){
  		$j(this.$.inputval).val('');
  		this.doFilter(true);
  	}
});
