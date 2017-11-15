/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */

/*
A schema component.
 */
Polymer({
    is: 'maximo-schema',  
    
	properties: {
		/**
		 * list of attribute names to fetch
		 */
      	attributeNames: {
      		type: String,
      		value: null
      	},
      	/**
      	 * object structure to fetch
      	 */
      	objectName: {
      		type:String,
      		notify:true
      	},      	
      	/**
      	 * the list of properties for the schema (starting with root)
      	 */
      	schema: {
      		type: Object,
      		notify:true
      	},
      	/**
      	 * the array of required fields
      	 */
      	required : {
      		type: Object,
      		notify:true
      	},
      	/**
      	 * boolean flag to indicate whether to fetch the entire hierarchy for the object structure
      	 */
      	fetchAll : {
      		type : Boolean,
      		value : false      		
      	},
      	/**
      	 * value to filter on
      	 */
      	searchTermValue : {
      		type : String,
      		value: ''
      	},
      	/**
      	 * set this to true to have the schema use the maxintobjdetail.description for the description
      	 */
      	useschemadesc : {
      		type: Boolean,
      		value: false
      	},
		/**
		 * The entire response for the schema call, includes all of the properties of the root object
		 */      	
      	fullresponse: {
      		type: Object,
      		notify:true
      	},

    }, // End of Properties
    
	ready: function()
	{
		
	},

	_isAuthenticationNeeded: function(e)
	{
		return this.$.myauthenticator.isAuthenticationNeeded();
	},

	fetchSchema: function()
	{
		if (!this.objectName && !this.collectionUri)
		{
			return new Promise(function (resolve, reject) {
							reject('No Object Name or collection URI specified');
						}.bind(this));
		}
		
		if (this._isAuthenticationNeeded())
		{
			return new Promise(function (resolve, reject) {
							reject('Authentication needed');
							$M.workScape.returnToLogin();
						}.bind(this));
		}
		
		this.$.mxajaxSchema.url = this.$.myauthenticator.getBaseUri() + '/oslc/jsonschemas/' + this.objectName;
		if (this.fetchAll) {
			this.$.mxajaxSchema.url	= this.$.mxajaxSchema.url + '?oslc.select=*'; 			
		}else if(this.attributeNames){
			this.$.mxajaxSchema.url	= this.$.mxajaxSchema.url + '?oslc.select=' + this.attributeNames;
		}
		
		if (this.searchTermValue && this.searchTermValue.length > 0){
			this.$.mxajaxSchema.url = this.$.mxajaxSchema.url + this._getParameterSeparator(this.$.mxajaxSchema.url) + 'schemaSearchTerm=\"' + this.searchTermValue + '\"';
		}
		
		if (this.useschemadesc) {
			this.$.mxajaxSchema.url = this.$.mxajaxSchema.url + this._getParameterSeparator(this.$.mxajaxSchema.url) + 'schemadesc=1';
		}
		
		this.$.mxajaxSchema.headers = {};
		
		return new Promise(function (resolve, reject) {
						this.$.mxajaxSchema.generateRequest().completes.then(function(result){ 
								resolve(result); 
						}, function(error) { 
								reject(error); 
						});
		}.bind(this));
	},
	
	_processSchemaResponse: function(e)
	{
		this.set('required',e.detail.response.required);
		this.set('schema',e.detail.response.properties);
		this.set('fullresponse',e.detail.response);
		this.fire('schema-data-refreshed');
	},
	
	_processSchemaResponseError: function(e)
	{
		if ($M.checkSession(e)){
			this.fire('schema-data-error', e.detail.request.xhr.response);
		}
	},
	_getParameterSeparator : function (url) {
		
		return (url.indexOf('?') > -1) ? '&' : '?';
	},
	
	refreshRecords : function() {
		return this.fetchSchema();
	}
});