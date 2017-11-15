/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */
/*
The `maximo-resource` element provides access to the details of a maximo business object.

Use the maximo-resource component when an application has a need to fetch more details or 
manipulate a record related to an Object Structure. 
For example, update a record, delete a record or perform an action etc.

	<maximo-resource id="woresource" 
	                    resource-uri="{{record.href}}"
	                    attribute-names="*,asset.description,asset._imagelibref"
	                    resource-data="{{woData}}"
	                    on-record-refreshed="_handleRecordRefreshed"
	                    on-record-refresh-error="_handleRecordRefreshed" >
	</maximo-resource>

The element uses the `resource-uri` attribute value to identify the exact maximo business
object, unless otherwise explicitly passed to certain methods.

The element provides ability to fetch details of a maximo business object. 
Use the `loadRecord` method fetch details. Make sure to set the `attribute-names` to
include a comma separated list of attribute names. The fetched data can be obtained by 
binding to the `resource-data` attribute. 

The element provides ability to update a maximo business object. Use the `updateRecord` 
method to update the details. Pass the record details to be updated as JSON object.

The element provides ability to delete a maximo business object. Use the `deleteRecord` 
method to delete the record.

The element provides ability to create or delete an attachment to the maximo business object. Use the
`createAttachment` method to create attachment. Use the `deleteAttachment` method to delete attachment.

The element provides ability to book mark an object for the user or remove the bookmark from an object. Use the
`bookmark` method to book mark an object. Use the `removeBookmark` method to remove a book mark from an object.


*/

