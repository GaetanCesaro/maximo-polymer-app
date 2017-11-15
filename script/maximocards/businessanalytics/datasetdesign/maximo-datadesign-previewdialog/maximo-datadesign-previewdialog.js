/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-datadesign-previewdialog',
  	behaviors: [BaseComponent],
    properties: {
    	/**
    	previewcolumns: {
    		type: Array,
    		value: [{'attribute':'title','title':'Title'},{'attribute':'remarks','title':'Remarks'},{'attribute':'title','title':'Title'},{'attribute':'remarks','title':'Remarks'},{'attribute':'title','title':'Title'},{'attribute':'remarks','title':'Remarks'}]
    	},
    	previewdataset: {
    		type: Array,
    		value: [
    			{
    				'title' : 'Crew',
    				'remarks' : 'Identfies the crew. This value must be unique within an organization.',
    				'href' : 'REP_AMCREW_AMCREW_amcrew'
    			},
    			{
    				'title' : 'Unique Id',
    				'remarks' : 'Unique Id',
    				'href' : 'REP_AMCREW_AMCREW_amcrewid'
    			}]
    	}
    	*/
    	
    	previewattributes : {
    		type: String,
    		value: null    			
    	},
    	previewobjectname : {
    		type: String,
    		value: null
    	},
    	previewqueryname : {
    		type: String,
    		value:''    		
    	},
    	/**
    	 * Result of collection
    	 */
    	previewdataset: {
    		type: Array,
    		notify: true,
    		observer: '_datasetChange'
    	},
    	
    	/**
    	 * Flat structure of collection's result 
		 * sent to table component
    	 */
    	flattenDataset : {
    		type: Array,
    		notify: true
    	}
	},
	_handlePreviewRefreshed: function(){
		
	},
	_ok: function(){
		this.container.close();	
	},
	attached: function(){
		if (this.recordData.objectset.intobjectname) {
			this.previewobjectname = this.recordData.objectset.intobjectname;
		}
		
		if (this.recordData.pickedList) {
			var attributes = '';
			var columns = [];
			this.recordData.pickedList.forEach(function(attr) {
				if (attributes.length > 0) {
					attributes += ',';					
				}
				var attribute = attr.attribute;
				if (attr.relationPath){
					attribute = attr.relationPath.toLowerCase() + '.' + attribute;
				}
				attributes += attribute;
				
				var col = {attribute: attribute, title: attr.title};
				columns.push(col);				
			});
			this.previewattributes = attributes;
			this.previewcolumns = columns;
		}

		var self = this;
		
		
		this.$.previewcollection.refreshServiceProviderData().then(
			function(result) {
				self._runPreviewQuery();
			}
		);						
	},	
	
	_runPreviewQuery : function() {		
		if ((this.recordData.query) && (this.recordData.query.queryName)) {
//			this.previewqueryname = this.recordData.query.queryName;		
		this.previewqueryname =  this.$.previewcollection.creationInfo[0].href + '?savedQuery=' + this.recordData.query.queryName;
		}
		
		if (this.previewobjectname && this.previewattributes) {			
			this.$.previewcollection.refreshRecords();
		}
		else {
			// todo make this an actual message
			console.log('not enough information to run preview screen');
		}		
	},
	
	/**
	 * Observer of previewdataset
	 */
	_datasetChange: function (newValue, oldValue) {
		this.flattenDataset = this.flatStructure(newValue);
	},
	
	/**
	 * Converts a hierarchical structure in a flat one
	 */
	flatStructure : function (dataset) {
		
		var list = [];
		var attributes = this.previewattributes.split(',');
		
		if (!attributes || attributes.length < 1) {
			console.warn('attributes not found');
			return dataset;
		}
		
		for (var i = 0; i < dataset.length; i++) {
			var element = dataset[i];
			var tempObj = {};
//			console.log(element);
			
			for (var j = 0; j < attributes.length; j++) {
				var attr = attributes[j];
				tempObj[attr] = this._extractValueOfObject(element, attr);
			}
			list.push(tempObj);
		}
		
		return list;
	},
	
	/**
	 * Dig a value in a object structure 
	 * given the attribute name
	 * e.g. attribute name is person.document
	 * it finds the document from that person inside given element
	 * returns NULL case no attribute or attribute not found in the element 
	 */
	_extractValueOfObject : function (/*object*/element, /*string*/attribute ) {
		
		if (!element || !attribute) {
			return null;
		}
		
		var attrArray = attribute.split('.');
		var tmpElement = element;
		
		if (!attrArray || attrArray.length < 1){
			return null;
		}
		
		for (var i = 0; i < attrArray.length; i++) {
			var propertyName = attrArray[i];
			if ( tmpElement.hasOwnProperty(propertyName) ){
				tmpElement = tmpElement[propertyName];
			}else {
				tmpElement = null;
				break;
			}
		}
		return tmpElement;
	}
});
