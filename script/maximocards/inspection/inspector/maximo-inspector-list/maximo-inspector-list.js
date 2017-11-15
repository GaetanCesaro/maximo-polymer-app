/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-inspector-list',
	
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
    	 * Select tab name
    	 */
    	selectedTabName: {
    		type: String,
    		observer: '_filterList' 
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
    	 * Hold message for each tab
    	 */
    	noInspectionsFound: {
    		type: String,
    		value: function() {
    			return $M.localize('uitext','mxapiinspresult','inspector_no_inspections_due');
    		}
    	},
    	
		additionalparams :{
			type : Array,
			notify : true
		},
    	
	},
	
	attached: function() {
		
		var defaultOrg = $M.getMaxauth().whoami.defaultOrg;
		inspresultlistcollection.additionalParams.push('oslc.where=orgid=%22'+defaultOrg+'%22');
		inspresultlistcollection.filtered=true;
		inspresultlistcollection.refreshRecords()
		
	},

	/**
	 * Opens Create Inspection View in order to start the inspection form creation.
	 */
	createUnscheduledInspection: function(e) {
		this.fire('createUnscheduledInspection');
	},
	
	/**
	 * DataSet Refresh - setHasRecord flag true/false if records exist
	 */
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
	 * Listens to tab selection
	 */
	tabTap: function(e) {
		
		var name = e.currentTarget.getAttribute('name');
		this.selectedTabName = name;
		//var curIntVal = e.currentTarget.getAttribute('intvalue');
	},
	
	/**
	 * Triggered by Status Filtering, Maximo Content Selector component.
	 * Change message according to selected tab
	 * 
	 * @param e
	 * @returns
	 */
	_filterList : function(tabName){
		$M.toggleWait(true);
		//clear search when changing tabs
		var searchBar = $j(inspectormain_inspResultList_inspectorListSearchBar);
		if(searchBar && searchBar.length > 0){
			searchBar[0].clear();	
		}	
		
		var inspresultlistcollection = $M.getGlobalResource('inspresultlistcollection');
		var statusObject = [];
		
		//cleanup appended additional params.	
		for(var i = inspresultlistcollection.additionalParams.length -1; i >= 0 ; i--){
		    if(inspresultlistcollection.additionalParams[i].indexOf('oslc.where')>-1 || inspresultlistcollection.additionalParams[i].indexOf('domaininternalwhere')>-1){
		    	inspresultlistcollection.additionalParams.splice(i, 1);
		    }
		}
				
		//find external status value
		switch(tabName){
			case 'pending':
				statusObject = this.statusSet.filter(x=>x.maxvalue==='PENDING');
				this.noInspectionsFound = $M.localize('uitext','mxapiinspresult','inspector_no_inspections_due');
				break;
			case 'inprogress':
				statusObject = this.statusSet.filter(x=>x.maxvalue==='INPROG');
				this.noInspectionsFound = $M.localize('uitext','mxapiinspresult','inspector_no_inspections_due');
				break;
			case 'completed':
				statusObject = this.statusSet.filter(x=>x.maxvalue==='COMPLETED');
				this.noInspectionsFound = $M.localize('uitext','mxapiinspresult','inspector_no_inspections_found');
				break;
			default:
				this.noInspectionsFound = $M.localize('uitext','mxapiinspresult','inspector_no_inspections_found');
		}
		
		if(statusObject.length>0){
			var status = statusObject[0].value;
			var defaultOrg = $M.getMaxauth().whoami.defaultOrg;
			if(status){
				if(tabName === 'all'){
					inspresultlistcollection.additionalParams.push('oslc.where=orgid=%22'+defaultOrg+'%22');
				} else {
					inspresultlistcollection.additionalParams.push('oslc.where=status=%22'+status+'%22 and orgid=%22'+defaultOrg+'%22');
				}
			}
		}
		
		inspresultlistcollection.filtered=true;
		
	},
	
	/**
	 * Highlight new record/card once its created
	 */
	selectRecord: function (formId) {
		if(formId){
			this.$.inspectorListTileTemplate.render();			
			var nodeArray = this.$.inspectorListDataScrollerDiv.querySelectorAll('maximo-inspector-tile');
			for (var i = 0; i < nodeArray.length; ++i) {
				if (nodeArray[i].__data__.record.inspectionresultid === formId){
					nodeArray[i].highlight();
				}
			}
		}
	},
	
	/**
	 * Request page change to execution
	 */
	_loadExecution: function(e) {
		var self = this;
		var filterData = [{'filtertype': 'SIMPLE', 'field': 'inspectionresultid', 'availablevalues': [ ]}];
		$M.toggleWait(true);
		//create filter to fetch assignment record
		var inspectionRecord = e.model.inspForm;
   		var filterByInspectionResultId = {};
   		filterByInspectionResultId.value = inspectionRecord.inspectionresultid;
   		filterByInspectionResultId.selected = true;
   	   	filterData[0].availablevalues.push(filterByInspectionResultId);
   	
		var inspresultcollection = $M.getGlobalResource('inspresultcollection');
		inspresultcollection.filterData = filterData;
		
		this.domHost.$.executionContainer.$.questionlist.resetUserChanges();
		
		inspresultcollection.refreshRecords().then(function(inspectionRecord){
			//var inspectionRecord = e.model.inspForm;
			self.fire('loadInspection', inspectionRecord.response.member[0]);
		});

	},
	
	
	/**
	 * Select pending tab
	 * Clear searchbar
	 */
	reset: function() {
		//console.log('Reset filter');
		this.$.inspectorListContentSelector.select(0);
		this.selectedTabName = 'pending';
	}
	
});
