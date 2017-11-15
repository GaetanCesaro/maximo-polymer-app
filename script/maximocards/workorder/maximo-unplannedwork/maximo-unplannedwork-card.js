/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-unplannedwork-card',
  	behaviors: [BaseComponent, HandlerWorkOrder],
  	listeners: {'fireFindLabor':'findLabor'},
    properties: {
		recordData: {
			type: Object,
			notify: true
		},
		woLaborRecordData: {
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
		laborRecordData: {
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
		woLaborFilterData: {
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
			value: 'UNPLANNEDWORK',
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
		recordCount: {
			type: String,
			value: 0,
			notify: true
		},
		additionalparams: {
			type: String,
			value: '',
			notify: true
		}
	},
		
	attached: function()
	{
		this.$.unplannedWorkPanel.toggleLoading(true);
	},
	
	_handleRecordDataRefreshed: function()
	{
		this.recordCount = this._getRecordCount();
		this.$.unplannedWorkPanel.toggleLoading(false);
		this.$.unplannedWorkPanelIronList.fire('iron-resize');
	},
	
	_laborHandleRecordDataRefreshed : function()
	{
		this.setCount = this._getRecordCount();
	},
	
	_showWODetails: function()
	{
		
	},
		
	_selectedQueryNameChanged : function()
	{
		
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
	
	_getRecordCount : function(){
		return this.$.unplannedWOCollection.totalCount;
	},
	
	openFindSomeoneElseCard: function (e) {
		var woclone = $M.cloneRecord(e.model.workorder);
		$M.showDialog(this, woclone, null, 'maximo-findsomeone-card', false);
	},
	
	refreshContainerRecords: function () {
		this.$.unplannedWOCollection.refreshRecords();
	},
	
	/**
	 * Assign Suggested Labor. This will assign the first labor in the list.
	 */
	assignLabor : function (e) {
		var self=this;		
		var responseProperties = '';
		var record = this.$.unplannedWorkPanelIronList.modelForElement(e.target).workorder;
		this.record=record;
		var availableLaborSet = record.uxavailablelabor;
		this.$.wmAssignmentResource.resourceUri=record.href;
		
		//Display warning to user if No Available Labor exists
		if(availableLaborSet === undefined || availableLaborSet.length===0){
			$M.alert(this.localize('messages', 'mxapiwodetail', 'Nolaborisavailableforassignment'), $M.alerts.info);
			return;
		}
		
		//hide card when action is selected.  Once panels are refreshed card will be reloaded from server and reappear if necessary.
		$M.hideCard(e.currentTarget);
		
		this.$.unplannedWorkPanel.toggleLoading(true);
		
		var laborcode = availableLaborSet[0].laborcode;
		var orgid = availableLaborSet[0].orgid;
		var params = {laborcode: laborcode, orgid: orgid};
		
		var filterData = [{'filtertype': 'SIMPLE', 'field': 'assignmentid', 'availablevalues': [ ]}];

		//create filter to fetch assignment record
   		var filterByAssignmentId = {};
   		filterByAssignmentId.value = record.assignmentid;
   	   	filterByAssignmentId.selected = true;
   	   	filterData[0].availablevalues.push(filterByAssignmentId);
		this.filterData = filterData;
		
		this.$.assignmentcollection.refreshRecords().then(function(){
			//call assignLabor webmethod action
			this.$.assignmentResource.updateAction('wsmethod:assignLabor', params, responseProperties).then(function() {
				self.$.unplannedWorkPanel.toggleLoading(false);
				$M.notify(self.localize('messages', 'mxapiwodetail', 'WO0isassignedto1',[self.record.wonum, availableLaborSet[0].person.displayname]), $M.alerts.info);
				self.$.unplannedWOCollection.refreshRecords();
				$M.toggleWait(false);
			}.bind(this), function(error) {
				$M.toggleWait(false);
				self.$.unplannedWorkPanel.toggleLoading(false);
				$M.showResponseError(error);
			});
		}.bind(this));

	},
	_getAssignmentUrl : function(){
		if(this.assignmentRecordData && this.assignmentRecordData.length>0){
			return this.assignmentRecordData[0].href;	
		} else {
			return null;
		}
	},


	/**
	 * Get Available Labors to be Assigned. This will fetch the available labors.
	 */
	findLabor : function(e) {
		this.$.unplannedWorkPanel.toggleLoading(true);
		var params = {};
		var responseProperties = null;
		var record = this.$.unplannedWorkPanelIronList.modelForElement(e.target).workorder;
		this.record = record;
		this.$.unplannedWorkResource.resourceUri=record.href;
				
  		this.$.woWithAvailableLaborCollection.collectionUri = this.$.unplannedWorkResource.resourceUri+'/uxavailablelabor.MXAPILABOR';
  		
		this.$.woWithAvailableLaborCollection.refreshRecords().then(function(availablelabor){
			var woclone = $M.cloneRecord(this.record);
			this.$.unplannedWorkPanel.toggleLoading(false);
			if(availablelabor.response.member && availablelabor.response.member.length>0){
				woclone.laborCollectionRef = this.$.woWithAvailableLaborCollection.collectionUri;
				$M.showDialog(this, woclone, null, 'maximo-assignlabor-card', false);
				$M.toggleWait(false);
			} else {
				$M.toggleWait(false);
				$M.notify(this.localize('messages', 'mxapiwodetail', 'Nolaborisavailableforassignment'), $M.alerts.warn);
			}
				
		}.bind(this));
		
//		this.$.unplannedWorkResource.updateAction('wsmethod:availableLabor', params, responseProperties).then(function(test) {
//			var myset = test;
//		});	
		
	}
	
});
