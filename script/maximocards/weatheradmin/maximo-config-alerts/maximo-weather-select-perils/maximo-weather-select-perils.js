/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-weather-select-perils',
  	behaviors: [BaseComponent],
  	listeners: {
		'maximo-searchbar-filter-changed':'_filterAvailableProducts',
		'productsSelectedChanged' : '_productSelectedChanged',
  		'removeProducts' : '_removeProducts',
		'pickedProductsChanged' : '_pickedProductsChanged'
  	},
    properties: {
    	availableList : {
    		type: Array,
    		value: [],
    		notify: true
    	},
    	recordData : {
    		type: Array,
    		value: [],
    		notify: true
    	}
	},
	moveSelected: function(e){
		var selectedRecord = this.$.availProductDatalist._selectedRecords;
		for(var i = 0; i < selectedRecord.length; i++){
			delete selectedRecord[i]["href"];
			delete selectedRecord[i]["_rowstamp"];
			delete selectedRecord[i]["localref"];
			delete selectedRecord[i]["_id"];
			selectedRecord[i]['_action'] = "Add";
		}
		this.$.selectedProducts.createRecordBulk(selectedRecord);
	},
	removeSelected: function(e){
		var selectedRecord = this.$.chosenProductlist._selectedRecords;
		for(var i = 0; i < selectedRecord.length; i++){
			delete selectedRecord[i]["_rowstamp"];
			delete selectedRecord[i]["localref"];
			delete selectedRecord[i]["_id"];
			selectedRecord[i]['_action'] = "Delete";
		}
		this.$.selectedProducts.createRecordBulk(selectedRecord);
		
	},
	_handleBulkSuccess: function(e){
		this.$.availableProducts.refreshRecords();
		this.$.selectedProducts.refreshRecords();
		this.$.availsearch.clear();
		this.$.chosensearch.clear();
	},
	_productSelectedChanged: function(){
		if(this.$.availProductDatalist._selectedRecords.length === 0){
			$j(this.$.addButton).attr({'disabled':'true'});
		}
		else {
			$j(this.$.addButton).removeAttr('disabled');
		}
	},
	
	_pickedProductsChanged: function(){
		if(this.$.chosenProductlist._selectedRecords.length === 0){
			$j(this.$.removeButton).attr({'disabled':'true'});
		}
		else {
			$j(this.$.removeButton).removeAttr('disabled');
		}
	},
	
	_filterAvailableProducts : function (e) {
		var filtervar = e.detail.value;
		if(e.detail.id === this.$.availsearch.id){
			/*for (var ii = 0; ii < this.availableProducts.length; ii++) {			
				this.availableProducts[ii].datalistVisible = ((this.availableProducts[ii].description.indexOf(filtervar) > -1) ||
						(this.availableProducts[ii].productcode.indexOf(filtervar) > -1));
			}*/
			//this.$.availProductDatalist.refresh();
			this.set('searchTermValue', filtervar);
			this.$.availableProducts.refreshRecords();
		}
		else if(e.detail.id === this.$.chosensearch.id){
			/*for (var ii = 0; ii < this.selectedProducts.length; ii++) {			
				this.selectedProducts[ii].datalistVisible = ((this.selectedProducts[ii].description.indexOf(filtervar) > -1) ||
						(this.selectedProducts[ii].productcode.indexOf(filtervar) > -1));
			}
			this.$.chosenProductlist.refresh();*/
			this.set('selSearchTermValue', filtervar);
			this.$.selectedProducts.refreshRecords();
		}
	},
	_removeProducts: function(e){
	      this.$.dataresource.deleteRecord(e.detail[0].href)
          .then(function(result){
      		this.$.availableProducts.refreshRecords();
    		this.$.selectedProducts.refreshRecords();
          }.bind(this));
	},
	//get schema information
	ready: function(){
		this.$.availableProducts.refreshRecords();
		this.$.selectedProducts.refreshRecords();
		//this.set('availableList', this.availableProducts);
	},
	
	downloadCSV: function(selectedProducts){
		if(selectedProducts !== undefined){
			var href = this.$.selectedProducts.$.mxajaxFetchRecords.url + '&_format=csv';
			return href;
		}
	}

});
