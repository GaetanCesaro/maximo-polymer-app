/*
* Licensed Materials - Property of IBM
* 5724-U18
* Copyright IBM Corporation. 2016
*/
Polymer({
	is: 'maximo-servicerequest-searchsol-card',
  	behaviors: [BaseComponent],
    properties: {
		recordData: {
			type: Object,
			notify: true
		},
		selectedRecord: {
			type: Object,
			notify: true
		},
		recordCount: {
			type: String,
			value: 0,
			notify: true
		},
		selectedQueryName: {
			type: String,
			value: 'servicerequest',
			notify: true,
			observer: '_selectedQueryNameChanged'
		},
		srFilterData: {
			type: Object,
			value: null,
			notify: true
		},
		searchTermValue: {
			type: String,
			notify: true
		}
	},
	solutionDetail : function(e) {
		 
			var solclone = $M.cloneRecord(e.model.sol);
			solclone.searchsolutioncollection = this.$.searchsolutioncollection;
			$M.showDialog(this, solclone, null, 'maximo-solutiondetail-card', false);

	},
	_addResolved : function(e)
	{
		this.$.searchsol.toggleLoading(true);
		var serviceRequest = {};
		serviceRequest.siteid = $M.userInfo.locationsite;
		serviceRequest.orgid = $M.userInfo.locationorg;
		serviceRequest.reportedby = $M.userInfo.personid;
		serviceRequest.reportdate = new Date();
		serviceRequest.affectedperson = $M.userInfo.personid;
		serviceRequest.description = e.model.sol.description;
		serviceRequest.description_longdescription = e.model.sol.description;
		//assume that solution-brought sr's reported priority is LOW
		serviceRequest.reportedpriority = 4;
		serviceRequest.status = 'RESOLVED';
		if (this.selectedRecord)
		{
			serviceRequest.assetnum = this.selectedRecord.assetnum;
		}
		if (this.selectedLocationRecord)
		{
			serviceRequest.location = this.selectedLocationRecord.location;
		}
		
		this.$.helpfulcollection.createRecord(serviceRequest, 'ticketid,description');
	},
	_handleRecordCreationSuccess: function(e)
	{
		e.stopPropagation();
		
		// show a message that record is created successfully
		// switch the user to page 0
		console.log('handleRecordCreationSuccess called! details = ' + e.detail);
		
		this.createdRecordResponse = e.detail; 	
		this.createdSRHref = e.detail.href;
		this.$.searchsol.toggleLoading(false);
		this.fire('record-create-refresh', this.createdRecordResponse);
		$M.notify(this.localize('SR creation completed successfully.'), $M.alerts.info);
		
	},
	_handleRecordCreationDiscard: function(){
		this.fire('record-create-refresh', this.createdRecordResponse);
	},
	
	_handleRecordCreationFailure: function()
	{
		console.log('_handleRecordCreationFailure called.');
	},
	ready: function()
	{
		this.$.searchsol.toggleLoading(true);
	},
	
	_handleRecordDataRefreshed: function()
	{
		this.recordCount = this._getRecordCount();
		this.$.searchsol.toggleLoading(false);
	},	
	_showSolutionDetails: function()
	{
		
	},
	
	_selectedQueryNameChanged : function()
	{
		
	},
	dialogOk: function(){
	
	},
	buildStyle: function(workorder,type){
		
	},
	_getRecordCount : function(){
		return this.$.searchsolutioncollection.totalCount;
	},
	
	refreshContainerRecords: function () {
		this.$.searchsolutioncollection.refreshRecords();
	}
});
