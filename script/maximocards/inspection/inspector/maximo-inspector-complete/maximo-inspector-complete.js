/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-inspector-complete',
	
  	behaviors: [BaseComponent],
  	
  	listeners: {
  		
  	},
  	
    properties: {
    	
    	/**
    	 * Inspection Result
    	 */
    	inspResult: {
    		type: Object,
    	},
    	
    	/**
    	 * Form name
    	 */
    	formName: {
    		type: String,
    		computed: '_computeFormName(inspResult)'
    	},
    	
    	/**
    	 * Complete date
    	 */
    	completeDate: {
    		type: String,
    		computed: '_computeCompleteDate(inspResult)'
    	},
    	
    	/**
    	 * Complete message
    	 */
    	completeMessage: {
    		type: String,
    		computed: '_computeCompleteMessage(formName)'
    	},
    	
    	/**
    	 * Compute reference type label
    	 */
    	resultObjReference: {
    		type: Object,
    		computed: '_computeObjectReference(inspResult)'
    	},
    	
	},
	
	/**
	 * Fetches form name when inspection result changes
	 */
	_computeFormName: function(inspResult) {
		
		if (inspResult && inspResult.inspectionform) {
			var inspForm = inspResult.inspectionform;
			if (inspForm.length > 0) {
				inspForm = inspForm[0];
			}
			return inspForm.name;
		}

		return null;
	},
	
	/**
	 * Computes message of inspection completion
	 */
	_computeCompleteMessage: function(formName) {
		return $M.localize('uitext','mxapiinspresult','inspection_completed', [formName]);
	},
	
	/**
	 * Computes date of inspection completion
	 */
	_computeCompleteDate: function (inspResult) {
		
		var lastComplete = this.fetchLastCompleteStatus(inspResult);
		var completeDate = new Date();
		
		if (lastComplete) {
			completeDate = new Date(lastComplete.changedate);
		}
		completeDate = $M.format({'value':'fetchDateOnly'}, completeDate);
		
		return $M.localize('uitext','mxapiinspresult','completed_on', [completeDate]);
	},
	
	/**
	 * Fetch last complete insp status 
	 */
	fetchLastCompleteStatus: function(inspResult) {
		var statusArray = inspResult.inspresultstatus;
		if (statusArray) {
			for (var i = statusArray.length; i > 0; i--) {
				var inspStatus = statusArray[i-1];
				if ( inspStatus.status === 'COMPLETED' ) {
					return inspStatus;
				}
			}
		}
		return null;
	},
	
	/**
	 * Fetches object reference
	 */
	_computeObjectReference: function(inspResult){
		
		var obj = {};

		var reference = inspResult.referenceobject;
		if (reference && reference.length > 0){
			reference = reference.toLowerCase();
		}
		
		var description = '';
		if (reference.indexOf('location') >= 0){
			description = inspResult.locations.description;
		}else if(reference.indexOf('asset') >= 0) {
			description = inspResult.asset.description;
		}
		
		obj.description = description;
		obj.type = $M.localize('uitext', 'mxapiinspresult', reference.toLowerCase());
		
		return obj;
	},
	
	/**
	 * Go back to list page
	 */
	exitCompletion: function(e) {
		this.fire('exitCompletion');
	},

	/**
	 * Go back to execution page.
	 */
	updateResponses : function(e){
		var detail = {'inspresult': this.inspResult, 'newstatus':'INPROG'};
		this.fire('changeInspectionStatus', detail);
	},
	
	/**
	 * Send user to workcenter
	 */
	goToWorkCenter: function(e) {
		$M.showDefaultWorkCenter();
	},
	
});
