/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */
/*
A system property component.
 */
Polymer({
    is: 'maximo-systemproperty',  
    
	properties: {
      	propertyName: {
      		type:String,
      		notify:true
      	},
      	
      	propertyValue: {
      		notify:true
      	}
        
    }, // End of Properties
    
	ready: function()
	{
		
	},

	_isAuthenticationNeeded: function(e)
	{
		return this.$.myauthenticator.isAuthenticationNeeded();
	},

	fetchProperty: function(propertyName)
	{		
		if (this._isAuthenticationNeeded())
		{
			return new Promise(function (resolve, reject) {
							reject('Authentication needed');
							$M.workScape.returnToLogin();
						}.bind(this));
		}
		
		if(propertyName)
		{
			this.set('propertyName',propertyName);
		}
		
		this.$.mxajaxSystemProperty.url = this.$.myauthenticator.getBaseUri() + '/oslc/service/system?action=wsmethod:getProperty&propName=' + this.propertyName;
		this.$.mxajaxSystemProperty.headers = {};
		
		return new Promise(function (resolve, reject) {
						this.$.mxajaxSystemProperty.generateRequest().completes.then(function(result){ 
								resolve(result); 
						}, function(error) { 
								reject(error); 
						});
		}.bind(this));
	},
	
	_processSystemPropertyResponse: function(e)
	{
		this.set('propertyValue',e.detail.response.return);
		this.fire('property-data-refreshed',e.detail.response.return);
	},
	
	_processSystemPropertyResponseError: function(e)
	{
		if ($M.checkSession(e)){
			this.fire('property-data-error', e.detail.request.xhr.response);
		}
	},
	
	setProperty: function(propertyName,propertyValue)
	{		
		if (this._isAuthenticationNeeded())
		{
			return new Promise(function (resolve, reject) {
							reject('Authentication needed');
							$M.workScape.returnToLogin();
						}.bind(this));
		}
		
		if(propertyName)
		{
			this.set('propertyName',propertyName);
		}
		
		var propertyBody = {};
		propertyBody.propName = propertyName;
		propertyBody.serverName = "COMMON";
		propertyBody.propValue = propertyValue;
		
		this.$.mxajaxSetSystemProperty.url = this.$.myauthenticator.getBaseUri() + '/oslc/service/system?action=wsmethod:setProperty';
		this.$.mxajaxSetSystemProperty.headers = {};
		this.$.mxajaxSetSystemProperty.contentType = 'application/json';
		this.$.mxajaxSetSystemProperty.method='POST';
		this.$.mxajaxSetSystemProperty.body=JSON.stringify(propertyBody);
		
		return new Promise(function (resolve, reject) {
						this.$.mxajaxSetSystemProperty.generateRequest().completes.then(function(result){ 
								resolve(result); 
						}, function(error) { 
								reject(error); 
						});
		}.bind(this));
	},
	
	_processSetSystemPropertyResponse: function(e)
	{
		this.fire('set-property-data');
	},
	
	_processSetSystemPropertyResponseError: function(e)
	{
		if ($M.checkSession(e)){
			this.fire('property-data-error', e.detail.request.xhr.response);
		}
	},
});