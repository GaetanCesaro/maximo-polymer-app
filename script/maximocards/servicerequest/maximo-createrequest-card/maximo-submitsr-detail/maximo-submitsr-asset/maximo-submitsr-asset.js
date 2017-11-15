/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-submitsr-asset',
  	behaviors: [BaseComponent],
    properties: {
       	label: {
			type: String,
			value: 'Panel'
		},
		icon: {
			type: String,
			value: 'title'
		},		
		
		title: {
			type: String,
			value: 'title'
		},
		itemCount: {
			type: Number,
			value: 0
		},	
		recordData :{
			type:Object,
			notify : true
		},
		itemData :{
			type:Object,
			notify : true
		},		
		selectedRecord :{
			type:Object,
			notify:true
		},		
		additionalConditionParams : {
			type:Object
		},
        searchValue: {
            type: String,
            value: '',
            notify: true,
            observer: '_valueChanged'
        },
        isSearch: {
            type: Boolean,
            value: false
        },        
        description : {
        	type : String
        },
        locationRef : {
        	type : String
        },
		siteidRef : {
			type:String
		},
        location : {
        	type : String
        },     
        locationDesc : {
        	type : String
        },         
        assetnum : {
        	type : String
        },
        siteid : {
        	type : String
        },
    	searchTerms: {
    		type: String
    	},
        userLocationDesc:{
        	type : String
        },
		additionalparams : {
			type : Object,
			notify : true
		},
		locanData : {
			type : Object,
			notify : true
		},
		locancestor :{
			type: Array,
    		value: []
		},
		bcdata : {
    		type: Array,
    		value: []
    	},
		selectedLocationDesc : {
			type: String
		},
		selectedLocation : {
			type:String
		},
        systemid : {
        	type: String
        },
        assetFirst :{ // if false, asset step is after the location step
        	type: Boolean,
        	value : false
        }
	},
	listeners :{
		'dom-change' : '_showNodataLabel'
	},
	ready: function()
	{
		var locIdx, assIdx;
		var steps = this.parentNode.children;
		for(var i=0; i<steps.length; i++) {
			if(steps[i].tagName === this.tagName) {
				assIdx = i;
			}
			else if(steps[i].tagName === 'MAXIMO-SUBMITSR-LOCATION') {
				locIdx = i;
			}
		}
		this.assetFirst = locIdx < assIdx ?  false : true;
	},
	_goNext : function(e) {
  		if (this.$.assetSearchbar.$.inputval.value.length < 3) {
  			console.log('input invalid');
  			return;
  		}
		// when location step skip or asset a head
		if (!this.locationRef) {       	
    		this.additionalancestorparams = [];
    		this.additionalancestorparams.push('oslc.where=location=%22'+this.location+'%22');
      		this.additionalancestorparams.push('responseos=MXAPILOCATION');
      		var that = this;
      		that.selectedBc = '';
      		
      		this.$.locancestorcollection.refreshRecords().then(function(collection) { 			
      			if (that.locanData.length > 0 ) {
      				that._addAncestor();
          			
          			if (that.bcdata) {
          				if(that.bcdata.length > 1) {
    	        	      	for(var i =0; i<that.bcdata.length; i++) {
    	                		if(i === that.bcdata.length-1) {
    	                			if(that.bcdata[i].description!=='All'){
    	                				that.selectedBc += that.bcdata[i].description;
    	                			}
    	                			break;
    	                		} else {
    	                			if(that.bcdata[i].description!=='All'){
    	                				that.selectedBc += that.bcdata[i].description+' > ';
    	                			}
    	                		}
    	                	}
          				}
          				else {
          					that.selectedBc = '';
          				}
            	    }
          			
         	      	that.fire('go-nextdetail', [{step:'Asset'          , value: {description: that.description, assetnum : that.assetnum, location : that.location, siteid : that.siteid}},
         	      			                    {step:'Location' , value: {description: that.selectedLocationDesc, breadcrumb: that.selectedBc, location:that.selectedLocation}}]);
      			} else {
      				
        	      	that.fire('go-nextdetail', [{step:'Asset'          , value: {description: that.description, assetnum : that.assetnum, location : that.location, siteid : that.siteid}},
        	      	                            {step:'Location' , value: {description: that.locationDesc, breadcrumb: that.selectedBc, location: that.location}}]);      			
      			}
      		});
    	}
    	else {
    		this.fire('go-nextdetail', {step:'Asset'       , value: {description: this.description, assetnum : this.assetnum, siteid : this.siteid}});
    	}
	},
	_skipStep: function(e) {
		if (this.locationRef) {
			this.fire('go-nextdetail', {step:'Asset', value:{}});
		} else {
			if(this.assetFirst){
				this.fire('go-nextdetail', {step:'Asset', value:{}});
			}
			else{
				this.fire('go-nextdetail', [{step:'Asset', value:{}},
				                            {step:'Location', value:{}}]);
			}
		}
	
	},
	initPage: function() {
		console.log('init page');
		this._initVar();
	},
	_initVar : function() {
		// asset variable
		$j(this.$.assetSearchbar.$.inputval).val('');
		this.searchValue='';
		$j(this.$.itemList).css({'display':'none'});
		this.locationRef = null;
		this.siteidRef = null;
		this.description = null;
        this.assetnum = null;
		this.location = null;
		this.siteid = null;
		
		//location info variable 
		this.selectedLocation = null;
		this.selectedBc = null;
		this.selectedLocationDesc = null;
		this.additionalparams = [];
		this.bcdata = [];
	},
   _filter: function(val) {  
    	var that = this;
    	this.itemCount = 0;
		this.additionalConditionParams = [];
    	$j(this.$.selectAssetWrapper).css({'display':'none'});
     	if (val.length < 3) {
        	this.itemCount = 0;
    		this.isSearch = true;
    		
    		$j(this.$.itemList).css({'display':'none'});
    		
    		return null;
    	}
    	else if (val.length === 3 && this.isSearch) {
            val =  encodeURIComponent(val);
            
    		this.$.nodataLabelWrapper.hidden=true;
    		// searchTerms
    		this.recordData = [];
    		this.isSearch = false;
 
    		this.searchTerms = val + '%';
    		//oslc.where
    		this.additionalConditionParams = [];
    		
    		// exist location from locations
    		if(this.locationRef)
    		{

    			this.additionalConditionParams.push('oslc.where=location=%22' + this.locationRef + '%22%20and%20siteid=%22'+this.siteidRef+'%22');
    			this.$.assetsrcollection.refreshRecords().then(function(){
    				if(that.recordData.length === 0) {
    					that.additionalConditionParams = [];
    					that.additionalConditionParams.push('oslc.where=location%21=%22%2A%22%20and%20siteid=%22'+that.siteidRef+'%22');
    					that.$.assetsrcollection.refreshRecords();  
    				}
    			});
    		} 
    		else
    		{
    			this.locationRef = null;    	
    			this.$.assetsrcollection.refreshRecords();      
    		}
    		
    		$j(this.$.itemList).css({'display':'block'});
    	    return function(asset) {
				return that._findAsset(val, asset);
    	    }; 
    	}
    	else {
    		$j(this.$.itemList).css({'display':'block'});
    	    return function(asset) {
				return that._findAsset(val, asset);
    	    };    		
    	}
    },
    _findAsset : function(val, asset)
    {
    	 var desc = new String(asset.description).toUpperCase();
		 var assetnum = new String(asset.assetnum).toUpperCase();
		 val = val.toUpperCase();

		 var result = desc.includes(val) || assetnum.includes(val);
		 
		 if (result)
		 {
			 this.itemCount = this.itemCount + 1;
		 }
		 return result && this.itemCount <= 5;
    },
    _getAsset(item) {
    	var desc = item.description;
    	
    	return desc + ' (' + item.assetnum + ')';
    },
    _getAssetDisp(item) {
    	return  '(' + item.assetnum + ')';
    },    
    _valueChanged: function(e) {
        if (this.searchValue.length >= 3) 
        {
            this.$.resultList.render();
        }

    },
    _selectedAsset : function (e) {
  	    var assetDiv = e.model._children[1];
    	
    	this.description = assetDiv.label;
    	this.assetnum = assetDiv.assetnum;
    	this.$.assetSearchbar.value = assetDiv.label;
    	this.siteid = assetDiv.siteid;
    	
    	if (!assetDiv.location) {
    		this.location = '';
    		this.locationDesc = '';
    	} else {
    		this.location = assetDiv.location;
    		this.locationDesc = assetDiv.locationdesc;
    	}
        
    	$j(this.$.itemList).css({'display':'none'});
    	$j(this.$.selectAssetWrapper).css({'display':'block'});
    },
    _handleRecordDataRefreshed : function() {
    	var that = this;
  		if(that.recordData && that.recordData.length === 0){
				that.$.nodataLabelWrapper.hidden=false;
		} else {
			    that.$.nodataLabelWrapper.hidden=true;
		}
    },
	_handleDataError : function(){
		console.log('handle data error');
	},
    _showNodataLabel : function(){
    	if (this.recordData.length > 0) {
        	if(this.searchValue!=='' || this.searchValue!==null){
        		if(!this.querySelector('.divRow')){
        			this.$.nodataLabelWrapper.hidden=false;
        		}
        		else{
        			this.$.nodataLabelWrapper.hidden=true;
        		}
        	}
    	}

    },
	renderPage: function(submitInfo, stackData) {
		// TODO: need to check no location data
		this.$.nodataLabelWrapper.hidden=true;
		this._initVar();
		
		if(submitInfo['Location'] && submitInfo['Location'].contents && submitInfo['Location'].contents.location) {
			if (!submitInfo['Location'].contents.skipped) {
				this.locationRef = submitInfo['Location'].contents.location;
				this.siteidRef = submitInfo['Location'].contents.siteid;
			} 
		}
		
		var newStackData = [];
		if (stackData) {
			for (var idx = stackData.length -1; idx>=0; idx--) {
				if (stackData[idx].data && stackData[idx].data.length !== 0) {
					newStackData.push($M.cloneRecord(stackData[idx]));
				}
			}
		}
		
		this.$.assetStep.setStackList(newStackData);
	},
	_addAncestor : function() {
		var that = this;
		var sysId ;
		
		for(var i=0; i<that.locanData.length; i++){
			if (i === 0) {
				that.systemid = that.locanData[i].systemid;
				sysId = that.systemid;
			}
			
			if(that.locanData[i].ancestor === that.location ){
				if(!sysId){
					that.systemid = sysId = that.locanData[i].systemid;
				}
				that.userLocationDesc = that.locanData[i].locations.description;
			}
		}
	
		for(i=0; i<that.locanData.length; i++){
			if(that.locanData[i].systemid === sysId){
				that.locancestor.push(that.locanData[i]);
			}
		}
		
		that._initUserLocationBreadcrumb(that.locancestor);        
	},
	_initUserLocationBreadcrumb : function(list){
		this.bcdata = [];
		var tempParent;

		var userloc = this.location;
		
		if (this.userLocationDesc) {
			this.selectedLocationDesc = this.userLocationDesc;
		} else {
			this.selectedLocationDesc = '';
		}
		
		this.selectedLocation = userloc;

		for(var i=0; i<list.length; i++){
			if(list[i].ancestor === userloc){ 
				this.bcdata.push({'description':list[i].locations.description, 'location':list[i].ancestor});
				if(list[i].lochierarchy.parent){
					tempParent = list[i].lochierarchy.parent;
				}
				else{
					break;
				}
				for(var j =0 ; j<list.length; j++){
					if(list[j].ancestor === tempParent){
						this.bcdata.push({'description':list[j].locations.description, 'location':list[j].ancestor});
						userloc = list[j].lochierarchy.parent;
						i = -1;
						break;
					}
				}
			}
		}
		this.bcdata.push({'description':'All', 'location':'All'});
		this.bcdata.reverse();
		this.locancestor = [];
	}
});