Polymer({
    is: 'maximo-resource',

    /**
     * Fired when a record details are fetched from the server.
     *
     * @event record-refreshed
     */

    /**
     * Fired when there is a problem fetching record details from the server.
     *
     * @event record-refresh-error
     */

    /**
     * Fired when a record is updated successfully.
     *
     * @event record-updated
     */
    
    /**
     * Fired when there is a problem updating the record.
     *
     * @event record-update-error
     */
    
    /**
     * Fired when a record is deleted successfully.
     *
     * @event record-deleted
     */
    
    /**
     * Fired when there is a problem deleting record.
     *
     * @event record-delete-error
     */

    /**
     * Fired when a record attachment is created successfully.
     *
     * @event attachment-created
     */
    
    /**
     * Fired when there is a problem creating attachment.
     *
     * @event attachment-create-error
     */

    /**
     * Fired when a record attachment is deleted successfully.
     *
     * @event attachment-deleted
     */
    
    /**
     * Fired when there is a problem deleting attachment.
     *
     * @event attachment-delete-error
     */
   
    
    /**
     * Fired when a record is book marked successfully.
     *
     * @event record-bookmarked
     */
    
    /**
     * Fired when there is a problem book marking a record.
     *
     * @event record-bookmark-error
     */
   
    /**
     * Fired when a book mark is removed for a record successfully.
     *
     * @event record-bookmark-removed
     */
    
    /**
     * Fired when there is a problem in removing the book mark of a record.
     *
     * @event record-bookmark-remove-error
     */
   
    
    
    
    
    
	properties: {

      	/**
      	 * List of Attribute names separated by comma.
      	 * These attributes are always included in a REST API call and the
      	 * returned collection data will have these attribute values.
      	 */
      	attributeNames: {
      		type: String,
      		value: '*'
      	},

		orderByAttributeNames : {
			type : String
		},

      	/**
      	 * A flag to indicate if the collection data need to be automatically
      	 * refreshed upon some property changes or not.
      	 * Defaults to true. If set to false, expicitly refresh methods need to be called.
      	 */
      	auto: {
      		type: Boolean,
      		value: true
      	},

      	/**
		 * A flag that indicates if the request contains localized json.
		 */
      	contentLocalized: {
      		type: Boolean,
      		value: false
      	},

      	/**
      	 * Actual data retrieved from the server.
      	 * Note that only one page (based on pageSize) worth of data at a time is retrieved.
      	 */
      	resourceData: {
      		type: Object,
      		notify: true
      	},

      	/**
      	 * Actual data retrieved from the server.
      	 * Note that only one page (based on pageSize) worth of data at a time is retrieved.
      	 */
      	memberData: {
      		type: Object,
      		notify: true
      	},

      	/**
      	 * Actual data retrieved from the server.
      	 * Note that only one page (based on pageSize) worth of data at a time is retrieved.
      	 */
      	queryParams: {
      		type: Object
      	},

      	/**
      	 * List of attribute names for which data is fetched whenever a record selection changes.
      	 */
      	attachmentAttributeNames: {
      		type: String
      	},


		/**
		 * Name of the object structure used for fetching data.
	     */
		objectName: {
	    	type: String,
	    	observer: '_objectNameChanged'
		},

		/**
		 * Name of the object structure used for fetching data.
	     */
		resourceUri: {
	    	type: String
		},
		
		/**
		 * Name of the action to be taken on this resource.
	     */
		action: {
	    	type: String
		},
		
		childObjectName: {
			type: String,
			notify: true
		},
		
		childObjectFilter: {
			type: String,
			notify: true
		},
		
		/**
		 * A flag that indicates whether to combine filters
		 * using the OR operand.  The default is false, which uses AND.
		 */
      	setLocalized: {
      		type: Boolean,
      		value: false
      	},
      	
      	/**
		 * A flag that indicates whether to combine filters
		 * using the OR operand.  The default is false, which uses AND.
		 */
      	queryLocalized: {
      		type: Boolean,
      		value: false
      	},
      	
		
		/**
		 * urltype for file from synonymdomain 
	     */
		urlTypeForFile : {
			type: String
		}
    }, // End of Properties


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
			//Anamitra
			if (!this.collectionUri && !this.objectName)
			{
				return;
			}
			//Anamitra
			//this.queryInfo = globalServiceProvider.getQueryCapabilities(this.$.myauthenticator.getBaseUri(), this.domainUri, this.objectName);
			//this.creationInfo = globalServiceProvider.getCreationFactories(this.$.myauthenticator.getBaseUri(), this.domainUri, this.objectName);

			if ((this.queryInfo == null || this.creationInfo == null) && this.objectName)
			{
				this.refreshServiceProviderData().then(function(result){}, function(error) {});
			}
			else
			{
				this.refreshRecords().then(function(result){}, function(error) {});
			}
		}
	},*/


	/**
	 * Indicates whether authentication is needed or not.
	 */
	_isAuthenticationNeeded: function(e)
	{
		return this.$.myauthenticator.isAuthenticationNeeded();
	},

	/**
	 * Refreshes the records in the collection by fetching the first page worth of data. Returns a Promise.
	 * The returned promise is resolved upon successfully retrieving the collection data
	 * from the REST call, otherwise the promise is rejected with an error.
	 * The successful retrieval of data results in also firing an event record-data-refreshed.
	 */
	loadRecord: function(isEditMode)
	{
		//Anamitra
		if (!this.memberData && !this.resourceData && !this.resourceUri)
		{
			return new Promise(function (resolve, reject) {
							reject('No member data or resource data or resource URI specified');
						}.bind(this));
		}

		// If authentication is needed, just return.
		if (this._isAuthenticationNeeded())
		{
			return new Promise(function (resolve, reject) {
							reject('Authentication needed');
						}.bind(this));
		}


		var ajaxURL = this._getResourceURL(true);
		
	    if(isEditMode){
	    	ajaxURL += '&editmode=1&oslc.properties=*';
	      }
	    
		this.$.mxajaxFetchRecords.url=ajaxURL;

		var headers = {};
		this.$.mxajaxFetchRecords.headers = headers;
		this.$.mxajaxFetchRecords.generateRequest();


		return new Promise(function (resolve, reject) {
						this.resolveRefreshRecordsPromise = resolve;
						this.rejectRefreshRecordsPromise = reject;
					}.bind(this));
	},

	/**
	 * Processes the response returned as part of getting a resource.
	 * Fires record-created event.
	 */
	_processGetResourceResponse: function(e)
	{
		var jsonResponse = e.detail.response;
		//we need to set the ref information

		this.fire('resource-record-retrieved', jsonResponse);
	},
	
	/**
	 * Processes the response returned as part of setting a resource.
	 * Fires record-created event.
	 */
	_processSetResourceValuesResponse: function(e)
	{
		var jsonResponse = e.detail.response;

		this.fire('resource-record-set', jsonResponse);
	},
	
	/**
	 *	Successfully submitted a session for a resource, retrieve response and clear href,
	 *	since we are done with that row.
	 */
	_submitSessionSuccessResponse: function(e)
	{
		console.log('new record saved');
		var jsonResponse = e.detail.response;
		this.href = '';
		this.fire('new-resource-saved', jsonResponse);
	},

	/**
	 *	Successfully submitted a session for set resource values, retrieve response and clear href,
	 *	since we are done with that row.
	 */
	_setAndsubmitSessionSuccessResponse: function(e)
	{
		console.log('new record saved');
		var jsonResponse = e.detail.response;	
		this.href = '';
		this.resolveSetAndSubmitSessionPromise(e.detail);
		this.fire('new-resource-saved', jsonResponse);
	},
	
	/**
	 * Processes the error as a result of a REST call.
	 */
	_processResourceError: function(e)
	{
		console.log('********* maximo-data processError called!');
		this.rejectSetAndSubmitSessionPromise(e.detail);
		this.fire('data-error', e.detail.request.xhr.response);
	},

	/**
	 * Processes the response as a result of making REST call to get the data.
	 * Fires a record-data-refreshed event.
	 */
	_processFetchRecordsResponse: function(e)
	{
		this._retrieveData(e);

		this.resolveRefreshRecordsPromise(this.resourceData);

		// TODO - cleanup this event
		this.fire('record-data-refreshed');
		
		// Fire record-refreshed event
		this.fire('record-refreshed', this.resourceData);
	},

	/**
	 * Processes the error as a result of making REST call to get the data.
	 * Fires data-error event.
	 */
	_processFetchRecordsResponseError: function(e)
	{
		// reject promise
		this.rejectRefreshRecordsPromise(e.detail);

		// TODO - cleanup this event
		this.fire('data-error', e.detail);
		
		// Fire record-refresh-error event
		this.fire('record-refresh-error', e.detail);
	},

	/**
	 * Processes the response as a result of making REST call to get the data.
	 * Fires a record-data-refreshed event.
	 */
	_processUpdateRecordResponse: function(e)
	{
		this._retrieveData(e);

		this.resolveUpdateRecordPromise(this.collectionData);

		this.fire('record-updated');
	},

	/**
	 * Processes the error as a result of making REST call to get the data.
	 * Fires data-error event.
	 */
	_processUpdateRecordResponseError: function(e)
	{
		// reject promise
		this.rejectUpdateRecordPromise(e.detail);

		this.fire('record-update-error', e.detail);
	},

	/**
	 * Processes the response as a result of making REST call to get the data.
	 * Fires a record-data-refreshed event.
	 */
	_processDeleteRecordResponse: function(e)
	{
		//this._retrieveData(e);

		this.resolveDeleteRecordPromise(e.detail);

		// TODO - cleanup this event.
		this.fire('record-delete');

		// fire record-deleted to be consistent with record-updated convention
		this.fire('record-deleted');
	},

	/**
	 * Processes the error as a result of making REST call to get the data.
	 * Fires data-error event.
	 */
	_processDeleteRecordResponseError: function(e)
	{
		// reject promise
		this.rejectDeleteRecordPromise(e.detail);

		this.fire('record-delete-error', e.detail);
	},

	/**
	 * Processes the response as a result of making REST call to get the data.
	 * Fires a record-data-refreshed event.
	 */
	_processBookmarkRecordResponse: function(e)
	{
		//this._retrieveData(e);

		this.resolveBookmarkRecordPromise(e.detail);

		this.fire('record-bookmarked');
	},

	/**
	 * Processes the error as a result of making REST call to get the data.
	 * Fires data-error event.
	 */
	_processBookmarkRecordResponseError: function(e)
	{
		// reject promise
		this.rejectBookmarkRecordPromise(e.detail);

		this.fire('record-bookmark-error', e.detail);
	},

	/**
	 * Processes the response as a result of making REST call to get the data.
	 * Fires a record-data-refreshed event.
	 */
	_processRemoveBookmarkRecordResponse: function(e)
	{
		//this._retrieveData(e);

		this.resolveRemoveBookmarkRecordPromise(e.detail);

		this.fire('record-bookmark-removed');
	},

	/**
	 * Processes the error as a result of making REST call to get the data.
	 * Fires data-error event.
	 */
	_processRemoveBookmarkRecordResponseError: function(e)
	{
		// reject promise
		this.rejectRemoveBookmarkRecordPromise(e.detail);

		this.fire('record-bookmark-remove-error', e.detail);
	},

	/**
	 * Processes the response as a result of making REST call to get the data.
	 * Fires a record-data-refreshed event.
	 */
	_processSubscribeEventRecordResponse: function(e)
	{
		//this._retrieveData(e);

		this.resolveSubscribeEventRecordPromise(e.detail);

		this.fire('record-subscribeevent');
	},

	/**
	 * Processes the error as a result of making REST call to get the data.
	 * Fires data-error event.
	 */
	_processSubscribeEventRecordResponseError: function(e)
	{
		// reject promise
		this.rejectSubscribeEventRecordPromise(e.detail);

		this.fire('record-subscribeevent-error', e.detail);
	},

	_processSnoozeEventRecordResponse: function(e)
	{
		//this._retrieveData(e);

		this.resolveSnoozeEventRecordPromise(e.detail);

		this.fire('record-snoozeevent');
	},

	/**
	 * Processes the error as a result of making REST call to get the data.
	 * Fires data-error event.
	 */
	_processSnoozeEventRecordResponseError: function(e)
	{
		// reject promise
		this.rejectSnoozeEventRecordPromise(e.detail);

		this.fire('record-snoozeevent-error', e.detail);
	},

	/**
	 * Processes the response as a result of making REST call to get the data.
	 * Fires a record-data-refreshed event.
	 */
	_processUnSubscribeEventRecordResponse: function(e)
	{
		//this._retrieveData(e);

		this.resolveUnSubscribeEventRecordPromise(e.detail);

		this.fire('record-unsubscribeevent');
	},

	/**
	 * Processes the error as a result of making REST call to get the data.
	 * Fires data-error event.
	 */
	_processUnSubscribeEventRecordResponseError: function(e)
	{
		// reject promise
		this.rejectUnSubscribeEventRecordPromise(e.detail);

		this.fire('record-unsubscribeevent-error', e.detail);
	},

	/**
	 * Processes the response as a result of making REST call to get the data.
	 * Fires a record-data-refreshed event.
	 */
	_processAllEventsForRecordResponse: function(e)
	{
		//this._retrieveData(e);

		this.resolveAllEventsForRecordPromise(e.detail);

		this.fire('record-alleventsfor');
	},

	/**
	 * Processes the error as a result of making REST call to get the data.
	 * Fires data-error event.
	 */
	_processAllEventsForRecordResponseError: function(e)
	{
		// reject promise
		this.rejectAllEventsForRecordPromise(e.detail);

		this.fire('record-alleventsfor-error', e.detail);
	},

	/**
	 * Processes the response as a result of making REST call to get the data.
	 * Fires a record-data-refreshed event.
	 */
	_processAllNotificationsForRecordResponse: function(e)
	{
		//this._retrieveData(e);

		this.resolveAllNotificationsForRecordPromise(e.detail);

		this.fire('record-alleventsfor');
	},

	/**
	 * Processes the error as a result of making REST call to get the data.
	 * Fires data-error event.
	 */
	_processAllNotificationsForRecordResponseError: function(e)
	{
		// reject promise
		this.rejectAllNotificationsForRecordPromise(e.detail);

		this.fire('record-alleventsfor-error', e.detail);
	},


	/**
	 * Processes the response as a result of making REST call to get the data.
	 * Fires a record-data-refreshed event.
	 */
	_processUpdateActionRecordResponse: function(e)
	{
		//this._retrieveData(e);

		this.resolveUpdateActionRecordPromise(e.detail);

		var fireName = 'record-update'+this.action;
		//reset action, otherwise it will be incorrectly appended on other requests
		this.action = '';

		this.fire(fireName, e.detail.response);
	},

	/**
	 * Processes the error as a result of making REST call to get the data.
	 * Fires data-error event.
	 */
	_processUpdateActionRecordResponseError: function(e)
	{
		// reject promise
		this.rejectUpdateActionRecordPromise(e.detail);

		var fireName = 'record-update'+this.action+'-error';
		//reset action, otherwise it will be incorrectly appended on other requests
		this.action = '';

		this.fire(fireName, e.detail);
	},

	/**
	 * Processes the response as a result of making REST call to get the data.
	 * Fires a record-data-refreshed event.
	 */
	_processGetActionRecordResponse: function(e)
	{
		//this._retrieveData(e);

		this.resolveGetActionRecordPromise(e.detail);

		this.fire('record-get'+this.action);
	},

	/**
	 * Processes the error as a result of making REST call to get the data.
	 * Fires data-error event.
	 */
	_processGetActionRecordResponseError: function(e)
	{
		// reject promise
		if ($M.checkSession(e)){
			this.rejectGetActionRecordPromise(e.detail);
			this.fire('record-get'+this.action+'-error', e.detail);
		}
	},

	/**
	 * Submit a session.
	 * 
	 */
	submitSession: function(responseProperties)
	{
		
		var creationURL = this._getResourceURL(false) + '?editmode=1';
		var ajaxURL = creationURL;
		this.$.mxajaxSubmitSession.url=ajaxURL;
		
		var headers = {};
	    //adding the csrf token
		headers.csrftoken = $M.getCSRFToken();

		headers.submitsession = '1';
		if(this.contentLocalized)
		{
			headers['content-localized'] = '1';
		}
		

		if (responseProperties)
		{
			headers.properties = responseProperties;
		}
		
		this.$.mxajaxSubmitSession.headers = headers;
		this.$.mxajaxSubmitSession.contentType = 'application/json';
		this.$.mxajaxSubmitSession.method='POST';
		this.$.mxajaxSubmitSession.generateRequest();
	},

	 /**
	 * Get a MBO with the passed record data and resonse properties.
	 * TODO - return a promise.
	 */
	setResourceValues: function(recordData, responseProperties)
	{
		
		var creationURL = this._getResourceURL(false) + '?editmode=1';
		var ajaxURL = creationURL;
		this.$.mxajaxSetResourceValues.url=ajaxURL;
		
		var headers = {};
		if(this.contentLocalized)
		{
			headers['content-localized'] = '1';
		}
		
	    //adding the csrf token
		headers.csrftoken = $M.getCSRFToken();
		headers['x-method-override'] = 'PATCH';
		headers.patchtype = 'MERGE';
		
		if (responseProperties)
		{
			headers.properties = responseProperties;
		}
		
		this.$.mxajaxSetResourceValues.headers = headers;
		this.$.mxajaxSetResourceValues.contentType = 'application/json';
		this.$.mxajaxSetResourceValues.method='POST';
		this.$.mxajaxSetResourceValues.body=JSON.stringify(recordData);

		this.$.mxajaxSetResourceValues.generateRequest();
	},
	

	
	/**
	 * Set and Save a Resource using submit session
	 */
	setAndSubmitResourceValues: function(recordData, responseProperties)
	{
		var ajaxURL = this._getResourceURL(false) + '?editmode=1';
		this.$.mxajaxSetAndSubmitSession.url=ajaxURL;

		var headers = {};
		if(this.contentLocalized)
		{
			headers['content-localized'] = '1';
		}
	    //adding the csrf token
		headers.csrftoken = $M.getCSRFToken();
		headers['x-method-override'] = 'PATCH';
		headers.patchtype = 'MERGE';

		headers.submitsession = '1';

		if (responseProperties)
		{
			headers.properties = responseProperties;
		}

		this.$.mxajaxSetAndSubmitSession.headers = headers;
		this.$.mxajaxSetAndSubmitSession.contentType = 'application/json';
		this.$.mxajaxSetAndSubmitSession.method='POST';
		this.$.mxajaxSetAndSubmitSession.body=JSON.stringify(recordData);

		this.$.mxajaxSetAndSubmitSession.generateRequest();
		
	    return new Promise(function (resolve, reject) {
            this.resolveSetAndSubmitSessionPromise = resolve;
            this.rejectSetAndSubmitSessionPromise = reject;
          }.bind(this));
	},
	
	 /**
	 * Get a resource object with the passed record data and response properties.
	 * TODO - return a promise.
	 */
	getResource: function(recordData, responseProperties)
	{
		
		var creationURL = this._getResourceURL(false) + '?editmode=1';
		var ajaxURL = creationURL;
		this.$.mxajaxGetResource.url=ajaxURL;
		
		var headers = {};
		if(this.contentLocalized)
		{
			headers['content-localized'] = '1';
		}
		
		if (responseProperties)
		{
			headers.properties = responseProperties;
		}
		
		this.$.mxajaxGetResource.headers = headers;
		this.$.mxajaxGetResource.contentType = 'application/json';
		this.$.mxajaxGetResource.method='GET';
		this.$.mxajaxGetResource.generateRequest();
	},

		/**
	 * Returns the creation URL.
	 */
	_getCreationURL: function(creationURL)
	{
		var retCreationURL = creationURL;
		if (this.leanMode === true)
		{
			retCreationURL = retCreationURL + '?lean=1';	
		}
		
		return retCreationURL;
	},
	
	/**
	 * Returns the resource edit mode creation URL.
	 */
	_getEditModeURL: function(creationURL){
		var retCreationURL = creationURL;
		if (this.leanMode === true)
		{
			retCreationURL = retCreationURL + '?editmode=1&lean=1';	
		}
		else		{
			retCreationURL = retCreationURL + '?editmode=1';	
		}
		
		return retCreationURL;
	},
		
	/**
	 * Duplicate Record
	 *
	 */
	duplicateRecord: function(recordData, responseProperties){
		if (!recordData){
			return new Promise(function (resolve, reject) {
				reject('No record data specified');
			}.bind(this));
		}

		// If authentication is needed, just return.
		if (this._isAuthenticationNeeded()){
			return new Promise(function (resolve, reject) {
							reject('Authentication needed');
						}.bind(this));
		}
		$M.toggleWait(true);

		var href = recordData.href;
		if (responseProperties && responseProperties.href){
			href = responseProperties.href;
		}
		var ajaxURL = href + '?action=system:duplicate'; //this._getResourceURL(false);
		this.$.mxajaxDuplicateRecord.url=ajaxURL;

		var headers = {};
		if(this.contentLocalized)
		{
			headers['content-localized'] = '1';
		}
		if (responseProperties){
			headers.properties = responseProperties;
		}
		else if(this.attributeNames){
			headers.properties = this.attributeNames;
		}
				
		this.$.mxajaxDuplicateRecord.headers = headers;
		this.$.mxajaxDuplicateRecord.contentType = 'application/json';
		this.$.mxajaxDuplicateRecord.handleAs='json';
		this.$.mxajaxDuplicateRecord.method='GET';
		this.$.mxajaxDuplicateRecord.body=JSON.stringify(recordData);
		this.$.mxajaxDuplicateRecord.generateRequest();


		return new Promise(function (resolve, reject) {
						this.resolveDuplicateRecordPromise = resolve;
						this.rejectDuplicateRecordPromise = reject;
					}.bind(this));

	},
	
	/**
	 * Processes the error as a result of a REST call.
	 */
	_processDuplicateRecordResponseError: function(e)
	{
		console.log('********* maximo-resource processDuplicateRecordResponseError called!');
		this.fire('data-error', e.detail.request.xhr.response);
		this.fire('record-duplicate-error', e.detail.request.xhr.response);
	},

	/**
	 * Creates a new record with the passed record data and resonse properties.
	 * TODO - return a promise.
	 */
	updateRecord: function(recordData, responseProperties, merge)
	{
		if (!recordData)
		{
			return new Promise(function (resolve, reject) {
				reject('No record data specified');
			}.bind(this));
		}

		if (!this.resourceUri)
		{
			return new Promise(function (resolve, reject) {
							reject('No member data or resource data or resource URI specified');
						}.bind(this));
		}

		// If authentication is needed, just return.
		if (this._isAuthenticationNeeded())
		{
			return new Promise(function (resolve, reject) {
							reject('Authentication needed');
						}.bind(this));
		}
		
		// send a ajax post request to create record.
		//
		// name, url
		// TODO - for now use index 0, but this need to be configurable.
		//Anamitra

		var ajaxURL = this._getResourceURL(false);
		this.$.mxajaxUpdateRecord.url=ajaxURL;

		var headers = {};
		if(this.contentLocalized)
		{
			headers['content-localized'] = '1';
		}
	    //adding the csrf token
		headers.csrftoken = $M.getCSRFToken();
		if (responseProperties){
			headers.properties = responseProperties;
		}
		else if(this.attributeNames){
			headers.properties = this.attributeNames;
		}
		headers['x-method-override'] = 'PATCH';
		if(merge){
			headers.patchtype = 'MERGE';
		}


		this.$.mxajaxUpdateRecord.headers = headers;
		this.$.mxajaxUpdateRecord.contentType = 'application/json';
		this.$.mxajaxUpdateRecord.handleAs='json';
		this.$.mxajaxUpdateRecord.method='POST';
		this.$.mxajaxUpdateRecord.body=JSON.stringify(recordData);
		this.$.mxajaxUpdateRecord.generateRequest();


		return new Promise(function (resolve, reject) {
						this.resolveUpdateRecordPromise = resolve;
						this.rejectUpdateRecordPromise = reject;
					}.bind(this));

	},

	/**
	 * Creates a new record with the passed record data and resonse properties.
	 * TODO - return a promise.
	 */
	updateAction: function(action, actionData, responseProperties)
	{

		if (!this.memberData && !this.resourceData && !this.resourceUri)
		{
			return new Promise(function (resolve, reject) {
							reject('No member data or resource data or resource URI specified');
						}.bind(this));
		}

		// If authentication is needed, just return.
		if (this._isAuthenticationNeeded())
		{
			return new Promise(function (resolve, reject) {
							reject('Authentication needed');
						}.bind(this));
		}

		// send a ajax post request to create record.
		//
		// name, url
		// TODO - for now use index 0, but this need to be configurable.
		//Anamitra
		this.action = action;
		var ajaxURL = this._getResourceURL(false);
		this.$.mxajaxUpdateActionRecord.url=ajaxURL;

		var headers = {};
		if(this.contentLocalized)
		{
			headers['content-localized'] = '1';
		}
	    //adding the csrf token
		headers.csrftoken = $M.getCSRFToken();
		if (responseProperties){
			headers.properties = responseProperties;
		}
		else if(this.attributeNames){
			headers.properties = this.attributeNames;
		}
		headers['x-method-override'] = 'PATCH';

		this.$.mxajaxUpdateActionRecord.headers = headers;
		this.$.mxajaxUpdateActionRecord.contentType = 'application/json';
		this.$.mxajaxUpdateActionRecord.handleAs='json';
		this.$.mxajaxUpdateActionRecord.method='POST';
		this.$.mxajaxUpdateActionRecord.body=JSON.stringify(actionData);
		this.$.mxajaxUpdateActionRecord.generateRequest();
		
		return new Promise(function (resolve, reject) {
		
						this.resolveUpdateActionRecordPromise = resolve;
						this.rejectUpdateActionRecordPromise = reject;
					}.bind(this));

	},

	/**
	 * Creates a new record with the passed record data and resonse properties.
	 * TODO - return a promise.
	 */
	getAction: function(action, queryParams)
	{

		if (!this.memberData && !this.resourceData && !this.resourceUri)
		{
			return new Promise(function (resolve, reject) {
							reject('No member data or resource data or resource URI specified');
						}.bind(this));
		}

		// If authentication is needed, just return.
		if (this._isAuthenticationNeeded())
		{
			return new Promise(function (resolve, reject) {
							reject('Authentication needed');
						}.bind(this));
		}

		// send a ajax post request to create record.
		//
		// name, url
		// TODO - for now use index 0, but this need to be configurable.
		//Anamitra
		this.action = action;
		this.queryParams = queryParams;
		var ajaxURL = this._getResourceURL(false);
		this.$.mxajaxGetActionRecord.url=ajaxURL;

		var headers = {};
		if(this.contentLocalized)
		{
			headers['content-localized'] = '1';
		}
		this.$.mxajaxGetActionRecord.headers = headers;
		this.$.mxajaxGetActionRecord.generateRequest();

		return new Promise(function (resolve, reject) {
						//reset action and queryParams
						this.action = '';
						this.queryParams = '';
						this.resolveGetActionRecordPromise = resolve;
						this.rejectGetActionRecordPromise = reject;
					}.bind(this));

	},

	/**
	 * Creates a new bookmark.
	 * TODO - return a promise.
	 */
	bookmark: function()
	{
		if (!this.memberData && !this.resourceData && !this.resourceUri)
		{
			return new Promise(function (resolve, reject) {
							reject('No member data or resource data or resource URI specified');
						}.bind(this));
		}

		// If authentication is needed, just return.
		if (this._isAuthenticationNeeded())
		{
			return new Promise(function (resolve, reject) {
							reject('Authentication needed');
						}.bind(this));
		}
		this.action = 'bookmark';

		// send a ajax post request to create record.
		//
		// name, url
		// TODO - for now use index 0, but this need to be configurable.
		//Anamitra

		var ajaxURL = this._getResourceURL(false);
		this.$.mxajaxBookmarkRecord.url=ajaxURL;

		var headers = {};
		if(this.contentLocalized)
		{
			headers['content-localized'] = '1';
		}
	    //adding the csrf token
		headers.csrftoken = $M.getCSRFToken();
		headers['x-method-override'] = 'PATCH';

		this.$.mxajaxBookmarkRecord.headers = headers;
		//this.$.mxajaxUpdateRecord.contentType = 'application/json';
		//this.$.mxajaxUpdateRecord.handleAs='json';
		this.$.mxajaxBookmarkRecord.method='POST';
		//this.$.mxajaxUpdateRecord.body=JSON.stringify(this.resourceData);
		this.$.mxajaxBookmarkRecord.generateRequest();

		return new Promise(function (resolve, reject) {
						this.resolveBookmarkRecordPromise = resolve;
						this.rejectBookmarkRecordPromise = reject;
					}.bind(this));

	},

	snoozeEvent : function(eventName, snoozeTime, snoozeUnit) {
		if (!this.memberData && !this.resourceData && !this.resourceUri) {
			return new Promise(
					function(resolve, reject) {
						reject('No member data or resource data or resource URI specified');
					}.bind(this));
		}

		// If authentication is needed, just return.
		if (this._isAuthenticationNeeded()) {
			return new Promise(function(resolve, reject) {
				reject('Authentication needed');
			}.bind(this));
		}
		this.action = 'snooze';
		var eventData = {};
		eventData.eventname = eventName;
		if (snoozeTime !== null) {
			eventData.snoozetime = snoozeTime;
		}

		if (snoozeUnit) {
			eventData.snoozeunit = snoozeUnit;
		}

		// send a ajax post request to create record.
		//
		// name, url
		// TODO - for now use index 0, but this need to be configurable.
		//Anamitra

		var ajaxURL = this._getResourceURL(false);
		this.$.mxajaxSnoozeEventRecord.url = ajaxURL;

		var headers = {};
		if(this.contentLocalized)
		{
			headers['content-localized'] = '1';
		}
	    //adding the csrf token
		headers.csrftoken = $M.getCSRFToken();
		headers['x-method-override'] = 'PATCH';

		this.$.mxajaxSnoozeEventRecord.headers = headers;
		this.$.mxajaxSnoozeEventRecord.contentType = 'application/json';
		this.$.mxajaxSnoozeEventRecord.handleAs = 'json';
		this.$.mxajaxSnoozeEventRecord.method = 'POST';
		this.$.mxajaxSnoozeEventRecord.body = JSON
				.stringify(eventData);
		this.$.mxajaxSnoozeEventRecord.generateRequest();

		return new Promise(function(resolve, reject) {
			this.resolveSnoozeEventRecordPromise = resolve;
			this.rejectSnoozeEventRecordPromise = reject;
		}.bind(this));

	},

	/**
	 * Creates a new record with the passed record data and resonse properties.
	 * TODO - return a promise.
	 */
	subscribeEvent: function(eventName, endpointName, usernotftype)
	{
		if (!this.memberData && !this.resourceData && !this.resourceUri)
		{
			return new Promise(function (resolve, reject) {
							reject('No member data or resource data or resource URI specified');
						}.bind(this));
		}

		// If authentication is needed, just return.
		if (this._isAuthenticationNeeded())
		{
			return new Promise(function (resolve, reject) {
							reject('Authentication needed');
						}.bind(this));
		}
		this.action = 'subscribe';
		var eventData = {};
		eventData.eventname = eventName;
		if(endpointName)
		{
			eventData.endpointname = endpointName;
		}
		if(usernotftype)
		{
			eventData.usernotftype = usernotftype;
		}

		// send a ajax post request to create record.
		//
		// name, url
		// TODO - for now use index 0, but this need to be configurable.
		//Anamitra

		var ajaxURL = this._getResourceURL(false);
		this.$.mxajaxSubscribeEventRecord.url=ajaxURL;

		var headers = {};
		if(this.contentLocalized)
		{
			headers['content-localized'] = '1';
		}
	    //adding the csrf token
		headers.csrftoken = $M.getCSRFToken();
		headers['x-method-override'] = 'PATCH';

		this.$.mxajaxSubscribeEventRecord.headers = headers;
		this.$.mxajaxSubscribeEventRecord.contentType = 'application/json';
		this.$.mxajaxSubscribeEventRecord.handleAs='json';
		this.$.mxajaxSubscribeEventRecord.method='POST';
		this.$.mxajaxSubscribeEventRecord.body=JSON.stringify(eventData);
		this.$.mxajaxSubscribeEventRecord.generateRequest();


		return new Promise(function (resolve, reject) {
						this.resolveSubscribeEventRecordPromise = resolve;
						this.rejectSubscribeEventRecordPromise = reject;
					}.bind(this));

	},


	/**
	 * Remove a bookmark.
	 * TODO - return a promise.
	 */
	removeBookmark: function()
	{
		if (!this.memberData && !this.resourceData && !this.resourceUri)
		{
			return new Promise(function (resolve, reject) {
							reject('No member data or resource data or resource URI specified');
						}.bind(this));
		}

		// If authentication is needed, just return.
		if (this._isAuthenticationNeeded())
		{
			return new Promise(function (resolve, reject) {
							reject('Authentication needed');
						}.bind(this));
		}
		this.action = 'removebookmark';

		// send a ajax post request to create record.
		//
		// name, url
		// TODO - for now use index 0, but this need to be configurable.
		//Anamitra

		var ajaxURL = this._getResourceURL(false);
		this.$.mxajaxRemoveBookmarkRecord.url=ajaxURL;

		var headers = {};
		if(this.contentLocalized)
		{
			headers['content-localized'] = '1';
		}
	    //adding the csrf token
		headers.csrftoken = $M.getCSRFToken();
		headers['x-method-override'] = 'PATCH';

		this.$.mxajaxRemoveBookmarkRecord.headers = headers;
//		this.$.mxajaxUpdateRecord.contentType = 'application/json';
//		this.$.mxajaxUpdateRecord.handleAs='json';
		this.$.mxajaxRemoveBookmarkRecord.method='POST';
//		this.$.mxajaxUpdateRecord.body=JSON.stringify(this.resourceData);
		this.$.mxajaxRemoveBookmarkRecord.generateRequest();

		return new Promise(function (resolve, reject) {
						this.resolveRemoveBookmarkRecordPromise = resolve;
						this.rejectRemoveBookmarkRecordPromise = reject;
					}.bind(this));

	},

	/**
	 * Creates a new record with the passed record data and resonse properties.
	 * TODO - return a promise.
	 */
	unsubscribeEvent: function(eventName)
	{
		if (!this.memberData && !this.resourceData && !this.resourceUri)
		{
			return new Promise(function (resolve, reject) {
							reject('No member data or resource data or resource URI specified');
						}.bind(this));
		}

		// If authentication is needed, just return.
		if (this._isAuthenticationNeeded())
		{
			return new Promise(function (resolve, reject) {
							reject('Authentication needed');
						}.bind(this));
		}
		this.action = 'unsubscribe';
		var eventData = {};
		eventData.eventname = eventName;

		// send a ajax post request to create record.
		//
		// name, url
		// TODO - for now use index 0, but this need to be configurable.
		//Anamitra

		var ajaxURL = this._getResourceURL(false);
		this.$.mxajaxUnSubscribeEventRecord.url=ajaxURL;

		var headers = {};
		if(this.contentLocalized)
		{
			headers['content-localized'] = '1';
		}
	    //adding the csrf token
		headers.csrftoken = $M.getCSRFToken();
		headers['x-method-override'] = 'PATCH';

		this.$.mxajaxUnSubscribeEventRecord.headers = headers;
		this.$.mxajaxUnSubscribeEventRecord.contentType = 'application/json';
		this.$.mxajaxUnSubscribeEventRecord.handleAs='json';
		this.$.mxajaxUnSubscribeEventRecord.method='POST';
		this.$.mxajaxUnSubscribeEventRecord.body=JSON.stringify(eventData);
		this.$.mxajaxUnSubscribeEventRecord.generateRequest();


		return new Promise(function (resolve, reject) {
						this.resolveUnSubscribeEventRecordPromise = resolve;
						this.rejectUnSubscribeEventRecordPromise = reject;
					}.bind(this));

	},

	/**
	 * Creates a new record with the passed record data and resonse properties.
	 * TODO - return a promise.
	 */
	allEvents: function()
	{
		if (!this.memberData && !this.resourceData && !this.resourceUri)
		{
			return new Promise(function (resolve, reject) {
							reject('No member data or resource data or resource URI specified');
						}.bind(this));
		}

		// If authentication is needed, just return.
		if (this._isAuthenticationNeeded())
		{
			return new Promise(function (resolve, reject) {
							reject('Authentication needed');
						}.bind(this));
		}
		this.action = 'events';

		// send a ajax post request to create record.
		//
		// name, url
		// TODO - for now use index 0, but this need to be configurable.
		//Anamitra

		var ajaxURL = this._getResourceURL(false);
		this.$.mxajaxAllEventsForRecord.url=ajaxURL;

		var headers = {};
		if(this.contentLocalized)
		{
			headers['content-localized'] = '1';
		}

		this.$.mxajaxAllEventsForRecord.headers = headers;
		this.$.mxajaxAllEventsForRecord.generateRequest();


		return new Promise(function (resolve, reject) {
						this.resolveAllEventsForRecordPromise = resolve;
						this.rejectAllEventsForRecordPromise = reject;
					}.bind(this));

	},

	allNotifications : function() {
		if (!this.memberData && !this.resourceData && !this.resourceUri) {
			return new Promise(
					function(resolve, reject) {
						reject('No member data or resource data or resource URI specified');
					}.bind(this));
		}

		// If authentication is needed, just return.
		if (this._isAuthenticationNeeded()) {
			return new Promise(function(resolve, reject) {
				reject('Authentication needed');
			}.bind(this));
		}
		this.action = 'notifications';

		// send a ajax post request to create record.
		//
		// name, url
		// TODO - for now use index 0, but this need to be configurable.
		//Anamitra
		var headers = {};
		if(this.contentLocalized)
		{
			headers['content-localized'] = '1';
		}

		var ajaxURL = this._getResourceURL(false);
		//Set the attributeNames only for notifications
		if (this.attributeNames) {
			if (ajaxURL.indexOf('?') > 0) {
				if (this.leanMode === true) {
					ajaxURL = ajaxURL +
							'&lean=1&collectioncount=1&oslc.select=' +
							 encodeURIComponent(this.attributeNames);
				} else {
					ajaxURL = ajaxURL +
							'&collectioncount=1&oslc.select=' +
							encodeURIComponent(this.attributeNames);
				}
			} else {
				if (this.leanMode === true) {
					ajaxURL = ajaxURL +
							'?lean=1&collectioncount=1&oslc.select='+
							encodeURIComponent(this.attributeNames);
				} else {
					ajaxURL = ajaxURL +
							'?collectioncount=1&oslc.select=' +
							encodeURIComponent(this.attributeNames);
				}
			}
		}

		if (this.orderByAttributeNames) {
			if (ajaxURL.indexOf('?') > 0) {
				ajaxURL = ajaxURL + '&oslc.orderBy=' +
						this.orderByAttributeNames;
			} else {
				ajaxURL = ajaxURL + '?oslc.orderBy=' +
						this.orderByAttributeNames;
			}
		}
		this.$.mxajaxAllNotificationsForRecord.url = ajaxURL;

		this.$.mxajaxAllNotificationsForRecord.headers = headers;
		this.$.mxajaxAllNotificationsForRecord.generateRequest();

		return new Promise(function(resolve, reject) {
			this.resolveAllNotificationsForRecordPromise = resolve;
			this.rejectAllNotificationsForRecordPromise = reject;
		}.bind(this));

	},


	/**
	 * Processes the response returned as part of creating a record.
	 * Fires record-created event.
	 */
	_processRecordCreateResponse: function(e)
	{
		var jsonResponse = e.detail.response;

		this.fire('record-created', jsonResponse);
	},

	/**
	 * Creates an attachment record.
	 * TODO - return a promise.
	 */
	createAttachment: function(recordURI, attachmentData, responseProperties)
	{
		// send a ajax post request to record URI with the attachment data.
		//
		// name, url

		var ajaxURL = this._getAttachmentURL(recordURI);
		this.$.mxajaxCreateAttachmentRecord.url=ajaxURL;

		var headers = {};
		if(this.contentLocalized)
		{
			headers['content-localized'] = '1';
		}
	    //adding the csrf token
		headers.csrftoken = $M.getCSRFToken();
		if (responseProperties)
		{
			headers.properties = responseProperties;
		}

		if (attachmentData.base64Encoded && attachmentData.base64Encoded === true)
		{
			headers['custom-encoding'] = 'base64';
		}
		if(attachmentData.description)
		{
			headers['x-document-description'] = attachmentData.description;
		}
		
		var docMeta = 'FILE/Attachments';
		if (this.urlTypeForFile && this.urlTypeForFile.length > 0) {
			docMeta = this.urlTypeForFile + '/Attachments';
			
		}
		headers['x-document-meta'] = docMeta;

		headers.slug = attachmentData.description;

		this.$.mxajaxCreateAttachmentRecord.headers = headers;
		this.$.mxajaxCreateAttachmentRecord.contentType = 'utf-8';
		this.$.mxajaxCreateAttachmentRecord.handleAs='json';
		this.$.mxajaxCreateAttachmentRecord.method='POST';
		this.$.mxajaxCreateAttachmentRecord.body=attachmentData.content;
		this.$.mxajaxCreateAttachmentRecord.generateRequest();

		return new Promise(function (resolve, reject) {
			this.resolveCreateAttachmentPromise = resolve;
			this.rejectCreateAttachmentPromise = reject;
		}.bind(this));

	},

	/**
	 * Creates an attachment record.
	 * TODO - return a promise.
	 */
	deleteAttachment: function(recordURI)
	{
		// send a ajax post request to record URI with the attachment data.
		//
		// name, url

		var ajaxURL = recordURI;
		this.$.mxajaxDeleteAttachmentRecord.url=ajaxURL;

		var headers = {};
		if(this.contentLocalized)
		{
			headers['content-localized'] = '1';
		}
	    //adding the csrf token
		headers.csrftoken = $M.getCSRFToken();
		headers['x-method-override'] = 'DELETE';

		this.$.mxajaxDeleteAttachmentRecord.headers = headers;
		//this.$.mxajaxCreateAttachmentRecord.contentType = attachmentData.type;
		this.$.mxajaxDeleteAttachmentRecord.method='POST';
		this.$.mxajaxDeleteAttachmentRecord.generateRequest();

		return new Promise(function (resolve, reject) {
			this.resolveDeleteAttachmentPromise = resolve;
			this.rejectDeleteAttachmentPromise = reject;
		}.bind(this));

	},

	/**
	 * Delete a record.
	 * TODO - return a promise.
	 */
	deleteRecord: function(recordURI)
	{
		// send a ajax post request to record URI with the attachment data.
		//
		// name, url
		
		// If URI is not passed, then take the default URL set on the object
		if (!recordURI)
		{
			recordURI = this.resourceUri;
		}
		
		var ajaxURL = recordURI;
		this.$.mxajaxDeleteRecord.url=ajaxURL;

		var headers = {};
		if(this.contentLocalized)
		{
			headers['content-localized'] = '1';
		}
	    //adding the csrf token
		headers.csrftoken = $M.getCSRFToken();
		headers['x-method-override'] = 'DELETE';

		this.$.mxajaxDeleteRecord.headers = headers;
		//this.$.mxajaxCreateAttachmentRecord.contentType = attachmentData.type;
		this.$.mxajaxDeleteRecord.method='POST';
		this.$.mxajaxDeleteRecord.generateRequest();

		return new Promise(function (resolve, reject) {
			this.resolveDeleteRecordPromise = resolve;
			this.rejectDeleteRecordPromise = reject;
		}.bind(this));

	},

	

	/**
	 * Returns attachment URL.
	 */
	_getAttachmentURL: function(attachmentURL)
	{
		var newattachmentURL = attachmentURL;//this._adjustURL(attachmentURL);
		if(!attachmentURL)
		{
			if (this.memberData)
			{
				newattachmentURL = this.memberData.doclinks;//newattachmentURL + '?lean=1';
				if(!newattachmentURL)
				{
					newattachmentURL = this.memberData.href+'/doclinks';
				}
			}
			else if(this.resourceUri)
			{
				newattachmentURL = this.resourceUri+'/doclinks';
			}
		}
		return newattachmentURL;
	},

	/**
	 * get url type from synonymdomain
	 */
	getUrlType: function() {
		if (this._isAuthenticationNeeded())
		{
			return new Promise(function (resolve, reject) {
							reject('Authentication needed');
						}.bind(this));
		}
			
		var ajaxURL = this.$.myauthenticator.getBaseUri() + '/oslc/os/mxapidomain?lean=1&oslc.where=domainid="URLTYPE"&oslc.select=*';

		this.$.mxajaxGetURLType.url = ajaxURL;
		
		var headers = {};
		
		this.$.mxajaxGetURLType.headers = headers;
				
		return new Promise(function (resolve, reject) {
						this.$.mxajaxGetURLType.generateRequest().completes.then(function(result){
							var urlTypeForFile = '';
							if (result.xhr && result.xhr.response) {
								var response = result.xhr.response;
								if (response && response.member && response.member.length > 0) {
									var synonymdomain = response.member[0].synonymdomain;
									if (synonymdomain && synonymdomain.length > 0) {
										for(var idx in synonymdomain) {
											if (synonymdomain[idx].maxvalue === 'FILE') {
												urlTypeForFile = synonymdomain[idx].value;
												break;
											}
										}
									}
								}
							}
							if (urlTypeForFile.length > 0) {
								resolve(urlTypeForFile); 
							}
							else {
								reject();
							}
						}, 
						function(error, response) { 
							reject(error); 
						});
					}.bind(this));			
	},

	/**
	 *  Add attachment in memory record.
	 */
	addAttachmentToMemoryRecord: function(attachmentData, responseProperties) {
		var ajaxURL = this._getResourceURL(false) + '?editmode=1';
		var doclinksData = {};
		
		// If authentication is needed, just return.
		if (this._isAuthenticationNeeded())
		{
			return new Promise(function (resolve, reject) {
							reject('Authentication needed');
						}.bind(this));
		}

		var headers = {};
		if(this.contentLocalized)
		{
			headers['content-localized'] = '1';
		}
	    //adding the csrf token
		headers.csrftoken = $M.getCSRFToken();
		if (responseProperties)
		{
			headers.properties = responseProperties;
		}

		headers['x-method-override'] = 'PATCH';
		headers.patchtype = 'MERGE';
		headers['Content-Type'] = 'application/json';

		var idx = attachmentData.content.indexOf(',');
		
		if (idx === -1) {
			doclinksData.documentdata = attachmentData.content;
		}
		else {
			doclinksData.documentdata = attachmentData.content.substring(idx+1);
		}
		
		doclinksData.doctype = 'Attachments';
		doclinksData.document = attachmentData.description.substring(0, 20);
		doclinksData.urlname = attachmentData.description;
		doclinksData.description = attachmentData.description;
		doclinksData._action = 'Add'; 

		this.$.mxajaxCreateAttachmentToMemoryRecord.url=ajaxURL;
		this.$.mxajaxCreateAttachmentToMemoryRecord.handleAs='json';
		this.$.mxajaxCreateAttachmentToMemoryRecord.method='POST';
		this.$.mxajaxCreateAttachmentToMemoryRecord.headers = headers;

		if (this.urlTypeForFile && this.urlTypeForFile.length > 0) {
			doclinksData.urltype = this.urlTypeForFile;
			this.$.mxajaxCreateAttachmentToMemoryRecord.body=JSON.stringify({'doclinks':[doclinksData]});
			this.$.mxajaxCreateAttachmentToMemoryRecord.generateRequest();
		}
		else {
			
			this.getUrlType().then(
				function(result) {
					this.urlTypeForFile = result;
					doclinksData.urltype = this.urlTypeForFile;
					this.$.mxajaxCreateAttachmentToMemoryRecord.body=JSON.stringify({'doclinks':[doclinksData]});
					this.$.mxajaxCreateAttachmentToMemoryRecord.generateRequest();
				}.bind(this), 
				function(error) {
				}
			);
		}
		
		return new Promise(function (resolve, reject) {
			this.resolveCreateAttachmentToMemoryPromise = resolve;
			this.rejectCreateAttachmentToMemoryPromise = reject;
		}.bind(this));
	},
	
	/**
	 *  Add attachment in memory record.
	 */
	removeAttachmentFromMemoryRecord: function(localref) {
		var ajaxURL = this._getResourceURL(false) + '?editmode=1';
		var doclinksData = {};
		
		// If authentication is needed, just return.
		if (this._isAuthenticationNeeded())
		{
			return new Promise(function (resolve, reject) {
							reject('Authentication needed');
						}.bind(this));
		}

		var headers = {};
		if(this.contentLocalized)
		{
			headers['content-localized'] = '1';
		}
	    //adding the csrf token
		headers.csrftoken = $M.getCSRFToken();
		headers['x-method-override'] = 'PATCH';
		headers.patchtype = 'MERGE';
		headers['Content-Type'] = 'application/json';

		doclinksData.localref = localref;
		doclinksData._action = 'Delete'; 

		this.$.mxajaxDeleteAttachmentFromMemoryRecord.url=ajaxURL;
		this.$.mxajaxDeleteAttachmentFromMemoryRecord.handleAs='json';
		this.$.mxajaxDeleteAttachmentFromMemoryRecord.method='POST';
		this.$.mxajaxDeleteAttachmentFromMemoryRecord.headers = headers;
		this.$.mxajaxDeleteAttachmentFromMemoryRecord.body=JSON.stringify({'doclinks':[doclinksData]});
		this.$.mxajaxDeleteAttachmentFromMemoryRecord.generateRequest();
		
		return new Promise(function (resolve, reject) {
			this.resolveRemoveAttachmentFromMemoryPromise = resolve;
			this.rejectRemoveAttachmentFromMemoryPromise = reject;
		}.bind(this));
	},	
	

	/**
	 * abort creating an attachment.
	 */
	abortCreateAttachment: function() {
		if (this.$.mxajaxCreateAttachmentRecord.lastRequest) {
			this.$.mxajaxCreateAttachmentRecord.lastRequest.xhr.abort();
		}
	},
	
	/**
	 * abort adding an attachment to memory.
	 */
	abortAddAttachmentToMemoryRecord: function() {
		if (this.$.mxajaxCreateAttachmentToMemoryRecord.lastRequest) {
			this.$.mxajaxCreateAttachmentToMemoryRecord.lastRequest.xhr.abort();
		}
	},

	/**
	 * Processes the response as a result of creating an attachment.
	 */
	_processCreateAttachmentProgress: function(e)
	{
		var jsonResponse = e.detail;

		this.fire('attachment-progress', jsonResponse);
	},
	
	_processCreateAttachmentResponse: function(e)
	{
		var jsonResponse = e.detail.response;

		this.fire('attachment-created', jsonResponse);
	},
	
	_processCreateAttachmentResponseError: function(e)
	{
		var jsonResponse = e.detail;
		
		// TODO - cleanup this event
		this.fire('attachment-error', jsonResponse);
		
		this.fire('attachment-create-error', jsonResponse);
	},	

	_processDeleteAttachmentResponse: function(e)
	{
		this.fire('attachment-deleted', e.detail);
	},
	
	_processDeleteAttachmentResponseError: function(e)
	{
		var jsonResponse = e.detail;
		
		this.fire('attachment-delete-error', jsonResponse);
	},
	/**
	 * Processes the response as a result of creating an attachment in memory record.
	 */
	_processCreateAttachmentToMemoryResponse: function(e)
	{
		var jsonResponse = e.detail.response;

		this.resolveCreateAttachmentToMemoryPromise(jsonResponse);
		
		this.fire('attachment-created', jsonResponse);
	},
	
	_processCreateAttachmentToMemoryProgress: function(e)
	{
		var jsonResponse = e.detail;
		
		this.fire('attachment-progress', jsonResponse);
	},
	
	_processCreateAttachmentToMemoryResponseError: function(e)
	{
		var jsonResponse = e.detail;
		
		this.rejectCreateAttachmentToMemoryPromise(e.detail);
		
		this.fire('attachment-error', jsonResponse);
	},

	/**
	 * Processes the response as a result of removing an attachment from memory record.
	 */
	_processDeleteAttachmentFromMemoryResponse: function(e)
	{
		this.resolveRemoveAttachmentFromMemoryPromise(e.detail);
		
		this.fire('attachment-deleted', e.detail);
	},
	
	_processDeleteAttachmentFromMemoryResponseError: function(e)
	{
		this.rejectRemoveAttachmentFromMemoryPromise(e.detail);
		
		this.fire('attachment-delete-error', e.detail);
	},
	

	/**
	 * Processes the response as a result of creating an attachment.
	 */
	_processRecordDeleteResponse: function(e)
	{
		var jsonResponse = e.detail.response;

		this.fire('record-deleted', jsonResponse);
	},

	/**
	 * Processes the response as a result of duplicating a record..
	 */
	_processDuplicateRecordResponse: function(e)
	{
		var jsonResponse = e.detail.response;

		this.fire('record-duplicated', jsonResponse);
	},
	
	
	
	/**
	 * Constructs a data access query URL based on various filter mechanisms.
	 * Returns the URL as a string.
	 */
	_getResourceURL : function(addPropsToURL)
	{

			var resAccessURL = '';

			var resURL;
			if (this.resourceUri)
			{
				resURL = this.resourceUri;
			}
			else if (this.memberData)
			{
				resURL = this.memberData.href;
			}
			else
			{
				resURL = this.resourceData.href;
			}

			resAccessURL = resURL;

			if (this.attributeNames && addPropsToURL)
			{
				if (resAccessURL.indexOf('?') > 0)
				{
					resAccessURL = resAccessURL + '&lean=1&oslc.properties='+encodeURIComponent(this.attributeNames);
				}
				else
				{
					resAccessURL = resAccessURL + '?lean=1&oslc.properties='+encodeURIComponent(this.attributeNames);
				}
			}

			if (this.action)
			{
				if (resAccessURL.indexOf('?') > 0)
				{
					resAccessURL = resAccessURL + '&action='+encodeURIComponent(this.action);
				}
				else
				{
					resAccessURL = resAccessURL + '?action='+encodeURIComponent(this.action);
				}
			}
			
			if (this.setLocalized)
			{
				if (resAccessURL.indexOf('?') > 0)
				{
					resAccessURL = resAccessURL + '&setlocalizedrep=1';
				}
				else
				{
					resAccessURL = resAccessURL + '?setlocalizedrep=1';
				}
			}
			
			if (this.queryLocalized)
			{
				if (resAccessURL.indexOf('?') > 0)
				{
					resAccessURL = resAccessURL + '&querylocalized=1';
				}
				else
				{
					resAccessURL = resAccessURL + '?querylocalized=1';
				}
			}
			
			
			if (this.queryParams)
			{
				var qps = '';
				for (var key in this.queryParams)
				{
					if (this.queryParams.hasOwnProperty(key))
					{
						qps += '&'+encodeURIComponent(key)+'='+encodeURIComponent(this.queryParams[key]);
						//alert(key + ' -> ' + p[key]);
					}
				}
				if (resAccessURL.indexOf('?') > 0)
				{
					resAccessURL = resAccessURL + qps;
				}
				else
				{
					resAccessURL = resAccessURL + '?' + qps;
				}
			}
			
			resAccessURL = this._addCtxTermsToURL(resAccessURL);
			resAccessURL = this._addSubObjectQuerytoURL(resAccessURL);
			return resAccessURL;
		},

	isBookmarked: function()
	{
		if(!this.resourceData && !this.memberData) { 
			return false; 
		}
		if(this.resourceData) { 
			return this.resourceData._bookmarked; 
		}
		if(this.memberData) { 
			return this.memberData._bookmarked; 
		}
	},

	getImageRef: function()
	{
		if(!this.resourceData && !this.memberData) { 
			return false; 
		}
		if(this.resourceData) { 
			return this.resourceData._imagelibref; 
		}
		if(this.memberData) { 
			return this.memberData._imagelibref; 
		}
	},


	/**
	 * Returns true if the passed parameter is a number.
	 */
	_isInteger: function(x)
	{
		return (typeof x === 'number') && (x % 1 === 0);
	},



	/**
	 * Retrieves the first page of data
	 */
	_retrieveData: function(e)
	{
		var jsonResponse = e.detail.response;
		this.set('resourceData', jsonResponse);
	},

	
	_addCtxTermsToURL: function(accessURL){
		if(this.ctxTerms){
    		if (accessURL.indexOf('?') <= 0){
    			accessURL = accessURL + '?';
    		}
    		
    		accessURL = accessURL + '&ctx=';
    		
			for (var key in this.ctxTerms) {
			    if (this.ctxTerms.hasOwnProperty(key)) {
			    	accessURL = accessURL + key + '=' + this.ctxTerms[key] + ',';
			    }
			}
			return accessURL.substring(0,accessURL.length-1);
		}
		return accessURL;
	},
	
	_addSubObjectQuerytoURL: function(accessURL){
		if(this.childObjectName && this.childObjectFilter){
			var filterData = this._addFilterClauseToQueryURL(this.childObjectFilter);
			if(filterData){
	    		if (accessURL.indexOf('?') > 0)
	    		{
	    			accessURL = accessURL + '&' + this.childObjectName + '.where=' + filterData;
	    		}
	    		else
	    		{
	    			accessURL = accessURL + '?' + this.childObjectName + '.where=' + filterData;
	    		}
			}
		}
		return accessURL;
	},
	
	_addFilterClauseToQueryURL: function(filterData)
	{
    	var filterDataQuery;
    	
    	var filterFieldValue;
    	
    	if (filterData && filterData.length > 0)
    	{
    		// status in ['WAPPR','INPRG']  and worktype = 'CM'
    		//
    		var l = 0;
    		for (var i=0; i< filterData.length; i++)
    		{
    			var filterfield = filterData[i].field;
    			var filtertype = filterData[i].filtertype;
    			var filters = filterData[i].availablevalues;

				var fieldFieldQuery;
				var j=0;
				
    			if (filtertype === 'SIMPLE'){
        			if (filters.length > 0){
        				//TO DO: remove that part after the fix for where clause
            			//@yajin
            			//@Anamitra
        				if(filters.length === 1){
        					fieldFieldQuery = filterfield + '=';
        				}else{
        					fieldFieldQuery = filterfield + ' in [';
        				}

            			var foundSelectedValue = false;
            			// each filter becomes part of an in cluase
            			var k = 0;
            			for (j=0; j< filters.length; j++){
            				if (!filters[j].selected || filters[j].selected === false){
            					continue;
            				}

            				foundSelectedValue = true;

                			if (k > 0){
                				fieldFieldQuery = fieldFieldQuery + ',';
                			}

                			filterFieldValue = filters[j].value;
                			if (filterFieldValue){
                    			//if (Number.isInteger(filterFieldValue))
                				if (this._isInteger(filterFieldValue)){
                        			fieldFieldQuery = fieldFieldQuery + '' + filterFieldValue + '';
                    			}else{
                        			fieldFieldQuery = fieldFieldQuery + '"' + filterFieldValue + '"';
                    			}
                			}
                			k++;
                		}
            			if(filters.length > 1){
            				fieldFieldQuery = fieldFieldQuery + ']';
            			}

            			if (!filterDataQuery){
            				filterDataQuery = '';
            			}

            			if (foundSelectedValue === true){
                			if (l > 0){
                				filterDataQuery = filterDataQuery + ' and ';
                			}
                			filterDataQuery = filterDataQuery + fieldFieldQuery;
                			l++;
            			}
        			}
    			}else if (filtertype === 'DATERANGE'){
        			if (filters.length > 0){
            			for (j=0; j< filters.length; j++){
            				if (!filters.selected || filters[j].selected === false){
            					continue;
            				}

                			filterFieldValue = filters[j].value;
                			if (filterFieldValue){
                				
                				var from;
                				var to;
                				
                				if (filterFieldValue === 'week'){
                					from = moment().subtract(7, 'days').format();
                					to = moment().format();

                					if (filterDataQuery && (filterDataQuery.length > 0)){
                						filterDataQuery = filterDataQuery + ' and ';
                					}else{
                						filterDataQuery = '';
                					}
                					fieldFieldQuery = '' + filterfield + '>="' + from + '" and ' + filterfield + '<="' + to + '"';
                					filterDataQuery = filterDataQuery + fieldFieldQuery;
                				}else if (filterFieldValue === 'month'){
                					from = moment().subtract(30, 'days').format();
                					to = moment().format();

                					if (filterDataQuery && (filterDataQuery.length > 0)){
                						filterDataQuery = filterDataQuery + ' and ';
                					}else{
                						filterDataQuery = '';
                					}
                					fieldFieldQuery = '' + filterfield + '>="' + from + '" and ' + filterfield + '<="' + to + '"';
                					filterDataQuery = filterDataQuery + fieldFieldQuery;
                				}
                			}
                		}
        			}
    			}
    		}
    	}
    	return filterDataQuery;
	},
	
  });