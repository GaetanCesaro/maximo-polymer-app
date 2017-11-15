/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-workinprogress-details-card',
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
		
		timeLeft: {
			type: String,
			notify: true
		},
		
		hideTimeLeft: {
			type: Boolean,
			value: false,
			notify: true
		},
		
		hideTimeSection: {
			type: Boolean,
			value: false,
			notify: true
		},
		
		spentEstTime: {
			type: String,
			notify: true
		},
		timeSpent: {
			type: String,
			notify: true
		},
		estimatedTime: {
			type: String,
			notify: true
		},
		
		hideCostSection: {
			type: Boolean,
			value: false,
			notify: true
		},
		costsSummary: {
			type: String,
			notify: true
		},
		costsCollection:{
			type: Object,
			notify: true
		},
		
		taskCompletion: {
			type: String,
			notify: true
		},
		tasksCollection: {
			type: Object,
			notify: true
		},
		
		commentSummary: {
			type: String,
			notify: true
		},
		commentsCollection: {
			type: Object,
			notify: true
		},
		
		materialSummary: {
			type: String,
			notify: true
		},
		materialCollection: {
			type: Object,
			notify: true
		},
		
		/**
		 * Store expanded section
		 */
		expandedSection: {
			type: Object,
			notify: true
		}
	},

	ready: function() {},
	
	attached: function(){},
	
	
	loadDetails: function(e) {
		this._loadDetails(e);
	},
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
			
			this._prepareTimes();
			this._prepareCostSection();
			this._prepareTaskSection();
			this._prepareMaterialSection();
			this._prepareCommentSection();
		}
		
		var that = this;
		this.async(function(){
			that.fire('readyForResize',{});
		},250);
//		this.$.mainsection.toggleLoading(false);
	},
	
	/**
	 * Set time values
	 */
	_prepareTimes: function() {
		
		if (this.recordDetail.remdur){
			this.timeLeft = this.recordDetail.remdur;
		}else{
			this.hideTimeLeft = true;
		}
		
		//this._applyClockStyle();

		if (!this.recordDetail.actstart || !this.recordDetail.estdur) {
			this.hideTimeSection = true;
			return;
		}

		var value = '0';
		if (this.recordDetail.actstart && this.recordDetail.estdur) {
			value = ( (new Date() - new Date(this.recordDetail.actstart)) / (this.recordDetail.estdur*60*60*1000) * 100); 
			value = value.toFixed(2);
		}
		this.spentEstTime = value + '%';
		
		if (this.recordDetail.actstart){
			var difftime = (new Date() - new Date(this.recordDetail.actstart));
			this.timeSpent = (difftime/1000/60/60);
		}
		this.estimatedTime = this.recordDetail.estdur;
	},
	
	_applyClockStyle: function() {

		var style = this.buildTimerStyle(this.recordDetail);
		var that = this;
		$j.each(style.split(';'), function(index,value) {
			var prop = value.split(':');
			$j(that.$.workinprogress_timer).css(prop[0],prop[1]);
		});
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

		this.costsSummary = '0%';
		if (estTotalCost !== 0){
			this.costsSummary = ((actTotalCost/estTotalCost)*100).toFixed(2) + '%';
		}
		this.costsCollection = collection;
	},
	
	/**
	 * Set task collection and section summary
	 */
	_prepareTaskSection: function() {
		
		//Set task collection
		this.tasksCollection = this.recordDetail.childtask;
		
		if (!this.tasksCollection) {
			this.taskCompletion = '0%';
			this.$.taskcompletionsection.collapsed = false;
			return;
		}
		
		var totalTasks = this.tasksCollection.length;
		
		var completedTasks = 0;
		for (var i = 0; i<totalTasks; i++){
			if (this.tasksCollection[i].status_maxvalue === 'COMP'){
				completedTasks++;
			}
			
		}
		
		//Set taskCompletion
		if (completedTasks === 0){
			this.taskCompletion = '0%';
			return;
		}
		
		this.taskCompletion = (completedTasks/totalTasks*100).toFixed(2) + '%';
		
	},

	
	/**
	 * Set comment collection and section summary
	 */
	_prepareCommentSection : function() {
		
		this.commentsCollection = this.recordDetail.modifyworklog;
		if (this.commentsCollection) {
			this.commentSummary = this.commentsCollection.length;
		}else{
			this.commentSummary = 0;
			this.$.commentsection.collapsed = false;
		}
	},
	
	/**
	 * Set material collection and section summary
	 */
	_prepareMaterialSection : function() {
		this.materialCollection = this.recordDetail.uxshowactualmaterial;
		if (this.materialCollection) {
			this.materialSummary = this.materialCollection.length;
		}else{
			this.materialSummary = 0;
			this.$.materialsection.collapsed = false;
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
