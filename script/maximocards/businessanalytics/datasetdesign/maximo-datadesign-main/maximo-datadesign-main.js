/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-datadesign-main',
  	behaviors: [BaseComponent],
  	listeners: {
  		'return-to-edit' : '_returnToEdit',
		'change-wizard-step' : '_changeTab',
		'reset' : 'reset',
		'set-step-state': '_setStepState',
  		'_selectset' : '_selectset',
  		'save':'_saveDataset',
  		'preview':'_preview',
  		'_saveAttributes': '_saveAttributes',
  		'_validateSQL' : '_validateSQL'
  	},
    properties: {
    	selectedtab: {
    		type: Number,
    		value: 0,
    		notify: true    	
    	},
   		_datasetTemplate: {
			type: Object,
			value: function(){
				return {pickedList: [], orderedList: [], objectset: {}, query: {}};
			},
			notify: true
		},
		_dataset: {
			type: Object,
			value: function(){
				return {};
			},
			notify: true
		},
		_datasethref:{
			type: String
		},
		_querytemplatehref:{
			type: String
		}

	},
	reset : function (e) {
		this.$.wizard.reset();
		this.$.crcontent.reset();
	},
	_returnToEdit:function (e) {
		this._dataset.editmode = true;
		this.fire('change-wizard-step',1);
	},
	_changeTab: function (e) {
		if (e.detail !== null) {
			var oldSelectedTab = this.selectedtab;
			this.selectedtab = e.detail;
			var wizard = this.$.wizard; 
			this.async(function(){
				wizard.currentIndex = e.detail;
				if(oldSelectedTab > e.detail){
					for(var stepIndex in wizard.steps){
						if(stepIndex >= this.selectedtab && stepIndex<= oldSelectedTab){ 
							wizard.disable(stepIndex, false);
						}
					}
				}
			}, 300);
			document.body.scrollTop = 0;
			this._fixButtons();
			
			if (e.detail.editmode === true){
				this._dataset.editmode = true;
			}
		}
	},
	_fixButtons: function(tab){
		var buttons = [ {'id':'goback','action':'true','label':this.localize('uitext','mxapibase','Back'),'event':'goback','icon':'chevron-left'},
		            	{'id':'preview','action':'true','label':this.localize('uitext','mxapibase','Preview'),'event':'preview','icon':'action-based:monitor'},
		            	{'id':'gonext','disabled':true,'default':true,'label':this.localize('uitext','mxapibase','Next'),'event':'gonext','easticon':'chevron-right','class':'nextButton'}];
		var context = this;
		switch(this.selectedtab){
			case 0:
			case undefined:
				buttons = null;
				break;
			case 1:
				context = this.$.crcontent;
				buttons[2].disabled = !this.$.crcontent._nextAllowed();
				break;
			case 2:
				context = this.$.deffilter;
				buttons[2].disabled = !this.$.deffilter._nextAllowed();
				break;
			case 3:
				context = this.$.saveit;
				buttons.pop();
				buttons.push({'id':'savedataset','disabled':!this.$.saveit._saveAllowed(),'default':true,'label':this.localize('uitext','mxapibase','save'),'event':'_save','icon':'formatting:save'});
				break;
			default:
				break;
		}
		$M.workScape.updateFooterToolbar(buttons, context);
	},
	_setStepState: function(e){
		this.$.wizard.setStepState({'detail':{'index':e.detail.index,'state':e.detail.state}});
	},

	_preview: function(e){
		$M.showDialog(this, this._dataset, $M.localize('uitext','mxapibase','Preview'), 'maximo-datadesign-previewdialog', false);
	},

	_confirmSelectSet: function(response, e){
		if(response === true){
			this.selectedSet = null;
			this._selectset(e);
		}
	},
	_selectset : function(e) {
		var card = e.detail.card;
		if(this.selectedSet){
			e.cardTarget = e.currentTarget;
			if(card !== this.selectedCard && this.$.crcontent.pickedList.length>0){
				var message = $M.localize('messages','mxapiwosdataset','changeObjectWarning', [$M.localize('uitext', 'mxapibase','Cancel'),$M.localize('uitext', 'mxapibase','Continue')]);
				$M.confirm(message, this._confirmSelectSet, this, 1, [0,1], e);
				$M.workScape.modifySystemDialog({'title':{'text':$M.localize('uitext','mxapibase','warning'),'align':'center','color':'#d74108'}, 'icon':{'icon':'maximo-based:urgency','color':'#d74108'}});
				return;
			}
		}
		this.selectedSet = e.detail.record;
		if (this.selectedSet) {
			if (this.selectedCard) {
				this.selectedCard.removeAttribute('selected', 'false');
			}			
			var tempDataSet;
			// create a new _dataset object from our template
			tempDataSet = JSON.parse(JSON.stringify(this._datasetTemplate));
			tempDataSet.objectset = this.selectedSet;
			if (e.detail.editmode === true){
				tempDataSet.objectset.app=tempDataSet.objectset.maxintobject["0"].app;
				tempDataSet.queryCollectionHref=tempDataSet.objectset.maxintobject["0"].localref+'/dsdesauthreposlcqueries';
				tempDataSet.queryCollectionAppHref=tempDataSet.objectset.maxintobject["0"].localref+'/dsdesauthrepappqueries';
			} else {
				tempDataSet.queryCollectionHref=tempDataSet.objectset.href+'/dsdesauthreposlcqueries';
				tempDataSet.queryCollectionAppHref=tempDataSet.objectset.href+'/dsdesauthrepappqueries';
			}
			this._dataset=tempDataSet;
			if (e.detail.editmode === true){
				this._dataset._analyticdatasetnum = this.selectedSet.analyticdatasetnum;
				this._dataset._description = this.selectedSet.description;
				this._dataset.editmode = true;
				this._datasethref = this.selectedSet.href;
			}

			if(card !== this.selectedCard){
				this._dataset.pickedList = [];
				this._dataset.orderedList = [];
 				this.$.deffilter._loaded = false;
 				this.fire('reset');
 			}	

 			// set the card as selected, set wizard state
			this.selectedCard = card;

			if(this.selectedCard){
				this.selectedCard.setAttribute('selected', 'true');
			}

			this.$.wizard.setStepState({'detail':{'index':0,'state':'complete'}});
			this.fire('change-wizard-step', 1);
		}
	},
	_handleRecordDataRefreshed: function(obj){
		
	},
	handleRecordCreated: function(e){
		this._datasethref = e.detail.href;
		// after record is created shut off wait and show created dialog
		$M.toggleWait(false);
		//$M.showDialog(this, this._dataset, $M.localize('uitext','mxapiwosdataset','data_set_created'), 'maximo-datadesign-savedialog', false);
		this._showSave(e.detail);
	},
	collectionDataError: function(e){
		$M.toggleWait(false);
		if(e.detail && e.detail.Error && e.detail.Error.message){
			$M.alert(e.detail.Error.message, $M.alerts.error);
		}
	},
	// at the end of the wizard, build the object and save it
	_saveDataset: function(e){
		if(this._dataset){
			$M.toggleWait(true);
			var recordData = {
				'analyticdatasetnum': this._dataset._analyticdatasetnum,
				'description': this._dataset._description,
				'intobjectname': this._dataset.objectset.intobjectname,
				'ispublic': true
			};

			// are we creating a new query?
			if(this._dataset.query.newQuery){
				// set attributes for new oslc query
				recordData.oslcquery = {
					'description': 'ANALYTICDATASET: ' + this._dataset._analyticdatasetnum,
					'querytype': 'osclause',
					'intobjectname': this._dataset.objectset.intobjectname,
					'ispublic': true,
					'clausename': this._dataset._analyticdatasetnum,
					'clause': this._dataset.query.newQueryClause
				};
				recordData.clausename = this._dataset._analyticdatasetnum;
			} else {
				// set oslcqueryid/queryid and erase old values in case of update
				recordData.clausename = this._dataset.query.clauseName;
				if (this._dataset.query.queryid){
					recordData.queryid = this._dataset.query.queryid;
					recordData.oslcqueryid = null;
				}else if (this._dataset.query.oslcqueryid){
					recordData.oslcqueryid = this._dataset.query.oslcqueryid;
					recordData.queryid = null;
				}
			}

			// create query template
			recordData.querytemplate = this._createQueryTemplate();
			// are we inserting a new one or updating the existing one?  (is there a _datasethref?)
			try{
				var properties = 'analyticdatasetnum,templatename,clausename,intobjectname';
				if (this._datasethref === undefined){
					// new record
					this.$.analyticdataset.createRecord(recordData, properties);
				}else{
					// update existing
					this.$.newDatasetResource.resourceUri = this._datasethref;
					var self = this;
					this.$.newDatasetResource.updateRecord(recordData, properties, true).then(function(){
						self._showSave(self.$.newDatasetResource.resourceData);
					});
				}
			}catch(e){
				console.log(e);
				$M.toggleWait(false);
			}
		}
	},
	_showSave: function(recordData){
		var dialog = $M.showDialog(this, recordData, $M.localize('uitext','mxapiwosdataset','data_set_created'), 'maximo-datadesign-savedialog', false);
		dialog.mainContext = this;
	},
	_createQueryTemplate: function(){
		var queryTemplateObject = {
			'intobjectname': this._dataset.objectset.intobjectname,
			'ispublic': true,
			'description': 'ANALYTICDATASET: ' + this._dataset._analyticdatasetnum
		};
		queryTemplateObject.querytemplateattr = this._getQueryTemplateAttrs();
		return queryTemplateObject;
	},
	// add any attributes in pickedList as querytemplateattrs
	_getQueryTemplateAttrs: function(){
		var queryTemplateAttrArray = [];
		var queryTemplateAttr;
		var sortAttrsAdded = 0;
		for(var i=0; i < this._dataset.pickedList.length; i++) {
			queryTemplateAttr = {};
			var attribute = this._dataset.pickedList[i].attribute;
			if (this._dataset.pickedList[i].objectname){
				attribute = this._dataset.pickedList[i].objectname.toLowerCase() + '.' + attribute + '*';
			}
			
			queryTemplateAttr.selectattrname = attribute;
			queryTemplateAttr.title = this._dataset.pickedList[i].title;
			queryTemplateAttr.visible = true;
			queryTemplateAttr.selectorder = i;
			queryTemplateAttr.searchable = false;
			// if it's in the orderedList, set sortbyon, sortbyorder and ascending
			if(this._dataset.orderedList && this._dataset.orderedList.length > 0 && sortAttrsAdded < this._dataset.orderedList.length){
				for(var j=0; j < this._dataset.orderedList.length; j++) {
					var orderedAttr = this._dataset.orderedList[j];
					if (orderedAttr.attribute === this._dataset.pickedList[i].attribute){
						queryTemplateAttr.sortbyon = true;
						queryTemplateAttr.sortbyorder = j;
						if (orderedAttr.sort === 'asc'){
							queryTemplateAttr.ascending = true;
						}
						sortAttrsAdded ++;	// perf measure so it stops looping unnecessarily
						if (sortAttrsAdded >= this._dataset.orderedList.length){
							break;
						}
					}
				}
			}
			// add queryTemplateAttr to the attrs list
			queryTemplateAttrArray.push(queryTemplateAttr);
		}
		return queryTemplateAttrArray;
	},
	_setSortProperties(templateAttr, pickedAttr){
		if(this._dataset.orderedList && this._dataset.orderedList.length > 0){
			for(var i=0; i < this._dataset.orderedList.length; i++) {
				var orderedAttr = this._dataset.orderedList[i];
				if (orderedAttr.attribute === pickedAttr.attribute){
					templateAttr.sortbyon = true;
					templateAttr.sortbyorder = i;
				}
			}
		}
	},
	/**
	 * Validate New Query entered.
	 */
	_validateSQL: function(e){
		var query = encodeURIComponent(e.detail.dataset.query.newQueryClause);
		
		
		if(e.detail.dataset._sqlQuerySuccessMap[query] && e.detail.dataset._sqlQuerySuccessMap[query] === true){
			//check if query has already been successfully validated, if saving do not show validquery message, just save.
			if(e.detail.save === true){
				this.fire('save',null);
				return;
			} else {
				$M.notify($M.localize('uitext','mxapiwosdataset','ValidQuery'),$M.alerts.info);
				return;
			}
		} else if(e.detail.dataset._sqlQueryFailureMap[query] && e.detail.dataset._sqlQueryFailureMap[query] === true){
			//check if query has already been unsuccessfully validated.
			$M.notify($M.localize('uitext','mxapiwosdataset','InvalidQuery'),$M.alerts.error);
			return;
		}
				
		//enable wait layer
		$M.toggleWait(true);
		
		//fetch csrftoken used to process request
		var csrftoken = $M.getCSRFToken();
		if(csrftoken && csrftoken.length>0){
			if(query && query.length>0){
				var object = e.detail.dataset.objectset.intobjectname;
				var url = $M.getMaxauth().baseUri+'/oslc/os/'+object+'?csrftoken='+csrftoken+'&pageSize=1&sqlwhere='+query;	
				
				this.$.mxajax_testsql.requestDetail = e.detail;
				this.$.mxajax_testsql.url = this.resolveUrl(url);
				this.$.mxajax_testsql.generateRequest();
			} else {
				$M.toggleWait(false);
				$M.notify($M.localize('uitext','mxapiwosdataset','EmptyQuery'),$M.alerts.error);	
			}
		}else{
			$M.alert($M.localize('messages','mxapiwosdataset','cannotvalidatesqlcsrf'), $M.alerts.error);
		}
	},
	/**
	 * Successful response has been received.
	 */
	processTestSqlResponse: function(e)
	{
		//disable wait layer
		$M.toggleWait(false);

		//track if query was successfully validated
		this.$.mxajax_testsql.requestDetail.dataset._sqlQuerySuccessMap[this.$.mxajax_testsql.requestDetail.dataset.query.newQueryClause] = true;
						
		if(this.$.mxajax_testsql.requestDetail.save === true){
			this.fire('save',null);
		} else {
			$M.notify($M.localize('uitext','mxapiwosdataset','ValidQuery'),$M.alerts.info);
		}
		
	},
	
	/**
	 * Unsuccessful response has been received.
	 * Either a response timeout or invalid request has been submitted.
	 */
	processTestSqlError: function(e)
	{
		//disable wait layer
		$M.toggleWait(false);
		
		//track if query was invalid when submitted
		//e.detail._sqlQueryFailureMap[e.detail.dataset.query.newQueryClause] = true;
		this.$.mxajax_testsql.requestDetail.dataset._sqlQueryFailureMap[this.$.mxajax_testsql.requestDetail.dataset.query.newQueryClause] = true;	
		
		if(e.detail.error.type === 'timeout'){
			$M.notify($M.localize('uitext','mxapiwosdataset','QueryTimeout'),$M.alerts.error);
		} else {
			$M.notify($M.localize('uitext','mxapiwosdataset','InvalidQuery'),$M.alerts.error);	
		}
	},	
});
