/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-datadesign-appsecurity',
  	behaviors: [BaseComponent],
  	listeners: {
  		'addRoles' : '_addRoles',
  		'removeRoles' : '_removeRoles',
  		'maximo-searchbar-filter-changed':'_filterChosen'
  	},
    properties: {
    	objectset : {
    		type: Object,
    		value: null,
    		notify: true
    	},
    	chosenAnalyticRoles: {
    		type: Array,
    		value: []
    	},
    	selected : {
    		type: Number,
    		observer: '_changetab'
    	}
	},
	_gonext : function(e) {
		this.fire('set-step-state', {'index':3,'state':'complete'});
		this.fire('change-wizard-step',4);
	},
	_goback : function (e) {
		this.fire('change-wizard-step',2);
	},
	_moveSelected: function(e){
		this.fire('addRoles', {'eventIndex': -1, 'records':this.$.roledatalist._selectedRecords});
	},
	_addRoles: function(e){
		var index = e.detail.eventIndex;
		var array = this.chosenAnalyticRoles;
		var records = e.detail.records; 
		var allowed = '_noDuplicates';
		var card = this;
		var added = false;
		records.forEach(function(record){
			var canAdd = true;
			if(allowed!==undefined){
				canAdd = false;
				if(card[allowed]){
					canAdd = card[allowed](array,record);
				}
				else {
					canAdd = allowed(array,record);
				}
			}
			if(canAdd){
				record.datalistVisible = true;
				if(index>=0){
					array.splice(index, 0, record);
					index++;
					added = true;
				}
				else {
					array.push(record);
					added = true;
				}
			}
		});
		if(added){
			this.$.chosenroleslist.refresh();
			this.$.selectedrolessearch.clear(true);
		}
	},
	_removeRecords: function(array, records){
		if(records.length===0){
			return array;
		}
		var tempList = JSON.parse(JSON.stringify(array));
		var removed = 0;
		array.forEach(function(picked,index){
			records.forEach(function(record){
				if(picked.href === record.href){
					tempList.splice(index-removed, 1);
					removed++;
				}
			});
		});
		return tempList;
	},
	_removeRoles: function(e){
		var startLength = this.chosenAnalyticRoles.length; 
		this.chosenAnalyticRoles = this._removeRecords(this.chosenAnalyticRoles, e.detail);
		if(startLength!==this.chosenAnalyticRoles.length){
			this.$.chosenroleslist.refresh();
		}
	},
	_noDuplicates: function(array, record){
		for(var checkIndex=0;checkIndex<array.length;checkIndex++){
			if(array[checkIndex].href === record.href){
				return false;
			} 
		}
		return true;
	},
	_handleRecordDataRefreshed: function(){
		this.$.roledatalist.refresh();
	},
	_changetab: function(selected){
		if(selected === 3){
			this.$.securitycollection.refreshRecords();
		}
	},
	_filterChosen : function (e) {
		if(e.detail.id === this.$.selectedrolessearch.id){
			var filtervar = e.detail.value.toLowerCase();
			for (var ii = 0; ii < this.chosenAnalyticRoles.length; ii++) {			
				this.chosenAnalyticRoles[ii].datalistVisible = this.chosenAnalyticRoles[ii].description.toLowerCase().includes(filtervar);
			}
			this.$.chosenroleslist.refresh();
		}
	},
});
