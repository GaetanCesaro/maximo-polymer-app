/*
* Licensed Materials - Property of IBM
* 5724-U18
* Copyright IBM Corporation. 2016
*/
Polymer({
	is: 'maximo-sredit-card',
  	behaviors: [BaseComponent],
    properties: {
		record : {
			type: Object,
			notify: true
		},
		priority : {
			type: Object,
			notify: true
		},
		recordData: {
			type: Object,
			notify: true		
   		},
   		recordIndex: {
   			type: Number,
   			value : 0
   		},
   		reportedpriority: {
			type: Number,
			notify: true,
		},
   		label : {
   			type: String,
   			value : function(){
   				return $M.localize('Edit Service Request');
   			}
   		}
	},
	ready : function() {
	},
	getCheckedP1: function (){
		if (this.record.reportedpriority === 4) {
			return true;
		}
		return false;
	},
	getCheckedP2: function (){
		if (this.record.reportedpriority === 3) {
			return true;
		}
		return false;
	},
	getCheckedP3: function (){
		if (this.record.reportedpriority === 2) {
			return true;
		}
		return false;
	},
	getCheckedP4: function (){
		if (this.record.reportedpriority === 1) {
			return true;
		}
		return false;
	},
	/**s
	 * Close Dialog.
	 */
	close : function() {
		UndoBehavior.close.call(this);
	},
	changeSR : function () {
		this.toggleLoading(true);
		var self=this;	
		//get selected data
		//var status = this.$.selectStatus.$.select.value;
		var ticketid = this.$.sredit_ticketid.value;
		var reportedby = this.$.sredit_reportedby.value;
		var affectedperson = this.$.sredit_affectedperson.value;
		var assetnum = this.$.sredit_assetnum.value;
		var assetdesc = this.$.sredit_assetdesc.value;
		var summary = this.$.sredit_summary.value;
		var detail = this.$.sredit_detail.value;
		var record = this.record;
		var priority = this.reportedpriority;
		
		//get changed data
		// TODO : change json format for affectedperson and asset description
		var currentDateTime = (new Date()).toISOString();  //  {'Ids':[{'Id1':'2'},{'Id2':'2'}]}
		var params = {ticketid : ticketid, reportedby : reportedby, affectedperson: affectedperson, assetnum : assetnum, description: summary, description_longdescription : detail, reportdate: currentDateTime, reportedpriority : priority};
		var responseProperties = 'description';
				
		//call changestatus action
		this.$.recordResource.updateRecord(params, responseProperties, true).then(function() {
			
			
			this.toggleLoading(false);
			$M.notify(self.localize('Edit completed successfully.',[record.ticketid]), $M.alerts.info);
			record.servicerequestcollection.refreshRecords();
			
			this.close();
//			this.parent.refreshContainerRecords();
		}.bind(this), function(error) {
			$M.showResponseError(error);
		});
	},
	_selectLowReportedPriority: function(e)
	{
		console.log('basicReportedPriority selected!');
		this.reportedpriority = 4;		
	},
		
	_selectMediumReportedPriority: function(e)
	{
		console.log('minorReportedPriority selected!');
		this.reportedpriority = 3;
	},
		
	_selectHighReportedPriority: function(e)
	{
		console.log('majorReportedPriority selected!');
		this.reportedpriority = 2;
	},
	_selectUrgentReportedPriority: function(e)
	{
		console.log('UrgentReportedPriority selected!');
		this.reportedpriority = 1;
	}
});