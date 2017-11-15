/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-worktoassign-card',
  	behaviors: [BaseComponent, HandlerWorkOrder],
  	listeners: {'fireFindLabor':'getAvailableLabors'},
    properties: {
		recordData: {
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
		selectedQueryDefaultLabel: {
			type: String,
			notify: true
		},
		selectedQueryName: {
			type: String,
			value: 'WORKTOASSIGN',
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
		}
	},
	attached: function()
	{
		this.$.worktoassign.toggleLoading(true);
	},
	
	_handleRecordDataRefreshed: function()
	{
		this.recordCount = this._getRecordCount();
		this.$.worktoassign.toggleLoading(false);
		this.$.worktoassignIronList.fire('iron-resize');
	},
	
	_laborHandleRecordDataRefreshed : function()
	{
		this.setCount = this._getRecordCount();
	},
	
	_showWODetails: function()
	{
		
	},
	
	_showLaborCraftDetails: function()
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
	
	_getRecordCount : function(){
		return this.$.wmassignmentcollection.totalCount;
	},
	
	openFindSomeoneElseCard: function (e) {
		var woclone = $M.cloneRecord(e.model.workorder);
		$M.showDialog(this, woclone, null, 'maximo-findsomeone-card', false);
	},
	
	refreshContainerRecords: function () {
		this.$.wmassignmentcollection.refreshRecords();
	},
	
	/**
	 * Assign Suggested Labor. This will assign the first labor in the list.
	 */
	assignLabor : function (e) {
		var self=this;		
		var responseProperties = '';
		//var record = this.$.maximoPanelWorktoassignTemplate.itemForElement(e.target);
		var record = this.$.worktoassignIronList.modelForElement(e.target).workorder; 
		self.scrollIndex = this.$.worktoassignIronList.firstVisibleIndex;
		this.record=record;
		var availableLaborSet = record.uxavailablelabor;
		this.$.wmAssignmentResource.resourceUri=record.href;
		
		//Display warning to user if No Available Labor exists
		if(availableLaborSet === undefined || availableLaborSet.length===0){
			$M.alert(this.localize('uitext', 'mxapiwmassignment', 'Nolaborisavailableforassignment'), $M.alerts.info);
			return;
		}
		
		//hide card when action is selected.  Once panels are refreshed card will be reloaded from server and reappear if necessary.
		//$M.hideCard(e.currentTarget);

		$M.hideCard(this, e, 'recordData'); 
		
				
		this.$.worktoassign.toggleLoading(true);
		
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
				self.$.worktoassign.toggleLoading(false);
				$M.notify(self.localize('uitext', 'mxapiwmassignment', 'WO0isassignedto1',[self.record.wonum, availableLaborSet[0].person.displayname]), $M.alerts.info);
				$M.toggleWait(false);
				self.$.wmassignmentcollection.refreshRecords().then(function(){
					self.$.worktoassignIronList.scrollToIndex(self.scrollIndex);	
				});
			}.bind(this), function(error) {
				$M.toggleWait(false);
				self.$.worktoassign.toggleLoading(false);
				$M.showResponseError(error);
				self.$.wmassignmentcollection.refreshRecords();
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
	 * Get Available Labors. This will fetch the available labors for the current assignment.
	 */
	getAvailableLabors : function(e) {
		this.$.worktoassign.toggleLoading(true);
		var record = this.$.worktoassignIronList.modelForElement(e.target).workorder; 
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
			this.$.worktoassign.toggleLoading(false);				
			var woclone = $M.cloneRecord(this.record);

			if(assignment.response.member[0] && assignment.response.member[0].uxavailablelabor && assignment.response.member[0].uxavailablelabor.length>0){
				woclone.laborCollectionRef = assignment.response.member[0].labor_collectionref;
				$M.showDialog(this, woclone, null, 'maximo-findsomeone-card', false);
				$M.toggleWait(false);
			} else {
				$M.toggleWait(false);
				$M.notify(this.localize('messages', 'mxapiwodetail', 'Nolaborisavailableforassignment'), $M.alerts.warn);
			}
		}.bind(this));
		
	},
	
	_placeCraft: function (record) {
		if (record.assignment.craftskill.description){
			return record.assignment.craftskill.description;
		}else {
			return record.assignment.craft.description;
		}
	}
});
