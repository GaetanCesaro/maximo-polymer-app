/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-weather-add-group',
  	behaviors: [BaseComponent],
  	observers:[
  	           '_handleQueryNameChange(queryName)'],
  	listeners: {
		'productsSelectedChanged' : '_productSelectedChanged',
		'pickedProductsChanged' : '_pickedProductsChanged'
  	},
    properties: {
    	parentRecord : {
    		type: Object,
    		value: {},
    		notify: true
    	},
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
			if (this.parentRecord.weatherproduct === undefined){
				this.set('parentRecord.weatherproduct',[]);
			}
			delete selectedRecord[i]["href"];
			this.push('parentRecord.weatherproduct',selectedRecord[i]);
	        var index = this.availableProducts.indexOf(selectedRecord[i]);
	        this.splice('availableProducts', index, 1);
		}
		this.$.chosenProductlist.refresh();
		this.$.availProductDatalist.refresh();
		
	},
	removeSelected: function(e){
		var selectedRecord = this.$.chosenProductlist._selectedRecords;
		for(var i = 0; i < selectedRecord.length; i++){
			if (this.availableProducts === undefined){
				this.set('availableProducts',[]);
			}
			this.push('availableProducts',selectedRecord[i]);
	        var index = this.availableProducts.indexOf(selectedRecord[i]);
	        this.splice('parentRecord.weatherproduct', index, 1);
		}
		this.$.chosenProductlist.refresh();
		this.$.availProductDatalist.refresh();
		
	},
	reset: function(){
		this.toggleNext();
		$j(this.$.resetChosen).attr({'disabled':'true'});
		this.$.availsearch.clear();
		this.$.selectedsearch.clear();
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
	
	//get schema information
	ready: function(){
		//this.set('availableList', this.availableProducts);
	},
	//get schema information
	_save: function(){
		console.log(this.addObject);
		if (this.addObject === false){
			this.$.weatheGroupResource.updateRecord(this.parentRecord);
		}
		else{
			this.parent.$.weathergroup.createRecord(this.parentRecord);
		}
		$M.closeDialog();
		this.parent.$.weathergroup.refreshPage(1);
	},
	_cancel: function(){
		$M.closeDialog();
		this.parent.$.weathergroup.refreshPage(1);
	},
	_handleQueryNameChange: function(queryName){
		if (queryName !== undefined)
		{
			if (queryName === 'unusedProducts'){
				var groupName = this.parentRecord.groupname;
				var queryParams = {};
				queryParams.groupName = groupName;
				this.set('queryParams',queryParams);
				this.$.availableProducts.refreshRecords();
				this.$.weatheGroupResource.loadRecord();	
				this.set('addObject',false);
			}
			else{
				this.$.availableProducts.refreshRecords();
				this.set('parentRecord.weatherproduct',[]);
				this.set('addObject',true);
			}
			
		}
	}

});
