/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-inspector-create',
	
  	behaviors: [BaseComponent, Polymer.IronResizableBehavior],
  	
  	listeners: {
  		'iron-resize': '_onIronResize',
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
    	 * Indicator to show/hide message
    	 */
    	hasFirstStep: {
    		type: Boolean,
    		value: false,
    		readOnly: true
    	},
    	
    	/**
    	 * Flag to hide chevron and input 
    	 */
    	hideInput: {
    		type: Boolean,
    		value: true,
    		readOnly: true
    	},
    	
    	/**
    	 * Placeholder for typeahead input
    	 */
    	inputPlaceholder: {
    		type: String,
    		value: ''
    	},
    	
    	/**
    	 * Type ahead value
    	 */
    	inputValue: {
    		type: String,
    		value: ''
    	},
    	
    	/**
    	 * Search terms used for both collections
    	 */
    	searchTerm: {
    		type: String,
    		value: ''
    	},
    	
    	/**
    	 * Indicator to show/hide loading   
    	 */
    	showLoading: {
    		type: Boolean,
    		value: false
    	},
    	
    	
    	/**
    	 * Flag to to indicate if there's type ahead result
    	 */
    	hasResult: {
    		type: Boolean,
    		value: false
    	},
    	
    	/**
    	 * Flag to indicate if there's inspection form
    	 */
    	hasRecord: {
    		type: Boolean,
    		value: false,
    		readOnly: true
    	},
    	    	
    	/**
    	 * String instruction for 1st step
    	 */
    	instruction: {
    		type: String,
    		value: function () {
    			return $M.localize('uitext','mxapiinspresult','selectitem');
    		}
    	},
    	
    	/**
    	 * collection used to search type ahead
    	 */
    	selectedCollection: {
    		type: Object,
    		value: null
    	},
    	
    	/**
    	 * type ahead result set
    	 */
    	typeAheadResultSet: {
    		type: Array,
    		value: []
    	},
    	
    	/**
    	 * Selected element
    	 */
    	selectedElement: {
    		type: Object
    	},
    	    	    	
    	/**
    	 * Set Selected Asset from type ahead
    	 */
    	selectedAsset : {
    		type: String
    	},
    	
    	/**
    	 * Set Selected Location from type ahead
    	 */
    	selectedLocation : {
    		type: String
    	},
 
    	/**
    	 * Set Selected Asset/Location Siteid from type ahead
    	 */
    	selectedSiteid : {
    		type: String
    	},
    	
    	/**
    	 * Set Selected Reference Object
    	 */
    	selectedReferenceObject : {
    		type: String
    	},
    	
		/**
		 * Inspection Org id
		 */
		inspOrgid: {
			type: String
		}
    	
	},
	
	/**
	 * window resize listener
	 */
	_onIronResize: function() {
		
		var height = $M.workScape.getHeight();
		
		$j(this.$.inspectorCreateMainDiv).height(height);
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
	 * Listens to asset button click
	 */
	assetList: function(e) {
		this.selectedReferenceObject = 'ASSET';
		this._setHideInput(false);
		this.inputPlaceholder = $M.localize('uitext', 'mxapiinspresult','asset_search_placeholder');
		this.selectedCollection = this.$.assetCollection;
		
		this.clearFirstStep();
		
		$j(this.$.inspectorLocationButton).toggleClass('assetLocationButtonActive',false);
		$j(this.$.inspectorAssetButton).toggleClass('assetLocationButtonActive',true);
		
		//this.fire('refreshFormCollection');
	},
	
	/**
	 * Listens to location button click
	 */
	locationList: function(e) {
		this.selectedReferenceObject = 'LOCATION';
		this._setHideInput(false);
		this.inputPlaceholder = $M.localize('uitext', 'mxapiinspresult','location_search_placeholder');
		this.selectedCollection = this.$.locationCollection;
		
		this.clearFirstStep();
		
		$j(this.$.inspectorLocationButton).toggleClass('assetLocationButtonActive',true);
		$j(this.$.inspectorAssetButton).toggleClass('assetLocationButtonActive',false);
		
		//this.fire('refreshFormCollection');
	},
	
	/**
	 * Refresh collection based on type 
	 */
	searchAgain: function (e) {
		
		//console.log('Listens to input: ' + this.inputValue);

		var input = e.currentTarget;
		
		if (!this.inputValue || this.inputValue.length < 3){
			$j(this.$.itemList).css({'display':'none'});
			if(input.keyupTimer){
				window.clearTimeout(input.keyupTimer);
			}
			this._setHasFirstStep(false);
			return;
		}else{
			this.showLoading=true;
			$j(this.$.itemList).css({'display':'block'});
		}
		
		if(input.keyupTimer){
			window.clearTimeout(input.keyupTimer);
		}
		
		var that = this;
	    input.keyupTimer = setTimeout(function(){
	    	that.performSearch();
		}, 1000);
		
	},
	
	/**
	 * Clear first step also hides input
	 */
	clearForm: function() {
		this.clearFirstStep();
		this._setHideInput(true);
	},
	
	
	/**
	 * Clear first step variables, inputs, selections
	 */
	clearFirstStep: function() {
		this._setHasFirstStep(false);
		this.selectedElement = null;
		this.typeAheadResultSet = [];
		$j(this.$.itemList).css({'display':'none'});
		
		this.inputValue = '';
		$j(this.$.inspectorLocationButton).toggleClass('assetLocationButtonActive',false);
		$j(this.$.inspectorAssetButton).toggleClass('assetLocationButtonActive',false);
	},
	
	/**
	 * Prepare conditions and trigger a collection refresh
	 */
	performSearch: function () {
		
		this.searchTerms = '%' + this.inputValue + '%';
		
		//Org filter
		if (this.inspOrgid) {
			this.selectedCollection.keySearchAttributeName = 'orgid';
			this.selectedCollection.keySearch = this.inspOrgid;
		}
		
		this.selectedCollection.refreshRecords();
	},
	
	/**
	 * Asset collection success handler
	 */
	_handleAssetDataRefreshed: function(e) {
		$j(this.$.itemList).css({'display':'block'});
		
		this.typeAheadResultSet = this.selectedCollection.collectionData;
		if (this.typeAheadResultSet && this.typeAheadResultSet.length > 0) {
			this.hasResult = true;
		}else {
			this.hasResult = false;
		}
		
		var that = this;
		setTimeout(function(){ that.showLoading = false; }, 500);
	},
	
	/**
	 * Asset collection fail handler
	 */
	_handleAssetDataError: function(e){
		this.showLoading = false;
		
		$j(this.$.itemList).css({'display':'block'});
		console.error('Problems to execute query');
	},
	
	/**
	 * Location collection success handler
	 */
	_handleLocationDataRefreshed: function() {
		$j(this.$.itemList).css({'display':'block'});
		
		this.typeAheadResultSet = this.selectedCollection.collectionData;
		if (this.typeAheadResultSet && this.typeAheadResultSet.length > 0) {
			this.hasResult = true;
		}else {
			this.hasResult = false;
		}
		
	
		var that = this;
		setTimeout(function(){ that.showLoading = false; }, 500);
	},
	
	/**
	 * Location collection fail handler
	 */
	_handleLocationDataError: function(){
		this.showLoading = false;
		
		$j(this.$.itemList).css({'display':'block'});
		console.error('Problems to execute query');
	},
	
	/**
	 * Listens to type ahead option list
	 */
	_selectElement: function(e){
		
		//console.log('element selected from collection ' + this.selectedCollection.id);
		//console.log(e.model._children[1]);
		
		this.fire('refreshFormCollection');
		
		//Store selected element in var
		this.selectedElement = e.model.elem;
		
		this.inputValue = this._getElemDesc(this.selectedElement);
		
		$j(this.$.itemList).css({'display':'none'});
		
		this._setHasFirstStep(true);
		
	},
	
	/**
	 * Compute asset description
	 */
	_getElemDesc(item) {
		
		var curObjName = this.selectedCollection.objectName;
		
		if (curObjName === 'MXAPIASSET') {
			this.selectedReferenceObject='ASSET';
			this.selectedAsset=item.assetnum;
    	} else if (curObjName === 'MXAPIOPERLOC') {
    		this.selectedReferenceObject='LOCATION';
    		this.selectedLocation=item.location;
    	}
		
		this.selectedSiteid=item.siteid;
		return  item.description;
    },
    /**
     * Compute asset num
     */
    _getNum(item) {
    	
    	var curObjName = this.selectedCollection.objectName;
    	if (curObjName === 'MXAPIASSET') {
    		return  ' (' + item.assetnum + ')';
    	} else if (curObjName === 'MXAPIOPERLOC') {
    		return  ' (' + item.location + ')';
    	}
    }
	
});
