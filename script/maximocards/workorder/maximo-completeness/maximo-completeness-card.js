/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-completeness-card',
  	behaviors: [BaseComponent,HandlerWorkOrder],
    properties: {
		record : {
			type: Object,
			notify: true
		},
   		label : {
   			type: String,
   			value : function(){
   				return $M.localize('uitext', 'mxapiperuser', 'WorkOrderCompletion');
   			}
   		},
   		completenessLabel : {
   			type: String,
   			value : '',
   			notify: true
   		},  		
		failureIncomplete : {
			type: Boolean,
			value: false,
			notify: true
		},
		taskIncomplete : {
			type: Boolean,
			value: false,
			notify: true
		},
		actualToolsIncomplete : {
			type: Boolean,
			value: false,
			notify: true
		},
		actualLaborIncomplete : {
			type: Boolean,
			value: false,
			notify: true
		},
		actualMaterialIncomplete : {
			type: Boolean,
			value: false,
			notify: true
		},
		showimage : {
			type: Boolean,
			value: false
		},
		person : {
			type: Object,
			notify: true
		}
	},
	ready : function() {
		
	},
	attached : function() {
		this._loadLaborRecord();
	},
	/**
	 * Close the dialog.
	 */
	close : function(){
		this.container.close();
	},
		
	/**
	 * Open the Maximo Record
	 */
	openWorkorder : function(){
		$M.openMaximoRecord('wotrack',this.record.workorderid);
	},
	
	/**
	 * Determine if Work Order is complete and display message accordingly.
	 */
	showCompleteMessage : function(percentComplete) {
		var completenessLabel = '';
		var changeby = (this.person) ? this.person.displayname : $M.getNoDataString();
		
		if(percentComplete===100){
			completenessLabel = $M.localize('uitext', 'mxapiperuser', '0hasenteredallthedata', [changeby]);
			this.completenessLabel = completenessLabel;
		} else {
			completenessLabel = $M.localize('uitext', 'mxapiperuser', '0hasnotentereddatainthefollowingitems', [changeby]);
			this.completenessLabel = completenessLabel;
		}
	},
	
	_loadLaborRecord: function () {
		
		var values = {};
		if(!this.record.changeby){
			values.value = 'N/A';			
		} else {
			values.value = this.record.changeby;
		}
		
		var filterData = [{'filtertype': 'SIMPLE', 'field': 'personid', 'availablevalues': [ ]}];

		//create filter to fetch assignment record
   		values.selected = true;
   	   	filterData[0].availablevalues.push(values);
		this.filterData = filterData;
		
		this.$.laborcollection.refreshRecords();
		
	},
	
	_getLaborSet: function () {
		
		if (this.recordData && this.recordData.length > 0){
			this.person = this.recordData[0];
		}
		
		var percentComplete = this.calculateCompleteness(this.record);
		this.showCompleteMessage(percentComplete);
		
	}
	
});
