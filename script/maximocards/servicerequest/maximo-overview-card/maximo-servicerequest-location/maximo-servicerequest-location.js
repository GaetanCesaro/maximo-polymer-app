Polymer({
	is: 'maximo-servicerequest-location',
  	behaviors: [BaseComponent],
	properties : {
		srLocationData : {
			type: Object
		},
		groupByData : {
			type: Object
		},
		
		chartdata : {
			type : Array,
			value : []
		},
		siteinfo : {
			type: Object
		},
		mapInfo : {
			type: Object
		},
		chartoptions: {
			type: Object,
			value: {}
		}
	},
//	siteData : [{label:'BEDFORD',siteid:'BEDFORD', lat:42.49073871,lng:-71.27481222},
//				{label:'DENVER',siteid:'DENVER', lat:39.8254131,lng:-104.8713684},
//				{label:'FLEET',siteid:'FLEET', lat:36.94455853,lng:-76.31230116},
//				{label:'HARTFORD',siteid:'HARTFORD', lat:41.76374165,lng:-72.68468857},
//				{label:'LAREDO',siteid:'LAREDO', lat:27.52288683,lng:-99.46455002},
//				{label:'MCLEAN',siteid:'MCLEAN', lat:38.93270727,lng:-77.17588663},
//				{label:'NASHUA',siteid:'NASHUA', lat:42.76062525,lng:-71.4600563},
//				{label:'TEXAS',siteid:'TEXAS', lat:29.42031082,lng:-98.4428215}],
//
  	created : function(){
  		
  	},
  	//TODO: Change hover template for location of service request ; number of service request in {} 
  	ready : function(){
  		this.hovertemplates = [this.localize('Site: {0}'),this.localize('Number of Requests : {0}')];  		
  	},
  	attached: function(){
  		
  	},
  	_handleLocationDataRefreshed : function() {
  		this.$.srlocationdata.fetchGroupByData();
  	},
  	_handleGroupByDataRefreshed : function() {
  		var sites = $M.createAttrArrayFromRecords(this.groupByData,'siteid');

  		for (var ii = 0; ii < sites.length; ii++) {
  			var site = sites[ii];
  			var set1 = this._getValFromSet(site, this.groupByData);
  			var factor=0;
  			if (set1){
  				factor = set1;
  				var location = this._getLatLngForSite(site);  				
  				if (location) {
  					location.value = factor;
  					location.label = location.siteid;
  					this.chartdata.push(location);
  				}
  			}  			
  		}
  		
  		this.chartoptions = {};  		
  		this.chartoptions.rmargin = 10;
  		this.chartoptions.tmargin = 0;
  		this.chartoptions.bmargin = 0;
  		this.chartoptions.lmargin = 10;  		
  		this.chartoptions.scale=2;
  		  		
  		this.$.chart.showChart();
  	},
  	_getValFromSet : function (value, set) {
  		for (var ii = 0; ii < set.length ; ii++) {
  			if (value === set[ii].siteid) {
  				return set[ii].count;
  			}
  		}
  		return null;
  	},
  	
  	_getLatLngForSite : function (siteid){
  		for (var ii = 0; ii < this.siteInfo.length ; ii++) {
  			if (siteid === this.siteInfo[ii].siteid) {
  				return JSON.parse(JSON.stringify(this.siteInfo[ii]));
  			}
  		}
  		return null;
  	},
  	_handleSiteInfoRefreshed : function () {
  		this.siteInfo = this.mapInfo[0].mapsites;
  		for (var ii =0; ii < this.siteInfo.length; ii++) {
  			if (this.siteInfo[ii].hasOwnProperty('initialy')) {
  				this.siteInfo[ii]['lat'] = this.siteInfo[ii]['initialy'];
  				delete this.siteInfo[ii]['initialy']; 
  			}
  			if (this.siteInfo[ii].hasOwnProperty('initialx')) {
  				this.siteInfo[ii]['lng'] = this.siteInfo[ii]['initialx'];
  				delete this.siteInfo[ii]['initialx']; 
  			}
  		}
  		this.$.srlocationdata.fetchGroupByData();
  	}
});