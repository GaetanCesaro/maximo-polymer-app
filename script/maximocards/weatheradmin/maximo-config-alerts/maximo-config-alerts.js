/*
 * Licensed Materials - Property of IBM
 *
 * 5724-U18
 *
 * (C) Copyright IBM Corp. 2016,2017 All Rights Reserved
 *
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with
 * IBM Corp.
 */

Polymer({
  is: 'maximo-config-alerts',
  behaviors: [BaseComponent],

  properties: {
    form: {
      type: Object
    },
    schema:{
    	type: Object
    },
    registerLabel:{
    	type: Object
    },
    confirmMessage:{
    	type: Object
    },
    confirmError:{
    	type: Object
    },
    regUnregLink:{
    	type: Object
    },
    readOnly:{
    	type: Boolean
    },
    recordData:{
		type: Array,
		value: []
	}, 
	password: {
		type: String,
		value: ''
	},
	clientsecret: {
	    type: String,
		value: ''
	}
  },


   _showPerilsSelect: function()
	{	
		this.set('selected',0);
	},
	
	_showEndPoints: function()
	{	
		this.set('selected',1);
	},
	
  _handleRecordDataRefreshed: function(e){
	  if (this.schema !== undefined && this.schema.properties !== undefined)
	  {
		  this.set("weatherEndPointSchema", this.schema.properties.weatherendpoint.items);
	  }
	  if (this.recordData !== undefined && this.recordData[0] !== undefined)
	  {
		  this.set('weatherEndPointData',this.recordData[0].weatherendpoint);
		  this.set("weatherEndPointUri", this.recordData[0].weatherendpoint_collectionref);
		  this.set('parentData',this.recordData[0]);
	  }
	  this._registryLabel();
	  //console.log(this.recordData);
  },
	//get schema information
	ready: function(){
		this.refresh();
		this.set('selected',0);
		this.set('iconLabel', 'Maximo:Download');
	},
	
	//get schema information
	refresh: function(){
		this.$.configalerts.refreshRecords();
	},
	
	_save: function(){
		delete this.parentData["_rowstamp"];
		
		if (this.password && this.password != '')
		{
			this.parentData.weatherendpoint[0].password = this.password;
		}
		else
		{
			delete this.parentData.weatherendpoint[0].password;
		}
		
		
		if (this.clientsecret && this.clientsecret != '')
		{
			this.parentData.clientsecret = this.clientsecret;
		}
		else
		{
			delete this.parentData.clientsecret;
		}

		this.$.dataresource.updateRecord(this.parentData)
          .then(function(result){
             this.refresh();
			 this.set('password', '');
			 this.set('clientsecret', '');
			 this.set('ConfirmMessage', this.localize('uitext','weatheradmin','SaveConfirm'));
			 this.set('ConfirmError', '');
          }.bind(this));
	},
	
	_registryLabel: function(){
		if (this.recordData !== undefined && this.recordData.length > 0){
			var reg = this.recordData[0].isregistered;
			if (reg === false){
				this.set('registerLabel', this.localize('uitext','weatheradmin','Register'));
				this.set('regUnregLink', this.localize('uitext','weatheradmin','RegisterLink'));
				this.set('readOnly', false);
				this.set('iconLabel', 'Maximo:Upload');
			}
			else{
				this.set('registerLabel', this.localize('uitext','weatheradmin','Unregister'));
				this.set('regUnregLink', this.localize('uitext','weatheradmin','UnRegisterLink'));
				this.set('readOnly', true);
				this.set('iconLabel', 'Maximo:Download');
			}
		}
	},
	
	_processEndPointsRegistry: function(){
		var reg = this.parentData.isregistered;
		var url = this.parentData.href;
		if (reg === true){
			url = url + "?action=wsmethod:registryEndPointsForAlerts&register=0";
		}
		else{
			url = url + "?action=wsmethod:registryEndPointsForAlerts&register=1";
		}
		this.set('registerResourceUri',url);

		this.$.registerResource.loadRecord().then(function(refresh){
			if (reg === true){
				this.set('ConfirmMessage', this.localize('uitext','weatheradmin','UnregisterConfirm'));
				this.set('ConfirmError', '');
				this.set('registerLabel', this.localize('uitext','weatheradmin','Unregister'));
				this.set('iconLabel', 'Maximo:Download');
			}
			else{
				this.set('ConfirmMessage', this.localize('uitext','weatheradmin','RegisterConfirm'));
				this.set('ConfirmError', '');
				this.set('registerLabel', this.localize('uitext','weatheradmin','Register'));
				this.set('iconLabel', 'Maximo:Upload');
			}
        this.refresh();
		}.bind(this));
	},
	_handleRecordDataError: function(e)
	{
		var errorMessage = e.detail.request.xhr.response.Error.message;
		this.set('ConfirmError', errorMessage);
		this.set('ConfirmMessage', '');
	}
});
