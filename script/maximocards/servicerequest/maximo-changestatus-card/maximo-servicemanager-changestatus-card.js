/*
* Licensed Materials - Property of IBM
* 5724-U18
* Copyright IBM Corporation. 2016
*/
Polymer({
	is: 'maximo-servicemanager-changestatus-card',
  	behaviors: [BaseComponent],
    properties: {
		record : {
			type: Object,
			notify: true
		},
   		label : {
   			type: String,
   			value : function(){
   				return $M.localize('Change Status');
   			}
   		}
	},
	ready : function (){
		
	},
	/**
	 * Close Dialog.
	 */
	close : function() {
		UndoBehavior.close.call(this);
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
	 * Change Status of the current record.
	 */
	changeStatus : function () {
		this.toggleLoading(true);
		var self=this;	
		
		//get selected status
		var status = this.$.selectStatus.$.select.value;
		var record = this.record;
		
		//get current date and time
		var currentDateTime = (new Date()).toISOString();
		var memo = this.$.changestatusMemo.value;
		
		var params = {status: status, date: currentDateTime, memo:memo};
		var responseProperties = 'status';
				
		//call changestatus action
		this.$.recordResource.updateAction('wsmethod:changeStatus', params, responseProperties).then(function() {
			this.toggleLoading(false);
			$M.notify(self.localize('{0} Status change completed successfully.',[record.ticketid]), $M.alerts.info);
			
			//refresh records
			record.servicerequestcollection.refreshRecords();
			this.close();
		}.bind(this), function(error) {
			$M.showResponseError(error);
		});
	}
	
});