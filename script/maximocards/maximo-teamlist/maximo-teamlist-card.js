/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({

	is: 'maximo-teamlist-card',
	
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
		}
	},
  	
  	behaviors: [BaseComponent],
	
  	listeners: {'toggle': 'formatContactData'},
  	  	
  	
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
	 * Send an Email to selected user.
	 */
	sendEmail : function(e){
		var record = this.$.myteamlistIronList.modelForElement(e.target).record;
		var email = record.email.emailaddress;
		
		if (email===''){
			return;
		}
		
		var link = 'mailto:'+email;
		window.location.href = link;		
	},
	
	/**
	 * Send a text message to selected user.
	 */
	sendSMS : function(e){
		var record = this.$.myteamlistIronList.modelForElement(e.target).record;
		var sms = record.primarysms;

		if (sms===''){
			return;
		}
		var link = 'sms:+'+sms;
		window.location.href = link;		
	},

	/**
	 * Call a selected user.
	 */
	makeCall : function(e){
		var record = this.$.myteamlistIronList.modelForElement(e.target).record;
		var phone = record.phone.phonenum;
		
		if (phone===''){
			return;
		}
		var link = 'tel:'+phone;
		window.location.href = link;		
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
	
	formatContactData: function(e) {
		
		if (!e.detail.opened){
			return;
		}
		
		var record = this.$.myteamlistIronList.modelForElement(e.target).record;
		var that = this;
		
		$j(e.target).find('maximo-button').each(function(ind, element){
			var name = $j(element).attr('name').split('-');
			if ( that.disableLink(record, name[0]) ){
				$j(element).attr('disabled','true');
			}
		});
		
	}

	
});
