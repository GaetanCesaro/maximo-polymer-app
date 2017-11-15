/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */

/*
A link component.
 */
Polymer({
	
	is : 'maximo-link',
	
	properties : {
		
		/**
		 * Name of external link to request for maximo
		 */
		linkName: {
			type: String,
			notify: true
		},
		
		/**
		 * Flag to indicate whether to show/hide the link
		 */
		isLinkHidden: {
			type: Boolean,
			readOnly: true,
			value: true
		},
		
		/**
		 * Set icon to show on the button
		 */
		icon : {
			type : String
		},

		/**
		 * Text preceding label
		 */
		preLabel: {
			type: String,
			value: ''
		},
		
		/**
		 * Text follows label
		 */
		postLabel: {
			type: String,
			value: ''
		},
		
		/**
		 * The text binding the http reference
		 */
		label: {
			type: String,
			value : ''
		},
		
		/**
		 * Configuration object
		 */
		config: {
			type: Object,
			notify: true
		},
		
		/**
		 * Configuration file path
		 */
		cfgUrl: {
			type: String,
			readOnly: true,
			value: '../../ext-link-config.json'
		},
		
		/**
		 * The http/s reference
		 */
		url: {
			type: String,
			notify: true
		},
		
		/**
		 * DEPRECATED
		 * Header received from external link
		 */
		linkHeader: {
			type: Object,
			readOnly: true,
			notify: true,
			observer: '_headerChanged'
		},
		
		/**
		 * DEPRECATED
		 * key of configuration file 
		 */
		ref: {
			type: String,
			notify: true
		}
		
	},
	
	/**
	 * @polymerBehavior 
	 */
	behaviors : [ BaseComponent, LoadingComponent ],
	
	ready : function() {
		
		if (!this.linkName || this.linkName.length <= 0) {
			console.warn('The link-name was not provided.');
			return;
		}
		
		this.$.mxajaxCfg.url = this.resolveUrl(this.cfgUrl);
		this.$.mxajaxCfg.generateRequest();
		
		if(!this.icon){
			$j(this.$.icon).css({'display':'none'});
		} else {
			$j(this.$.icon).css({'display':'inline'});
		}
	},
	
	
	/**
	 * Listens to maximo response
	 */
	_handleRecordDataRefreshed: function() {
		
		var collection = this.externalLinkCollection;
		
		if (!collection || collection.length !== 1) {
			console.warn('Unexpected response.');
			this.hideLink(true);
			return;
		}
		
		var extlink = collection[0];
		
		if (extlink.active === true && extlink.valid === true){
			this.url = extlink.url;
			this.hideLink(false);
		}
		
	},
	
	/**
	 * controls link visibility
	 */
	hideLink: function (/*boolean*/ isHidden){
		this._setIsLinkHidden(isHidden);
	},
	
	/**
	 * Retrieves the configuration for external link
	 */
	_handleConfigFile: function (e, request) {
		
		var response = e.detail.response;
		if (!response && typeof response !== 'object') {
			console.warn('Not able to parse response.');
		}
		
		this.config = response;
		
		//Check if user disabled app configuration 
		if (!response.hasOwnProperty('disableAllLinks') || response.disableAllLinks === true){
			//console.log('Configuration missing. Link is hidden.');
			return;
		}

		var link = this.linkName;
		//Check if mapping exists in configuration file
		if (response.hasOwnProperty('linkMap') && typeof response.linkMap === 'object' && response.linkMap.length > 0){
			//Fetch name if linkName matches any alias 
			// from mapping set in config file 
			link = this.fetchLinkName(this.linkName, response.linkMap);
		}

		this.linkName = link.toUpperCase();
		
		//Trigger maximo request
		this.$.extlink.refreshRecords();
		
	},
	
	/**
	 * Handle bad response from config file request
	 */
	_handleConfigError: function (e, request) {
		console.error('Not able to load external link configuration.');
	},

	/**
	 * Try to fetch linkName in the mapping as alias
	 * return link name
	 */
	fetchLinkName: function(/*String*/alias, /*Array*/map) {
		
		for (var i=0; i < map.length; i++) {
			if (map[i].alias === alias){
				if (map[i].hasOwnProperty('name') && map[i].name.length > 0) {
					alias = map[i].name;
					break;
				}
			}
		}
		return alias; 		
	},
	
	/**
	 * DEPRECATED
	 * Observer of linkHeader
	 */
	_headerChanged: function (newV, oldV) {
		
		if (JSON.stringify(newV) !== JSON.stringify({})) {
			this.fire('validate-extlink', newV);
		}
	},
	
	/**
	 * DEPRECATED
	 * Apply conditions to external link
	 */
	validateLink: function(/*Object*/ extlink) {
		
		//Check if link is active by user
		if (extlink.active && extlink.active === false) {
			console.warn ('Link is not active.');
			this.hideLink(true);
			return;
		}
		
		//Check if link is stale
		var expmonths = extlink.expmonths;
		var headers = JSON.parse(extlink.headers);
		if (expmonths && headers.hasOwnProperty('last-modified')) {
			var lastMod = headers['last-modified'];
			var isStale = this.checkExpiredLink(lastMod, expmonths);
			if (isStale) {
				console.warn ('Link is not active.');
				this.hideLink(true);
				return;
			}
		}
		
		//Check if link is up
		if (extlink.lastcallsuccess && extlink.lastcallsuccess === false) {
			console.warn ('Link is not up.');
			this.hideLink(true);
			return;
		}
		
		this.url = extlink.linkurl;
		this.hideLink(false);
		if ( JSON.stringify(headers) !== JSON.stringify({}) ) {
			this._setLinkHeader(headers);
		}

		return;
		
	},
	
	/**
	 * DEPRECATED
	 * Return true link is stale
	 * Stale = (last-mod + expmonths) < today
	 */
	checkExpiredLink: function (/*string*/lastModified, /*int*/expMonths) {
		
		var curDate = new Date();
		//Converts lastModified in date
		var expDate = new Date(lastModified);
		//Add months to it
		expDate.setMonth(expDate.getMonth() + expMonths);
		//Condition
		var isStale = curDate > expDate;
		
		return isStale;
	},
	
	/**
	 * DEPRECATED
	 * Receive success response to validate link
	 */
	_handleResponse: function(e, request) {
		
		var response = e.detail.response;
		
		if (!response && typeof response !== 'object') {
			console.warn('Not able to parse response.');
			this.hideLink(true);
			return;
		}
		
		if (response.lastcallsuccess && response.lastcallsuccess === true) {
			this.url = response.linkurl;
			this.hideLink(false);
			
			var headers = JSON.parse(response.headers);
			if ( JSON.stringify(headers) !== JSON.stringify({}) ) {
				this._setLinkHeader(headers);
			}			
		}
		return;
		
	},
	
	/**
	 * DEPRECATED
	 * Receive bad response to valida link
	 */
	_handleError: function(e, request) {
		console.error(e);
		this.hideLink(true);
	}
	
});