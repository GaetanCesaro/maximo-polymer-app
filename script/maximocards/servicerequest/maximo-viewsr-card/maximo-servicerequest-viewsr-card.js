/*
* Licensed Materials - Property of IBM
* 5724-U18
* Copyright IBM Corporation. 2016
*/
Polymer({
	is: 'maximo-servicerequest-viewsr-card',
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
		srRecordData: {
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
			value: 'SERVICEREQUEST',
			notify: true,
			observer: '_selectedQueryNameChanged'
		},
		srFilterData: {
			type: Object,
			value: null,
			notify: true
		}
	},
		
	srEdit : function(e) {
		//this.filterWorkOrderID = e.model.wmassignment.workorderid;
		this.$.servicerequestcollection.refreshRecords().then(function(){
			var sreditclone = $M.cloneRecord(e.model.sr);
			sreditclone.servicerequestcollection = this.$.servicerequestcollection;
			$M.showDialog(this, sreditclone, null, 'maximo-sredit-card', false);
		}.bind(this));
	},
	changeStatus : function(e) {
		this.filterTicketID = e.model.sr.ticketid;
		this.$.oneservicerequestcollection.refreshRecords().then(function(){
			if (this.srRecordData && this.srRecordData.length > 0) {
				var srclone = $M.cloneRecord(this.srRecordData[0]);
				srclone.servicerequestcollection = this.$.servicerequestcollection;
				$M.showDialog(this, srclone, null, 'maximo-changestatus-card', false);
			}
		}.bind(this));
	},
	
	srDetail : function(e) {
		var srclone = $M.cloneRecord(e.model.sr);
		$M.showDialog(this, srclone, null, 'maximo-srdetail-card', false);
	},
	
	ready: function()
	{
		this.$.viewsr.toggleLoading(true);
	},
	
	_handleRecordDataRefreshed: function()
	{
		this.recordCount = this._getRecordCount();
		this.$.viewsr.toggleLoading(false);
	},
	
	_selectedQueryNameChanged : function()
	{
		
	},
	_mountCompletionString : function (record) {
	
		if (record.changedate){
			return $M.localize('{0} ago',[this.calcDifference(record.changedate)]);
		}
		else {
			return '';
		}
	},
	calcDifference : function (referencePeriod) {
		
		var difference = '';
		var oneMinute=1000*60;
		var oneHour=oneMinute*60;
		var oneDay=oneHour*24;
		//var oneWeek=oneDay*7;
		
		if (referencePeriod) {
			var msecs = Date.parse(referencePeriod);
			var completionDate = new Date(msecs);
			var nowDate = new Date();
			
			var msecsDiff = nowDate.getTime() - completionDate.getTime();
			var value = 1;
			
//			if (msecsDiff >= oneWeek) {
//				value = Math.round(msecsDiff/oneWeek);
//				difference = value.toString() + ' week';
//			}else 
			if (msecsDiff >= oneDay) {
				value = Math.round(msecsDiff/oneDay);
				difference = value.toString() + ' day';
			}else if (msecsDiff >= oneHour){
				value = Math.round(msecsDiff/oneHour);
				difference = value.toString() + ' hour';
			}else if (msecsDiff >= oneMinute) {
				value = Math.round(msecsDiff/oneMinute);
				difference = value.toString() + ' minute';
			}else {
				value = 1;
				difference = '1 minute';
			}
			
			if (value > 1) {
				difference = difference + 's';
			} 
		}
		
		return difference;
	},
	_getRecordCount : function(){
		return this.$.servicerequestcollection.totalCount;
	},
	/**
	 * Hide priority section if no priority is defined on the record.
	 */
	showPriority: function(sr){
		if(sr.reportedpriority){
			return false;
		} else {
			return true;
		}
	},
	showPriorityTag: function(sr, type){
		var priority = sr[type];
		var priorityName;

		switch (priority) {
		  case 3    : priorityName = 'Medium';
		              break;
		  case 2    : priorityName = 'High';
		              break;
		  case 1    : priorityName = 'Urgent';      
                      break;
		  default   : priorityName = 'Low';
          			  break;		  
		}

		return  priorityName;
	},
	refreshContainerRecords: function () {
		this.$.servicerequestcollection.refreshRecords();
	},
	onSelectedStatus: function(e) {
		
		if(e.currentTarget) {
			this.$.viewsr.toggleLoading(true);
			var intvalue = e.currentTarget.attributes.getNamedItem('intvalue');
			if (intvalue.value === 'All') {
				this.srFilterData = [];
	  		} else {
	  			
	  			this.srFilterData = [{filtertype : 'SIMPLE', field : 'STATUS', availablevalues : [{value : intvalue.value, selected : true}]}];	
	  		}
		}
		this.$.servicerequestcollection.refreshRecords();
	},
	
	
	_handleCleanSRRecordDataRefreshed : function (){
		
	},
	_handleDataError : function(e){
		this.$.viewsr.toggleLoading(false);
		$M.alert(e.detail.error.message);
	},
	selectOwner : function(e){
		var srclone = $M.cloneRecord(e.model.sr);
		$M.showDialog(this, srclone, null, 'maximo-srselectowner-card', true);
	}
});
