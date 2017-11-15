/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */

/*
The `maximo-allowed-states` element provides access to the list of allowed states
for a given maximo business object.  

*/
Polymer({
    is: 'maximo-allowed-states',

    /**
     * Fired when allowed states are fetched from the server.
     *
     * @event allowed-states-refresh
     */
        
    /**
     * Fired when there is a problem fetching allowed states from the server.
     *
     * @event allowed-states-refresh-error
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
      	 * A set of allowed states and their metadata that is fetched from the server.
      	 */
      	allowedStatesData: {
      		type: Array,
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
	 * Make a REST API call to the Maximo Server and fetches all allowed states (STATUS) for a Maximo Business Object
	 * based on the unique id. Upon successful retrieval fires off an event called allowed-states-refresh
	 * if successful, other wise fires off an event called allowed-states-refresh-error.
	 */
	fetchAllowedStates: function()
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

		this.$.mxajaxAllowedStates.url = this.$.myauthenticator.getBaseUri() + '/oslc/os/' + this.objectName+'/?oslc.select=allowedstates&oslc.where='+this.key+'='+'"'+this.keyValue+'"';
				
		this.$.mxajaxAllowedStates.headers = {};
		return new Promise(function (resolve, reject) {
						this.$.mxajaxAllowedStates.generateRequest().completes.then(function(result){ 
								resolve(result); 
						}, function(error) { 
								reject(error); 
						});
		}.bind(this));
	},

	
	_processAllowedStatesResponse: function(e)
	{
		this.set('allowedStatesData',e.detail.response.member[0].allowedstates);
		this.set('fullResponse',e.detail.response);
		this.fire('allowed-states-refresh');
	},
	
	_processAllowedStatesResponseError: function(e)
	{
		if ($M.checkSession(e)){
			this.fire('allowed-states-refresh-error', e.detail.request.xhr.response);
		}
	},

	
  });