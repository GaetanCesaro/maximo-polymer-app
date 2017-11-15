/*
* Licensed Materials - Property of IBM
* 5724-U18
* Copyright IBM Corporation. 2016
*/
Polymer({
	is: 'maximo-searchasset-card',
  	behaviors: [BaseComponent],
    properties: {
		recordData: {
			type: Object,
			notify: true
		},
		record : {
			type: Object,
			notify: true
		},

   		label : {
   			type: String,
   			value : function(){
   				return $M.localize('Select Owner');
   			}
   		},
		assetrecord : {
			type : Object,
			notify : true,
		},
		
		selectedQueryName: {
			type: String,
			value: 'ASSIGNEDWORK',
			notify: true,
			observer: '_selectedQueryNameChanged'
		},
		
		selectedRecord: {
			type: Object,
			notify: true
		},
		
		woFilterData: {
			type: Object,
			value: null,
			notify: true
		},
		
		recordCount: {
			type: String,
			value: 0,
			notify: true
		},
	
		dynamicAttributeNames: {
			type: Array,
			value: [],
			notify: true
		}
	},

	ready : function (){

	},
	
	listeners: {
      //  'tap': 'selectedRow',
        'dblclick': 'selectedRow',
	},
	
	
	_showWODetails: function()
	{
		
	},
	
	_selectedQueryNameChanged : function()
	{
	},

	_getRecordCount : function(){
		return this.$.selectassetcollection.totalCount;
	},
	
	selectedRow: function(e) {
		if (e.currentTarget.localName === 'maximo-searchasset-card')
		{
			if (e.target.parentNode.record)
		    {
				
				this.parent.selectedAsset(e.target.parentNode.record);
				
				UndoBehavior.close.call(this);
		    }
		}  
	},
	
	created : function() {
		
	},
	
	_refresh : function() {
		if(this.selectedType === 0)
		{
			this.$.selectassetcollection._refresh();
		}
	},
	/**
	 * Close Dialog.
	 */
	close : function() {
		UndoBehavior.close.call(this);

	},
	
	_handleRecordDataRefreshed: function()
	{
		this.recordCount = this._getRecordCount();
		this.$.selectAssetPanel.toggleLoading(false);
	},
	
	_handleDataError : function(e){
		this.$.selectAssetPanel.toggleLoading(false);
		$M.alert(e.detail.Error.message);
	}
});