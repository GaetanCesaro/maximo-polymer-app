/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-worktoclose-card',
  	behaviors: [BaseComponent,HandlerWorkOrder],
  	listeners: {'fireCloseWork': 'closeWO',
  		'toggleCollapsible': 'toggleSection',
  		'readyForResize':'resizeCollapsible'},
    properties: {
		recordData: {
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
			value: 'WORKTOCLOSE',
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
		
		percentage : {
			type: String,
			value: 100,
			notify: true
		},
		
		period : {
			type: String,
			value: function() {
				return 'one day';
			}
		}	
	},
	attached: function()
	{
		this.$.maximoWorkToClose.toggleLoading(true);
	},
	
	_handleRecordDataRefreshed: function()
	{
		this.recordCount = this._getRecordCount();
		this.$.maximoWorkToClose.toggleLoading(false);
		this.$.worktoclosesectionIronList.fire('iron-resize');
	},
	
	_showWODetails: function()
	{
		
	},
	
	_selectedQueryNameChanged : function()
	{
		
	},
	
	_mountCompletionString : function (record) {
		
		var change;
		if (record.changeby) {
			change = $M.localize ('uitext', 'mxapiwodetail', 'by0',[record.changeby]);
		}
		
		var status;
		if (record.statusdate){
			status = $M.localize('uitext', 'mxapiwodetail', '0ago',[this.calcDifference(record.statusdate)]);
		}
		
		if (change && status){
			return $M.localize('uitext', 'mxapiwodetail', 'Set01',[change, status]);
		}else if(change){
			return $M.localize('uitext', 'mxapiwodetail', 'Set0',[change]);
		}else if(status){
			return $M.localize('uitext', 'mxapiwodetail', 'Set0',[status]);
		}else {
			return '';
		}
	},
	
	calcDifference : function (referencePeriod) {
		
		var difference = '';
		var unit;
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
//				difference = value.toString();
				unit = 'time_unit_day';
			}else if (msecsDiff >= oneHour){
				value = Math.round(msecsDiff/oneHour);
//				difference = value.toString();
				unit = 'time_unit_hour';
			}else if (msecsDiff >= oneMinute) {
				value = Math.round(msecsDiff/oneMinute);
//				difference = value.toString();
				unit = 'time_unit_minute';
			}else {
				value = 1;
				unit = 'time_unit_minute';
			}
			
			if (value > 1) {
				unit += 's';
			}
			difference = $M.localize('uitext', 'mxapibase', unit, [value.toString()]);
		}
		
		return difference;
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
		return this.$.womaincollection.totalCount;
	},
	
	/**
	 * Change Status of the current record to "CLOSED"
	 */
	closeWO : function (e) {
		
		var self=this;				
		var record = this.$.worktoclosesectionIronList.modelForElement(e.target).workorder;
		var closeStatusObject = record.allowedstates.CLOSE;
		
		if(closeStatusObject && closeStatusObject.length>0){
			this.$.maximoWorkToClose.toggleLoading(true);
			var closedStatus = closeStatusObject[0].value;
			var params = {status: closedStatus};
			var responseProperties = 'status';
			
			this.$.woCloseResource.resourceUri=record.href;
			
			//call changestatus action
			this.$.woCloseResource.updateAction('wsmethod:changeStatus', params, responseProperties).then(function() {
				
				//hide card when action is selected.  Once panels are refreshed card will be 
				//reloaded from server and reappear if necessary.
				//$M.hideCard(e.target);
				//$M.hideCard(self, e, 'recordData');
				self.$.womaincollection.refreshRecords().then(function(){
					self.$.maximoWorkToClose.toggleLoading(false);
					$M.notify(self.localize('messages', 'mxapiwodetail', 'Theworkorder0wasclosed',[record.wonum]), $M.alerts.info);
					$M.toggleWait(false);
					self.$.worktoclosesectionIronList.fire('iron-resize');
				})
			}.bind(this), function(error) {
				$M.showResponseError(error);
				this.$.maximoWorkToClose.toggleLoading(false);
				$M.toggleWait(false);
				self.$.womaincollection.refreshRecords();
			}.bind(this));
		} else {
			this.$.maximoWorkToClose.toggleLoading(false);
			$M.toggleWait(false);
			$M.notify(self.localize('messages', 'mxapiwodetail', 'Thestatuscannotbechangedfortheselectedre',[record.wonum]), $M.alerts.warn);
			
		}
		
	},
	
	/**
	 * Display "maximo-workorderdetails-card" dialog when "More Info" is selected.
	 */
	moreInfo : function(e) {
		var woclone = $M.cloneRecord(e.model.workorder);
		$M.showDialog(this, woclone, null, 'maximo-workorderdetails-card', false);
	},
	
	/**
	 * Handle "maximo-workorderdetails-card" dialog OK button.
	 */
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
	
	toggleSection: function(e) {
		//Despite collapsed is false it's on its opening process
		if (!e.detail.collapsed){
			$j(e.target).find('maximo-worktoclose-details-card').get(0).loadDetails(e);
		}
	},
	
	resizeCollapsible: function(e) {
		
		var collapsible = $j(e.target).closest('maximo-collapsible').get(0);
		var upperDivHeight = $j(collapsible).find('div[name="wo-inner-section"]').get(0).scrollHeight;
		var lowerDivHeight = $j(e.target).find('div[name="wod-inner-section"]').get(0).scrollHeight;
		var height;
		if (upperDivHeight && lowerDivHeight){
			height = upperDivHeight+lowerDivHeight+10;
		}
		
		collapsible.resizeCollapsible(height);

	}
	
});
