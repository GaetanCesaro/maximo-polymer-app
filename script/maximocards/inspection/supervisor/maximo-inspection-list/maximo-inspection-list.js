/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-inspection-list',
	
  	behaviors: [BaseComponent],
  	
  	listeners: {
  		
  	},
  	
    properties: {
    	
    	/**
    	 * List of inspection form
    	 */
    	dataSet: {
    		type: Array
    	},
    	
    	/**
    	 * 
    	 */
    	selectedTile: {
    		type: Object    	
    	},
    	
    	/**
    	 * Synonym domain collection
    	 */
    	statusSet: {
    		type: Array,
    		observer: '_statusSetChange'
    	},
    	
    	/**
    	 * Indicator to show/hide message
    	 */
    	hasRecord: {
    		type: Boolean,
    		value: false,
    		readOnly: true
    	}
    	
	},
	
	createForm: function(e) {
		//TODO show clean form !!REUSE form
		console.info('New form');
		this.fire('buildNewForm');
	},
	
	editForm: function(e) {
		//TODO show form with inspection form !!REUSE form
		console.info('Edit form');
		this.fire('editForm', {'form': this.selectedTile});
	},
	
	_statusSetChange: function(newV) {
	},
	
	selectRecord: function (formId) {
		if(formId){
			this.$.inspectionFormTemplate.render();			
			var nodeArray = this.$.dataScroller.querySelectorAll('maximo-inspection-tile');
			for (var i = 0; i < nodeArray.length; ++i) {
				if (nodeArray[i].dataId === formId){
					nodeArray[i].highlight();
				}
			}
		}
	},
	
	dataSetRefresh: function () {
		var total;
		if (!this.dataSet) {
			total = 0;
		}else {
			total = this.dataSet.length;
		}
		
		this._resultCounter = $M.localize('uitext', 'mxapiwosdataset', '0Results',[total]);
		
		if (total === 0){
			this._setHasRecord(false);
		}else{
			this._setHasRecord(true);
		}
	},
	
	/**
	 * Remove tile (record) from list
	 * Method required instead of refreshing list
	 * List refresh prevents others cards to be deleted. 
	 */
	removeTile: function (record) {
		
		var index = this.dataSet.indexOf(record);
        this.splice('dataSet', index, 1);
        
        this.dataSetRefresh();

	}
	
});
