/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-datadesign-savedialog',
	behaviors: [BaseComponent, MaxExport],
	listeners: {
  		'chooseQuery' : '_chooseQuery',
  		'radio-button-selected' : '_qrySelectChanged'
  	},
    properties: {
    	dataset : {
    		type: Object,
    		value: null,
    		notify: true
    	},
    	objectset : {
    		type: Object,
    		value: null,
    		notify: true
    	},
    	selected : {
    		type: Number,
    		observer: '_changetab'
    	},
		recordData: {
			type: Object,
			notify: true
		},
		selectedRecord: {
			type: Object,
			notify: true
		},
		selectedQueryDefaultLabel: {
			type: String,
			notify: true
		},
		selectedQueryName: {
			type: String,
			value: 'MYDATASETS',
			notify: true,
			observer: '_selectedQueryNameChanged'
		},
		dynamicAttributeNames: {
			type: Array,
			value: [],
			notify: true
		},
		recordCount: {
			type: String,
			value: 0,
			notify: true
		},
		cookieName: {
			type: String,
			notify: true
		},
		displayWatsonIcon: {
			type: Boolean,
			value: false
		},
		endpointData: {
			type: Object,
			notify: true
		}
	},
	
	_selectedQueryNameChanged : function()
	{
		
	},

	_handleEndPointDataRefreshed: function()
	{

	},
	
	_close: function(){
		this.container.close();
	},
	
	_returnToEdit: function(){
		this.container.mainContext.fire('return-to-edit');
		this.container.close();
	},
	
	_createNewDataSet: function(){
		this.container.close();	
		this.container.onclose = $M._changeWorkCenter('datasetdesigner');
	},

	_returnToWorkCenter: function() {
		this.container.close(); 
		$M.toggleWait();
		this.async(function(){
			$M.set('route.path', '/businessanalyst');
		},200);
    },
    
    _watsonExport: function(){
    	this.watsonExport(this.record);
    }
	
});
