/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-workinprogress-card',
  	behaviors: [BaseComponent,HandlerWorkOrder],
  	listeners: {'fireReassign': 'getAvailableLabors',
  		'toggleCollapsible': 'toggleSection',
  		'readyForResize':'resizeCollapsible'},
    properties: {
		recordData: {
			type: Object,
			notify: true
		},
		wmassignmentCollectionRecordData: {
			type: Object,
			notify: true
		},
		assignmentRecordData: {
			type: Object,
			notify: true
		},
		availableLaborRecordData: {
			type: Object,
			notify: true
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
		selectedQueryDefaultLabel: {
			type: String,
			notify: true
		},
		selectedQueryName: {
			type: String,
			value: 'ASSIGNEDWORK',
			notify: true,
			observer: '_selectedQueryNameChanged'
		},
		selectedAssetTypeLabelDefault: {
			type: String,
			notify: true
		},
      	
		dynamicAttributeNames: {
			type: Array,
			value: [],
			notify: true
		},
		eventListeners: {
			value: ['dialogOk']
		},
		
		recordCount: {
			type: String,
			value: 0,
			notify: true
		},
		
		filterWorkOrderID: {
			type: String,
			notify: true
		}
		
	},

	moreInfo : function(e) {
		var woclone = $M.cloneRecord(e.model.wmassignment);
		$M.showDialog(this, woclone, null, 'maximo-workorderdetails-card', false);
	},
	
	attached: function()
	{
		this.$.workinprogress.toggleLoading(true);
	},
	
	_handleRecordDataRefreshed: function()
	{
		this.recordCount = this._getRecordCount();
		this.$.workinprogress.toggleLoading(false);
		this.$.workinprogressIronList.fire('iron-resize');
	},
	
	_showWODetails: function()
	{
		
	},
	
	_selectedQueryNameChanged : function()
	{
		
	},
	dialogOk: function(){
		this.$.womaincollection.refreshRecords();
	},
	/**
	 * Hide priority section if no priority is defined on the record.
	 */
	showPriority: function(wo){
		if(wo.wopriority){
			return false;
		} else {
			return true;
		}
	},
	buildStyle: function(workorder,type){
		var style;
		switch(type){
			case 'wopriority' :
				if(workorder[type]<=3){
					style='height:20px;width:20px;color:#F93945';
				}
				else if(workorder[type]<=6){
					style='height:20px;width:20px;color:#FFCC00';
				}
				else if(workorder[type]>6){
					style='height:20px;width:20px;color:#8ED02D';
				} 
				else {
					style='height:20px;width:20px;color:#8ED02D';
				}
				break;	
		}
		return style;
	},
	/**
	 * Get Available Labors. This will fetch the available labors for the current assignment.
	 */
	getAvailableLabors : function(e) {
		this.$.workinprogress.toggleLoading(true);
		var record = this.$.workinprogressIronList.modelForElement(e.target).wmassignment;
		this.record=record;
		var params = {};
		params['oslc.properties']='*,availability, laborcraftrate.craft, laborcraftrate.skilllevel, person.displayname';
		
		var filterData = [{'filtertype': 'SIMPLE', 'field': 'assignmentid', 'availablevalues': [ ]}];

		//create filter to fetch assignment record
   		var filterByAssignmentId = {};
   		filterByAssignmentId.value = record.assignmentid;
   	   	filterByAssignmentId.selected = true;
   	   	filterData[0].availablevalues.push(filterByAssignmentId);
		this.filterData = filterData;	
		
		this.$.assignmentcollection.refreshRecords().then(function(assignment){
			var woclone = $M.cloneRecord(this.record);
			this.$.wmassignmentcollection.refreshRecords().then(function(wmassignment){
				this.$.workinprogress.toggleLoading(false);	
				if(wmassignment.response && 
						wmassignment.response.member.length>0 && 
						wmassignment.response.member[0].uxavailablelabor && 
						wmassignment.response.member[0].uxavailablelabor.length>0){
					woclone.laborCollectionRef = assignment.response.member[0].labor_collectionref;
					$M.showDialog(this, woclone, null, 'maximo-findsomeone-card', false);
					$M.toggleWait(false);
				} else {
					$M.toggleWait(false);
					$M.notify('No labor available', $M.alerts.warn);
				}
			}.bind(this));
			
		}.bind(this));
		
	},
	
	_getRecordCount : function(){
		return this.$.womaincollection.totalCount;
	},
	
	_getAssignmentUrl : function(){
		if(this.assignmentRecordData && this.assignmentRecordData.length>0){
			return this.assignmentRecordData[0].href;	
		} else {
			return null;
		}
	},
	
	_getWorkorderUrl : function(){
		if(this.workorderRecordData && this.workorderRecordData.length>0){
			return this.workorderRecordData[0].href;	
		} else {
			return null;
		}
	},
	
	refreshContainerRecords: function () {
		this.$.womaincollection.refreshRecords();
	},
	
	_handleCleanAssignmentRecordDataRefreshed : function (){
		//console.log('hi');
	},
	
	toggleSection: function(e) {
		//Despite collapsed is false it's on its opening process
		if (!e.detail.collapsed){
			$j(e.target).find('maximo-workinprogress-details-card').get(0).loadDetails(e);
		}
	},
	
	resizeCollapsible: function(e) {
		
		var collapsible = $j(e.target).closest('maximo-collapsible').get(0);
		var upperDivHeight = $j(collapsible).find('div[name="wp-inner-section"]').get(0).scrollHeight;
		var lowerDivHeight = $j(e.target).find('div[name="wpd-inner-section"]').get(0).scrollHeight;
		var height;
		if (upperDivHeight && lowerDivHeight){
			height = upperDivHeight+lowerDivHeight+10;
		}
		
		collapsible.resizeCollapsible(height);
	}
	
});
