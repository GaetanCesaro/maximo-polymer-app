/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */
/*
The `maximo-collection` element provides access to a set of maximo objects. 

Use the maximo-collection component when an application has a need to retrieve 
a set of records related to an Object Structure. The set of records can be further 
filtered using page size, query name, search terms etc. The record data retrieved 
can also be filtered further for set of attributes that are really needed.

For example, the following element definition retrieves the asset data based on MXAPIASSET
Object Structure into the myAssetRecordData object.

    <maximo-collection
        auto
        object-name="MXAPIASSET"
        attribute-names="assetnum,description,siteid"
        selected-query-name="All"
        collection-data="{{myAssetRecordData}}">
    </maximo-collection>

With `auto` attribute, the element performs a request whenever 
its `selected-query-name` property is changed. NOTE Do not use the `auto` 
attribute unless it is absolutely needed in applications. It is provided for 
some quick prototypes or sample code. You can trigger a refresh explicitly 
by calling `refreshRecords` on the element.

The element provides ability to group data. Data can be grouped using `fetchGroupByData` method. 
Note that `group-by-attribute-names` attribute should be set and the data 
retrieved can be obtained by binding to `group-by-data`.

The element provides ability to get distinct values for an attribute. Distinct values
can be obtained using `getDistinctValuesForAttribute` method by passing an attribute name.
The data retrieved can be obtained by binding to `distinct-values`.

The element provides ability create a new record. To create a new record, use the
`createRecord` method and pass the record data to be created as JSON object.

The element provides ability to invoke an action. To invoke an action, use the
`invokeAction` method and pass the action name and parameters appropriately.


*/
Polymer({
    is: 'maximo-collection',
    
    /**
     * Fired when a records are fetched from the server.
     *
     * @event collection-refreshed
     */
        
    /**
     * Fired when there is a problem fetching records from the server.
     *
     * @event collection-refresh-error
     */

    /**
     * Fired when a record is created successfully.
     *
     * @event record-created
     */
    
    /**
     * Fired when there is a problem in creating a record.
     *
     * @event record-create-error
     */

    /**
     * Fired when a record's attachment is created successfully.
     *
     * @event attachment-created
     */
    
    /**
     * Fired when there is a problem creating an attachment.
     *
     * @event attachment-create-error
     */
    
    /**
     * Fired when group by data is fetched from the server.
     *
     * @event groupby-data-refreshed
     */
   
    /**
     * Fired when there is a problem fetching group by data from the server.
     *
     * @event groupby-data-refresh-error
     */
    
    /**
     * Fired when distinct value data for an attribute is fetched from the server.
     *
     * @event distinct-values-refreshed
     */
   
    /**
     * Fired when there is a problem fetching distinct value data for an attribute from the server.
     *
     * @event distinct-values-refresh-error
     */
    
    /**
     * Fired when an action is successfully invoked.
     *
     * @event action-invoked
     */
   
    
    /**
     * Fired when there is a problem invoking an action.
     *
     * @event action-invoke-error
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
      	
      	/**
      	 * List of search term attribute names separated by comma. 
      	 */
      	searchAttributeNames: {
      		type: String
      	},
      	
      	/**
      	 * List of attributes to select in a group by query, separated by comma.
      	 * Should include at least one aggregate function, for example count.*
      	 */
      	groupByAttributeNames: {
      		type: String
      	},

      	/**
      	 * List of expressions using aggregated values to filter the results of a group by query,
      	 * separated by a comma. For example, count.*>100.
      	 */
      	groupByHavingClause: {
      		type: String
      	},

      	/**
      	 * Comma separated list of attribute names that can be used to order the grouped collection data.
      	 * <div>
      	 * For example, to order by record count ascending, set the value as <b>%2Bcount.*</b> and to 
      	 * order by descending, set the calue as <b>-count.*</b>
      	 * </div>
      	 */
      	groupBySortClause: {
      		type: String
      	},
      	/**
      	 * List of related attribute names to include in a group by query, 
      	 * in the format relationname[attributename].  For example, classstructure[description]
      	 */
      	groupByRelatedAttributes: {
      		type: String
      	},
      	/**
      	 * A flag to indicate if the collection data need to be automatically
      	 * refreshed upon some property changes or not.
      	 * Defaults to true. If set to false, expicitly refresh methods need to be called.
      	 */
      	auto: {
      		type: Boolean,
      		value: false
      	},
      	
      	
      	/** local url from which to get data. Does not require login */
      	testUrl: {
      		type: String,
      		observer: '_getTestData'
      	},
      		
    	
      	/**
      	 * A flag to indicates whether the collection record response 
      	 * should indicate if a record is book marked or not.
      	 */
      	checkForBookmarks: {
      		type: Boolean,
      		value: false
      	},
      	
      	/**
      	 * Actual data retrieved from the server. 
      	 * Note that only one page (based on pageSize) worth of data at a time is retrieved.
      	 */
      	collectionData: {
      		type: Array,
      		notify: true
      	},
      	
      	/**
      	 * Flag to indicate whether the previously loaded collection data should be retained when calling refreshNextPageRecords()
      	 */
      	retainPreviousData: {
      		type: Boolean,
      		value: false,
      		notify: true
      	},
      	
      	/**
      	 * Actual data retrieved from the server. 
      	 * Note that only one page (based on pageSize) worth of data at a time is retrieved.
      	 */
      	groupByData: {
      		type: Object,
      		notify: true
      	},
      	/**
      	 * Actual data retrieved from the server. 
      	 * Note that only one page (based on pageSize) worth of data at a time is retrieved.
      	 */
      	queryWhere: {
      		type: Object
      	},


      	insightData: {
      		type: Object,
      		notify: true
      	},
      	
      	/**
      	 * Information about the creation details (url used to create) that can be used 
      	 * to create an object of the type specified by the objectName.
      	 * Represents an array of creation details.
      	 * Each [] memner is of {'name', 'Creation Name', url: 'http:../maximo/creationurl'}
      	 */
      	creationInfo: {
      		type: Array,
      		//value: [],
      		notify: true
      	},
        /**
         * This is updated every time we create a new in memory record.
         */
        newRecordHref: {
          type: String,
          notify: true
        },
	    /**
	     * Length of time in milliseconds to debounce multiple requests 
	     * because of multiple attribute value changes, when auto is set.
	    */
		debounceDuration: {
	        type: Number,
	        value: 0,
	        notify: true
		},
      
    	/**
    	 * The Data Access Servlet URI used (TODO - need to make this optional)
    	 */
    	/*dataAccessServletUri: {
    		type: String,
    		value: '/MaximoNextGenUI/MaximoDataAccessServlet'
    	},*/
    	 
    	/**
    	 * OSLC Domain used for fetching data
    	 */
      	/*domainUri: {
      		type: String,
      		value: '/oslc/sp/SmarterPhysicalInfrastructure'
      	},*/
      	
      	/**
      	 * List of attribute names for which data is fetched whenever a record selection changes.
      	 */
      	dynamicAttributeNames: {
      		type: Object,
      		notify: true
      	},
      	
      	/**
      	 * An array that has metadata about how to filter the collection data.
		 * Represents an array of filters, so it can be rendered as breadcrumbs.
		 * Each element of the array is an object that has the following meta data.
		 *
		 * <div>
		 * <b>'type'</b>: 'Work Type' => name that will appear to the user in UI
		 * </div>
		 * <div>
		 * <b>'field'</b>: 'worktype' => field that will be used to build the OSLC query
		 * </div>
		 * <div>
		 * <b>'availablevalues'</b> : [] => an array of the selected filters within the filter
		 * </div>
		 * <div>
		 * where each element of the array is an object that has the following meta data.
		 * </div>
		 * <div>
		 *     {
		 * </div>
		 * <div>
		 *        <b>'description'</b>: 'Corrective Maintenance',	=> name that would appear to user in UI
		 * </div>
		 * <div>
		 *		  <b>'value'</b>: 'CM' 		=> value that will be used to build the OSLC query
		 * </div>
		 * <div>
    	 *        <b>'selected'</b>: true/false
    	 * </div>
    	 * <div>
		 *		}
		 * </div>
      	 */
      	filterData: {
      		type: Array,
      		notify: true,
      		value: function(){
      			return [];
      		}
      	},
      	
      	/**
		 * A flag that indicates if the request contains localized json.
		 */
      	contentLocalized: {
      		type: Boolean,
      		value: false
      	},
      	
      	/**
		 * A flag that indicates if the response should contains localized JSON.
		 */
      	addLocalizedrep: {
      		type: Boolean,
      		value: false
      	},
      	
		/**
		 * A flag that indicates whether to combine filters
		 * using the OR operand.  The default is false, which uses AND.
		 */
      	useOrOperand: {
      		type: Boolean,
      		value: false
      	},
      	
      	/**
      	 * A flag that indicates whether the collection data 
      	 * has a book marked record or not.
      	 */
      	hasBookmarks: {
      		type: Boolean,
      		value: false,
      		readOnly: true
      	},
      	
		/**
		 * A search value that filters the collection data.
		 */      	
      	keySearch: {
      		type: String,
      		value: '',
      		notify: true
      	},
      	
      	/**
      	 * keySearchAttributeName, an attribute name used for a record search. 
      	 * The keySearch value is used with this attribute name.
      	 */
      	keySearchAttributeName: {
      		type: String,
      		notify: true
      	},
      	
      	/**
      	 * A lean mode used for specifying tha attribute names. When leanMode is set to false,
      	 * the attribute names are expected to be in oslc namespace prefix format as defined
      	 * by the object structure.
      	 *
      	 * Defaults to true.
      	 */
      	_leanMode: {
      		type: Boolean,
      		value: true
      	},
      	
      	/**
      	 * Is query localized.
      	 */
      	queryLocalized: {
      		type: Boolean,
      		value: true
      	},

      	
      	/**
      	 * URI of the next page used for fetching next page data.
      	 */
      	nextPageUri: {
      		type: String
      	},

      	/**
      	 * URI of the previous page used for fetching previous page data.
      	 */
      	previousPageUri: {
      		type: String
      	},
      	
		/**
		 * Name of the object structure used for fetching data.
	     */
		objectName: {
	    	type: String,
	    	observer: '_objectNameChanged',
	    	notify: true
		},
		
		_cachedObjectName: {
	    	type: String,
	    	notify: true
		},
		
		/**
		 * collection uri used for fetching data.
	     */
		collectionUri: {
	    	type: String
		},

    
      	/**
      	 * orderByAttributeNames, A comma separated list of attribute names that can be used to order the collection data.
      	 * <div>
      	 * For example, to order by description ascending, set the value as <b>%2Bdescription</b> and to 
      	 * order by descending, set the calue as <b>-description</b>
      	 * </div>
      	 *
      	 */
      	orderByAttributeNames: {
      		type: String,
      		notify: true
      	},
      	
      	/**
      	 * orderByChildAttributeNames, A array of objects composed by collection reference (String) and attributes (String).  
      	 * The attribute value is a comma separated list of attribute names that can be used to order the collection data.
      	 * <div>
      	 * For example, in the following selected attributes :
      	 * attribute-names="wonum,workorderid,rel.childtask{taskid,description,status}"
      	 * if taskid is the sortable attribute the object would be:
      	 * {collection: '{woclass}.{relation_name}',attributes: '{attributes_list as string}'}
      	 * {collection:'workorder.childtask',attributes:'%2Btaskid'}
      	 * to order by description ascending, set the value as <b>%2Bdescription</b> and to 
      	 * order by descending, set the calue as <b>-description</b>
      	 * </div>
      	 *
      	 */
      	orderByChildAttributeNames: {
      		type: Array,
      		notify: true
      	},
      	
      	/**
      	 * Maximum number of records to fetch on a network call.
      	 */
      	pageSize: {
      		type: Number,
      		value: 50,
      		notify: true
      	},
      	
      	/**
      	 * Information about the query details that this collection supports.
      	 * Represents an array of query details.
      	 * Each [] memner is of {'name', 'My Query', url: 'http:../maximo/queryurl'}
      	 */
      	queryInfo: {
      		type: Array,
      		//value: [],
      		notify: true
      	},
      	
      	_cachedQueryInfo: {
      		type: Array,
      		//value: [],
      		notify: true
      	},

      	/**
      	 * An object of query parameter name and value pairs that can be used to substitute a query URL containing parameters.
      	 */
      	queryParams: {
      		type: Object,
      		notify:true
      	},
      	
      	/**
      	 * Additional parameters to append to the url.
      	 * When appending to the end of the URL use:  &key=value
      	 */
      	additionalParams: {
      		type: Array,
      		notify:true,
      		observer: 'collectionOptionsChanged'
      	},
      	
		/**
		 * An internal data used for keeping track of dynamic attributes fetched.
		 */      	
      	recentlyFetchedAttributes: {
      		type: Array
      	},
      	
      	/**
      	 * Actual value for which the collection need to be filtered.
      	 */
      	searchTermValue: {
      		type: String,
      		value: '',
      		notify: true
      	},
      	
      	/**
      	 * Indicates the index of the query selected from the queryInfo list.
      	 * The collection is automatically refreshed when the index is changed.
      	 */
      	selectedQueryIndex: {
      		type: Number,
      		value: -1,
      		notify:true
      	},
      	
      	/**
      	 * Indicates the name of the query selected from the queryinfo list.
      	 * Changing the query name will set the query index, which would automatcally refresh
      	 * the collection data.
      	 */
      	selectedQueryName: {
      		type: String,
      		notify: true,
      		observer: '_selectedQueryNameChanged'
      	},
      	
      	/**
      	 * Indicates the url of a query that can be used to filter the collection data.
      	 */
      	selectedQueryUri: {
      		type: String,
      		notify: true
      	},
      	
      	/**
      	 * Indicates the record from the collection that's selected.
      	 * Selecting a record causes the dynamic attributes to be fetched and
      	 * causes the dynamic attributes to be fetched and cached as part of the 
      	 * collection data.
      	 */
      	selectedRecord: {
      		type: Object,
      		notify: true,
      		observer: '_selectedRecordChanged'
      	
      	},

      	/**
      	 * Indicates the index of a record from the collection that's selected.
      	 * Setting a selected record index, causes the dynamic attributes to be
      	 * fetched and cached as part of the collection data.
      	 */
      	selectedRecordIndex: {
      		type: Number,
      		value: -1,
      		notify: true,
      		observer: '_selectedRecordIndexChanged'
      	},
      	
      	/**
      	 * A flag to indicate whether to filter the collection data 
      	 * with the book marked records or not.
      	 */
      	showBookmarks: {
      		type: Boolean,
      		value: false
      	},
      	
      	/**
      	 * Total Number of records that match the query.
      	 */
      	totalCount: {
      		type: Number,
      		value: 0,
      		notify: true
      	},
      	
      	/**
      	 * Indicates whether search terms (text search based) are used or not.
      	 * NOTE: Search terms (i.e the actual attribute names used for search) need to be defined 
      	 * at the ObjectStructure for now, but eventually would be able to define at this object level.
      	 */
      	useSearchTerms: {
      		type: Boolean,
      		value: false,
      		notify: true
      	},
      	countNew:{
      		type: Number,
      		value: 0
      	},
      	/**
      	 * List of distinct values obtained as a result of calling 
      	 * the method getDistinctValuesForAttribute for an attribute.
      	 */
      	distinctValues: {
      		type: Array,
      		value: []
      	},
      		
      	/**
      	 * A refresh interval in seconds that can be used to automatically refresh the collection.
      	 * Note that this will cause network requests to be sent at every such interval.
      	 */
      	refreshInterval : {
      		type: Number,
      		value: 0
      	},
      	
      	timerHandle : {
      		type: Object
      	},
      	
      	refreshListeners : {
      		type: Array,
      		value : function(){
      			return [];
      		},
      		notify: true
      	},
      	
      	/**
      	 * TimeLine queries support querying around a date attribute within a specified range.
      	 * For example if the date attribute is elected to be status date and the date range in -90D 
      	 * ie list all records that have had a status change in the last 90 days.
      	 * 
      	 * Example:
      	 * http://localhost:7001/maximo/oslc/os/mxasset?_lid=wilson&_lpwd=wilson&lean=1&tlattribute=statusdate&oslc.orderBy=-statusdate&tlrange=-90D
      	 * 
      	 * If you would like to query around a specified date, we can provide the time line query as below:
      	 * 
    	 * Example:
    	 * http://localhost:7001/maximo/oslc/os/mxasset?_lid=wilson&_lpwd=wilson&lean=1&tlattribute=statusdate=2015-12-08T16:35:03-05:00&oslc.select=statusdate&oslc.orderBy=-statusdate&tlrange=%2B-4W
    	 * 
    	 * This fires a query to fetch all records that have a status change in the +- 4 weeks since  2015-12-08T16:35:03
    	 * The important thing to note here is the way we set the timeline base date statusdate=<date in iso 8601 format>. If none is provided, its assumed to be system current date.
    	 * Also note that the tlrange=+-4W - where the '+' is url encoded as %2B.
    	 * 
    	 * The supported units are:
    	 * Y - Year
    	 * M -  month
    	 * D - day
    	 * W - Week
    	 * h - hour
    	 * m -  minute
    	 * s - second
    	 */
      	timeLineAttribute : {
      	    type: String,
      		notify: true
      	},
      	
      	timeLineRange : {
      	    type: String,
      		notify: true
      	},
      	
      	/**
      	 * Page Number of the currently fetched data.
      	 */
      	
      	pageNum: {
      		type: Number,
      		value: 0,
      		notify:true
      	},
      	
      	totalPages: {
      		type: Number,
      		notify:true
      	},
      	
      	/**
      	 * A flag to indicate if schema should be included in the response.
      	 */
      	addschema: {
      		type: Object,
      		notify: true,
      		value: function(){
      			return true;
      		}
      	},
      	
      	/**
      	 * A flag to indicate if identity attribute called _id should be returned as part of the record. 
      	 */
      	addid: {
      		type: Object,
      		notify: true,
      		value: function(){
      			return true;
      		}
      	},
      	
      	/**
      	 * Schema data that's fetched for this collection.
      	 */
      	schema: {
      		type: Object,
      		notify:true
      	},
      	
      	subselects: {
      		type: String,      		
      		value: '',
      		notify: true,
      		observer: 'collectionOptionsChanged'
      	},
      	
      	queryTemplateName: {
      		type: String,
      		notify: true
      	},
      	
      	useQueryTemplate: {
      		type: Boolean,
      		notify: false
      	},
      	
      	/**
      	 * Flag to include localized parameters
      	 */
      	localizedRepo: {
      		type: String,
      		value: '1'
      	},
      	
      	insightName: {
      		type: String,
      		notify: true
      	},
      	
      	groupByFromDate: {
      		type: String,
      		notify: true
      	},
      	
      	groupByToDate: {
      		type: String,
      		notify: true
      	},
      	
      	_componentListeners: {
      		type: Object,
      		value: function(){
      			return {};
      		}
      	},
      	
      	// 0: not sorted, 1: asc, 2: desc
      	insightValueSort: {
      		type: String
      	}
    },

    firstLoad : true,
    observers: [
      'collectionOptionsChanged(selectedQueryName, keySearch, ' + 
      						'useSearchTerms, searchTermValue, showBookmarks, filterData, auto, subselects)'
    ],
    
    /* jshint ignore:start */
    // debounce for multiple attributes changed in a sequence
    collectionOptionsChanged: function(selectedQueryName, keySearch, useSearchTerms, searchTermValue, 
    		showBookmarks, filterData, auto, subselects){
		this.debounce('refresh-records', function() {
			if (this.auto) {
				if (this.groupByAttributeNames) {
					this.fetchGroupByData().then(function(result){}, function(error) {});
				}
				else {
					this.refreshRecords().then(function(result){}, function(error) {});
				}
			}
		}, this.debounceDuration);
    },
    /* jshint ignore:end */
    
    // Listeners
    listeners: {
    	// event sent as part of a successful login
        'refresh-data': '_handleLoginRefresh'
    },
    
	ready: function()
	{
		$M.registerCollection(this.id, this.refreshListeners);
	},

	addComponentListener: function(object, eventName){
		if(!eventName){
			eventName = 'collection-refreshed';
		}
		if(eventName !== 'collection-data-refresh-requested' && eventName !== 'collection-refreshed' && eventName !== 'collection-data-refreshed'){
			console.error('Could not add listener to '+ this.id + 'only [\'collection-data-refresh-requested\' & \'collection-refreshed\'] are allowed.');
		}
		if(!this._componentListeners[eventName]){
			this._componentListeners[eventName] = [];
		}
		this._componentListeners[eventName].push({ object:object, eventName:eventName });
	},
	
	/**
	 * Called as part of a successful login, if the collection component is used 
	 * within an app component. This call takes care of fetching the data automatically
	 * as soon as the login happens.
	 */
	_handleLoginRefresh: function(e)
	{
		if (this.auto === true || this.testUrl)
		{
			//Anamitra
			if (!this.collectionUri && !this.objectName)
			{
				return;
			}
			//Anamitra
			//this.queryInfo = globalServiceProvider.getQueryCapabilities(this.$.myauthenticator.getBaseUri(), this.domainUri, this.objectName);
			//this.creationInfo = globalServiceProvider.getCreationFactories(this.$.myauthenticator.getBaseUri(), this.domainUri, this.objectName);

			if ((this.queryInfo === null || this.creationInfo === null) && this.objectName)
			{
				this.refreshServiceProviderData().then(function(result){}, function(error) {});
			}
			else
			{
				this.refreshRecords().then(function(result){}, function(error) {});
			}
		}
	},
	
	/**
	 * If object name is changed, make sure to refresh the service provider details.
	 */
	_objectNameChanged: function(e)
	{
		// Make sure to refresh the query information
		if (this.auto === true)
		{
			this.refreshServiceProviderData().then(function(result) {}, function(error) {});
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
	_getServiceProviderURL: function()
	{
		var serviceProviderURL = this.$.myauthenticator.getBaseUri() + '/oslc/apimeta/'+this.objectName;
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
	fetchGroupByData: function()
	{
		// If authentication is needed, just return.	
		if (this._isAuthenticationNeeded())
		{
			return new Promise(function (resolve, reject) {
							reject(Error('Authentication needed'));
							$M.workScape.returnToLogin();
						}.bind(this));
		}
		
		if(this.objectName && !this.collectionUri)
		{
			if ((!this.queryInfo))//|| !this.creationInfo))
			{
				return new Promise(function (resolve, reject) {
								this.refreshServiceProviderData().then(
										function(result) {
											// after sp data is refreshed, refresh the data
											this.fetchGroupByData().then(function(result) { 
												resolve(result);
												}.bind(this));
										}.bind(this), 
										function(error) { 
											reject(error);		
										});
							}.bind(this));
			}
			
			// If there is no queryInfo after retrieving SP data,
			// just return.
			if (!this.queryInfo)
			{
				return new Promise(function (resolve, reject) {
								reject('No Query Information available');
							}.bind(this));
			}
			
			this._updateSelectedQueryIndex(this.queryInfo, this.selectedQueryName);	
		}
		
			
		this.$.mxajaxGroupBy.url = this._getGroupByQueryURL();
		this.$.mxajaxGroupBy.headers = {};
				
		return new Promise(function (resolve, reject) {
						this.$.mxajaxGroupBy.generateRequest().completes.then(function(result){ resolve(result); }, function(error) { reject(error); });
					}.bind(this));		
	},
	
	
	fetchInsightData: function()
	{
		// If authentication is needed, just return.	
		if (this._isAuthenticationNeeded())
		{
			return new Promise(function (resolve, reject) {
							reject(Error('Authentication needed'));
							$M.workScape.returnToLogin();
						}.bind(this));
		}
					
		this.$.mxajaxInsight.url = this._getInsightURL();
		this.$.mxajaxInsight.headers = {};
				
		return new Promise(function (resolve, reject) {
						this.$.mxajaxInsight.generateRequest().completes.then(function(result){ resolve(result); }, function(error) { reject(error); });
					}.bind(this));		
	},
	
	/**
	 * Refreshes the Service Provider data associated with the object name.
	 * The Service Provider data currently includes the list of public queries
	 * (which include the query name and the query URL) and creation URL to create
	 * new records.
	 * This method returns a Promise. The promise is resolved when the service provider data
	 * is updated successfully, otherwise the promise is rejected with an error.
	 */
	refreshServiceProviderData: function(hardloading)
	{
		// If authentication is needed, just return.	
		if (this._isAuthenticationNeeded())
		{
			return new Promise(function (resolve, reject) {
							reject(Error('Authentication needed'));
							$M.workScape.returnToLogin();
						}.bind(this));
		}
		
		// The following logic is added so, we don't end up making several calls
		// for getting the api meta information. Once the api meta information is obtained,
		// it is stored in session storage for re-use.
		// Logic:
		// 1. If we have not fetched the api meta yet, set a pending flag to indicate that
		//    we are about to fetch the api meta from the server.
		// 2. Other UI elements that use a similar collection, execute the collection code
		//    in the context of the UI thread and they check the pending flag and return a Promise
		//    which will be resolved via event listener logic, which receive event when the fetch 
		//    for the api meta is either success or failure.
		// 3. If the pending flag is set by the current thread code, it will make the ajax request
		//    and returns a Promise that will be resolved when the request is successfully processed
		//    or rejected due to an error. The response processing logic also triggers events
		//    which are received by the listeners (previous step) and process the logic as if they
		//    fetched the data.
		var metaInfo = JSON.parse(sessionStorage.getItem("apimeta-" + this.objectName));
		
		if(hardloading === true){
			metaInfo = undefined;
		}
		
		if (metaInfo)
		{
			this._handleServiceProviderQueryResponseObject(metaInfo);
			
			return new Promise(function (resolve, reject) {
				
				resolve(metaInfo);
			}.bind(this));
		}
		
		var pending = sessionStorage.getItem("apimeta-pending-" + this.objectName);
		
		if (pending)
		{
			var promise = new Promise(function (resolve, reject) {
				
				var successFunction = function() {
					
					var metaInfo = JSON.parse(sessionStorage.getItem("apimeta-" + this.objectName));
					if (metaInfo)
					{
						this._handleServiceProviderQueryResponseObject(metaInfo);
						
						window.removeEventListener("apimeta-response-success" + this.objectName, successFunction);
						
						resolve(metaInfo);
					}
					else
					{
						var errorMsg = "error getting apimeta for " + this.objectName;
						reject(errorMsg);
					}
				}.bind(this);
				
				window.addEventListener("apimeta-response-success" + this.objectName, successFunction);
				
				var errorFunction = function() {
					
					var errorMsg = "error getting apimeta for " + this.objectName;
					window.removeEventListener("apimeta-response-error" + this.objectName, successFunction);
					
					reject(errorMsg);
					
				}.bind(this);
				
				window.addEventListener("apimeta-response-error" + this.objectName, errorFunction);
			}.bind(this));	
			
			return promise;
		}
		
		sessionStorage.setItem("apimeta-pending-" + this.objectName, "true");
		
		this.$.mxajaxServiceProvider.url = this._getServiceProviderURL();
		this.$.mxajaxServiceProvider.headers = {};
				
		return new Promise(function (resolve, reject) {
						this.$.mxajaxServiceProvider.generateRequest().completes.then(function(result){ 
							resolve(result); 
						}, 
						function(error, response) { 
							reject(error); 
						});
					}.bind(this));		
	},
	
	/**
	 * Processes the service provider result returned as part of a REST API call
	 * to get Service Provider data for the domain associated with the domain uri.
	 */
	_processServiceProviderQueryResponse: function(e)
	{
		this._processServiceProviderQueryResponseObject(e.detail.response);
	},
	
	_processServiceProviderQueryResponseObject: function(responseObject)
	{
		// update the service provider data retrieved for the domainURI
		//Anamitra
		//globalServiceProvider.setServiceProviderData(this.domainUri, e.detail.response);

		var sObj = {};
		sObj["queryInfo"] = responseObject.queryCapability;
		sObj["creationInfo"] = responseObject.creationFactory;
		
		sessionStorage.setItem("apimeta-"+this.objectName, JSON.stringify(sObj));
		
		sessionStorage.removeItem("apimeta-pending-" + this.objectName);
		
		this._handleServiceProviderQueryResponseObject(sObj);
		
		this.fire("apimeta-response-success" + this.objectName, sObj);
	},
	
	_handleServiceProviderQueryResponseObject: function(metaInfo)
	{
		this.queryInfo = metaInfo.queryInfo;
		this.creationInfo = metaInfo.creationInfo;
		
		this.set('_cachedQueryInfo',this.queryInfo);
		this.set('_cachedObjectName',this.objectName);
		
		this.fire('queryinfo-refreshed',this.queryInfo);
		// If the query information exists, set the first query as selected,
		// if there is no match to the seledted query.
		this._updateSelectedQueryIndex(this.queryInfo, this.selectedQueryName);
	},
	
	/**
	 * Processes the error as a result of service provider REST API call.
	 */
	_processServiceProviderQueryResponseError: function(e)
	{
		if ($M.checkSession(e)){
			this.fire('data-error', e.detail.request.xhr.response);
		}
		
		sessionStorage.removeItem("apimeta-pending-" + this.objectName);
		
		this.fire("apimeta-response-error" + this.objectName);
	},
	
	/**
	 * Returns an array list of query information. 
	 * Each array element includes a query information that has name and URL.
	 */
	getQueryInfo: function()
	{
		return this.queryInfo; 
	},
	
	/**
	 * Processes the error as a result of a REST call.
	 */
	_processError: function(e)
	{
		console.log('********* maximo-data processError called!');
		this.fire('data-error', e.detail.request.xhr.response);
	},
	
	/**
	 * If the selected query name is changed, updates the selected query index.
	 * Updating the index potentially cause the collection data to be refreshed.
	 */
	_selectedQueryNameChanged: function(e)
	{
		this._updateSelectedQueryIndex(this.queryInfo, this.selectedQueryName);
	},
	
	/**
	 * Updates the seledted query index based on the passed query name
	 */
	_updateSelectedQueryIndex: function(queryInfo, queryName)
	{
		if (queryInfo && queryInfo.length > 0)
		{
			if (queryName)
			{
				for (var i = 0; i < queryInfo.length; i++)
				{
					if (queryInfo[i].name === queryName)
					{
						this.selectedQueryIndex = i;
						break;
					}
				}
			}
			else
			{
				this.selectedQueryIndex = 0;			
			}
		}
	},
	
	/**
	 * Refreshes the records in the collection by fetching the first page worth of data. Returns a Promise.
	 * The returned promise is resolved upon successfully retrieving the collection data
	 * from the REST call, otherwise the promise is rejected with an error.
	 * The successful retrieval of data results in also firing an event record-data-refreshed.
	 */	 
	refreshRecords: function(urlToUse, stopRelatedRefresh)
	{
		
		//Anamitra
		var my = this;
		if (!this.objectName && !this.collectionUri)
		{
			return new Promise(function (resolve, reject) {
							reject('No Object Name or collection URI specified');
						}.bind(this));
		}
		
		// If authentication is needed, just return.	
		if (this._isAuthenticationNeeded())
		{
			return new Promise(function (resolve, reject) {
							reject('Authentication needed');
							$M.workScape.returnToLogin();
						}.bind(this));
		}
		
		// Check if there is any query information retrieved or not earlier
		// by some other collection
		//Anamitra
		/*if (this.selectedQueryIndex < 0 || !this.queryInfo)
		{
			this.queryInfo = globalServiceProvider.getQueryCapabilities(this.$.myauthenticator.getBaseUri(), this.domainUri, this.objectName);
			this.creationInfo = globalServiceProvider.getCreationFactories(this.$.myauthenticator.getBaseUri(), this.domainUri, this.objectName);
		}*/
		if(this.objectName)
		{
			if ((!this.queryInfo)) //|| !this.creationInfo))
			{
				this.fire('collection-data-refresh-requested');
				return new Promise(function (resolve, reject) {
								this.refreshServiceProviderData().then(
										function(result) {
											// after sp data is refreshed, refresh the data
											this.refreshRecords().then(function(result) { 
												resolve(result);
												}.bind(this));
										}.bind(this), 
										function(error) {
											reject(error);
										});
							}.bind(this));
			}
			
			// If there is no queryInfo after retrieving SP data,
			// just return.
			if (!this.queryInfo)
			{
				return new Promise(function (resolve, reject) {
								reject('No Query Information available');
							}.bind(this));
			}
			
			this._updateSelectedQueryIndex(this.queryInfo, this.selectedQueryName);	
			
//			if (this.selectedQueryIndex < 0)
//			{
//				return new Promise(function (resolve, reject) {
//								reject('No selected query');
//							}.bind(this));
//			}
		}
		
		if ((urlToUse) && (urlToUse.length > 0)) {
			this.$.mxajaxFetchRecords.url=urlToUse;
		}
		else {
			var ajaxURL = this._getDataAccessQueryURL();
			
			if (this.queryLocalized === true)
			{
				if(ajaxURL.indexOf('?') > 0){
					ajaxURL = ajaxURL + '&querylocalized=1';
				}else{
					ajaxURL = ajaxURL + '?&querylocalized=1';
				}
			}
			
			this.$.mxajaxFetchRecords.url=ajaxURL;				
		}
				
		this.$.mxajaxFetchRecords.headers = {};
		
		if(this.contentLocalized)
		{
			this.$.mxajaxFetchRecords.headers['content-localized'] = '1';
		}
		
		this.fire('collection-data-refresh-requested');
		return new Promise(function (resolve, reject) {
						this.$.mxajaxFetchRecords.generateRequest().completes.then(function(result){ 
							resolve(result);
							if(!my.firstLoad && !stopRelatedRefresh){
								$M.notifyCollections(my.id);
							}
							my._notifyListeners('collection-refreshed');
							my._notifyListeners('collection-data-refreshed');
							my.firstLoad = false;
						}, 
						function(error) { 
							reject(error); 
						});
					}.bind(this));
	},
	
	_notifyListeners: function(eventName){
		var collection = this;
		var listeners = collection._componentListeners[eventName];
		if(listeners){
			listeners.forEach(function(listener){
				if(listener.eventName === eventName){
					listener.object.fire(listener.eventName, collection);
				}
			})
		}
	},
	
	/**
	 * Processes the response as a result of making REST call to get the data.
	 * Fires a record-data-refreshed event.
	 */
	_processFetchRecordsResponse: function(e)
	{
		this._retrieveData(e);
		
		if(this.collectionData !== undefined && this.collectionData[0] !== undefined){
 			if (!this.selectedRecord)
			{
				if (this.collectionData[0])
				{
					this.selectedRecord = this.collectionData[0];
					this.set('selectedRecord', this.collectionData[0]);
				}
			}
		}
		
		// TODO - clean up this event
		this.fire('record-data-refreshed');
		
		this.fire('collection-refreshed');
		
		this.startRefreshTimer();
	},
	
	/**
	 * Processes the error as a result of making REST call to get the data.
	 * Fires data-error event.
	 */
	_processFetchRecordsResponseError: function(e)
	{
		if ($M.checkSession(e)){
			// reject promise
	// 		this.rejectRefreshRecordsPromise(e.detail);
			this.fire('data-error', e.detail.request.xhr.response);
			
			this.fire('collection-refresh-error', e.detail.request.xhr.response);
		}
	},
	
	/**
	 * Processes the response as a result of making REST call to get the data.
	 * Fires a record-data-refreshed event.
	 */
	_processGroupByQueryResponse: function(e)
	{
		var jsonResponse = e.detail.response;
		this.set('groupByData', jsonResponse);
		this.fire('groupby-data-refreshed', jsonResponse);
		this.startRefreshTimerForGroupBy();
	},
	
	/**
	 * Processes the error as a result of making REST call to get the data.
	 * Fires data-error event.
	 */
	_processGroupByQueryResponseError: function(e)
	{
		if ($M.checkSession(e)){
			// TODO - cleanup this event
			this.fire('groupby-data-error', e.detail.request.xhr.response);
			
			this.fire('groupby-data-refresh-error', e.detail.request.xhr.response);
		}
	},
	
	_processInsightResponse: function(e)
	{
		var jsonResponse = e.detail.response;
		this.set('insightData', jsonResponse);
		this.fire('insight-data-refreshed');
		this.startRefreshTimerForInsight();
	},
	
	/**
	 * Processes the error as a result of making REST call to get the data.
	 * Fires data-error event.
	 */
	_processInsightResponseError: function(e)
	{
		if ($M.checkSession(e)){
			this.fire('insight-data-error', e.detail.request.xhr.response);
		}
	},

	/**
	 * Processes the error as a result of making REST call to get the data.
	 * Fires data-error event.
	 */
	_processSaveThisQueryError: function(e)
	{
		if ($M.checkSession(e)){
			this.fire('savedquery-create-error', e.detail.request.xhr.response);
		}
	},

	
	/**
	 * Loads the next page worth of data by making a REST call.
	 * TODO - return a promise.
	 */
	refreshNextPageRecords: function()
	{
		console.log('maximo-collection refreshNextPageRecords called!.....');
		
		if (this.nextPageUri)
		{
			this.$.mxajaxFetchMoreRecords.url=this.nextPageUri;
			this.$.mxajaxFetchMoreRecords.headers = this.authHeader;
//			this.$.mxajaxFetchMoreRecords.generateRequest();
			return new Promise(function (resolve, reject) {
				this.$.mxajaxFetchMoreRecords.generateRequest().completes.then(function(result){ resolve(result); }, function(error) { reject(error); });
			}.bind(this));
		}
		else
		{
			return new Promise(function (resolve, reject) {
				reject('No more records to fetch.');
			}.bind(this));
		}
	},
	
	/**
	 * Retrieves the next page data and appends to the collection data.
	 */
	_processDataNextPageResponse: function(e)
	{
		this._retrieveNextPageData(e);
		
		this.fire('collection-refreshed');
	},
	
	_processDataNextPageError: function()
	{
		if ($M.checkSession(e)){
			// TODO - cleanup this event.
			this.fire('data-error', e.detail.request.xhr.response);
			
			this.fire('collection-refresh-error', e.detail.request.xhr.response);
		}		
	},
	/**
	 * Fetches the dynamic attribute data whenever the selected record index is changed.
	 */
	_selectedRecordIndexChanged: function()
	{
		if ((this.selectedRecordIndex < 0) || (!this.collectionData))
		{
			return;
		}
		
		// update the seleted record 
		this.set('selectedRecord', this.collectionData[this.selectedRecordIndex]);
	},
	
	/**
	 * Fetches the dynamic attribute data whenever the selected record changes.
	 */
	_selectedRecordChanged: function()
	{
		if ((!this.selectedRecord) || (!this.collectionData))
		{
			return;
		}

		// find the selected record index and update it
		for (var i = 0; i < this.collectionData.length; i++)
		{
			if (this.collectionData[i] === this.selectedRecord)
			{
				this.selectedRecordIndex = i;
				if (this.auto === true)
				{
					this.fetchDynamicAttributeData();
				}
			}
		}
	},
	
	setDynamicAttributeForReFetch: function(attrName)
	{
		if (this.selectedRecord)
		{
			if (this.selectedRecord._dynamicAttributeNames)
			{
				if (this.selectedRecord._dynamicAttributeNames['_fetched_' + attrName])
				{
					delete this.selectedRecord._dynamicAttributeNames['_fetched_' + attrName];
				}				
			}
		}
	},

	/**
	 * Fetches the dynamic attribute data.
	 * TODO - return a promise.
	 */
	fetchDynamicAttributeData: function()
	{
		// process a fecth of the additional attributes.
		if (!this.dynamicAttributeNames || (this.dynamicAttributeNames && Object.keys(this.dynamicAttributeNames).length <= 0))
		{
			return;
		}
		
		// If no seledted record index, we don't have anything to fecth.
		if (this.selectedRecordIndex < 0)
		{
			return;
		}
		
		var aboutName = 'rdf:about';
		if (this._leanMode === true)
		{
			aboutName = 'href';	
		}
		var selectedMboURI = this.selectedRecord[aboutName];
		
		selectedMboURI = this._adjustURL(selectedMboURI);
		
		var dynAttrKeys = Object.keys(this.dynamicAttributeNames);
		if (!dynAttrKeys)
		{
			return;
		}
		
		var i;
		var attrName;
		var attrValue;
		
		for (i = 0; i < dynAttrKeys.length; i++)
		{
			attrName = dynAttrKeys[i];
			attrValue = this.dynamicAttributeNames[dynAttrKeys[i]];
			
			// If the selected record does not have these names, create
			if (!this.selectedRecord._dynamicAttributeNames)
			{
				this.selectedRecord._dynamicAttributeNames = {};
			}
			
			// If the selected record has the names, but does not have the specific
			// attr name, then set it
			if (!this.selectedRecord._dynamicAttributeNames[attrName])
			{
				this.selectedRecord._dynamicAttributeNames[attrName] = attrValue;
			}
		}
		
		this.recentlyFetchedAttributes = [];
		// Now go through all the ones that are not fetched, and include them in a list
		//
		var fetchAttributeNames = '';
		var k = 0;
		for (i = 0; i < dynAttrKeys.length; i++)
		{
			attrName = dynAttrKeys[i];
			
			if (!this.selectedRecord._dynamicAttributeNames['_fetched_' + attrName])
			{
				k++;
			}
			
			if (k > 1)
			{
				fetchAttributeNames = fetchAttributeNames + ',';
			}
			
			fetchAttributeNames = fetchAttributeNames + this.selectedRecord._dynamicAttributeNames[attrName];
			this.recentlyFetchedAttributes.push(attrName);
		}

		selectedMboURI = this._getDataAccessRecordQueryURL(selectedMboURI, fetchAttributeNames);
		
		this.$.mxajaxFetchRecordDetail.url=selectedMboURI;
		this.$.mxajaxFetchRecordDetail.headers = {};
		this.$.mxajaxFetchRecordDetail.generateRequest();
	},
	
	/**
	 * Update the selected record with the dynamic attribute data fetched.
	 */
	_processFetchRecordDetailResponse: function(e)
	{
		this._retrieveDetailsOfSelectedMbo(e);	
		
		if (this.recentlyFetchedAttributes)
		{
			for (var i = 0; i < this.recentlyFetchedAttributes.length; i++)
			{
				var attrName = this.recentlyFetchedAttributes[i];
	
 				this.notifyPath('selectedRecord.' + attrName, this.collectionData[this.selectedRecordIndex][attrName]);
			}
		}
		
		this.fire('dynamic-attribute-data-fetched', {'index': this.selectedRecordIndex, 'attributesFetched': this.recentlyFetchedAttributes });
	},

	/**
	 * saves a new query - just the qbe part - mostly should be used for saving filters.
	 * TODO - return a promise.
	 */
	saveThisQueryRecord: function(recordData)
	{
		if (!this.collectionUri)
		{
			return;
		}

		// send a ajax post request to create record.
		//
		// name, url
		// TODO - for now use index 0, but this need to be configurable.
		//Anamitra
		//var creationURL = this.creationInfo[0].href;
		
		var ajaxURL = this._getSaveThisQueryURL(this.collectionUri);
		this.$.mxajaxSaveThisQueryRecord.url=ajaxURL;
		
		//this.authHeader = this.$.myauthenticator.getAuthenticationHeader();
		
		var headers = {};
		if(this.contentLocalized)
		{
			headers['content-localized'] = '1';
			ajaxURL = this._addLocalizeRepresentation(ajaxURL);
			this.$.mxajaxSaveThisQueryRecord.url=ajaxURL;
		}
		
		headers.csrftoken = $M.getCSRFToken();
		if (this.authHeader)
		{
			headers.maxauth = this.authHeader;
		}
		
		this.$.mxajaxSaveThisQueryRecord.headers = headers;
		this.$.mxajaxSaveThisQueryRecord.contentType = 'application/json';
		this.$.mxajaxSaveThisQueryRecord.handleAs='json';
		this.$.mxajaxSaveThisQueryRecord.method='POST';
		this.$.mxajaxSaveThisQueryRecord.body=JSON.stringify(recordData);
		this.$.mxajaxSaveThisQueryRecord.generateRequest();
	},

	
	/**
	 * internal function to generate an add or update request for a child record
	 */
	_createOrUpdateChildRecord: function(recordData, dataProperties, responseProperties){
		if (!dataProperties.href && !dataProperties.object){
			return;
		}
		
		var creationURL = dataProperties.href+'/'+dataProperties.object;
		var ajaxURL = this._getCreationURL(creationURL);
		this.$.mxajaxCreateChildRecord.url=ajaxURL;
		var headers = {};
		if(this.contentLocalized)
		{
			headers['content-localized'] = '1';
			ajaxURL = this._addLocalizeRepresentation(ajaxURL);
			this.$.mxajaxCreateChildRecord.url=ajaxURL;
		}
		
		//adding the csrf token
		headers.csrftoken = $M.getCSRFToken();
	    headers['x-method-override'] = 'PATCH';
	    headers.patchtype = 'MERGE';
	    
		var arrayData = [];
		arrayData.push(recordData);

		if (responseProperties) {
			headers.properties = responseProperties;
		}

		this.$.mxajaxCreateChildRecord.headers = headers;
		this.$.mxajaxCreateChildRecord.contentType = 'application/json';
		this.$.mxajaxCreateChildRecord.handleAs='json';
		this.$.mxajaxCreateChildRecord.method='POST';
		this.$.mxajaxCreateChildRecord.body=JSON.stringify(arrayData);
		this.$.mxajaxCreateChildRecord.generateRequest();
	},
	
	/**
	 * Creates a child record data or update existing with the passed record data and response properties.
	 * TODO - return a promise.
	 */
	createOrUpdateChildRecord: function(recordData, dataProperties, responseProperties){
		recordData._action='AddChange';
		this._createOrUpdateChildRecord(recordData, dataProperties, responseProperties);
	},
	
	/**
	 * Creates a child record data with the passed record data and response properties.
	 * TODO - return a promise.
	 */
	createChildRecord: function(recordData, dataProperties, responseProperties){
		recordData._action='Add';
		this._createOrUpdateChildRecord(recordData, dataProperties, responseProperties);
	},
	
	/**
	 * Updates a child record data with the passed record data and response properties.
	 */
	updateChildRecord: function(recordData, dataProperties, responseProperties){
		recordData._action='Update';
		this._createOrUpdateChildRecord(recordData, dataProperties, responseProperties);
	},
	
	/**
	 * Creates a new record with the passed record data and resonse properties.
	 * TODO - return a promise.
	 */
	createRecord: function(recordData, responseProperties)
	{
		if (!this.creationInfo)
		{
			return;
		}
		
		// send a ajax post request to create record.
		//
		// name, url
		// TODO - for now use index 0, but this need to be configurable.
		//Anamitra
		var creationURL = this.creationInfo[0].href;
		
		var ajaxURL = this._getCreationURL(creationURL);
		this.$.mxajaxCreateRecord.url=ajaxURL;
		
		var headers = {};
	    //adding the csrf token
	    headers.csrftoken = $M.getCSRFToken();
	    
		if(this.contentLocalized)
		{
			headers['content-localized'] = '1';
			ajaxURL = this._addLocalizeRepresentation(ajaxURL);
			this.$.mxajaxCreateRecord.url=ajaxURL;
		}
		
		if (responseProperties)
		{
			headers.properties = responseProperties;
		}
		
		this.$.mxajaxCreateRecord.headers = headers;
		this.$.mxajaxCreateRecord.contentType = 'application/json';
		this.$.mxajaxCreateRecord.handleAs='json';
		this.$.mxajaxCreateRecord.method='POST';
		this.$.mxajaxCreateRecord.body=JSON.stringify(recordData);
		this.$.mxajaxCreateRecord.generateRequest();
		
		return new Promise(function (resolve, reject) {
			$M.toggleWait(false);
			this.resolveCreateRecordPromise = resolve;
			this.rejectCreateRecordPromise = reject;
		}.bind(this));
//		return new Promise(function (resolve, reject) {
//			this.$.mxajaxCreateRecord.generateRequest().completes.then(function(result){ resolve(result); }, function(error) { reject(error); });
//		}.bind(this));		
	},
	
	  /**
	   * Send an ajax request to create a new in memory record. This record is not saved until post with submitsession:1 is called.
	   */
	  createNewRecord: function(recordData, responseProperties, isEditOnly){
	    if (!this.creationInfo && !this.collectionUri) {
			return;
	    }

	    var ajaxURL;

	    if(this.creationInfo){
	      var creationURL = this.creationInfo[0].href;
	      ajaxURL = this._getCreationURL(creationURL);
	    }
	    else {
	        //if we don't have creationInfo, then we must rely on the collectionUri
	        ajaxURL = this.collectionUri + '?lean=1';
	    }

	    var headers = {};
	    //adding the csrf token
	    headers.csrftoken = $M.getCSRFToken();
	    
	    if(this.contentLocalized)
		{
			headers['content-localized'] = '1';
			ajaxURL = this._addLocalizeRepresentation(ajaxURL);
		}
		
	    
	    if(isEditOnly){
	      ajaxURL += '&editmode=1';
	    }
	    else {
	      //we need to append editmode and the action
	      ajaxURL += '&editmode=1&action=system:new&addschema=1';
	    }

	    this.$.mxajaxCreateNewRecord.headers = headers;
	    this.$.mxajaxCreateNewRecord.url=ajaxURL;

	    if(isEditOnly){
	      this.$.mxajaxCreateNewRecord.method='GET';
	    }
	    else {
	      this.$.mxajaxCreateNewRecord.method='POST';
	    }

	    this.$.mxajaxCreateNewRecord.generateRequest();
	  },

	  
	  /**
	   * Send an ajax request to create a new in memory record. 
	   * Creates Mbo in memory to utilize maximo functionality and then discards.
	  **/
	  getNewRecordData: function(recordData, responseProperties){
	    if (!this.creationInfo && !this.collectionUri)
		{
			return false;
		}

	    var ajaxURL;

	    if(this.creationInfo){
	      var creationURL = this.creationInfo[0].href;
	      ajaxURL = this._getCreationURL(creationURL);
	    }else{
	        //if we don't have creationInfo, then we must rely on the collectionUri
	        ajaxURL = this.collectionUri + "?lean=1"
	    }

	    var headers = {};
	    if(this.contentLocalized)
		{
			headers['content-localized'] = '1';
			ajaxURL = this._addLocalizeRepresentation(ajaxURL);
		}

	    //we need to append editmode and the action
	    ajaxURL += '&action=system:new&addschema=1';
	    
	    this.$.mxajaxCreateNewRecord.headers = headers;
	    this.$.mxajaxCreateNewRecord.url=ajaxURL;
	    this.$.mxajaxCreateNewRecord.method='GET';
	   
	    this.$.mxajaxCreateNewRecord.generateRequest();
	    return true;
	  },
	  
	/**
	 * Send an ajax request to remove a new in memory record.
	**/
	removeNewRecordFromMemory: function(){
	    var ajaxURL = this.newRecordHref + '?editmode=1&action=removefrommemory';

	    console.log('remove new record from memory');
	    console.log(ajaxURL);

	    var headers = {};
	    if(this.contentLocalized)
		{
			headers['content-localized'] = '1';
			ajaxURL = this._addLocalizeRepresentation(ajaxURL);
		}
	    
	    //adding the csrf token
	    headers.csrftoken = $M.getCSRFToken();
	    
	    if (this.authHeader)
	    {
	      headers.maxauth = this.authHeader;
	    }
	    
	    headers['x-method-override'] = 'PATCH';
	    headers.patchtype = 'MERGE';

		this.$.mxajaxRemoveNewRecordFromMemory.headers = headers;
		this.$.mxajaxRemoveNewRecordFromMemory.url=ajaxURL;
		this.$.mxajaxRemoveNewRecordFromMemory.method='POST';
		this.$.mxajaxRemoveNewRecordFromMemory.generateRequest();
	  },

  /**
   * Send an ajax request to save the new in memory record. This depends on the ref that was provided from a call to createNewRecord.
   */
  saveNewRecord: function(recordData, responseProperties){
    var ajaxURL = this.newRecordHref + '?editmode=1';

    console.log('save new record');
    console.log(ajaxURL);

    var headers = {};
    if(this.contentLocalized)
	{
		headers['content-localized'] = '1';
		ajaxURL = this._addLocalizeRepresentation(ajaxURL);
	}
    
    //adding the csrf token
    headers.csrftoken = $M.getCSRFToken();
    
    if (this.authHeader)
    {
      headers.maxauth = this.authHeader;
    }

    headers['x-method-override'] = 'PATCH';
    headers.patchtype = 'MERGE';
    headers.submitsession = 1;

	if (responseProperties)
	{
		headers.properties = responseProperties;
	}

    this.$.mxajaxSaveNewRecord.headers = headers;
    this.$.mxajaxSaveNewRecord.url = ajaxURL;
    this.$.mxajaxSaveNewRecord.method='POST';
    this.$.mxajaxSaveNewRecord.contentType = 'application/json';
    this.$.mxajaxSaveNewRecord.handleAs='json';
    this.$.mxajaxSaveNewRecord.body=JSON.stringify(recordData);

    this.$.mxajaxSaveNewRecord.generateRequest();
  },
	createRecordBulk: function(recordData,actionName)
	{
		if (!this.queryInfo)
		{
			return new Promise(function (resolve, reject) {
				this.refreshServiceProviderData().then(
						function(result) {
							this.createRecordBulk(recordData,actionName);
						}.bind(this), 
						function(error) {
							reject(error);
						});
			}.bind(this));
		}
		else if(!this.creationInfo)
		{
			return;
		}
		
		// send a ajax post request to create record.
		//
		// name, url
		// TODO - for now use index 0, but this need to be configurable.
		//Anamitra
		var creationURL = this.creationInfo[0].href;
		
		var ajaxURL = this._getCreationURL(creationURL);
		if(actionName !== undefined){
			if(ajaxURL.indexOf('?') > 0){
				ajaxURL = ajaxURL + '&action=' + actionName;
			}else{
				ajaxURL = ajaxURL + '?&action=' + actionName;
			}
		}
		this.$.mxajaxCreateRecordBulk.url=ajaxURL;
		
		ajaxURL = this._addLocalizeRepo(ajaxURL);
		
		var headers = {};
	    if(this.contentLocalized)
		{
			headers['content-localized'] = '1';
			ajaxURL = this._addLocalizeRepresentation(ajaxURL);
			this.$.mxajaxCreateRecordBulk.url = ajaxURL;
		}
		
	    //adding the csrf token
		headers.csrftoken = $M.getCSRFToken();
		headers['x-method-override'] = 'BULK';
		
		this.$.mxajaxCreateRecordBulk.headers = headers;
		this.$.mxajaxCreateRecordBulk.contentType = 'application/json';
		this.$.mxajaxCreateRecordBulk.handleAs='json';
		this.$.mxajaxCreateRecordBulk.method='POST';
		this.$.mxajaxCreateRecordBulk.body=JSON.stringify(recordData);
		this.$.mxajaxCreateRecordBulk.generateRequest();
	},
	
		 /**
	 * Creates a new stateful resource object with the passed record data and resonse properties.
	 * 
	 */
	createNewResource: function(recordData, responseProperties)
	{
		if (!this.creationInfo)
		{
			return;
		}
		
		// send a ajax post request to create record.
		//
		// name, url
		// TODO - for now use index 0, but this need to be configurable.
		//Anamitra
		var creationURL = this.creationInfo[0].href;
		creationURL = this._getStatefulURL(creationURL);
		var ajaxURL = this._getStatefulCreationURL(creationURL);
		this.$.mxajaxCreateNewResource.url=ajaxURL;
		
		var headers = {};
	    if(this.contentLocalized)
		{
			headers['content-localized'] = '1';
			ajaxURL = this._addLocalizeRepresentation(ajaxURL);
			this.$.mxajaxCreateNewResource.url=ajaxURL;
		}
		
	    //adding the csrf token
		headers.csrftoken = $M.getCSRFToken();
		
		if (responseProperties)
		{
			headers.properties = responseProperties;
		}
		
		this.$.mxajaxCreateNewResource.headers = headers;
		this.$.mxajaxCreateNewResource.contentType = 'application/json';
		this.$.mxajaxCreateNewResource.handleAs='json';
		this.$.mxajaxCreateNewResource.method='POST';

		this.$.mxajaxCreateNewResource.generateRequest();
	},


	/**
	 * Returns the creation URL.
	 */
	_getCreationURL: function(creationURL)
	{
		var retCreationURL = creationURL;
		if (this._leanMode === true)
		{
			retCreationURL = retCreationURL + '?lean=1';	
		}
		
		if(this.addid && this.addid === true)
		{
    		if (retCreationURL.indexOf('?') > 0){
    			retCreationURL = retCreationURL + '&addid=1';
    		}
    		else{
    			retCreationURL = retCreationURL + '?&addid=1';
    		}
		}
		
		return retCreationURL;
	},
	/**
	 * Returns the creation URL.
	 */
	_getSaveThisQueryURL: function(creationURL)
	{
		var retCreationURL = creationURL;
		retCreationURL = retCreationURL + '&action='+encodeURIComponent('system:savethisquery');
		if (this.queryLocalized === true)
		{
			retCreationURL = retCreationURL + '&querylocalized=1';	
		}
		if(this.queryWhere)
		{
			retCreationURL = retCreationURL + '&querywhere='+encodeURIComponent(JSON.stringify(this.queryWhere));
		}	
		return retCreationURL;
	},

	
		 /**
	 * Returns the stateful resource URL.
	 */
	_getStatefulURL: function(creationURL)
	{
		var retCreationURL = creationURL;
		if (this._leanMode === true)
		{
			retCreationURL = retCreationURL + '?editmode=1&lean=1';	
		}
		else		{
			retCreationURL = retCreationURL + '?editmode=1';	
		}
		
		return retCreationURL;
	},

	/**
	 * Returns the stateful creation URL.
	 */
	_getStatefulCreationURL: function(creationURL)
	{
		var retCreationURL = creationURL;
		retCreationURL = retCreationURL + '&action=system:new';	
		
		return retCreationURL;
	},

	/**
	 * Processes the response returned as part of creating a record.
	 * Fires record-created event.
	 */
	_processRecordCreateResponse: function(e)
	{
		this.resolveCreateRecordPromise(e.detail);
		var jsonResponse = e.detail.response;
		
		this.fire('record-created', jsonResponse);
	},
	_processRecordCreateError: function(e)
	{
		this.rejectCreateRecordPromise(e.detail);
		
		// TODO - cleanup this error event name
		this.fire('data-error', e.detail.request.xhr.response);
		
		// fire record-create-error to be consistent with update or delete convention
		this.fire('record-create-error', e.detail.request.xhr.response);
	},
	/**
	 * Processes the response returned as part of creating a record.
	 * Fires record-created event.
	 */
	_processSaveThisQueryResponse: function(e)
	{
		var jsonResponse = {};
		jsonResponse.location = e.detail.xhr.getResponseHeader('Location');
		jsonResponse.altlocation = e.detail.xhr.getResponseHeader('altlocation');
		jsonResponse.contentlocation = e.detail.xhr.getResponseHeader('content-location');
		this.fire('savedquery-created', jsonResponse);
	},


	/**
	 * Processes the response returned as part of creating a child record.
	 * Fires child-record-created event.
	 */
	_processChildRecordCreateResponse: function(e)
	{
		var jsonResponse = e.detail.response;
		
		this.fire('child-record-created', jsonResponse);
	},
	
	
	/**
	 * Processes the response returned as part of creating a stateful resource.
	 * Fires record-created event.
	 */
	_processCreateResourceResponse: function(e)
	{
		var jsonResponse = e.detail.response;
		//we need to set the ref information
		this.newRecordHref = jsonResponse.href;
		this.fire('new-record-created', jsonResponse);
	},

  /**
    Successfully created new record, retrieve response
  **/
  _recordCreateNewSuccessResponse: function(e)
  {
    var jsonResponse = e.detail.response;

    //we need to set the ref information
    this.newRecordHref = jsonResponse.href;

    this.fire('new-record-created', jsonResponse);
  },

  /**
   * Successfully created new record, retrieve response
   **/
  _recordRemoveNewFromMemorySuccessResponse: function(e)
  {
    var jsonResponse = e.detail.response;

    this.fire('new-record-removed', jsonResponse);
  },  
  /**
    Successfully saved the new record, retrieve response and clear href,
    since we are done with that row.
  **/
  _recordSaveNewSuccessResponse: function(e)
  {
    console.log('new record saved');
    var jsonResponse = e.detail.response;
    this.href = '';

    this.fire('new-record-saved', jsonResponse);
  },
	_processRecordCreateBulkResponse: function(e)
	{
		var jsonResponse = e.detail.response;
		
		this.fire('record-created-bulk', jsonResponse);
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
			ajaxURL = this._addLocalizeRepresentation(ajaxURL);
			this.$.mxajaxCreateAttachmentRecord.url=ajaxURL;
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
		
		headers['x-document-description'] = attachmentData.description;
		headers['x-document-meta'] = 'FILE/Attachments';
		
		var slug = attachmentData.description;
		
		headers.slug = slug;
// 		headers['x-method-override'] = 'PATCH';
		
		this.$.mxajaxCreateAttachmentRecord.headers = headers;
		//this.$.mxajaxCreateAttachmentRecord.contentType = attachmentData.type;
		this.$.mxajaxCreateAttachmentRecord.contentType = 'utf-8';
		this.$.mxajaxCreateAttachmentRecord.handleAs='json';
		this.$.mxajaxCreateAttachmentRecord.method='POST';
		this.$.mxajaxCreateAttachmentRecord.body=attachmentData.content;
		this.$.mxajaxCreateAttachmentRecord.generateRequest();
	},
	
	/**
	 * Returns attachment URL.
	 */
	_getAttachmentURL: function(attachmentURL)
	{
		var newattachmentURL = this._adjustURL(attachmentURL);
		if (this._leanMode === true)
		{
			newattachmentURL = newattachmentURL + '?lean=1';	
		}
		else
		{
			newattachmentURL = newattachmentURL;	
		}	
		
		return newattachmentURL;
	},

	/**
	 * Adjusts the URI passed by replacing the URI with the data servlet URI.
	 */
	_adjustURL: function(uri)
	{
		//return uri.replace(this.$.myauthenticator.getBaseUri(), this.dataAccessServletUri);
		return uri;
	},
	
	/**
	 * Processes the response as a result of creating an attachment.
	 */
	_processAttachmentResponse: function(e)
	{
		var jsonResponse = e.detail.response;
		
		this.fire('attachment-created', jsonResponse);
	},
	
	/**
	 * Processes the error as a result of creating an attachment.
	 */
	_processAttachmentError: function(e)
	{
		// TODO - cleanup this data-error event		
		this.fire('data-error', e.detail.request.xhr.response);
		
		this.fire('attachment-create-error', e.detail.request.xhr.response);
	},
	
	_getInsightURL: function()
	{
		var insightURL = '';
		var queryURL;
		if(!this.collectionUri && this.insightName !== undefined && this.insightName !== null)
		{
			queryURL = this.$.myauthenticator.getBaseUri() + '/oslc/insight/' + this.insightName;
		}	
		else if(this.collectionUri !== undefined)
		{
			queryURL = this.collectionUri;
		}
		else
		{
			return;
		}
		
    	if (this.groupByAttributeNames){
    		if (queryURL.indexOf('?') > 0){
    			insightURL = queryURL + '&gbcols='+encodeURIComponent(this.groupByAttributeNames);
    		}
    		else{
    			insightURL = queryURL + '?gbcols='+encodeURIComponent(this.groupByAttributeNames);
   			}
    		
        	if (this.groupByHavingClause){
        		insightURL = insightURL + '&gbfilter='+encodeURIComponent(this.groupByHavingClause);
        	}
        	if (this.groupBySortClause){
        		insightURL = insightURL + '&gbsortby=' +encodeURIComponent(this.orderByAttributeNames);
        	}
        	if (this.groupByRelatedAttributes){ 
        		insightURL = insightURL + '&gbrelprops=' +encodeURIComponent(this.groupByRelatedAttributes);
        	}
    	}
    	if (this.insightValueSort && this.insightValueSort.length>0)
    	{
    		insightURL = insightURL + '&valuesort=' + encodeURIComponent(this.insightValueSort);
    	}
    	/*
		if (this.subselects && this.subselects.length > 0){
    		groupByURL = groupByURL + '&subselects=' + this.subselects;
    	}*/
    	
    	insightURL = this._addSearchAttributesToQueryURL(insightURL);
    	insightURL = this._addKeySearchToQueryURL(insightURL);
    	insightURL = this._addSearchTermsToQueryURL(insightURL);
    	insightURL = this._addFilterClauseToQueryURL(insightURL);
    	insightURL = this._addAdditionalParamsToUrl(insightURL);
    	return insightURL;
	},
	
	_getGroupByQueryURL: function()
	{
		var groupByURL = '';
		var queryURL;
		if(!this.collectionUri)
		{
			if(this.queryInfo[this.selectedQueryIndex])
			{
				queryURL = this.queryInfo[this.selectedQueryIndex].href;
			}
			if (this.selectedQueryUri && this.selectedQueryUri.length > 0)
			{
				queryURL = this.selectedQueryUri;
			}
			if(this.selectedQueryName && this.selectedQueryName.indexOf('kpi:') > -1)
			{
				queryURL = this.queryInfo[0].href + '?&savedQuery=' + this.selectedQueryName;
			}
		}	
		else
		{
			queryURL = this.collectionUri;
		}
		
    	if (this.groupByAttributeNames){
    		if (queryURL.indexOf('?') > 0){
    			groupByURL = queryURL + '&gbcols='+encodeURIComponent(this.groupByAttributeNames);
    		}
    		else{
    			groupByURL = queryURL + '?gbcols='+encodeURIComponent(this.groupByAttributeNames);
   			}
    		
        	if (this.groupByHavingClause){
        		groupByURL = groupByURL + '&gbfilter='+encodeURIComponent(this.groupByHavingClause);
        	}
        	if (this.groupBySortClause){
        		groupByURL = groupByURL + '&gbsortby=' +encodeURIComponent(this.orderByAttributeNames);
        	}
        	if (this.groupByRelatedAttributes){ 
        		groupByURL = groupByURL + '&gbrelprops=' +encodeURIComponent(this.groupByRelatedAttributes);
        	}
    	}
    	
		if (this.subselects && this.subselects.length > 0){
    		groupByURL = groupByURL + '&subselects=' + this.subselects;
    	}
    	
    	groupByURL = this._addSearchAttributesToQueryURL(groupByURL);
    	groupByURL = this._addKeySearchToQueryURL(groupByURL);
    	groupByURL = this._addSearchTermsToQueryURL(groupByURL);
    	groupByURL = this._addFilterClauseToQueryURL(groupByURL);
    	groupByURL = this._addAdditionalParamsToUrl(groupByURL);
    	return groupByURL;
	},
	
	_addSearchAttributesToQueryURL: function(dataAccessURL)
	{
    	if (this.searchAttributeNames)
    	{
    		if (dataAccessURL.indexOf('?') > 0)
    		{
        		dataAccessURL = dataAccessURL + '&searchAttributes='+encodeURIComponent(this.searchAttributeNames);
    		}
    		else
    		{
    			dataAccessURL = dataAccessURL + '?searchAttributes='+encodeURIComponent(this.searchAttributeNames);
    		}
    	}
		return dataAccessURL;
	},
	
	_addKeySearchToQueryURL: function(dataAccessURL)
	{
    	if (this.keySearchAttributeName && this.keySearch)
    	{
    		if (dataAccessURL.indexOf('?') > 0)
    		{
        		dataAccessURL = dataAccessURL + '&oslc.where='+this.keySearchAttributeName+'=\"' + this.keySearch + '\"';
    		}
    		else
    		{
    			dataAccessURL = dataAccessURL + '?oslc.where='+this.keySearchAttributeName+'=\"' + this.keySearch + '\"';
    		}    		
    	}
		return dataAccessURL;
	},

	
	_addSearchTermsToQueryURL: function(dataAccessURL)
	{
		if (this.useSearchTerms && this.searchTermValue)
		{
    		if (dataAccessURL.indexOf('?') > 0)
    		{
        		dataAccessURL = dataAccessURL + '&oslc.searchTerms=\"'+encodeURIComponent(this.searchTermValue) + '\"';
    		}
    		else
    		{
    			dataAccessURL = dataAccessURL + '?oslc.searchTerms=\"'+encodeURIComponent(this.searchTermValue) + '\"';
    		}    		
		}
		return dataAccessURL;
	},

	_addFilterClauseToQueryURL: function(dataAccessURL)
	{
    	var filterDataQuery;
    	if (this.filterData && this.filterData.length > 0){
    		// status in ['WAPPR','INPRG']  and worktype = 'CM' 
    		//
    		var l = 0;
    		var i = 0;
    		var j = 0;
    		var filterfield;
    		var filtertype;
    		var filters;
			var fieldFieldQuery;
			var filterFieldValue;
    		
    		for (i=0; i< this.filterData.length; i++){
    			filterfield = this.filterData[i].field;
    			filtertype = this.filterData[i].filtertype;
    			filters = this.filterData[i].availablevalues;
    			
    			if (filtertype === 'SIMPLE'){
        			if (filters.length > 0){

        				
        				//TO DO: remove that part after the fix for where clause
            			//@yajin
            			//@Anamitra
        				if(filters.length === 1){
        					fieldFieldQuery = filterfield + '=';
        				}
        				else {
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
                    			}
                				else {
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
    			}
    			else if (filtertype === 'DATERANGE'){
        			if (filters.length > 0){
            			for (j=0; j< filters.length; j++){
            				if (!filters[j].selected || filters[j].selected === false){
            					continue;
            				}
            				
                			filterFieldValue = filters[j].value;
                			if (filterFieldValue)
                			{
                				var from;
                				var to;
                				
                				if (filterFieldValue === 'week') {
                					from = moment().subtract(7, 'days').format();
                					to = moment().format();
                					
                					if (filterDataQuery && (filterDataQuery.length > 0)){
                						filterDataQuery = filterDataQuery + ' and ';
                					}
                					else {
                						filterDataQuery = '';
                					}
                					fieldFieldQuery = '' + filterfield + '>="' + from + '" and ' + filterfield + '<="' + to + '"';
                					filterDataQuery = filterDataQuery + fieldFieldQuery;
                				} 
                				else if (filterFieldValue === 'month'){
                					from = moment().subtract(30, 'days').format();
                					to = moment().format();
                					
                					if (filterDataQuery && (filterDataQuery.length > 0)){
                						filterDataQuery = filterDataQuery + ' and ';
                					}
                					else {
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
    	
    	if (filterDataQuery){
    		// append the oslc.where clause with the filter query
    		if (dataAccessURL.indexOf('?') > 0){
        		dataAccessURL = dataAccessURL + '&oslc.where='+filterDataQuery;
    		}
    		else {
    			dataAccessURL = dataAccessURL + '?oslc.where='+filterDataQuery;
    		}    		
    	}
		return dataAccessURL;
	},

	
	/**
	 * Constructs a data access query URL based on various filter mechanisms.
	 * Returns the URL as a string.
	 */
	_getDataAccessQueryURL: function()
	{
		var dataAccessURL = '';
		
		var queryURL = '';
		if(!this.collectionUri)
		{
			if(this.queryInfo[this.selectedQueryIndex])
			{
				queryURL = this.queryInfo[this.selectedQueryIndex].href;
			}
			if (this.selectedQueryUri && this.selectedQueryUri.length > 0)
			{
				queryURL = this.selectedQueryUri;
			}
			if(this.selectedQueryName && this.selectedQueryName.indexOf('kpi:') > -1)
			{
				queryURL = this.queryInfo[0].href + '?&savedQuery=' + this.selectedQueryName;
			}
		}	
		else
		{
			queryURL = this.collectionUri;
		}
		
		if (((this.attributeNames && this.attributeNames === '*') || (!this.attributeNames)) && this.useQueryTemplate && this.useQueryTemplate === true && this.queryTemplateName)
		{
    		if (queryURL.indexOf('?') > 0)
    		{
    			if (this._leanMode === true)
    			{
        			dataAccessURL = queryURL + '&lean=1&collectioncount=1&querytemplate='+encodeURIComponent(this.queryTemplateName);	
    			}
    			else
    			{
    				dataAccessURL = queryURL + '&collectioncount=1&querytemplate='+encodeURIComponent(this.queryTemplateName);		
    			}
    		}
    		else
    		{
    			if (this._leanMode === true)
    			{
        			dataAccessURL = queryURL + '?&lean=1&collectioncount=1&querytemplate='+encodeURIComponent(this.queryTemplateName);	
    			}
    			else
    			{
    				dataAccessURL = queryURL + '?&collectioncount=1&querytemplate='+encodeURIComponent(this.queryTemplateName);		
    			}
    		}
		}
		else if (this.attributeNames && this.useQueryTemplate && this.useQueryTemplate === true && this.queryTemplateName)
		{
    		if (queryURL.indexOf('?') > 0)
    		{
    			if (this._leanMode === true)
    			{
        			dataAccessURL = queryURL + '&lean=1&collectioncount=1&oslc.select='+encodeURIComponent(this.attributeNames) + '&querytemplate='+encodeURIComponent(this.queryTemplateName);	
    			}
    			else
    			{
        			dataAccessURL = queryURL + '&collectioncount=1&oslc.select='+encodeURIComponent(this.attributeNames) + '&querytemplate='+encodeURIComponent(this.queryTemplateName);	
    			}
    		}
    		else
    		{
    			if (this._leanMode === true)
    			{
        			dataAccessURL = queryURL + '?lean=1&collectioncount=1&&oslc.select='+encodeURIComponent(this.attributeNames) + '&querytemplate='+encodeURIComponent(this.queryTemplateName);	
    			}
    			else
    			{
        			dataAccessURL = queryURL + '?collectioncount=1&oslc.select='+encodeURIComponent(this.attributeNames) + '&querytemplate='+encodeURIComponent(this.queryTemplateName);	
    			}
    		}
		}
		else if (this.attributeNames)
    	{
    		if (queryURL.indexOf('?') > 0)
    		{
    			if (this._leanMode === true)
    			{
        			dataAccessURL = queryURL + '&lean=1&collectioncount=1&oslc.select='+encodeURIComponent(this.attributeNames);	
    			}
    			else
    			{
        			dataAccessURL = queryURL + '&collectioncount=1&oslc.select='+encodeURIComponent(this.attributeNames);	
    			}
    		}
    		else
    		{
    			if (this._leanMode === true)
    			{
        			dataAccessURL = queryURL + '?lean=1&collectioncount=1&oslc.select='+encodeURIComponent(this.attributeNames);	
    			}
    			else
    			{
        			dataAccessURL = queryURL + '?collectioncount=1&oslc.select='+encodeURIComponent(this.attributeNames);	
    			}
    		}
    	} 
    	
    	if (this.pageSize>0)
    	{
    		if (dataAccessURL.indexOf('?') > 0)
    		{
	    		dataAccessURL = dataAccessURL + '&oslc.pageSize=' + this.pageSize;
	    	} else
	    	{
	    		dataAccessURL = dataAccessURL + '?oslc.pageSize=' + this.pageSize;
	    	}
    	}
    	
    	if (this.searchAttributeNames)
    	{
    		if (dataAccessURL.indexOf('?') > 0)
    		{
        		dataAccessURL = dataAccessURL + '&searchAttributes='+encodeURIComponent(this.searchAttributeNames);
    		}
    		else
    		{
    			dataAccessURL = dataAccessURL + '?searchAttributes='+encodeURIComponent(this.searchAttributeNames);
    		}
    	}
    	
    	
    	if (this.showBookmarks && this.showBookmarks === true)
    	{
        	this.nextPageUri = null;
        	this.previousPageUri = null;
    		if (dataAccessURL.indexOf('?') > 0)
    		{
        		dataAccessURL = dataAccessURL + '&bookmarked=1';
    		}
    		else
    		{
    			dataAccessURL = dataAccessURL + '?bookmarked=1';
    		}
    	}
    	
		// filterdata - allows data to be filtered further.
		// Represents an array of filters, so it can be rendered as breadcrumbs.
		// 'type': 'Work Type' => name that will appear to the user in UI
		// 'field': 'worktype' => field that will be used to build the OSLC query
		// 'availablevalues' : [] => an array of the selected filters
		//      { 'description': 'Corrective Maintenance',		=> name that would appear to user in UI
		//		  'value': 'CM' 						=> value that will be used to build the OSLC query
    	//        'selected': true/false
		//		}
		// 
    	// ex:
		//    	[
		//    	  {
		//    	    'type': 'Work Type',
		//    	    'filtertype': 'SIMPLE',
		//    	    'field': 'worktype',
		//    	    'availablevalues': [
		//    	      {
		//    	        'description': 'Corrective Work',
		//    	        'value': 'CM',
		//    	        'selected': false
		//    	      },
		//    	      {
		//    	        'description': 'Emergency Work',
		//    	        'value': 'EM',
		//    	        'selected': false
		//    	      },
		//    	      {
		//    	        'description': 'Preventative Work',
		//    	        'value': 'PM',
		//    	        'selected': false
		//    	      }
		//    	    ]
		//    	  }
    	//    	{
		//    	    'type': 'Reported Date',
		//    	    'filtertype': 'DATERANGE',
		//    	    'field': 'reportdate',
		//    	    'availablevalues': [
		//    	      {
		//    	        'description': 'Last Week',
		//    	        'value': 'week',
		//    	        'selected': false
		//    	      },
		//    	      {
		//    	        'description': 'Last Month',
		//    	        'value': 'month',
		//    	        'selected': true
		//    	      }
		//    	    ],
		//    	    'displayfilter': 'Last Month'
		//    	  }		
    	// 		]
    	//	
    	var filterDataQuery;
		var i = 0;
		var j = 0;
		var filterfield;
		var filtertype;
		var filters;
		var filterFieldValue;
		var fieldFieldQuery;
		
    	if (this.filterData && this.filterData.length > 0)
    	{
    		// status in ['WAPPR','INPRG']  and worktype = 'CM' 
    		//
    		var l = 0;
    		for (i=0; i< this.filterData.length; i++)
    		{
    			filterfield = this.filterData[i].field;
    			filtertype = this.filterData[i].filtertype;
    			filters = this.filterData[i].availablevalues;
    			
    			if (filtertype === 'SIMPLE')
    			{
        			if (filters.length > 0)
        			{
            			//TO DO: remove that part after the fix for where clause
            			//@yajin
            			//@Anamitra
        				if(filters.length === 1)
        				{
        					fieldFieldQuery = filterfield + '=';
        				}
        				else
        				{
        					fieldFieldQuery = filterfield + ' in [';
        				}

            			var foundSelectedValue = false;
            			// each filter becomes part of an in cluase    
            			var k = 0;
            			for (j=0; j< filters.length; j++)
                		{
            				if (!filters[j].selected || filters[j].selected === false)
            				{
            					continue;
            				}
            				
            				foundSelectedValue = true;
            				
                			if (k > 0)
                			{
                				fieldFieldQuery = fieldFieldQuery + ',';	
                			}
                			
                			filterFieldValue = filters[j].value;
                			if (filterFieldValue)
                			{
                    			//if (Number.isInteger(filterFieldValue))
                				if (this._isInteger(filterFieldValue))
                    			{
                        			fieldFieldQuery = fieldFieldQuery + '' + filterFieldValue + '';            			
                    			}
                    			else
                    			{
                        			fieldFieldQuery = fieldFieldQuery + '"' + filterFieldValue + '"';            			
                    			}
                			}
                			
                			k++;
                		}
        				if(filters.length > 1)
        				{
        					fieldFieldQuery = fieldFieldQuery + ']';
        				}
            			
            			if (!filterDataQuery)
            			{
            				filterDataQuery = '';
            			}
            			
            			if (foundSelectedValue === true)
            			{
            				
                			if (l > 0)
                			{
                				filterDataQuery = filterDataQuery + ' and ';
                			}
                			filterDataQuery = filterDataQuery + fieldFieldQuery;
                			l++;
            			}
        			}
    			}
    			else if (filtertype === 'DATERANGE')
    			{
        			if (filters.length > 0)
        			{
            			for (j=0; j< filters.length; j++)
                		{
            				if (!filters[j].selected || filters[j].selected === false)
            				{
            					continue;
            				}
            				
                			filterFieldValue = filters[j].value;
                			if (filterFieldValue)
                			{
                				var from;
                				var to;
                				
                				if (filterFieldValue === 'week')
                				{
                					from = moment().subtract(7, 'days').format();
                					to = moment().format();
                					
                					if (filterDataQuery && (filterDataQuery.length > 0))
                					{
                						filterDataQuery = filterDataQuery + ' and ';
                					}
                					else
                					{
                						filterDataQuery = '';
                					}
                					fieldFieldQuery = '' + filterfield + '>="' + from + '" and ' + filterfield + '<="' + to + '"';
                					filterDataQuery = filterDataQuery + fieldFieldQuery;
                				}
                				else if (filterFieldValue === 'month')
                				{
                					from = moment().subtract(30, 'days').format();
                					to = moment().format();
                					
                					if (filterDataQuery && (filterDataQuery.length > 0))
                					{
                						filterDataQuery = filterDataQuery + ' and ';
                					}
                					else
                					{
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
    	
    	if (filterDataQuery)
    	{
    		// append the oslc.where clause with the filter query
    		if (dataAccessURL.indexOf('?') > 0)
    		{
        		dataAccessURL = dataAccessURL + '&oslc.where='+filterDataQuery;
    		}
    		else
    		{
    			dataAccessURL = dataAccessURL + '?oslc.where='+filterDataQuery;
    		}    		
    	}
    	
    	if (this.keySearchAttributeName && this.keySearch)
    	{
    		if (dataAccessURL.indexOf('?') > 0)
    		{
        		dataAccessURL = dataAccessURL + '&oslc.where='+this.keySearchAttributeName+'=\"' + this.keySearch + '\"';
    		}
    		else
    		{
    			dataAccessURL = dataAccessURL + '?oslc.where='+this.keySearchAttributeName+'=\"' + this.keySearch + '\"';
    		}    		
    	}
		if (this.useSearchTerms && this.searchTermValue)
		{
    		if (dataAccessURL.indexOf('?') > 0)
    		{
        		dataAccessURL = dataAccessURL + '&oslc.searchTerms=\"'+encodeURIComponent(this.searchTermValue) + '\"';
    		}
    		else
    		{
    			dataAccessURL = dataAccessURL + '?oslc.searchTerms=\"'+encodeURIComponent(this.searchTermValue) + '\"';
    		}    		
		}
		 		
 		if (this.useOrOperand) {
 			dataAccessURL = dataAccessURL + '&opmodeor=1';
 		}
 		
 		dataAccessURL = this._addTimeLineTermsToURL(dataAccessURL);
 		
 		dataAccessURL = this._addLocalizeRepo(dataAccessURL);
    	
    	if (this.checkForBookmarks)
    	{
    		if (dataAccessURL.indexOf('?') > 0)
    		{
        		dataAccessURL = dataAccessURL + '&collectionbm=1';
    		}
    		else
    		{
    			dataAccessURL = dataAccessURL + '?collectionbm=1';
    		}    		
    	}
    	
    	var noOfParams;
    	
		if (this.queryParams)
		{
    		var queryParamKeyList = Object.keys(this.queryParams);
    		noOfParams = queryParamKeyList.length;
    		for (i = 0; i < noOfParams; i++)
    		{
    			var queryParamKey = queryParamKeyList[i];
    			var queryParamKeyP = '{' + queryParamKey + '}';
    			
    			var queryParamValue = this.queryParams[queryParamKey];
    			dataAccessURL = dataAccessURL.replace(queryParamKeyP, queryParamValue);
    		}
		}  	
    	
    	    	
    	if (this.orderByAttributeNames)
    	{
    		if (dataAccessURL.indexOf('?') > 0)
    		{
        		dataAccessURL = dataAccessURL + '&oslc.orderBy=' + this.orderByAttributeNames;
    		}
    		else
    		{
    			dataAccessURL = dataAccessURL + '?oslc.orderBy=' + this.orderByAttributeNames;
    		}    		
    	}
    	
    	if (this.orderByChildAttributeNames)
    	{
    		var collection, attributes, prefix;
    		if (this.orderByChildAttributeNames.length > 0)
    		{
    			for (var ind=0; ind<this.orderByChildAttributeNames.length; ind++)
    			{
    				collection = this.orderByChildAttributeNames[ind].collection;
    				attributes = this.orderByChildAttributeNames[ind].attributes;
    				if (collection && attributes)
    				{
	    				if (dataAccessURL.indexOf('?') > 0)
	    				{
	    					prefix = '&';
	    	    		}
	    				else
	    				{
	    	    			prefix = '?';
	    	    		}
	    				var attrs = attributes.split(',');
	    				attrs.forEach(function(attr, index){
	    					if(decodeURIComponent(attr) === attr){
		    					attrs[index] = encodeURIComponent(attr);
		    				}
	    				});
	    				attributes = attrs.join(',');
	    				
	    				dataAccessURL = dataAccessURL + prefix + collection + '.orderBy=' + attributes;
    				}
    			}
    		}
    		
    	}
    	
    	

    	//add additional paramters to dataAccessURL
    	if (this.additionalParams)
		{
    		noOfParams = this.additionalParams.length;
    		for (i = 0; i < noOfParams; i++)
    		{
    			var param = this.additionalParams[i];    			    			
    			dataAccessURL = dataAccessURL+'&'+param;
    		}
    		
		}
    	
    	this.hasBookmarks = false;
    	
		if(this.ctxTerms){
    		if (dataAccessURL.indexOf('?') === -1){
    			dataAccessURL = dataAccessURL + '?';
    		}
    		
    		dataAccessURL = dataAccessURL + '&ctx=';
    		
			for (var key in this.ctxTerms) {
			    if (this.ctxTerms.hasOwnProperty(key)) {
			    	dataAccessURL = dataAccessURL + key + '=' + this.ctxTerms[key] + ',';
			    }
			}
			dataAccessURL = dataAccessURL.substring(0,dataAccessURL.length-1);
		}
		
		if(this.addschema && this.addschema === true)
		{
    		if (dataAccessURL.indexOf('?') > 0){
        		dataAccessURL = dataAccessURL + '&addschema=1';
    		}
    		else{
    			dataAccessURL = dataAccessURL + '?&addschema=1';
    		}
		}
		
		if(this.addid && this.addid === true)
		{
    		if (dataAccessURL.indexOf('?') > 0){
        		dataAccessURL = dataAccessURL + '&addid=1';
    		}
    		else{
    			dataAccessURL = dataAccessURL + '?&addid=1';
    		}
		}
		
    	if (this.subselects && this.subselects.length > 0)
    	{
    		dataAccessURL = dataAccessURL + '&subselects=' + this.subselects;
    	}
    	
    	return dataAccessURL;
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
		var recordData = [];
		//this.set('collectionData', []);
		var jsonResponse = e.detail.response;
		
		var memberName = 'rdfs:member';
		if (this._leanMode === true)
		{
			memberName = 'member';
		}
		
		if(e.detail.response === undefined || e.detail.response === null)
		{
			return;
		}
		
		var response = e.detail.response[memberName];
		for (var i=0; i< response.length; i++)
		{
			// adjust imagelibref URLs
			var keys = Object.keys(response[i]);
			for (var j = 0; j < keys.length; j++)
			{
				var key = keys[j];
				if (key.lastIndexOf('imagelibref') >= 0)
				{
					response[i][key] = this._adjustURL(response[i][key]);
				}
			}
			//this.push('collectionData', response[i]);
			recordData.push(response[i]);
		}
		
		
		var responseInfoName = 'oslc:responseInfo';
		var nextPageName = 'oslc:nextPage';
		var previousPageName = 'oslc:previousPage';
		var totalCountName = 'oslc:totalCount';
		var pageNum = 'pagenum';
		var totalPages = 'totalPages';
		var nextpageURIName = 'rdf:resource';
		var previouspageURIName = 'rdf:resource';
		var hasBookmarks = 'spi:hasBookmarks';
		var schemaName = 'schema';
		if (this._leanMode === true)
		{
			responseInfoName = 'responseInfo';
			nextPageName = 'nextPage';
			totalCountName = 'totalCount';
			nextpageURIName = 'href';
			hasBookmarks = 'hasBookmarks';
			previousPageName = 'previousPage';
			previouspageURIName = 'href';
		}

    	this.nextPageUri = null;
		
        if (jsonResponse[responseInfoName])
        {
            var nextPageURI2 = jsonResponse[responseInfoName][nextPageName];
            this.totalCount = jsonResponse[responseInfoName][totalCountName];
            this.set('pageNum',jsonResponse[responseInfoName][pageNum]);
            this.set('totalPages',jsonResponse[responseInfoName][totalPages]);
            if(this.addschema === true && jsonResponse[responseInfoName][schemaName])
            {
                this.set('schema',jsonResponse[responseInfoName][schemaName]);
            }
            if (nextPageURI2)
            {
            	nextPageURI2 = nextPageURI2[nextpageURIName];
            	nextPageURI2 = this._adjustURL(nextPageURI2);

            	this.nextPageUri = nextPageURI2;
            }
            else
            {
            	this.nextPageUri = null;
            }
            
            var prevPageURI = jsonResponse[responseInfoName][previousPageName];
            if (prevPageURI)
            {
            	prevPageURI = prevPageURI[previouspageURIName];
            	prevPageURI = this._adjustURL(prevPageURI);

            	this.previousPageUri = prevPageURI;
            }
            else
            {
            	this.previousPageUri = null;
            }
                                  
            if (!this.hasBookmarks || this.hasBookmarks === false)
            {
                this.hasBookmarks = jsonResponse[responseInfoName][hasBookmarks];
            }
        }
        else
        {
        	this.nextPageUri = null;
        	this.previousPageUri = null;
        	this.totalCount = recordData.length;
        }
        //This will not used when collection fetches _id. Collection is set to do so by default. 
        if(this.addid === true)
        {
        	if(recordData[0] && !recordData[0].hasOwnProperty('_id') && recordData[0].hasOwnProperty('href')){ //only check first one to save time
		        recordData.forEach(function(data){
	            	data._id = data.href.substring(data.href.lastIndexOf('/')+1, data.href.length);
		        });
        	}
        }
        
        this.set('collectionData', recordData);        
	},

	/**
	 * Constructs a data access query URL for retrieving dynamic attribute data.
	 */
	_getDataAccessRecordQueryURL: function(queryURL, attributeNames)
	{
		var recordQueryURL = queryURL;
		
    	if (attributeNames)
    	{
    		if (recordQueryURL.indexOf('?') > 0)
    		{
    			if (this._leanMode === true)
    			{
        			recordQueryURL = recordQueryURL + '&lean=1&oslc.properties='+encodeURIComponent(attributeNames);	
    			}
    			else
    			{
        			recordQueryURL = recordQueryURL + '&oslc.properties='+encodeURIComponent(attributeNames);	
    			}
    		}
    		else
    		{
    			if (this._leanMode === true)
    			{
        			recordQueryURL = recordQueryURL + '?lean=1&oslc.properties='+encodeURIComponent(attributeNames);	
    			}
    			else
    			{
        			recordQueryURL = recordQueryURL + '?oslc.properties='+encodeURIComponent(attributeNames);	
    			}
    		}
    	}
    	
		return recordQueryURL;
	},
	
	/**
	 * Processes the dynamic attribute data returned from a REST call.
	 */
	_retrieveDetailsOfSelectedMbo: function(e)
	{
		var jsonResponse = e.detail.response;
		console.log(jsonResponse);
		
		var keyNames = Object.keys(jsonResponse);
		for (var i = 0; i < keyNames.length; i++)
		{
			if (keyNames[i].lastIndexOf('imagelibref') >= 0)
			{
				jsonResponse[keyNames[i]] = this._adjustURL(jsonResponse[keyNames[i]]);
			}
			
			if (keyNames[i] === 'href')
			{
				continue;
			}
			
			this.set('collectionData.' + this.selectedRecordIndex + '.' + keyNames[i], jsonResponse[keyNames[i]]);
		}
		
	},
    
    /**
     * Processes the next page data returned from a REST call.
     */
	_retrieveNextPageData: function(e)
	{
		var membername;
		if (this.lean !==false)
		{
			membername = 'member';
		}
		var jsonResponse = e.detail.response;
		var response = e.detail.response[membername];
		if (response===undefined || response===null){
			return;
		}
			
		if (this.retainPreviousData===false){
			this.collectionData = [];
		}
		
		for (var i=0; i< response.length; i++)
		{
			this.push('collectionData', response[i]);
		}
		
//		console.log('********** listdata: ' + this.mboDataList);
		var responseInfoName = 'oslc:responseInfo';
		var nextPageName = 'oslc:nextPage';
		var totalCountName = 'oslc:totalCount';
		var nextpageURIName = 'rdf:resource';
		var previousPageName = 'oslc:previousPage';
		var previouspageURIName = 'rdf:resource';
		if (this.lean !== true)
		{
			responseInfoName = 'responseInfo';
			nextPageName = 'nextPage';
			totalCountName = 'totalCount';
			nextpageURIName = 'href';
			previousPageName = 'previousPage';
			previouspageURIName = 'href';
		}
        if (jsonResponse[responseInfoName])
        {
            var nextPageURI2 = jsonResponse[responseInfoName][nextPageName];
            this.totalCount = jsonResponse[responseInfoName][totalCountName];
            if (nextPageURI2)
            {
            	nextPageURI2 = nextPageURI2[nextpageURIName];
            	nextPageURI2 = this._adjustURL(nextPageURI2);

            	this.nextPageUri = nextPageURI2;
            }
            else
            {
            	this.nextPageUri = null;
            }
            
            var prevPageURI = jsonResponse[responseInfoName][previousPageName];
            if (prevPageURI)
            {
            	prevPageURI = prevPageURI[previouspageURIName];
            	prevPageURI = this._adjustURL(prevPageURI);

            	this.previousPageUri = prevPageURI;
            }
            else
            {
            	this.previousPageUri = null;
            }
        }
        else
        {
        	this.nextPageUri = null;
        	this.previousPageUri = null;
//        	this.totalCount = this.mboDataList.length;
			this.totalCount = jsonResponse.responseInfo.totalCount;
        }        
	},
	
	/**
	 *	returns true if there is a next page available for the response
	 */
	hasNextPage : function() {
		return ((this.nextPageUri) && (this.nextPageUri.length > 0));	
	},
	
	/**
	 * returns true if there is a previous page available for the response
	 */
	hasPreviousPage : function() {
		return ((this.previousPageUri) && (this.previousPageUri.length > 0));	
	},

	/**
	 *	Page forward if there is a next page, the contents replaces the current set of data.
	 */
	pageForward : function() {
		if (this.hasNextPage()) {
			return this.refreshRecords(this.nextPageUri);
		}
		else
		{
			return new Promise(function (resolve, reject) {
				reject('No more records to fetch.');
			}.bind(this));			
		}
	},
	/**
	 *	Page backwards if there is a previous page, the contents replaces the current set of data.
	 */	
	pagePrevious: function() {
		if (this.hasPreviousPage()) {
			return this.refreshRecords(this.previousPageUri);
		}
		else
		{
			return new Promise(function (resolve, reject) {
				reject('No more records to fetch.');
			}.bind(this));
		}
	},
	
	/**
	 *	Return the current page for the current set of data
	 */
	getCurrentPage: function() {
		if (this.$.mxajaxFetchRecords.url) {
			var paramstart = this.$.mxajaxFetchRecords.url.indexOf('pageno=');	
			if (paramstart > 0) {
				var param;
				if (this.$.mxajaxFetchRecords.url.indexOf('&',paramstart + 7) > -1) {
					 param = this.$.mxajaxFetchRecords.url.substring(paramstart + 7, this.$.mxajaxFetchRecords.url.indexOf('&',paramstart + 7));
				}			
				else {
					 param = this.$.mxajaxFetchRecords.url.substr(paramstart + 7);	
				}				
				return parseInt(param,10);
			}			
			else {
				return 1;
			}
		}
		else {
			return -1;
		}			
	},

	/**
	 *	Return the total number pages for the set.
	 */
	getTotalPages: function() {
		if (this.pageSize > 0) {
			return Math.ceil(this.totalCount / this.pageSize); 			
		}
	},
	
	/**
	 *	fetch the pagenumber of data from the current url
	 */
	refreshPage: function(pagenumber) {
		
		if (this.$.mxajaxFetchRecords.url) {
			var paramstart = this.$.mxajaxFetchRecords.url.indexOf('pageno=');
			var newUrl;
			if (paramstart > 0) { 
				newUrl = this.$.mxajaxFetchRecords.url.substring(0,paramstart + 7) + pagenumber;
				if (this.$.mxajaxFetchRecords.url.indexOf('&',paramstart + 7) > -1) {
					newUrl += this.$.mxajaxFetchRecords.url.substr(this.$.mxajaxFetchRecords.url.indexOf('&',paramstart + 7));
				}						 		
			}			
			else {
				if (this.$.mxajaxFetchRecords.url.indexOf('?') > -1){
					newUrl = this.$.mxajaxFetchRecords.url + '&pageno=' + pagenumber;
				}
				else {
					newUrl = this.$.mxajaxFetchRecords.url + '?pageno=' + pagenumber;
				}
			}			
			return this.refreshRecords(newUrl);
		}
		else {
			return new Promise(function (resolve, reject) {
				reject('refreshPage: no existing url to page with');
			}.bind(this));
			console.log('refreshPage: no existing url to page with');
		}		
	},
	getCountNew: function() {

		this.$.mxajaxCountNew.url = this.$.myauthenticator.getBaseUri() + '/oslc/os/' + this.objectName + '?action=countnew';
		this.$.mxajaxCountNew.headers = {};
		
		return new Promise(function (resolve, reject) {
						this.$.mxajaxCountNew.generateRequest().completes.then(function(result){ 
								resolve(result); 
						}, function(error) { 
								reject(error); 
						});
		}.bind(this));		
	},
	
	_processCountNewResponse: function(e)
	{
		var jsonResponse = e.detail.response;
		this.countNew = jsonResponse.count;
		this.fire('count-new-refreshed',this.countNew);
	},
	
	/**
	 * Fetches distinct values for the given attribute name. This function returns a promise which when fulfilled
	 * contains the distinct values of the attribute.
	 */
	getDistinctValuesForAttribute: function(attributeName) {

		if (this.selectedQueryName==='All' || this.selectedQueryName===null)
		{
			this.$.mxajaxDistinct.url = this.$.myauthenticator.getBaseUri() + '/oslc/os/' + this.objectName + '?distinct=' + attributeName;
			
		} else
		{	
			this.$.mxajaxDistinct.url = this.$.myauthenticator.getBaseUri() + '/oslc/os/' + this.objectName + '?savedQuery=' + this.selectedQueryName + '&distinct=' + attributeName;
		}
		this.$.mxajaxDistinct.headers = {};
		
		return new Promise(function (resolve, reject) {
						this.$.mxajaxDistinct.generateRequest().completes.then(function(result){ 
								resolve(result); 
						}, function(error) { 
								reject(error); 
						});
		}.bind(this));		
	},
	
	_processDistinctResponse: function(e)
	{
		this.distinctValues = e.detail.response;
		this.fire('distinct-values-refreshed',this.distinctValues);
	},
	
	/**
	 * Processes the error as a result of a distinct value REST call.
	 */
	_processDistinctError: function(e)
	{
		this.fire('distinct-values-refresh-error', e.detail.request.xhr.response);
	},
	
	startRefreshTimer: function () {
		
		if (this.timerHandle) {
			 window.clearTimeout(this.timerHandle);
			 this.timerHandle = null;
		}
		
		if (this.refreshInterval > 0) {
			this.timerHandle = window.setTimeout($j.proxy(this.refreshRecords, this, null, true), this.refreshInterval * 1000);			
		}
	},
	
	startRefreshTimerForGroupBy: function () {
		
		if (this.timerHandle) {
			 window.clearTimeout(this.timerHandle);
			 this.timerHandle = null;
		}
		
		if (this.refreshInterval > 0) {
			this.timerHandle = window.setTimeout($j.proxy(this.fetchGroupByData, this, null, true), this.refreshInterval * 1000);			
		}
	},
	
	startRefreshTimerForCount: function () {
		
		if (this.timerHandle) {
			 window.clearTimeout(this.timerHandle);
			 this.timerHandle = null;
		}
		
		if (this.refreshInterval > 0) {
			this.timerHandle = window.setTimeout($j.proxy(this.getCollectionCount, this, null, true), this.refreshInterval * 1000);			
		}
	},
	
	startRefreshTimerForInsight: function () {
		
		if (this.timerHandle) {
			 window.clearTimeout(this.timerHandle);
			 this.timerHandle = null;
		}
		
		if (this.refreshInterval > 0) {
			this.timerHandle = window.setTimeout($j.proxy(this.fetchInsightData, this, null, true), this.refreshInterval * 1000);			
		}
	},
	
	_processCollectionCountResponse: function(e)
	{
		var jsonResponse = e.detail.response;
		this.totalCount = jsonResponse.totalCount;
		this.fire('count-refreshed',this.totalCount);
		this.startRefreshTimerForCount();
	},
	
	
	getCollectionCount: function()
	{
		if(this.objectName && !this.collectionUri)
		{
			this.queryInfo = this.$.meta.byKey(this.objectName);
			if ((!this.queryInfo))//|| !this.creationInfo))
			{
				return new Promise(function (resolve, reject) {
								this.refreshServiceProviderData().then(
										function(result) {
											// after sp data is refreshed, refresh the data
											this.getCollectionCount().then(function(result) { 
												resolve(result);
												}.bind(this));
										}.bind(this), 
										function(error) { 
											reject(error);		
										});
							}.bind(this));
			}
		}
		
		var url = this.queryInfo[0].href + '?count=1&lean=1';
		if (this.selectedQueryName && this.selectedQueryName !=='All')
		{
			url = url + '&savedQuery=' + this.selectedQueryName;
		}
		url = this._addAdditionalParamsToUrl(url);
		this.$.mxajaxCollectionCount.url = url;
		this.$.mxajaxCollectionCount.headers = {};
				
		return new Promise(function (resolve, reject) {
						this.$.mxajaxCollectionCount.generateRequest().completes.then(function(result){ resolve(result); }, function(error) { reject(error); });
					}.bind(this));		
	},
	
	/**
	 * Supports Timeline date searching
	 */
	_addTimeLineTermsToURL: function(accessURL)
	{
		if(this.timeLineAttribute && this.timeLineRange){
    		if ((accessURL.indexOf('?') < 0))
    		{
    			accessURL = accessURL + '?';
    		}
    		accessURL += '&tlattribute=' + this.timeLineAttribute + '&tlrange=' + encodeURIComponent(this.timeLineRange);
		}
		return accessURL;
	},
	
	/**
	 * Adds localized parameters
	 * such as: Numbers, Dates and Times
	 */
	_addLocalizeRepo: function(accessURL)
	{
		if(this.localizedRepo && this.localizedRepo === '1'){
    		if ((accessURL.indexOf('?') < 0))
    		{
    			accessURL = accessURL + '?';
    		}
    		accessURL += '&addlocalizedrep=1';
		}
		return accessURL;
	},
	
	/**
	 * Adds localized parameters
	 * such as: Numbers, Dates and Times
	 */
	_addLocalizeRepresentation: function(accessURL)
	{
		if(this.addLocalizedrep){
    		if ((accessURL.indexOf('?') < 0))
    		{
    			accessURL = accessURL + '?';
    		}
    		accessURL += '&addlocalizedrep=1';
		}
		return accessURL;
	},
	
	
	_addAdditionalParamsToUrl: function(dataAccessURL)
	{
    	var noOfParams;
    	var i;
		var found = false;
		if (this.additionalParams)
		{
    		noOfParams = this.additionalParams.length;
    		for (i = 0; i < noOfParams; i++)
    		{
    			var param = this.additionalParams[i];    			    			
    			dataAccessURL = dataAccessURL+'&'+param;

				if (param.startsWith('oslc.where=') && this.groupByToDate && this.groupByFromDate)
				{
					var subWhere = 'statusdate>="' + this.groupByFromDate + '" and statusdate<"' + this.groupByToDate + '"';
					dataAccessURL = dataAccessURL + ' and ' + subWhere;
					found = true;
				}
    		}
    	}

		if (found===false && this.groupByToDate && this.groupByFromDate)
		{
			var subWhere = 'statusdate>="' + this.groupByFromDate + '" and statusdate<"' + this.groupByToDate + '"';
			dataAccessURL = dataAccessURL + '&oslc.where=' + subWhere;    			
		}	

    	return dataAccessURL;
	},
	
	_addCtxTermsToURL: function(accessURL){
		if(this.ctxTerms){
    		if (accessURL.indexOf('?') === -1 ){
    			accessURL = accessURL + '?ctx=';
    		}
    		else{
    			accessURL = accessURL + '&ctx=';	
    		}
    		
			for (var key in this.ctxTerms) {
			    if (this.ctxTerms.hasOwnProperty(key)) {
			    	accessURL = accessURL + key + '=' + this.ctxTerms[key] + ',';
			    }
			}
			return accessURL.substring(0,accessURL.length-1);
		}
		return accessURL;
	},
	/** Allows a single load of data from a request with no security. Designed for use with a relative path for test page data */
	_getTestData: function(url){
		var my = this;
		if(url && url !== ''){
			//can only sort by 1 column in test data
			var sort = function(data){
				if(my.groupBySortClause){
					var sorts = my.groupBySortClause.split(',')
					var sort = sorts[0].split(' ');
					var attribute = sort[0];
					var dir = sort[1];
					if(!dir){
						dir = 'asc';
					}
					dir = dir.toLowerCase();
					if(dir==='asc'){
						data.sort(function(a, b) {
							if(a[attribute] < b[attribute]) return -1;
						    if(a[attribute] > b[attribute]) return 1;
						    return 0;
						});
					}
					else {
						data.sort(function(a, b) {
							if(a[attribute] < b[attribute]) return 1;
						    if(a[attribute] > b[attribute]) return -1;
						    return 0;
						});
					}
				}
				var temp = [];
				if(my.filterData && my.filterData.length > 0){
					data.forEach(function(record){
						var matched = 0;
						my.filterData.forEach(function(filter){
							if(filter.filtertype.toUpperCase() === 'SIMPLE'){
								filter.availablevalues.forEach(function(filterValue){
									var included = (record[filter.field]).toString().toLowerCase().includes(filterValue.value.toLowerCase()); 
									if(included === filterValue.selected){
										matched++;
									}
								});
							}
						});
						if(my.filterData.length === matched){
							temp.push(record);
						}
					});
					data = temp;
				}
				return data;
			};
			my._retrieveData = function(e){
	        	my.nextPageUri = null;
	        	my.previousPageUri = null;
	        	if(!e.detail.response){
	        		console.error('Data retrieved via test-url may be formatted incorrectly.');
	        		return;
	        	}
	        	var data = e.detail.response.member?e.detail.response.member:e.detail.response;
	        	data = sort(data);
	        	var responseInfoName = 'oslc:responseInfo';
	        	if (this._leanMode === true){
	    			responseInfoName = 'responseInfo';
	    		}
	        	if(this.addschema === true && e.detail.response[responseInfoName] && e.detail.response[responseInfoName].schema){
	                my.set('schema',e.detail.response[responseInfoName].schema);
	            }
	        	if(data){
	        		var tempData = data;
	        		if(my.searchTermValue && my.searchAttributeNames){
	        			tempData = [];
	        			var searchTerm = my.searchTermValue.toLowerCase();
	        			data.forEach(function(record){
	        				var matched = false;
	        				var searchAttrs = my.searchAttributeNames.split(',');
	        				searchAttrs.forEach(function(searchAttr){
	        					if(record[searchAttr].toLowerCase().includes(searchTerm)){
	        						matched = true;
	        					}
	        				});
	        				if(matched){
	        					tempData.push(record);
	        				}
	        			});
	        		}
	        		my.totalCount = tempData.length;
	        		my.set('collectionData', tempData);
	        	}
			};
			my.refreshRecords = function(urlToUse, stopRelatedRefresh){
				return new Promise(function (resolve, reject) {
					my.$.mxajaxFetchRecords.url=urlToUse?urlToUse:url;
					my.$.mxajaxFetchRecords.generateRequest().completes.then(function(result){ 
						resolve(result);
						if(!my.firstLoad && !stopRelatedRefresh){
							$M.notifyCollections(my.id);
						}
						my._notifyListeners('collection-data-refreshed');
						my.firstLoad = false;
					}, 
					function(error) { 
						reject(error); 
					});
				}.bind(this));
			};
			my.getNewRecordData = function(){
				/*
				 * very basic implementation for test
				 * Copy first row and reset all values as follows
				 * 	array: []
				 *  string: ''
				 *  boolean: false
				 *  integer: -1 
				 */
				var newRecord = JSON.parse(JSON.stringify(this.collectionData[0]));
				var schemaProperties = this.schema.properties;
				Object.keys(newRecord).forEach(function(key){
					var schemaProperty = schemaProperties[key];
					if(schemaProperty){
						switch(schemaProperty.type){
							case 'string':
								newRecord[key] = '';		
								break;
							case 'boolean':
								newRecord[key] = false;
								break;
							case 'integer':
								newRecord[key] = -1;
								break;
							case 'array':
								newRecord[key] = [];
								break;
						}
					}
				});
				newRecord._id = newRecord.href = (new Date()).getTime() + '';
				this.fire('new-record-created', newRecord);
			};
		}
	},
	
	/**
	 * Example for GET: this.$.collection.invokeAction('getActionName');
	 * Example for POST: this.$.collection.invokeAction('postActionName',{},'POST', postBody);
	 */
	
	invokeAction: function(action, queryParams, method, postBody)
	{
		//Build base action URL
		var actionURL = '';
		if(!this.collectionUri && this.objectName !== undefined && this.objectName !== null)
		{
			actionURL = this.$.myauthenticator.getBaseUri() + '/oslc/os/' + this.objectName + '?action=' + action;
		}	
		else if(this.collectionUri !== undefined)
		{
			actionURL = this.collectionUri + '?action=' + action;
		}
		else
		{
			return;
		}

		//Build action params if there is any and append it to action url
		if (queryParams)
		{
			var qps = '';
			for (var key in queryParams)
			{
				if (queryParams.hasOwnProperty(key))
				{
					qps += '&'+encodeURIComponent(key)+'='+encodeURIComponent(queryParams[key]);
					//alert(key + ' -> ' + p[key]);
				}
			}
			actionURL = actionURL + qps;
		}
		
		// If authentication is needed, just return.
		if (this._isAuthenticationNeeded())
		{
			return new Promise(function (resolve, reject) {
							reject('Authentication needed');
						}.bind(this));
		}
		
		//Set up action url
		
		this.$.mxajaxInvokeActionRecord.url = actionURL;
		
		//Set up header
		var headers = {};
		if(this.contentLocalized){
			headers['content-localized'] = '1';
			actionURL = this._addLocalizeRepresentation(actionURL);
			this.$.mxajaxInvokeActionRecord.url = actionURL;
		}
		
		//When method is POST, handle extra params content-type/handleAs/postBody
		if(method === 'POST'){
			this.$.mxajaxInvokeActionRecord.contentType = 'application/json';
			this.$.mxajaxInvokeActionRecord.handleAs='json';
			this.$.mxajaxInvokeActionRecord.method = method;
			this.$.mxajaxInvokeActionRecord.body={};
			if(postBody !== undefined && postBody !== null){
				this.$.mxajaxInvokeActionRecord.body=JSON.stringify(postBody);
			}
			headers.csrftoken = $M.getCSRFToken();
		}//Otherwise handle it as GET
		else{
			this.$.mxajaxInvokeActionRecord.method = 'GET';
		}
		
		this.$.mxajaxInvokeActionRecord.headers = headers;
		this.$.mxajaxInvokeActionRecord.generateRequest();

		return new Promise(function (resolve, reject) {
			this.resolveInvokeActionRecordPromise = resolve;
			this.rejectInvokeActionRecordPromise = reject;
		}.bind(this));
	},
	
	_processInvokeActionRecordResponse: function(e)
	{
		this.resolveInvokeActionRecordPromise(e.detail);
		
		this.fire('action-invoked',e.detail.response);
	},

	_processInvokeActionRecordResponseError: function(e)
	{
		this.rejectInvokeActionRecordPromise(e.detail);
		
		this.fire('action-invoke-error',e.detail.request.xhr.response);
	}
  });