/*
* Licensed Materials - Property of IBM
* 5724-U18
* Copyright IBM Corporation. 2016
*/
Polymer({
	is: 'maximo-srhistory-card',
  	behaviors: [BaseComponent],
    properties: {
		record : {
			type: Object,
			notify: true,
			observer: 'filterticketid'
		},
   		label : {
   			type: String,
   			value : function(){
   				return $M.localize('Service Requeset History');
   			}
   		},
   		selectedRecord: {
			type: Object,
			notify: true
		},
		srHistoryData :{
			type: Object,
			notify:true
		},
		srOwnerHistoryData :{
			type: Object,
			notify:true
		},
		tkFilterData: {
			type: Object,
			value: null,
			notify: true
		},
		tkOwnerFilterData: {
			type: Object,
			value: null,
			notify: true
		},
		
	},
	_selectedHistoryQueryNameChanged : function(){
		
	},
	ready : function (){	
		
	},

	filterticketid : function(){
		var ticketid = this.record.ticketid;
		this.tkFilterData = [{filtertype : 'SIMPLE', field : 'TICKETID', availablevalues : [{value : ticketid, selected : true}]},
		                     {filtertype : 'SIMPLE', field : 'CLASS', availablevalues : [{value : 'SR', selected : true}]}];	
	/*	this.tkOwnerFilterData = [{filtertype : 'SIMPLE', field : 'TICKETID', availablevalues : [{value : ticketid, selected : true}]},
		                     {filtertype : 'SIMPLE', field : 'CLASS', availablevalues : [{value : 'SR', selected : true}]}];	
		
	*/	
		this.$.tkstatuscollection.refreshRecords();
		this.$.tkownercollection.refreshRecords();

	},
	close : function() {
		UndoBehavior.close.call(this);
	},
	
	_showTicketDetails : function(){
		
	},
	_handleDataError : function(e){
		$M.alert(e.detail.error.message);
	},
	_handleRecordDataRefreshed: function()
	{
		this.$.tkstatuscollection.refreshRecords();
		this.$.tkownercollection.refreshRecords();
	},
	_getHistoryUrl : function(e){
		if(this.srOwnerHistoryData && this.srOwnerHistoryData.length>0){
			return this.srOwnerHistoryData[0].href;	
		} else {
			return null;
		}
	},
	_getStatusUrl : function(e){
		if(this.srHistoryData && this.srHistoryData.length>0){
			return this.srHistoryData[0].href;	
		} else {
			return null;
		}
	}
	
});