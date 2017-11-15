/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-datadesign-deffilter',
  	behaviors: [BaseComponent],
  	listeners: {
  		'chooseQuery' : '_chooseQuery',
  		'radio-button-selected' : '_qrySelectChanged',
		'goback':'goback',
		'gonext':'gonext'
  	},
    properties: {
    	dataset : {
    		type: Object,
    		value: null,
    		notify: true
    	},
    	objectset : {
    		type: Object,
    		value: null,
    		notify: true
    	},
    	selected : {
    		type: Number,
    		observer: '_changetab'
    	},
    	querylist: {
    		type: Array,
    		value: [],
    		notify: true
    	},    	
    	_query: {
    		type: Object,
    		value: null,
    		notify: true
    	},
    	_existingClause: {
    		type: String,
    		value: '',
    		notify: true
    	},
    	_merged : {
    		type: Array,
    		value: [],
    		notify:true    		
    	},
    	_appQueriesMerged : {
    		type: Boolean,
    		value: false
    	},
    	_oslcQueriesMerged : {
    		type: Boolean,
    		value: false
    	},
    	_newClause: {
    		type: String,
    		value: '',
    		observer: '_setNewClause'
    	},
    	_radiooptions0 : {
    		type: Array,
    		value: [],
    		notify:true    		
    	},
    	_radiooptions1 : {
    		type: Array,
    		value: [],
    		notify:true    		
    	},
    	_createNewQuery : {
    		type: Boolean,
    		value: false
    	},
    	_sqlQuerySuccessMap : {
    		type: Object,
    		value: function(){
    			return {};
    		}
    	},
    	_sqlQueryFailureMap : {
    		type: Object,
    		value: function(){
    			return {};
    		}
    	}
	},
	ready : function () {
		this.set('_radiooptions0', [{description : this.localize('uitext','mxapiwosdataset','Use Existing Query'), usequery: true, href: 'useexisting'}]);
		this.set('_radiooptions1', [{description : this.localize('uitext','mxapiwosdataset','Use New Query'), usequery: false, href: 'usenew'}]);
	},
	gonext : function(e) {
		this.fire('set-step-state', {'index':2,'state':'complete'});
		this.fire('change-wizard-step',3);
	},
	goback : function (e) {
		this.fire('change-wizard-step',1);
	},
	_changetab: function(selected){
		//reset query tracking maps
		this._sqlQuerySuccessMap={};
		this._sqlQueryFailureMap={};
		
		if(selected === 2){
			this._merged=[];
			this.querylist=[];
			this.objectset = this.dataset.objectset;
			this.$.querycollection.refreshRecords();
			this.$.querycollectionapp.refreshRecords();
		}
	},
	_getCardCollections : function(){
		return [this.$.querycollection,this.$.querycollectionapp];

	},
	
	/**
	 * called when the oslc query fetch finishes
	 */
	_handleRecordDataRefreshed: function(e) {
		var oslc = (this.oslcQueryData[0]) ? this.oslcQueryData : [];
		if (this._oslcQueriesMerged){	// if they've already been merged once then we're re-loading them, so reset merged
			this._merged = [];
			this._appQueriesMerged = false;
		}

		this._merged = this._merged.concat(oslc);
		
		this._merged.sort(function(a, b) {		
			if (a.ispublic === b.ispublic) {
				return a.description.localeCompare(b.description);
			}
			else {
				return a.ispublic < b.ispublic;
			}			
		});
						
		this._merged.forEach(function(item) {
			item.datalistVisible = true;	
		});
		
		this.querylist = this._merged;
		this._setCorrectQueryName();

		this._oslcQueriesMerged = true;

		// if dataset.editmode, select the query on the dataset
		if (this.dataset.editmode){
			
			var queryObj;
			if (this.dataset.query && (this.dataset.query.queryid || this.dataset.query.oslcqueryid)){
				queryObj = this.dataset.query;
			} else if (this.objectset.oslcquery && this.objectset.oslcquery.length > 0){
				queryObj = this.objectset.oslcquery[0];
			}else if (this.objectset.query && this.objectset.query.length > 0){
				queryObj = this.objectset.query[0];
			}

			// find the current datalist item (it's different from queryObj) and select it
			if (queryObj && this.$.querydatalist.items){
				for(var i=0; i < this.$.querydatalist.items.length; i++){
					var item = this.$.querydatalist.items[i];
					// if it's an app query then compare queryids, if its oslc query then compare oslcqueryids
					if ( (queryObj.queryid && item.queryid === queryObj.queryid) || 
							(queryObj.oslcqueryid && item.oslcqueryid === queryObj.oslcqueryid) ){
						this.$.querydatalist.selectRecord(item);
						break;
					}
				}
				e = {'detail': {'_selectedRecords': [] } };
				e.detail._selectedRecords.push(queryObj);
				// call _chooseQuery with an object like e.detail._selectedRecords[0]
				this._chooseQuery(e);		
			}
		}	
	},
	
	/**
	 * called when the app query fetch finishes
	 */
	_handleAppRecordDataRefreshed: function(e) {
		var app = (this.appQueryData[0]) ? this.appQueryData : [];
		if (this._appQueriesMerged){	// if they've already been merged once then we're re-loading them, so reset merged
			this._merged = [];
			this._oslcQueriesMerged = false;
		}
		
		var appname = this.dataset.objectset.app;
		if (appname) {
			app.forEach(function(apprec) {
				apprec.appclausename = appname + ':' + apprec.clausename;	
			});
		}
		
		this._merged = this._merged.concat(app);
		
		this._merged.sort(function(a, b) {		
			if (a.ispublic === b.ispublic) {
				return a.description.localeCompare(b.description);
			}
			else {
				return a.ispublic < b.ispublic;
			}			
		});
						
		this._merged.forEach(function(item) {
			item.datalistVisible = true;	
		});
		
		this.querylist = this._merged;
		this._setCorrectQueryName();
		
		this._appQueriesMerged = true;
		
		// if dataset.editmode, select the query on the dataset
		if (this.dataset.editmode){
			
			var queryObj;
			if (this.dataset.query && (this.dataset.query.queryid || this.dataset.query.oslcqueryid)){
				queryObj = this.dataset.query;
			} else if (this.objectset.oslcquery && this.objectset.oslcquery.length > 0){
				queryObj = this.objectset.oslcquery[0];
			}else if (this.objectset.query && this.objectset.query.length > 0){
				queryObj = this.objectset.query[0];
			}

			// find the current datalist item (it's different from queryObj) and select it
			if (queryObj && this.$.querydatalist.items){
				for(var i=0; i < this.$.querydatalist.items.length; i++){
					var item = this.$.querydatalist.items[i];
					// if it's an app query then compare queryids, if its oslc query then compare oslcqueryids
					if ( (queryObj.queryid && item.queryid === queryObj.queryid) || 
							(queryObj.oslcqueryid && item.oslcqueryid === queryObj.oslcqueryid) ){
						this.$.querydatalist.selectRecord(item);
						break;
					}
				}
				e = {'detail': {'_selectedRecords': [] } };
				e.detail._selectedRecords.push(queryObj);
				// call _chooseQuery with an object like e.detail._selectedRecords[0]
				this._chooseQuery(e);		
			}
		}	
	},
	
	_chooseQuery: function(e){
		this._query = e.detail._selectedRecords[0];
		if(this._query){
			this._existingClause = this._query.clause;
			this.dataset.query.clauseName = this._query.clausename;
			if (this._query.queryid){	// it's an APP query
				this.dataset.query.queryid = this._query.queryid;
				this.dataset.query.queryName = this._query.appclausename;
				this.dataset.query.oslcqueryid = null;
			}else if (this._query.oslcqueryid){	// it's an OSLC query
				this.dataset.query.oslcqueryid = this._query.oslcqueryid;
				this.dataset.query.queryName = this._query.clausename;
				this.dataset.query.queryid = null;
			}
		}
		this._usePreDefQuery();
		this.toggleNext();
	},
		
	_setCorrectQueryName : function () {
		this.dataset.query.newQuery = this._createNewQuery;
		if (!this._createNewQuery) {
			$j(this.$.resetNew).attr({'disabled':'true'});
			$j(this.$.testNew).attr({'disabled':'true'});
			if (this._query && this._query.queryid){	// only do this for app queries!
				this.dataset.query.queryName = this._query.appclausename;
			}
		} else {
			this._setNewClause();
		}	
	},
	
	_setNewClause: function(e){
		if(this.dataset.query){
			this.dataset.query.newQuery = true;
			this.dataset.query.newQueryClause = this._newClause;
		}
		if($j(this.$.newClause).val()===''){
			$j(this.$.resetNew).attr({'disabled':'true'});
			$j(this.$.testNew).attr({'disabled':'true'});
			
			if (this._createNewQuery){
				$j(this.$.gonext).attr({'disabled':'true'});
			}
		}
		else {
			$j(this.$.resetNew).removeAttr('disabled');
			$j(this.$.testNew).removeAttr('disabled');
			$j(this.$.gonext).removeAttr('disabled');
		}
		this.toggleNext();
	},

	_useCustomQuery: function(){
		$j(this.$.qryselector1).find('div.radiobutton').trigger('click');
		this.toggleNext();
	},

	_usePreDefQuery: function(){
		$j(this.$.qryselector0).find('div.radiobutton').trigger('click');
		this.toggleNext();
	},

	_qrySelectChanged : function(e) {	
		this._createNewQuery = (typeof e === 'boolean')?e:!e.detail.item.usequery;
		$j(this.$.clauseColumn).find('div[role=radio]').each(function(){
			$j(this).removeAttr('aria-checked');
			$j(this).find('div').toggleClass('mark',false);
		});
		$j(e.target).find('div[role=radio]').each(function(){
			$j(this).attr({'aria-checked':'true'});
			$j(this).find('div').toggleClass('mark',true);
		});
		
		this.$.newClause._setReadonly(!this._createNewQuery);
		this.$.newClause.toggleClass('fade',!this._createNewQuery);
		this.$.definedClause.toggleClass('fade',this._createNewQuery);
		this._setCorrectQueryName();
		this.toggleNext();
	},
	
	_nextAllowed: function(){
		if (this._createNewQuery){
			return $j(this.$.newClause).val()!=='';
		}
		else if(this.$.querydatalist._selectedRecords.length===0){
			this._existingClause = '';
			return false;
		}
		else {
			return true;
		}
		return true;
	},
	
	toggleNext: function(){
		var next = $M.workScape.getFooterButton('gonext');
		if(next){
			$j(next).prop('disabled',!this._nextAllowed());
		}
	},
	
	resetNew: function(){
		$j(this.$.newClause).val('');
	},
	
	preview : function(){
		this.fire('preview');
	},
	_validateSQL : function(e){
		this.dataset._sqlQuerySuccessMap = this._sqlQuerySuccessMap;
		this.dataset._sqlQueryFailureMap = this._sqlQueryFailureMap;
		
 		this.fire('_validateSQL',{'dataset':this.dataset, 'save':false});
	}
		
});
