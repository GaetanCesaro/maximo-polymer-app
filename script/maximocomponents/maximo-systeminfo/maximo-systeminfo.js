/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */

(function() {

  Polymer({
    is: 'maximo-systeminfo',

	properties: {


      	/**
      	 * A flag to indicate if the collection data need to be automatically
      	 * refreshed upon some property changes or not.
      	 * Defaults to true. If set to false, expicitly refresh methods need to be called.
      	 */
      	auto: {
      		type: Boolean,
      		value: true,
      		observer:'_autoChanged'
      	},


      	/**
      	 * Actual data retrieved from the server.
      	 * Note that only one page (based on pageSize) worth of data at a time is retrieved.
      	 */
      	systemData: {
      		type: Object,
      		notify: true,
      		value:{}
      	},


      	/**
      	 * A lean mode used for specifying tha attribute names. When leanMode is set to false,
      	 * the attribute names are expected to be in oslc namespace prefix format as defined
      	 * by the object structure.
      	 *
      	 * Defaults to true.
      	 */
      	leanMode: {
      		type: Boolean,
      		value: true
      	}


    }, // End of Properties

    // Listeners
   /* listeners: {
    	// event sent as part of a successful login
        'refresh-data': '_handleLoginRefresh'
    },*/

	ready: function()
	{
		
	},

	/**
	 * Called as part of a successful login, if the collection component is used
	 * within an app component. This call takes care of fetching the data automatically
	 * as soon as the login happens.
	 */
	/*_handleLoginRefresh: function(e)
	{
		if (this.auto == true)
		{
			if (!this.systemData)
			{
				this.refreshSystemData().then(function(result){}, function(error) {});
			}
		}
	},*/

	_autoChanged: function(e)
	{
		if(this.auto === true)
		{
			this.refreshSystemData().then(function(result){
				console.log(result);
				},
				function(reject){});
		}
	},


	/**
	 * Indicates whether authentication is needed or not.
	 */
	_isAuthenticationNeeded: function(e)
	{
		return this.$.myauthenticator.isAuthenticationNeeded();
	},

	/**
	 * Returns the Service provider URL for fetchhing query and creation uri information.
	 */
	_getSystemInfoURL: function()
	{
		var serviceProviderURL = this.$.myauthenticator.getBaseUri() + '/oslc/systeminfo?lean=1';
		return serviceProviderURL;
	},

	/**
	 * Refreshes the Service Provider data associated with the object name.
	 * The Service Provider data currently includes the list of public queries
	 * (which include the query name and the query URL) and creation URL to create
	 * new records.
	 * This method returns a Promise. The promise is resolved when the service provider data
	 * is updated successfully, otherwise the promise is rejected with an error.
	 */
	refreshSystemData: function()
	{
		// If authentication is needed, just return.
		if (this._isAuthenticationNeeded())
		{
			return new Promise(function (resolve, reject) {
							reject(Error('Authentication needed'));
						}.bind(this));
		}

		this.$.mxajaxSystemInfo.url = this._getSystemInfoURL();
		this.$.mxajaxSystemInfo.headers = {};
		this.$.mxajaxSystemInfo.generateRequest();


		return new Promise(function (resolve, reject) {
						this.resolverefreshSystemInfoDataPromise = resolve;
						this.rejectrefreshSystemInfoDataPromise = reject;
					}.bind(this));

	},

	/**
	 * Processes the service provider result returned as part of a REST API call
	 * to get Service Provider data for the domain associated with the domain uri.
	 */
	_processSystemInfoResponse: function(e)
	{
		// update the service provider data retrieved for the domainURI
		//Anamitra
		//globalServiceProvider.setServiceProviderData(this.domainUri, e.detail.response);

		// update the query and creation information
		var resp = e.detail.response;
		var lsystemData = {};
		lsystemData.appserver = resp.appServer;
		lsystemData.dbinfo = resp.database.dbProductName+' '+resp.database.dbMajorVersion+'.'+resp.database.dbMinorVersion+' ('+resp.database.dbVersion+')';
		lsystemData.appversion = resp.appVersion.member;
		lsystemData.osinfo = resp.os.osName+' '+resp.os.osVersion+' '+resp.os.architecture;

		this.systemData = lsystemData;
		this.resolverefreshSystemInfoDataPromise(this.systemData);
		//this.set('systemData',this.systemData);
		//this.fire('system-data-fetched',this.systemData);
	},

	/**
	 * Processes the error as a result of service provider REST API call.
	 */
	_processSystemInfoResponseError: function(e)
	{
		// reject promise
		this.rejectrefreshSystemInfoDataPromise(e.detail);

		this.fire('data-error', e.detail);
	},

	/**
	 * Returns an array list of query information.
	 * Each array element includes a query information that has name and URL.
	 */
	getSystemData: function()
	{
		return this.systemData;
	},


  });


})();