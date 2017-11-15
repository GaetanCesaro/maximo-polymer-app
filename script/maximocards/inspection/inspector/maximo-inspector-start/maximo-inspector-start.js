/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-inspector-start',
	
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
    	 * Inspection Template
    	 */
    	inspForm: {
    		type: Object    	
    	},

    	
    	/**
    	 * Object label
    	 */
    	objectTypeLabel : {
    		type: String,
    		computed: '_fetchObjectTypeLabel(inspResult)'
    	},
    	
    	/**
    	 * Object type
    	 */
    	objectDescription: {
    		type: String,
    		computed: '_fetchObjectDescription(inspResult)'
    	},
    	
    	/**
    	 * Inspection Result
    	 */
    	inspResult: {
    		type: Object,
    	},
    	
    	/**
    	 * flag to indicate creation of inspection result
    	 * or just status update
    	 */
    	isResultCreated: {
    		type: Boolean,
    		value: false,
    		observer: '_isResultCreatedChanged'
    	},
    	
    	/**
    	 * Indicator to show/hide message
    	 */
    	hasRecord: {
    		type: Boolean,
    		value: false,
    		readOnly: true
    	},
    	
    	/**
    	 * Instruction flag to hide / show
    	 */
    	hasInstructions: {
    		type: Boolean,
    		value: false,
    		computed: '_checkInstruction(inspForm)'
    	}
    	
	},

	/**
	 * Opens Create Inspection View in order to start the inspection form creation.
	 */
	createUnscheduledInspection: function(e) {
		this.fire('createUnscheduledInspection');
	},
		
	/**
	 * Apply flag based on long description field
	 */
	_checkInstruction: function(inspForm) {
		
		return ((!this.inspForm) || 
				(this.inspForm.description_longdescription === null) || 
				(this.inspForm.description_longdescription===undefined) ) ? false : true;
	},
	
	/**
	 * fetch object label from inspection result
	 */
	_fetchObjectTypeLabel: function(inspResult) {
		
		var type = inspResult.referenceobject;
		var label = '';
		if(type) {
			label = $M.localize('uitext', 'mxapiinspresult', type.toLowerCase());
		}
		return label;
	},
	
	/**
	 * fetch object description from ObjectType
	 */
	_fetchObjectDescription: function(inspResult) {
		
		var type = inspResult.referenceobject;
		var desc = '';
		var obj = {};
		if (type) {
			type = type.toLowerCase();
			if (type.indexOf('asset') >= 0) {
				obj = inspResult.asset;
				desc = obj.description;
			}else if(type.indexOf('location') >= 0) {
				obj = inspResult.locations;
				desc = obj.description;
			}
		}
		
		return desc;
		
	},
	
	/**
	 * is result created observer
	 */
	_isResultCreatedChanged: function (newV) {
		if (newV && newV === true) {
			$j( this.$.inspectorSave ).prop( 'disabled' , true );
		}else {
			$j( this.$.inspectorSave ).prop( 'disabled' , false );
		}
		
		
	},
	
});
