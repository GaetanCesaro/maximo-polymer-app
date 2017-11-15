/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-worktoclose-details-card',
  	behaviors: [BaseComponent, HandlerWorkOrder],
  	listeners: {
        'toggleCollapsible': '_loadDetails',
        'toggle': '_expandSingleSection'
  	},
    properties: {
    	
		record: {
			type: Object,
			notify: true
		},
		recordDetail: {
			type: Object,
			notify: true
		},
		
		actualLaborSummary: {
			type: String,
			notify: true
		},
		laborCollection: {
			type: Object,
			notify: true
		},
		
		actualMaterialSummary: {
			type: String,
			notify: true
		},
		materialCollection: {
			type: Object,
			notify: true
		},
		
		actualToolSummary: {
			type: String,
			notify: true
		},
		toolCollection: {
			type: Object,
			notify: true
		},
		
		actualServiceSummary: {
			type: String,
			notify: true
		},
		serviceCollection: {
			type: Object,
			notify: true
		},
		
		hideCostSection: {
			type: Boolean,
			value: false,
			notify: true
		},
		costSummary: {
			type: String,
			notify: true
		},
		costCollection: {
			type: Object,
			notify: true
		},
		
		taskSummary: {
			type: String,
			notify: true
		},
		tasksCollection: {
			type: Object,
			notify: true
		},
		
		failureSummary: {
			type: String,
			notify: true
		},
		failureCollection: {
			type: Object,
			notify: true
		},
		reportRemark: {
			type: String,
			notify: true
		},
		/**
		 * Stores expanded section
		 */
		expandedSection: {
			type: Object,
			notify: true
		}
	},

	ready: function() {},
	
	attached: function(){},
	
	/**
	 * Loads async data when main section is collapsed
	 */
	_loadDetails: function(e) {
		
		//Section collapsed no need to reload data
//		if (e.target.id !== this.$.mainsection.id || !e.detail.opened){
//			return;
//		}
		
		var filterByWonum = {};
		filterByWonum.value = this.record.wonum;
		filterByWonum.selected = true;
	
		var filterData = [{'filtertype': 'SIMPLE', 'field': 'wonum', 'availablevalues': [ filterByWonum ]}];
		this.filterData = filterData;
		
		//Prepare child sort
		this.childTaskSort = [{collection:'workorder.childtask',attributes:'%2Btaskid'}];
		
		this.$.wocollection.refreshRecords();
//		this.$.mainsection.toggleLoading(true);
	},
	
	loadDetails: function(e) {
		this._loadDetails(e);
	},
	/**
	 * Prevents more than one section expanded
	 */
	_expandSingleSection: function(e) {
		
		//Exclude main section for this part
//		if (e.target.id === this.$.mainsection.id){
//			return;
//		}
		var that = this;
		this.async(function(){
			that.fire('readyForResize',e);
		},250);
		
		//Reset expandedSection var if expanded section was collapsed		
		if ( this.expandedSection && e.target.id === this.expandedSection.id) {
			if (!e.detail.opened) {
				this.expandedSection = null;
			}
			return;
		}

		if (this.expandedSection){
			this.expandedSection.toggleCollapse();
		}
		this.expandedSection = e.target;
		
	},
	
	_handleRecordDataRefreshed: function(){
		
		if (this.collectionRecord && this.collectionRecord.length > 0){
			this.recordDetail = this.collectionRecord[0];
			
			this._prepareLaborSection();
			this._prepareMaterialSection();
			this._prepareToolSection();
			this._prepareServiceSection();
			this._prepareCostSection();
			this._prepareTaskSection();
			this._prepareFailureSection();
		}
		
		var that = this;
		this.async(function(){
			that.fire('readyForResize',{});
		},250);
//		this.$.mainsection.toggleLoading(false);
	},
	
	/**
	 * Set labor collection and section summary
	 */
	_prepareLaborSection: function() {
		this.laborCollection = this.recordDetail.uxshowactuallabor;
		if (this.laborCollection) {
			this.actualLaborSummary = this.laborCollection.length;
		}else{
			this.actualLaborSummary = 0;
			this.$.actuallaborsection.collapsed = false;
		}
	},
	
	/**
	 * Set material collection and section summary
	 */
	_prepareMaterialSection : function() {
		this.materialCollection = this.recordDetail.uxshowactualmaterial;
		if (this.materialCollection) {
			this.actualMaterialSummary = this.materialCollection.length;
		}else{
			this.actualMaterialSummary = 0;
			this.$.actualmaterialsection.collapsed = false;
		}
	},
	
	/**
	 * Set tool collection and section summary
	 */
	_prepareToolSection: function() {
		this.toolCollection = this.recordDetail.uxshowactualtool;
		if (this.toolCollection) {
			this.actualToolSummary = this.toolCollection.length;
		}else{
			this.actualToolSummary = 0;
			this.$.actualtoolsection.collapsed = false;
		}
	},
	
	/**
	 * Set service collection and section summary
	 */
	_prepareServiceSection: function() {
		this.serviceCollection = this.recordDetail.uxshowactualservice;
		if (this.serviceCollection) {
			this.actualServiceSummary = this.serviceCollection.length;
		}else{
			this.actualServiceSummary = 0;
			this.$.actualservicesection.collapsed = false;
		}
	},
	
	/**
	 * Set costs collection and section summary
	 */
	_prepareCostSection: function() {
		
		var collection = [];
		var actTotalCost = 0; 
		var estTotalCost = 0;
		
		var actCost, estCost, percent;
		
		percent = 0;
		actTotalCost += actCost = this.recordDetail.actlabcost ? this.recordDetail.actlabcost : 0;
		estTotalCost += estCost = this.recordDetail.estatapprlabcost ? this.recordDetail.estatapprlabcost : 0;
		if (estCost !== 0) { 
			percent = (actCost/estCost*100).toFixed(2);
		}
		collection.push({'label':$M.localize('uitext', 'mxapiwodetail', 'ActualLabortoEstimated'),'cost': percent + '%'});
		
		percent = 0;
		actTotalCost += actCost = this.recordDetail.acttoolcost ? this.recordDetail.acttoolcost : 0;
		estTotalCost += estCost = this.recordDetail.estatapprtoolcost ? this.recordDetail.estatapprtoolcost : 0;
		if (estCost !== 0) { 
			percent = (actCost/estCost*100).toFixed(2);
		}
		collection.push({'label':$M.localize('uitext', 'mxapiwodetail', 'ActualTooltoEstimated'),'cost': percent + '%'});

		percent = 0;
		actTotalCost += actCost = this.recordDetail.actservcost ? this.recordDetail.actservcost : 0;
		estTotalCost += estCost = this.recordDetail.estatapprservcost ? this.recordDetail.estatapprservcost : 0;
		if (estCost !== 0) { 
			percent = (actCost/estCost*100).toFixed(2);
		}
		collection.push({'label':$M.localize('uitext', 'mxapiwodetail', 'ActualServicestoEstimated'),'cost': percent + '%'});

		percent = 0;
		actTotalCost += actCost = this.recordDetail.actmatcost ? this.recordDetail.actmatcost : 0;
		estTotalCost += estCost = this.recordDetail.estatapprmatcost ? this.recordDetail.estatapprmatcost : 0;
		if (estCost !== 0) { 
			percent = (actCost/estCost*100).toFixed(2);
		}
		collection.push({'label':$M.localize('uitext', 'mxapiwodetail', 'ActualMaterialstoEstimated'),'cost': percent + '%'});
		
		if (!actTotalCost && !estTotalCost) {
			 this.hideCostSection = true;
			 return;
		}
		
		percent = 0;
		if (estTotalCost !== 0){
			percent = ((actTotalCost/estTotalCost)*100).toFixed(2);
		}
		collection.unshift({'label':$M.localize('uitext', 'mxapiwodetail', 'ActualCoststoEstimated'),'cost': percent + '%'});
		
		this.costSummary = '$' + actTotalCost.toFixed(2);
		this.costCollection = collection;
	},
	
	/**
	 * Set task collection and section summary
	 */
	_prepareTaskSection: function() {
		
		//Set task collection
		var collection = this.recordDetail.childtask;
		
		if (!collection) {
			this.taskSummary = '0%';
			this.$.taskscompletesection.collapsed = false;
			return;
		}
		
		var totalTasks = collection.length;
		
		var completedTasks = 0;
		for (var i = 0; i<totalTasks; i++){
			if (collection[i].status_maxvalue === 'COMP'){
				completedTasks++;
			}
		}
		collection.sort(function(a, b) {
			return parseFloat(a.taskid) - parseFloat(b.taskid);
		});
		
		//Set taskCompletion
		if (completedTasks === 0){
			this.taskSummary = '0%';
			this.tasksCollection = collection;
			return;
		}
		
		this.tasksCollection = collection;
		this.taskSummary = (completedTasks/totalTasks*100).toFixed(2) + '%';
		
	},

	
	/**
	 * Set failure collection and section summary
	 */
	_prepareFailureSection : function() {
		
		//Failure
		this.failureCollection = this.recordDetail.uxshowfailurereport;
		if (this.failureCollection) {
			this.failureSummary = $M.localize('uitext', 'mxapibase', 'Yes');
		}else{
			this.failureSummary = $M.localize('uitext', 'mxapibase', 'No');
			this.$.failurereportsection.collapsed = false;
		}
		
		//Remark
		var remarks = this.recordDetail.uxshowfailureremark;
		if (remarks && remarks.length > 0) {
			this.reportRemark = remarks[0].description;
		}
		
	},
	
	/**
	 * Set positive quantity
	 */
	getQuantity: function(qty) {
		
		if (!qty){
			return 0;
		}else {
			return Math.abs(qty);
		}
	}
	
});
