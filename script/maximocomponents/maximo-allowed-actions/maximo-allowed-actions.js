/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */

/*
The `maximo-allowed-actions` element provides access to the list of allowed actions
for a given maximo business object.  

*/
Polymer({
    is: 'maximo-allowed-actions',

    
    /**
     * Fired when allowed actions are fetched from the server.
     *
     * @event allowed-actions-refresh
     */
        
    /**
     * Fired when there is a problem fetching allowed actions from the server.
     *
     * @event allowed-actions-refresh-error
     */


    
	properties: {

      	/**
      	 * Name of the unique id key be used.
      	 */
      	key: {
      		type: String,
      		notify: true
      	},
      	
      	/**
      	 * Uniqueid value of an object for which the actions need to be obtained.
      	 */
      	keyValue: {
      		type: String,
      		notify: true
      	},

      	/**
      	 * A set of allowed methods and their metadata that is fetched from the server.
      	 */
      	allowedActionsData: {
      		type: Object,
      		notify: true
      	},
      	
      	/**
      	 * Complete response JSON object obtained from the server.
      	 */
      	fullResponse: {
      		type: Object,
      		notify: true
      	},

      	/**
      	 * Name of the Object Structure to be used.
      	 */
		objectName: {
	    	type: String
		},

		
    }, // End of Properties


	ready: function()
	{
	},

	/**
	 * Indicates whether authentication is needed or not.
	 */
	_isAuthenticationNeeded: function(e)
	{
		return this.$.myauthenticator.isAuthenticationNeeded();
	},

	/**
	 * Make a REST API call to the Maximo Server and fetches all allowed actions for a Maximo Business Object
	 * based on the unique id. Upon successful retrieval fires off an event called allowed-actions-refresh
	 * if successful, other wise fires off an event called allowed-actions-refresh-error.
	 */
	fetchAllowedActions: function()
	{
		if (!this.objectName && !this.key && !this.keyvalue)
		{
			return new Promise(function (resolve, reject) {
							reject('No object name defined');
						}.bind(this));
		}
		
		// Check for authentication if necessary
		if (this._isAuthenticationNeeded())
		{
			return new Promise(function (resolve, reject) {
							reject('Authentication needed');
						}.bind(this));
		}

		this.$.mxajaxAllowedActions.url = this.$.myauthenticator.getBaseUri() + '/oslc/os/' + this.objectName+'/?oslc.select=allowedactions&oslc.where='+this.key+'='+'"'+this.keyValue+'"';
				
		this.$.mxajaxAllowedActions.headers = {};
		console.log("INSIDE ---- 3");
		return new Promise(function (resolve, reject) {
						this.$.mxajaxAllowedActions.generateRequest().completes.then(function(result){ 
								resolve(result); 
						}, function(error) { 
								reject(error); 
						});
		}.bind(this));
	},

	
	_processAllowedActionsResponse: function(e)
	{
		this.set('allowedActionsData',e.detail.response.member[0].allowedactions);
		this.set('fullResponse',e.detail.response);
		this.fire('allowed-actions-refresh');
	},
	
	_processAllowedActionsResponseError: function(e)
	{
		if ($M.checkSession(e)){
			this.fire('allowed-actions-refresh-error', e.detail.request.xhr.response);
		}
	},

	
  });