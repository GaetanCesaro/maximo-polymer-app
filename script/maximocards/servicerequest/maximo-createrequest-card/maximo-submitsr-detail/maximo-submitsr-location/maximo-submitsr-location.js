/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-submitsr-location',
  	behaviors: [BaseComponent],
    properties: {
		label: {
			type: String,
			value: 'Panel'
		},		
		title: {
			type: String,
			value: 'title'
		},
		recordData :{ //object for location list data
			type:Object,
			notify : true
		},
		locanData :{ // object for location ancestor list data
			type : Object,
			notify : true
		},
		locancestor :{ // array for location ancestor list
			type: Array,
    		value: []
		},
		selectedRecord :{
			type:Object,
			notify:true
		},
		additionalparams :{
			type : Object,
			notify : true
		},
		additionalancestorparams :{
			type : Object,
			notify : true
		},
		selectedItem : {
			type : Object
		},
		selectedQueryName :{
			type : Object,
			notify : true
		},
		bcdata: { // array for listing breadcrumb
    		type: Array,
    		value: []
    	},
    	overlayOpened: {
			type: Boolean,
			value: false
		},
		selectedLocationDesc :{
			type: String
		},
		selectedBc :{ // Selected location on breadcrumb
			type: String,
			value : ''
		},
		selectedLocation :{ 
			type:String
		},
		selectedSiteid : { // Selected siteid of location
			type: String,
			value : ''
		},
		assetSiteid : { // If asset step is first, save asset info
			type: String
		},		
		searchValue: {
            type: String,
            value: '',
            notify: true
        },
        userLocationDesc:{ // location description of user location
        	type : String
        },
        userLocation:{ // location of user 
        	type : String
        },
        systemid :{ // systemid of location hierarchy
        	type: String
        },
        systemType:{ // system type of location hierarchy
        	type : Array,
        	value : []
        },
        systemsFilter:{
        	type : Array,
        	value : []
        },
        assetdesc :{ 
        	type : String
        },
        assetnum :{
        	type : String
        },
        locationFirst:{ // if false, asset step is before the location step
        	type:Boolean,
        	value : false
        }
	},
	listeners :{
		'dom-change' : 'showNodataLabel'
	},
	ready: function(){
	},
	attached : function(){
		//check which step is first
		var locIdx, assIdx;
		var steps = this.parentNode.children;
		for(var i=0; i<steps.length; i++) {
			if(steps[i].tagName === 'MAXIMO-SUBMITSR-ASSET') {
				assIdx = i;
			}
			else if(steps[i].tagName === this.tagName) {
				locIdx = i;
			}
		}
		this.locationFirst = locIdx > assIdx ?  false : true;
		//check if user's location is specified
		if($M.userInfo.location.location){
			this.userLocation = $M.userInfo.location.location;
			if($M.userInfo.location.description){
				this.userLocationDesc = $M.userInfo.location.description;
			}
			else{
				this.userLocationDesc = this.userLocation;
			}
		}
	},
	_goNext : function(e) {
		// if user selects his or her location
		if(this.userLocation === this.selectedLocation && !this.selectedLocationDesc.includes($M.localize('uitext','mxapisr','YourLocation'))){
			this.selectedLocationDesc += ' ('+$M.localize('uitext','mxapisr','YourLocation')+')';
		}
		// check if asset is selected in asset step
		if(!this.assetnum){
			if(this.locationFirst){
				this.fire('go-nextdetail', [{step:'Location', value: {description: this.selectedLocationDesc, breadcrumb: this.selectedBc, location:this.selectedLocation, selectedinlocation:true, siteid : this.selectedSiteid}},{step:'Asset'}]);
			}
			else{ // asset is before the location step
				this.fire('go-nextdetail', [{step:'Location', value: {description: this.selectedLocationDesc, breadcrumb: this.selectedBc, location:this.selectedLocation, selectedinlocation:true, siteid : this.selectedSiteid}},{step:'Asset', value:{}}]);
			}
		}
		else{
			this.fire('go-nextdetail', [{step:'Location', value: {description: this.selectedLocationDesc, breadcrumb: this.selectedBc, location:this.selectedLocation, siteid : this.selectedSiteid, skipped:false, selectedinlocation:true}},{step:'Asset',value: {description: this.assetdesc, assetnum : this.assetnum, siteid : this.assetSiteid}}]);
		}
	},
	_skipStep: function(e) {
		this.selectedLocation = null;
		this.selectedBc = null;
		this.selectedLocationDesc = null;
		this.fire('go-nextdetail', {step:'Location', value: {}});
	},
	initPage: function() {
		this.selectedLocation = null;
		this.selectedBc = null;
		this.selectedLocationDesc = null;
		this.assetdesc = null;
		this.assetnum = null;
		this.assetSiteid = null;
		this.additionalparams = [];
		this.bcdata = [];
	},
	//function for reaching parent location of user's location. 
	getToUserLocation : function(){
		this.selectedQueryName = 'SERVICEREQUESTLOCATION';
		this.additionalparams = [];
		var selected = this.userLocation;
		this.additionalparams.push('oslc.where=location=%22'+selected+'%22');
  		this.additionalparams.push('responseos=MXAPILOCATION');
  		var that = this;
  		this.$.locationcollection.refreshRecords().then(function(collection) {
  			that.selectedQueryName = 'SERVICEREQUESTLOCATION';
  			that.selectedItem = {};
  			if(that.recordData[0].locations[0].description){
  				that.userLocationDesc = that.recordData[0].locations[0].description;
  			}
  			else{
  				that.userLocationDesc = that.recordData[0].location;
  			}
  			
  			that.selectedSiteid = that.recordData[0].siteid;
  			
  			//that.initUserLocationBreadcrumb(that.locanestor, that.recordData[0]);
  			if(!that.systemid){
  				that.systemid = that.recordData[0].systemid;
  				if(that.recordData[0].parent){
  					that.addParams(that.recordData[0].parent);
  				}
  			}
  			else{
  				for(var i=0; i<that.recordData.length;i++){
  					if(that.systemid === that.recordData[i].systemid){
  						if(that.recordData[i].parent){
  							that.addParams(that.recordData[i].parent);
  						}
  						else{ // when user location is root
  							that.$.setLocationButton.hidden = true;
  		  	  				that.$.breadcrumb.hidden = true;
  		  	  				that.selectedQueryName = 'SERVICEREQUESTROOTLOCATION';
  		  	  				that.additionalparams = [];
		  		  	  		var param = 'oslc.where=';
			  		  		if(that.systemType.length !== 0){
			  		  			param += that.getSystemTypeParams().substring(9);
			  		  			if(that.systemsFilter.length !== 0){
			  		  				param += that.getSystemsFilterParams();
			  		  			}
			  		  		}
			  		  		else{
			  		  			if(that.systemsFilter.length !== 0){
			  		  				param += that.getSystemsFilterParams();
			  		  			}
			  		  		}
	  		  		
  		  	  				that.additionalancestorparams = [];
  		  	  				that.additionalparams.push(param);
  		  	  				that.$.locationcollection.refreshRecords().then(function(collection) {
  		  	  					that.setYourLocationLabel(that.userLocationDesc);
  		  	  	  				that.$.indoorList.hidden = false;
  		  	  	  				that.$.breadcrumb.hidden = true;
  		  	  	  				that.$.loadingSpinner.hidden = false;
  		  	  		  		});
  						}
  					}
  				}
  			}
  		});
  		
	},
	_computeSort: function(a, b) {
		//user's location should be on the top of list
		if(a.location === this.userLocation && b.location !== this.userLocation){
			return -1;
		}
		else if(a.location !== this.userLocation && b.location === this.userLocation){
			return 1;
		}
		var loca, locb;
		loca = a.locations[0].description ? a.locations[0].description : a.location;
		locb = b.locations[0].description ? b.locations[0].description : b.location;
		if(loca === locb){
			a = null;
		}
		else{
			return loca < locb ? -1 : 1;
		}
	    
    },
	setYourLocationLabel : function(desc){
		for(var i=0; i<this.recordData.length; i++){
			if(this.querySelectorAll('.locationLabel')[i].label === desc){
				this.querySelectorAll('.locationLabel')[i].label = desc+' ('+$M.localize('uitext','mxapisr','YourLocation')+')';
				break;
			}
		}
	},
	//function for setting breadcrumb if user's location is specified at first
	initUserLocationBreadcrumb : function(list){
		this.bcdata = [];
		var tempParent;
		var userloc = this.userLocation;
		//building location hierarchy
		for(var i=0; i<list.length; i++){
			if(list[i].ancestor === userloc){ 
				if(userloc !== this.userLocation){
					this.bcdata.push({'description':list[i].locations.description, 'location':list[i].ancestor});
				}
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
		
		this.selectedLocation = this.bcdata[this.bcdata.length-1].location;
		this.selectedLocationDesc = this.bcdata[this.bcdata.length-1].description;
		this.setBreadCrumb();
		this.$.breadcrumb.hidden = false;
		this.locancestor = [];
	},
	_handleRecordDataRefreshed : function(){
		$j(this.$.indoorSearch.$.inputval).val('');
		this.searchValue='';
	},
	_handleDataError : function(){
		console.log('handle data error');
	},
	getSystemTypeParams : function(){
		var param='';
		for(var i=0; i<this.systemType.length; i++){
			if(this.systemType[i] === 'primary'){
				param+='%20and%20locsystem.primarysystem=1';
			}
			if(this.systemType[i] === 'network'){
				param+='%20and%20locsystem.network=1';
			}
			if(this.systemType[i] === 'address'){
				param+='%20and%20locsystem.address=1';
			}
		}
		return param;
	},
	getSystemsFilterParams : function(){
		var param='';
		for(var i=0; i<this.systemsFilter.length; i++){
			if(i === 0){
				if(this.systemType.length === 0){
					param+='systemid%20in%5B%22'+this.systemsFilter[i]+'%22';
				}
				else{
					param+='%20and%20systemid%20in%5B%22'+this.systemsFilter[i]+'%22';
				}
			}
			else{
				param+='%2C%22'+this.systemsFilter[i]+'%22';
			}
			if(i === this.systemsFilter.length-1){
				param+='%5D';
			}
		}
		return param;
	},
	getAssetSiteidParams : function(){
		var param = '';
		if(this.systemType.length === 0 && this.systemsFilter.length === 0){
			param+='siteid=%22'+this.assetSiteid+'%22';
		}
		else{
			param += '%20and%20siteid=%22'+this.assetSiteid+'%22';
		}
		return param;
	},
	addParams : function(selected){
		this.additionalparams = [];
		var param = 'oslc.where=parent=%22'+selected+'%22';
		if(this.systemType.length !== 0){
			param += this.getSystemTypeParams();
			if(this.systemsFilter.length !== 0){
				param += this.getSystemsFilterParams();
			}
		}
		else{
			if(this.systemsFilter.length !== 0){
				param += '%20and%20'+this.getSystemsFilterParams();
			}
		}
		
		
  		this.additionalparams.push(param);
		
  		this.additionalparams.push('responseos=MXAPILOCATION');
  		var that = this;
  		this.$.locationcollection.refreshRecords().then(function(collection) {
  			if(that.recordData.length === 0){
  				that.$.indoorList.hidden = true;
  				that.querySelector('.bcLast').ellipsisSize = 0;
  				that.querySelector('.bcLast').label = that.querySelector('.bcLast').getAttribute('locationdesc');
  				//$j(that.$.setLocationWrapper).addClass('setLocationWrapper_noData');
  			} else {
  				that.$.indoorList.hidden = false;
  				that.setYourLocationLabel(that.userLocationDesc);
  				//$j(that.$.setLocationWrapper).removeClass('setLocationWrapper_noData');
  			}
  			that.$.loadingSpinner.hidden = true;
  		});
	},
	addAncestorParams : function(location){ 
		this.additionalancestorparams = [];
		//this.recordData = [];
		var param = 'oslc.where=location=%22'+location+'%22';
		if(this.systemType.length !== 0){
			param += this.getSystemTypeParams();
			if(this.systemsFilter.length !== 0){
				param += this.getSystemsFilterParams();
			}
		}
		else{
			if(this.systemsFilter.length !== 0){
				param += '%20and%20'+this.getSystemsFilterParams();
			}
		}
		
  		this.additionalancestorparams.push(param);
		this.additionalancestorparams.push('responseos=MXAPILOCANCESTOR');
  		var that = this;
  		this.$.locancestorcollection.refreshRecords().then(function(collection) {
  			var sysId = that.systemid;
  			for(var i=0; i<that.locanData.length; i++){
  				if(that.locanData[i].ancestor === that.userLocation){
  					if(!sysId){
  						that.systemid = sysId = that.locanData[i].systemid;
  					}
  				}
  			}
  			for(i=0; i<that.locanData.length; i++){
  				if(that.locanData[i].systemid === sysId){
  					that.locancestor.push(that.locanData[i]);
  				}
  			}
  			if(that.locancestor.length !== 1){
  				that.initUserLocationBreadcrumb(that.locancestor);
  			}
  		});
	},
	getLocationLabel : function(loc){
		if(loc.locations[0].description){
			return loc.locations[0].description;
		}
		else{
			return loc.location;
		}
	},
	findRecordData : function(desc){
		for(var i=0; i<this.recordData.length; i++){
			if(this.recordData[i].locations[0].description){
				if(this.recordData[i].locations[0].description === desc){
					return this.recordData[i];
				}
			}
			else{
				if(this.recordData[i].location === desc){
					return this.recordData[i];
				}
			}
		}
	},
	//function for when user taps location item on the list
	getLocations : function(e){
		e.preventDefault();
		this.$.loadingSpinner.hidden = false;
		var selected;
		var selectedName;
		var selectedSiteid = '';
		
		this.$.breadcrumb.hidden =false;
		
		if(e.target.textContent.trim().includes($M.localize('uitext','mxapisr','YourLocation'))){
			selected = this.userLocation;
			selectedName = this.userLocationDesc;
			selectedSiteid = this.selectedSiteid;
		}
		else{
			var data = this.findRecordData(e.target.textContent.trim());
			selected = selectedName = data.location;
			selectedSiteid  = data.siteid;
			
			if(data.locations[0].description){
				selectedName = data.locations[0].description;
			}
		}
		
		this.selectedLocation = selected;
		this.selectedLocationDesc = selectedName;
		this.selectedSiteid = selectedSiteid;
		
		if(this.bcdata.length === 0){
			var first = {'location':'All', 'description':'All'};
			this.bcdata.push(first);
			this.$.setLocationButton.hidden = false;
		}
		var locData = {'description': selectedName,'location':selected};
		this.bcdata.push(locData);
		
		this.selectedQueryName = 'SERVICEREQUESTLOCATION';
		this.selectedItem = {};
		if(selected){
			this.addParams(selected);
		}
		this.setBreadCrumb();
	},
	//function for when user taps location item on breadcrumb
	getBcLocation : function(e){
		this.$.loadingSpinner.hidden = false;
		var locDesc = e.target.getAttribute('locationdesc');
		var that = this;
		var selected = null;
		if(locDesc === 'All' || e.target.textContent.trim() === 'All'){
			this.bcdata = [];
			this.$.breadcrumb.hidden =true;
			this.selectedQueryName = 'SERVICEREQUESTROOTLOCATION';
			this.additionalparams = [];
			var param='';
			if(this.systemType.length !== 0){
				param += 'oslc.where='+this.getSystemTypeParams().substring(9);
			}
			if(this.systemsFilter.length !== 0){
				if(param !== ''){
					param += this.getSystemsFilterParams();
				}
				else{
					param += 'oslc.where='+this.getSystemsFilterParams();
				}
			}
			if(this.assetSiteid){
				if(param !== ''){
					param += this.getAssetSiteidParams();
				}
				else{
					param += 'oslc.where='+this.getAssetSiteidParams();
				}
			}
			this.additionalparams.push(param);
			this.$.setLocationButton.hidden = true;
			this.$.indoorList.hidden = false;
			this.$.locationcollection.refreshRecords().then(function(collection) {
				if(that.userLocationDesc){
					that.setYourLocationLabel(that.userLocationDesc);
				}
				that.$.loadingSpinner.hidden = true;
	  		});
		}
		else{
			for(var i=0; i<this.bcdata.length; i++){
				if(this.bcdata[i].description === locDesc){
					selected = this.bcdata[i].location;
					break;
				}
			}
			if(selected){
				this.addParams(selected);
			}
			for(i = this.bcdata.length-1; i>0; i--){
				if(this.bcdata[i].description === locDesc){
					break;
				}
				this.bcdata.pop();
			}
			this.setBreadCrumb();
		}
	},
	//function for setting breadcrumb
	setBreadCrumb : function(last){
		var that = this;
		while ( this.$.breadcrumb.hasChildNodes() )
		{
			this.$.breadcrumb.removeChild(this.$.breadcrumb.firstChild);       
		}
		this.selectedBc = '';
		if(this.bcdata.length <= 7){ // if number of location item is not more than 7 
			for(var i =0; i<this.bcdata.length; i++){
				if(i === this.bcdata.length-1){ // last location on breadcrumb
					var bcl = Polymer.Base.create('MAXIMO-LABEL', {'id':'bc'+i, 'label':this.bcdata[i].description});
					bcl.setAttribute('class', 'bcLast maximo-submitsr-location');
					bcl.setAttribute('locationdesc', this.bcdata[i].description);
					bcl.$.label.setAttribute('locationdesc', this.bcdata[i].description);
					bcl.ellipsisSize = 20;
					this.$.breadcrumb.appendChild(bcl);
					if(this.bcdata[i].description!=='All'){
						this.selectedBc += this.bcdata[i].description;
					}
				}
				else{
					var bc = Polymer.Base.create('MAXIMO-LABEL', {'id':'bc'+i, 'label':this.bcdata[i].description, 'icon':'image:navigate-next'});
					bc.setAttribute('class', 'bcList maximo-submitsr-location');
					bc.setAttribute('locationdesc', this.bcdata[i].description);
					bc.$.label.setAttribute('locationdesc', this.bcdata[i].description);
					bc.ellipsisSize = 20;
					bc.addEventListener('click', function(e){
						that.findLocationObjInBc(that.bcdata,e.target.parentNode.getAttribute('locationdesc'));
						that.getBcLocation(e);
					});
					this.$.breadcrumb.appendChild(bc);
					if(this.bcdata[i].description!=='All'){
						this.selectedBc += this.bcdata[i].description+' > ';
					}
				}
			}
		}
		else{ // if number of location item is more than 7
			var all = Polymer.Base.create('MAXIMO-LABEL', {'id':'bc'+0, 'label': 'All','icon':'image:navigate-next'});
			all.setAttribute('class', 'bcList maximo-submitsr-location');
			var elps = Polymer.Base.create('MAXIMO-LABEL', {'id':'bc1', 'label': '...','icon':'image:navigate-next'});
			elps.setAttribute('class', 'bcList maximo-submitsr-location');
			all.addEventListener('click', function(e){
				that.getBcLocation(e);
			});
			this.$.breadcrumb.appendChild(all);
			this.$.breadcrumb.appendChild(elps);
			
			this.$.bdsection.style.top = elps.offsetTop+23 +'px';
			this.$.bdsection.style.left = elps.offsetLeft-10 + 'px';
			while ( this.$.bdListWrapper.hasChildNodes()) // initialize list box on breadcrumb('...')
			{
				this.$.bdListWrapper.removeChild(this.$.bdListWrapper.firstChild);       
			}
			//setting list box on breadcrumb('...')
			for(var d = 2; d<this.bcdata.length-5; d++){
				var dbc = Polymer.Base.create('MAXIMO-LABEL', {'id':'dbc'+d, 'label':this.bcdata[d].description});
				dbc.setAttribute('class', 'dbcList maximo-submitsr-location');
				dbc.setAttribute('locationdesc', this.bcdata[d].description);
				dbc.$.label.setAttribute('locationdesc', this.bcdata[d].description);
				dbc.ellipsisSize = 20;
				dbc.addEventListener('click', function(e){
					that.getBcLocation(e);
					that.overlayOpened = false;
				});
				this.$.bdListWrapper.appendChild(dbc);
			}
			elps.addEventListener('click', function(e){
				that.overlayOpened = true;
			});
			for(var j = this.bcdata.length-5; j<this.bcdata.length; j++){
				
				if(j === this.bcdata.length-1){
					var leftbcl = Polymer.Base.create('MAXIMO-LABEL', {'id':'bc'+j, 'label':this.bcdata[j].description});
					leftbcl.ellipsisSize = 20;
					leftbcl.setAttribute('class', 'bcLast maximo-submitsr-location');
					leftbcl.setAttribute('locationdesc', this.bcdata[j].description);
					leftbcl.$.label.setAttribute('locationdesc', this.bcdata[j].description);
					this.$.breadcrumb.appendChild(leftbcl);
					if(this.bcdata[j].description!=='All'){
						this.selectedBc += this.bcdata[j].description;
					}
				}
				else{
					var leftbc = Polymer.Base.create('MAXIMO-LABEL', {'id':'bc'+j, 'label':this.bcdata[j].description, 'icon':'image:navigate-next'});
					leftbc.setAttribute('class', 'bcList maximo-submitsr-location');
					leftbc.ellipsisSize = 20;
					leftbc.setAttribute('locationdesc', this.bcdata[j].description);
					leftbc.$.label.setAttribute('locationdesc', this.bcdata[j].description);
					leftbc.addEventListener('click', function(e){
						that.findLocationObjInBc(that.bcdata,e.target.parentNode.getAttribute('locationdesc'));
						that.getBcLocation(e);
					});
					this.$.breadcrumb.appendChild(leftbc);
					if(this.bcdata[j].description!=='All'){
						this.selectedBc += this.bcdata[j].description+' > ';
					}
				}
			}
		}
	},
	findLocationObjInBc : function(list, desc){
		for(var i=0; i<list.length; i++){
			if(list[i].description === desc){
				this.selectedLocation =  list[i].location;
				this.selectedLocationDesc = list[i].description;
			}
		}
	},
	_filter: function(val) {  
    	var that = this;
    	this.searchTerm = val;	
	    return function(loc) {
			return that._findLocation(val, loc);
	    };    		
	},
    _findLocation : function(val, loc)
    {
    	 var desc;
    	 if(loc.locations[0].description){
    		 desc = loc.locations[0].description.toUpperCase();
    	 }
    	 else{
    		 desc = loc.location.toUpperCase();
    	 }
		 val = val.toUpperCase();
		 return desc.includes(val);
    },
    showNodataLabel : function(){
    	if(this.searchValue!=='' || this.searchValue!==null){
    		if(!this.querySelector('.locationListWrapper')){
    			this.$.nodataLabelWrapper.hidden=false;
    		}
    		else{
    			this.$.nodataLabelWrapper.hidden=true;
    		}
    	}
    	var that = this;
    	setTimeout(function() {
    		that._setLayout();
		}, 100);
    	
    },
    _setLayout : function(){
    	if(this.querySelector('.indoorList').offsetHeight+this.$.breadcrumb.offsetHeight > window.innerHeight-361){ // fix buttons // 100 is height of banner and header
    		if($M.screenInfo.device !=='desktop'){
    			$j(this.querySelector('.setLocationWrapper')).addClass('setLocationButtonWrapperFixed');
    			$j(this.querySelector('.skipButtonDiv')).addClass('skipbuttonWrapperFixed maximo-submitsr-location');
    		}
    		else{
    			$j(this.querySelector('.setLocationWrapper')).addClass('setLocationButtonWrapperFixedDesktop');
    			$j(this.querySelector('.skipButtonDiv')).addClass('skipbuttonWrapperFixedDesktop maximo-submitsr-location');
    		}
    		this.querySelector('.hrborder').style.width = 'calc(100% - 48px)'; // 48px is for padding
    		if(this.selectedQueryName === 'SERVICEREQUESTROOTLOCATION'){ // when user selected 'All'
    			if($M.screenInfo.device ==='desktop'){
    				this.querySelector('.contentWrapper').style.height = 'calc(100% - 57px)'; // 65 is height of one button(without set location button)
    			}
    			else{
    				this.querySelector('.mainWrapper').style.height = 'calc(100% - 65px)';
    			}
    		}
    		else{
    			if($M.screenInfo.device ==='desktop'){
    				this.querySelector('.contentWrapper').style.height = 'calc(100% - 109px)'; // 117 is height of two buttons
    			}
    			else{
    				this.querySelector('.mainWrapper').style.height = 'calc(100% - 117px)';
    			}
    		}
    	}
    	else{ // scroll buttons
    		$j(this.querySelector('.setLocationWrapper')).removeClass('setLocationButtonWrapperFixed');
    		$j(this.querySelector('.skipButtonDiv')).removeClass('skipbuttonWrapperFixed maximo-submitsr-location');
    		$j(this.querySelector('.setLocationWrapper')).removeClass('setLocationButtonWrapperFixedDesktop');
    		$j(this.querySelector('.skipButtonDiv')).removeClass('skipbuttonWrapperFixedDesktop maximo-submitsr-location');
    		if($M.screenInfo.device ==='desktop'){
    			this.querySelector('.contentWrapper').style.height = '100%';
			}
			else{
				this.querySelector('.mainWrapper').style.height = '100%';
			}
    		this.querySelector('.hrborder').style.width = '100%';
    	}
    	
    },
 	renderPage: function(submitInfo, stackData) {
 		var reset = false;
 		if(!this.locationFirst){
 			if(submitInfo['Asset'] && submitInfo['Asset'].contents && submitInfo['Asset'].contents.assetnum) {
 				if(submitInfo['Asset'].contents.location){	// when asset has location
 					if(submitInfo['Location'].contents.skipped){
	 					this.fire('go-back');
	 				}
 					else if(!submitInfo['Location'].contents.skipped && !submitInfo['Location'].contents.selectedinlocation){//asset without location was selected, and location was selected in location step.
	 					this.assetSiteid = null;
 						this.fire('go-nextdetail',{step:'Location', value: {description:submitInfo['Location'].contents.description,breadcrumb:submitInfo['Location'].contents.breadcrumb,location:submitInfo['Location'].contents.location,skipped: true}});
 					}
 				}
 				else{ // when asset does not have its location info
 					this.assetdesc = submitInfo['Asset'].contents.description;
 					this.assetnum = submitInfo['Asset'].contents.assetnum;
 					this.assetSiteid = submitInfo['Asset'].contents.siteid;
 				}
 			}
 			else{
 				this.assetdesc = null;
				this.assetnum = null;
				if(this.assetSiteid){
					reset = true;
				}
				this.assetSiteid = null;
 			}
 		}
 		this.$.nodataLabelWrapper.hidden=true;
		if(!this.selectedLocation || this.assetSiteid || reset){ // open location step at first time
			this.$.loadingSpinner.hidden = false;
			if(this.userLocation && !this.assetSiteid){
	 			this.getToUserLocation();
	 			this.addAncestorParams(this.userLocation);
				this.$.indoorList.hidden = false;
				this.$.setLocationButton.hidden = false;
	 		}
	 		else{
				this.$.setLocationButton.hidden = true;
		 		this.$.breadcrumb.hidden = true;
				this.selectedQueryName = 'SERVICEREQUESTROOTLOCATION';
				this.additionalparams = [];
				this.bcdata = [];
				var param='';
				if(this.systemType.length !== 0){
					param += 'oslc.where='+this.getSystemTypeParams().substring(9);
				}
				if(this.systemsFilter.length !== 0){
					if(param !== ''){
						param += this.getSystemsFilterParams();
					}
					else{
						param += 'oslc.where='+this.getSystemsFilterParams();
					}
				}
				if(this.assetSiteid){
					if(param !== ''){
						param += this.getAssetSiteidParams();
					}
					else{
						param += 'oslc.where='+this.getAssetSiteidParams();
					}
				}
				this.additionalparams.push(param);
				var that = this;
				this.$.locationcollection.refreshRecords().then(function(collection){
					if(that.userLocationDesc){
						that.setYourLocationLabel(that.userLocationDesc);
					}
					that.$.loadingSpinner.hidden = true;
				});
				this.$.indoorList.hidden = false;
	 		}
		}
		else { // get back to location step
			
		}
		
		var newStackData = [];
		if (stackData) {
			for (var idx = stackData.length -1; idx>=0; idx--) {
				if (stackData[idx].data && stackData[idx].data.length !== 0) {
					newStackData.push($M.cloneRecord(stackData[idx]));
				}
			}
		}
		this.$.locationstep.setStackList(newStackData);
	}
});
