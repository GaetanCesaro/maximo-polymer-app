/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-changestatus-card',
  	behaviors: [BaseComponent],
    properties: {
		record : {
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
   		label : {
   			type: String,
   			value : function(){
   				return $M.localize('uitext', 'mxapiwo', 'ChangeStatus');
   			}
   		},
   		memoPlaceholder: {
   			type: String,
   			value : function(){
   				return $M.localize('uitext', 'mxapiwo', 'Addmemo');
   			},
   			notify: true
   		}
	},

	ready : function (){
	},
	
	attached: function(){
		if (!this.record.np_statusmemo){
			 this.$.changestatus_section_texteditor.placeholder = this.memoPlaceholder;
		}
		this.enableButton();
	},
	
	/**
	 * Return string array of allowed internal status values.
	 */
	_statusList : function(record){
		var statuses = record.allowedstates;
		var externalValues=[];
		externalValues.push('');
		for (var key in statuses) {
			var valueArray = statuses[key];
			if(valueArray.length>0){
				valueArray.forEach(function(member){
					externalValues.push(member.value+':'+member.description);
				});
			}
		}
		
		return externalValues.toString();
	},
	
	/**
	 * Open the Maximo Record
	 */
	openWorkorder : function(){
		$M.openMaximoRecord('wotrack',this.record.workorderid);
	},
	
	enableButton : function(){
		var selectNode = document.getElementById('select_select');
		var me = this;
		this.$.changestatus_footer_ok.disabled = true;
		$j(selectNode[selectNode.selectedIndex]).each(function() {
			if (!$j(this).is(":disabled")) {
				me.$.changestatus_footer_ok.disabled = false;
			}
		});
		
	},
	
	/**
	 * Change Status of the current record.
	 */
	changeStatus : function () {
		
		this.toggleLoading(true);
		var self=this;	
		
		//get selected status
		var newstatus=document.getElementById('select_select');
		var status = newstatus[newstatus.selectedIndex].value;
		var record = this.record;
		
		//get current date and time
		var currentDateTime = (new Date()).toISOString();
		
		var params = {status: status, date: currentDateTime, memo: record.np_statusmemo};
		var responseProperties = 'status';
				
		//call changestatus action
		this.$.recordResource.updateAction('wsmethod:changeStatus', params, responseProperties).then(function() {
			
			//check if changing status to CLOSE
			var closeStatusObject = record.allowedstates.CLOSE;
			var compStatusObject = record.allowedstates.COMP;
			
			//join arrays together
			var statusArray = closeStatusObject.concat(compStatusObject);
				
			if(statusArray && statusArray.length>0){
				statusArray.forEach(function(internalStatus){
					if (internalStatus && internalStatus.maxvalue === status){
						//hide card when action is selected.  Once panels are refreshed card will be 
						//reloaded from server and reappear if necessary.
						if(record.id!=='taskwo_changestatus'){
							$M.hideCard(record.currentEvent.target);
						}
					}
				});
			}
			
			this.toggleLoading(false);
			$M.notify(self.localize('messages', 'mxapiwo', 'Statuschangecompletedsuccessfully',[record.wonum]), $M.alerts.info);
			//record.womaincollection.refreshRecords();
			
			this.container.close();
			this.parent.refreshContainerRecords();
		}.bind(this), function(error) {
			$M.showResponseError(error);
		});
	},
	
	/**
	 * Close the change status dialog
	 */
	close : function(){
		this.container.close();
	}
	
});
