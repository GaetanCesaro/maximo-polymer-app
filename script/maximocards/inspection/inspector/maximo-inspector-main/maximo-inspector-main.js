/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	
	is: 'maximo-inspector-main',
	
  	behaviors: [BaseComponent],
  	
  	listeners: {
  		'changePage' : '_changePage',
  		'createInspectionResult' : '_createInspectionResult',
  		'createUnscheduledInspection' : '_createUnscheduledInspection',
  		'goback' : '_goBack',
  		'processFormSelection' : '_processFormSelection',
  		'refreshFormCollection' : '_refreshFormCollection',
  		'startInspection' : '_startInspection',
  		'loadInspection' : '_loadInspectionExecution',
  		'updateResponse' : '_updateResponse',
  		'completeInspection' : '_completeInspection',
  		'exitCompletion' : '_exitCompletion',
  		'start' : '_start',
  		'changeInspectionStatus' : '_changeInspectionStatus',
  		'record-updatewsmethod:changeResultStatus' : '_handleRecordUpdatedSuccess',
		'record-updatewsmethod:changeResultStatus-error' : '_handleRecordUpdatedFail' 
  	},
  	
    properties: {
    	
    	/**
    	 * component selected in iron-pages 
    	 */
    	selectedPage: {
    		type: String,
    		value: 'inspResultList'    	
    	},
    	
		formRecordData: {
			type: Object,
			notify: true
		},
		
		recordResult: {
			type: Object,
			notify: true
		},
		
		recordForm : {
			type: Object,
			value: null
		},
		
		/**
		 * HREF used in resource component
		 */
		inspResultHref : {
			type: String
		},
    	
    	/**
    	 * Synonym domain collection
    	 */
    	formStatusSet: {
    		type: Array
    	},
    	    	
    	/**
    	 * Inspection Results status domain filter
    	 */
    	domainFilter: {
    		type: Array,
    		value: function () {
    			return [{'filtertype': 'SIMPLE', 'field': 'domainid', 'availablevalues': [ {'value': 'INSPRESULTSTATUS', 'selected': true} ]}];
    		}
    	},
    	
    	questionSort: {
    		type: Array,
    		value: function () {
    			return [{collection: 'inspectionform.inspquestion', attributes: '%2Bgroupseq'}];
    		}
    	},
    	startClicked : {
    		type: Boolean,
    		value: false
    	},
    	//Store navigation history
    	historyStack: {
    		type: Array,
    		value: []
    	},
	},
	
	_getFooterNavButtons : function(e){
	   	 //Screen navigation buttons 
		return [ {'id':'goback','action':'true','label':this.localize('uitext','mxapibase','Cancel'),'event':'goback','icon':'chevron-left'}];
	},
	
	/**
	 * Footer buttons containing Cancel and Start
	 */
	_getFooterPendingStatusStartButtons : function(e){
	   	 //Screen navigation buttons 
		return [ {'id':'inspectorCancel','action':'true','label':this.localize('uitext','mxapibase','Cancel'),'event':'goback','icon':'chevron-left'},
      	{'id':'inspectorStart','default':true,'label':this.localize('uitext','mxapiinspresult','start'),'event':'start','icon':'Maximo:Confirm'}];
	}, 
	
	/**
	 * Footer buttons containing Cancel and Save Pending and Start
	 */
	_getFooterStartButtons : function(e){
	   	 //Screen navigation buttons 
		return [ {'id':'inspectorCancel','action':'true','label':this.localize('uitext','mxapibase','Cancel'),'event':'goback','icon':'chevron-left'},
       	{'id':'inspectorSave','action':'true','label':this.localize('uitext','mxapiinspresult','savePending'),'event':'createInspectionResult','icon':'Maximo:Save'},
       	{'id':'inspectorStart','default':true,'label':this.localize('uitext','mxapiinspresult','start'),'event':'start','icon':'Maximo:Confirm'}];
	},   
	
	
	_fixButtons: function(tab){
		var buttons = this._getFooterNavButtons();
		var context = this;
		switch(tab){
			case 'executionContainer':
				buttons = null;
				break;
			case 'completeInspection':
				buttons = null;
				break;
			case 'inspResultList':
				buttons = null;
				break;
			case 'start':
				if(this.recordResult.status_maxvalue==='PENDING'){
					buttons = this._getFooterPendingStatusStartButtons();
				}else{
					buttons = this._getFooterStartButtons();	
				}
				break;
			case undefined:
				buttons = null;
				break;
			case 'createInspection':
				context = this.$.createInspection;
				break;
			default:
				break;
		}
		$M.workScape.updateFooterToolbar(buttons, context);
	},
	
	/**
	 * Go Back to Inspection Result List
	 */
	_goBack: function (e) {		
		//this._changePage('inspResultList');
		
		if (this.historyStack.length < 1) {
			this._changePage('inspResultList');
			return;
		}
		
		//clear searchbar
		if($j('#inspectorCreateSearchBar')){
			if($j('#inspectorCreateSearchBar').length>0){
				$j('#inspectorCreateSearchBar')[0].clear();
			}
		}
		
		var pageName = this.historyStack.pop();
		this._changePage(pageName, true);
	},
	
	/**
	 * New Inspection Result Record Created on button click
	 */
	_createUnscheduledInspection: function (e) {
		//show form page 
		this.$.createInspection.clearForm();
		this.$.inspresultcollection.getNewRecordData();
		$M.toggleWait(true);
	},
	
	_handleNewRecordCreated : function(e){

		var recordData = e.detail;
		this.$.createInspection.inspOrgid = e.detail.orgid;
		this.mbo = recordData;
		this._changePage('createInspection');
		$M.toggleWait(false);
	},
	

	/**
	 *  Handle Refresh for Form Record Data Refresh
	 */
	_handleFormRecordDataRefreshed: function (objs) {
		this.$.createInspection.dataSet = this.formRecordData;
		this.$.createInspection.dataSetRefresh();
		$M.toggleWait(false);
	},
	
	/**
	 * Handle Refresh for Form List Refresh containing only top level records, no children
	 */
	_handleFormRecordDataRefreshedList: function (objs) {
		this.$.createInspection.dataSet = this.formListRecordData;
		this.$.createInspection.dataSetRefresh();
		$M.toggleWait(false);
	},
	
	_handleRecordDataRefreshed: function (objs) {
		this.$.inspResultList.dataSetRefresh();
		this.$.inspResultList.selectRecord(this.highlightedId);
		this.highlightedId = null;
		//this._refreshCurrentRecord();
		$M.toggleWait(false);
	},
	
	_handleError: function (e) {
		var error = e.detail.Error;
		console.error(error);
		$M.notify(error.message, $M.alerts.error);
		
		this.$.inspResultList.dataSetRefresh();
		$M.toggleWait(false);
	},
	
  	_changePage: function (pageName, isGoingBack) {	
		
		if(pageName.detail !== undefined){
			pageName = pageName.detail;
		}
		
		//release memory
		if (pageName==='inspResultList'){
			this.$.executionContainer.questions = [];
			this.$.executionContainer.dataListQuestions = [];
		}
		
		if (this.selectedPage !== pageName) {
			
			if (!isGoingBack || isGoingBack !== true) {
				this.historyStack.push(this.selectedPage);
			}
			this.selectedPage = pageName;
			document.body.scrollTop = 0;
			this._fixButtons(pageName);
		}
	},
	
	/**
	 * Select form when creating Unscheduled Inspection
	 */
	_processFormSelection: function(e){
		
		//Setting object reference
		var selectedObjectType = this.$.createInspection.selectedReferenceObject;
		var selectedObject = this.$.createInspection.selectedElement;
		
		var selectedType = (selectedObjectType==='LOCATION')?'location':'asset';
		var assetLocationLabel = $M.localize('uitext','mxapiinspresult',selectedType);
		e.detail.assetLocationLabel = assetLocationLabel;

		//Setting object description
		var description = this.$.createInspection.inputValue;
		e.detail.description = description;
		
		var inspResult = {};
		inspResult.referenceobject = selectedObjectType;
		if ( selectedObjectType === 'LOCATION' ) {
			inspResult.locations = selectedObject;
		}else if ( selectedObjectType === 'ASSET' ) {
			inspResult.asset = selectedObject;	
		}
		
		//var objectDescription = (selectedObject.assetnum) ? selectedObject.assetnum : selectedObject.location;
		//e.detail.objectDescription = objectDescription;

		//e.detail.hasInstructions = ((e.detail.description_longdescription===null) || (e.detail.description_longdescription===undefined))?false:true;
		
		this.recordResult = inspResult;
		this.recordForm = e.detail;
		
		this.$.startInspection.isResultCreated = false;
		
		var pageName = e.detail.page;
		this._changePage(pageName);
	},
	
	_handleStatusDomainSet: function(e) {

		if (this.domainStatusCollection.length > 0) {
			this.formStatusSet = this.domainStatusCollection[0].synonymdomain;
		}else {
			this.formStatusSet = [];
		}
		this.$.inspresultcollection.refreshRecords();
  	},
  	
  	_handleStatusDomainSetError: function(e) {

    	this.formStatusSet = [];
    	this.$.inspresultcollection.refreshRecords();
  	},
  	
  	_refreshFormCollection : function(e){
  		this.$.inspformList.refreshRecords();
  		this.$.createInspection.dataSet = this.formListRecordData;
  	},
  	
  	/**
  	 * Send request to create inspection result record
  	 */
  	_createInspectionResult : function(e,status){
  		
		var referenceObject = this.$.createInspection.selectedReferenceObject;
		var referenceAsset = this.$.createInspection.selectedAsset;
		var referenceLocation = this.$.createInspection.selectedLocation;
		var referenceSiteid = this.$.createInspection.selectedSiteid;
		
		//Grab the whole form record
		var recordData = this.recordForm;
		
		var container = {};
		//container.props = 'inspectionresultid,resultnum';
		container.props = '*,inspectionform.name,asset.description,locations.description';
		
		var currentUser = $M.userInfo.personid;
		var object = {};
		object.createdby = currentUser;
		object.createdate = new Date();
		object.orgid = recordData.orgid;
		object.referenceobject = referenceObject;
		
		if (referenceObject === 'ASSET') {
			object.asset = referenceAsset;
			object.location = null;
    	} else if (referenceObject === 'LOCATION') {
    		object.location = referenceLocation;
    		object.asset = null;
    	}
				
		object.siteid = referenceSiteid;
		
		if(typeof(status)==='object'){
			object.status = 'PENDING';
		} else {
			object.status = status;
		}
		
		//filter status object using internal value to get external value.
		var filterStatusObject = this.formStatusSet.filter(function(o){return o.maxvalue === object.status;} );
		var externalStatus = filterStatusObject[0].value;
		
		object.status = externalStatus;
		object.revision = recordData.revision;
		object.inspformnum = recordData.inspformnum;
		object.revision = recordData.revision;
	
		container.record = object;

		$M.toggleWait(true);
		
		this.$.inspresultcollection.createRecord(container.record, container.props);
		
  	},
  	
  	/**
  	 * Handle response when inspection result record is created successfully. 
  	 */
  	_handleSaveInspectionResultRecordCreated : function(e){
  		var recordData = e.detail;
  		this.$.inspresultlistcollection.refreshRecords();
  		
  		//reset
  		this.$.createInspection.selectedReferenceObject = '';
  		this.$.createInspection.selectedAsset = '';
  		this.$.createInspection.selectedLocation = '';
  		this.$.createInspection.clearFirstStep();
  		this.$.createInspection._setHideInput(true);
  		
  		this.highlightedId = recordData.inspectionresultid;
  		
  		this.recordResult = recordData;
  		
  		var pageName;
  		if (this.startClicked === false){
  			pageName = 'inspResultList';
  		} else {
  			pageName = 'executionContainer';
  		}
  		
  		this.startClicked = false;
  		this._changePage(pageName);
  		$M.toggleWait(false);
  	},
  	
  	/**
  	 * Initialize inspection and 
  	 * show inspection assessment page 
  	 */
  	_startInspection: function(e) {
  		
  		console.log('heading to execution form');
  		
  		this.startClicked = true;
		this._createInspectionResult(e,'INPROG');
  		
  		var inspFormData = e.detail;
  		if(inspFormData){
  			//this.$.executionContainer.recordData = inspFormData;  			

  			//this.$.executionContainer.record = recordData.inspectionform[0];
  			
  			//this.recordResult = inspFormData;
  			this.recordForm = inspFormData;
  			
  			//this.$.executionContainer.record = recordData;
  		} else {
  			//this.$.executionContainer.record = recordData;
  			this.recordForm = inspFormData;
  		}

  		//TODO maybe save the form before changing page
  		
  		this._changePage('executionContainer');
  	},
  	
  	/**
  	 * Change status of inspection result
  	 * from pending to inprogress
  	 */
  	_changeInspectionStatus: function (e) {

  		var inspectionResult = e.detail.inspresult;
  		//filter status object using internal value to get external value.
		var filterStatusObject = this.formStatusSet.filter(function(o){return o.maxvalue === e.detail.newstatus;} );
		var newStatus = filterStatusObject[0].value;
  		
//  		if (inspectionResult && inspectionResult.status_maxvalue === 'INPROG') {
//  			return;
//  		}
  		
  		var responseProperties = '*,inspectionform.name,asset.description,locations.description';
  		this.inspResultHref = inspectionResult.href;
  		  		
  		var params = {'status' : newStatus};
  		
  		$M.toggleWait(true);
  		
		//Call method to update record
		this.$.inspResultResource.updateAction('wsmethod:changeResultStatus', params, responseProperties)

  	},
  	
  	/**
  	 * Load inspection
  	 */
  	_loadInspectionExecution: function (e) {
  		
  		var recordResult = e.detail;
  		this.recordResult = recordResult;
  		
  		if (recordResult.status_maxvalue === 'PENDING') {
  			this.recordForm = recordResult.inspectionform[0];
  			this.$.startInspection.isResultCreated = true;
  			this._changePage('start');
  		} else if (recordResult.status_maxvalue === 'INPROG') {
  			this._changePage('executionContainer');
  		} else if (recordResult.status_maxvalue === 'COMPLETED') {
  			this._changePage('executionContainer');
  		}
  		
  	},
  	
  	_updateResponse : function(e){
  		var record = e.detail.recorddata;
  		var field = e.detail.field;
  		record.inspfieldresult = [];
  		//field._action='Add';
  		record.inspfieldresult.push(field);
  		var properties = {'href':record.href,'object':'INSPFIELDRESULT'};
  		
  		var responseProperties = '*,inspectionform.name,asset.description,locations.description';
  		this.$.inspresultcollection.createOrUpdateChildRecord(field, properties, responseProperties);
  	},
  	
	_handleChildRecordCreated : function(e){
		var inspResultResponse = e.detail;
		
		this.$.executionContainer.inspfieldresult = inspResultResponse.inspfieldresult;

		var form = (inspResultResponse.inspectionform.length > 0) ? inspResultResponse.inspectionform[0] : inspResultResponse.inspectionform ;
		this.$.executionContainer.setClonedQuestions(form.inspquestion);

		this.$.inspresultcollection.refreshRecords();
	},
	
	/**
	 * Listens to resource update success response
	 */
	_handleRecordUpdatedSuccess : function (e) {
		this.$.inspresultcollection.refreshRecords();
		//Set recordResult with response
		var recordStatus = e.detail.status;
		var filterStatusObject = this.formStatusSet.filter(function(o){return o.maxvalue === 'COMPLETED';} );
		var completedStatus = filterStatusObject[0].value;
		var filterStatusObject2 = this.formStatusSet.filter(function(o){return o.maxvalue === 'INPROG';} );
		var inprogStatus = filterStatusObject2[0].value;
		if (recordStatus === completedStatus) {
			this._changePage('completeInspection');
		} else if(recordStatus === inprogStatus) {
			this.$.startInspection.isResultCreated = false;
			this._changePage('executionContainer');
		}
		$M.toggleWait(false);
	},
	
	/**
	 * Listens to resource update fail response
	 */
	_handleRecordUpdatedFail: function(e) {
		console.error('Fail to update status of inspection result record.');
		console.error(e.detail.error);
		$M.toggleWait(false);
	},
			
	/**
	 * Save record as Inprogress
	 * Lead user to execution page
	 */
	_start: function(e) {
		var start = this.$.startInspection;
		if (!start.isResultCreated || start.isResultCreated === false) {
			this.fire('startInspection', start.inspForm);
		} else {
			var detail = {'inspresult': start.inspResult, 'newstatus':'INPROG'};
			this.fire('changeInspectionStatus', detail);
		}
	},
	
	/**
	 * Send user to list page
	 * Reset tab filter 
	 */
	_exitCompletion: function(e) {
		this.$.inspResultList.reset();
		var pageName = 'inspResultList';
		this._changePage(pageName);
	}
});
