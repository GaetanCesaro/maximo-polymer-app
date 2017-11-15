/*
* Licensed Materials - Property of IBM
* 5724-U18
* Copyright IBM Corporation. 2016
*/
Polymer({
	is: 'maximo-servicemanager-ownerlist-card',
  	properties : {
  		personData: {
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
			value: 'MYTEAMLIST',
			notify: true,
			observer: '_selectedQueryNameChanged'
		},
		record : {
			type: Object,
			notify: true,
		},
		label : {
   			type: String,
   			value : function(){
   				return $M.localize('Select Owner');
   			}
   		}
	},
  	
  	behaviors: [BaseComponent],
	  	
  	  	
  	
  	/**
  	 * Start loading widget
  	 */
  	attached : function(){
  		this.$.myteamlist.toggleLoading(true);
  	},
  	  	
  	/**
  	 * Close loading widget
  	 */
  	_handleRecordDataRefreshed: function()
	{
  		this.recordCount = this._getRecordCount();
		this.$.myteamlist.toggleLoading(false);
		
	},
	
	_getRecordCount : function(){
		return this.$.personcollection.totalCount;
	},
	
	
	
	/**
	 * Set Not Available (N/A) if label info is empty.
	 */
	setLabel : function(data){
		if(data && data!==''){
			return data;
		} else {
			return $M.getNoDataString();
		}
	},
	
	_selectedQueryNameChanged : function()
	{
		
	},
		
	disableLink : function(record,data){
		var isMobile = this.isMobile();
		var phone = record.phone.phonenum;
		var sms = record.primarysms;
		var emailaddress = record.email.emailaddress;
		
		switch(data){
			case 'primarysms':
				data = sms;
				break;
			case 'phonenum':
				data = phone;
				break;
			case 'emailaddress':
				data = emailaddress;
				break;
		}
				
		if(!data || data===''){
			return true;
		} else {
			//if on desktop and phone or SMS is populated, disable link.
			if(!isMobile && ((phone && data===phone) ||  (sms && data===sms))){
				return true;
			}else if (isMobile){
				return false;
			} else {
				return false;
			}
		}	
	},
	
	isMobile : function() {
	    return navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i);
	},
	
	onSelectOwner : function(e) {
		this.toggleLoading(true);
		var self=this;
		var params;
		var owner = e.model.owner.personid;
		var currentDateTime = (new Date()).toISOString();  //  {'Ids':[{'Id1':'2'},{'Id2':'2'}]}
		
		
		var responseProperties = 'description';
		this.$.ticketResource.resourceUri = this.record.href;	
		if(this.record.status!=='RESOLVED')
		{
			params = {owner: owner, changedate: currentDateTime, status:'QUEUED'};
			this.$.ticketResource.updateRecord(params, responseProperties, true).then(function() {	
				this.toggleLoading(false);
				$M.notify(self.localize('{0} Owner Selection completed successfully.',[this.record.ticketid]), $M.alerts.info);
				this.parent.refreshContainerRecords();
			}.bind(this), function(error) {
				$M.showResponseError(error);
			});
			UndoBehavior.close.call(this);
		}
		else{
			params = {owner: owner, changedate: currentDateTime};
			this.$.ticketResource.updateRecord(params, responseProperties, true).then(function() {	
				this.toggleLoading(false);
				$M.notify(self.localize('{0} Owner Selection completed successfully.',[this.record.ticketid]), $M.alerts.info);
				this.parent.refreshContainerRecords();
			}.bind(this), function(error) {
				$M.showResponseError(error);
			});
			UndoBehavior.close.call(this);
		}
	},
	showCurrentOwner : function(record){
		if(record.owner===null){
			return 'Current Owner : Not Entered';
		}
		else{
			return 'Current Owner : '+' '+this.record.owner;
		}
	},
	
});