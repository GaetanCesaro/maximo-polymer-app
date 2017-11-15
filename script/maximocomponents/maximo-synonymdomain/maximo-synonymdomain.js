/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */
Polymer({
    is: 'maximo-synonymdomain',  
    
	properties: {
      	domainid: {
      		type: String,
      		notify: true
      	},
      	maxvalue: {
      		type: String,
      		notify: true
      	},
      	classname: {
      		type: String,
      		notify: true
      	}
        
    }, // End of Properties
    
	ready: function()
	{
		
	},

	_isAuthenticationNeeded: function(e)
	{
		return this.$.myauthenticator.isAuthenticationNeeded();
	},

	fetchValue: function()
	{		
		if (this._isAuthenticationNeeded())
		{
			return new Promise(function (resolve, reject) {
							reject('Authentication needed');
							$M.workScape.returnToLogin();
						}.bind(this));
		}
		
		this.$.mxajaxSynonymDomain.url = this.$.myauthenticator.getBaseUri() + '/oslc/os/mxapidomain?lean=1&oslc.where=domainid="'+this.domainid+'"&oslc.select=*';
		this.$.mxajaxSynonymDomain.headers = {};
		return new Promise(function (resolve, reject) {
			this.$.mxajaxSynonymDomain.generateRequest().completes.then(function(result){ 
					resolve(result); 
			}, function(error) { 
					reject(error); 
			});
		}.bind(this));
	},
	
	_processSynonymDomainResponse: function(e)
	{
		var className = '';
		if (e.detail && e.detail.response) {
			var response = e.detail.response;
			if (response && response.member && response.member.length > 0) {
				var synonymdomain = response.member[0].synonymdomain;
				if (synonymdomain && synonymdomain.length > 0) {
					for(var idx in synonymdomain) {
						if (synonymdomain[idx].maxvalue === this.maxvalue) {
							className = synonymdomain[idx].value;
							break;
						}
					}
				}
			}
		}
		if (className.length > 0) {
			this.set('classname', className);
			this.fire('value-data-refreshed', className);
		}
		else {
			this._processSynonymDomainResponseError(e);
		}
	},
	
	_processSynonymDomainResponseError: function(e)
	{
		if ($M.checkSession(e)){
			this.fire('value-data-error', e.detail.request.xhr.response);
		}
	}
});