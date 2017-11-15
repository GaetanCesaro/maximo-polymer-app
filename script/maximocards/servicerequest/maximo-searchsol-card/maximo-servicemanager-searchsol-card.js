/*
* Licensed Materials - Property of IBM
* 5724-U18
* Copyright IBM Corporation. 2016
*/
Polymer({
	is: 'maximo-servicemanager-searchsol-card',
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
		},
		record :{
			type: Object,
			notify: true
		}
	},
	solutionDetail : function(e) {
		 
			var solclone = $M.cloneRecord(e.model.sol);
			solclone.searchsolutioncollection = this.$.searchsolutioncollection;
			$M.showDialog(this, solclone, null, 'maximo-servicemanager-solutiondetail-card', false);

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
	onSelectedSolutionStatus: function(e) {
		
		if(e.currentTarget) {
			this.$.searchsol.toggleLoading(true);
			var intvalue = e.currentTarget.attributes.getNamedItem('intvalue');
			if (intvalue.value === 'ALL') {
				this.srFilterData = [];
	  		} else {
	  			
	  			this.srFilterData = [{filtertype : 'SIMPLE', field : 'STATUS', availablevalues : [{value : intvalue.value, selected : true}]}];	
	  		}
		}
		this.$.searchsolutioncollection.refreshRecords();
	},
	refreshContainerRecords: function () {
		this.$.searchsolutioncollection.refreshRecords();
	},
	_getSolutionUrl : function(e){
		if(this.recordData && this.recordData.length>0){
			return this.recordData[0].href;	
		} else {
			return null;
		}
	},
	checkSelfAccess: function (value) {
		if(value){
			return true;
		}
		return false;
	},
	changeSelfAccess: function (e) {
		this.toggleLoading(true);
		var value = e.model.sol.selfservaccess;
		var self=this;
		//get selected data
		
		//get changed data
		// TODO : change json format for affectedperson and asset description
		var currentDateTime = (new Date()).toISOString();  //  {'Ids':[{'Id1':'2'},{'Id2':'2'}]}
		var params = {selfservaccess : !value, changedate : currentDateTime};
		var responseProperties = 'description';
		this.$.recordResource.resourceUri = e.model.sol.href;		
		//call changestatus action
		this.$.recordResource.updateRecord(params, responseProperties, true).then(function() {
			
			
			this.toggleLoading(false);
			if(value){
				$M.notify(self.localize('{0} Self-Service Access blocked',[e.model.sol.solution]), $M.alerts.info);
			}
			else {
				$M.notify(self.localize('{0} Self-Service Access enabled',[e.model.sol.solution]), $M.alerts.info);
			}
			this.$.searchsolutioncollection.refreshRecords();	
//			this.parent.refreshContainerRecords();
		}.bind(this), function(error) {
			$M.showResponseError(error);
		});
		
	}
	
});
