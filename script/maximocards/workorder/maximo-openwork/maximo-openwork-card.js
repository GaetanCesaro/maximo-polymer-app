/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-openwork-card',
  	behaviors: [BaseComponent,HandlerWorkOrder],
    properties: {
		tempCollection: {
			type: Object,
			notify: true,
			observer: '_transferCollection'
		},
		displayedCollection: {
			type: Object,
			notify: true,
			observer: '_handleRecordDataRefreshed'
		},
		currentCount: {
			type: String,
			notify: true 
		},
		
		overdueCollection: {
			type: Object,
			notify: true
		},
		todayCollection: {
			type: Object,
			notify: true
		},
		tomorrowCollection: {
			type: Object,
			notify: true
		},
		nextdaysCollection: {
			type: Object,
			notify: true
		},
		
		overdueCount: {
			type: Object,
			value: 0,
			notify: true
		},
		todayCount: {
			type: Object,
			value: 0,
			notify: true
		},
		tomorrowCount: {
			type: Object,
			value: 0,
			notify: true
		},
		nextdaysCount: {
			type: Object,
			value: 0,
			notify: true
		},
		
		woRecordData: {
			type: Object,
			notify: true
		},
		assignmentRecordData: {
			type: Object,
			notify: true
		},
		selectedRecord: {
			type: Object,
			notify: true
		},
		filterData: {
			type: Object,
			value: null,
			notify: true
		},
		assignmentfilterData: {
			type: Object,
			value: null,
			notify: true
		},
		selectedQueryDefaultLabel: {
			type: String,
			notify: true
		},
		selectedQueryName: {
			type: String,
			value: 'OPENWORK',
			notify: true,
			observer: '_selectedQueryNameChanged'
		},
		selectedAssetTypeLabelDefault: {
			type: String,
			notify: true
		},
      	
		dynamicAttributeNames: {
			type: Array,
			value: [],
			notify: true
		},
		
		
		timeLineAttribute: {
			type: String,
			notify: true
		},
		timeLineRange: {
			type: String,
			notify: true
		},
		listenerOn: {
			type: Boolean,
			value: false
		},
		currentTab: {
			type: String,
			notify: true
		},
		currentCollection: {
			type: Object,
			notify: true
		}
	},
	
	observers: ['_calculateCounter(overdueCount, todayCount, tomorrowCount, nextdaysCount)'],
			
	ready: function()
	{
		Polymer.dom(this.$.maximoOpenWork.$.header).appendChild(this.$.contentSelector);
	},
	
	/**
	 * Update Counts and display default overdue collection tab
	 */
	attached: function() {
		var self = this;
		this.filterNextThreeDays().then(function(){
			self.nextdaysCount = self._getRecordCount();
			self.filterTomorrow().then(function(){
				self.tomorrowCount = self._getRecordCount();
				self.filterToday().then(function(){
					self.todayCount = self._getRecordCount();
					self.filterOverdue().then(function(){
						self.displayedCollection = self.overdueCollection;
						self.overdueCount = self._getRecordCount();
						
						self.showMessage(self, $M.localize('uitext','mxapiwodetail','Noassignmentsoverdue'));
											
						$M.toggleWait(false);
					});	
				});
			});
		});
	},
	
	showMessage: function(that,message){
		if(that.displayedCollection){
			that.totalCount = that.displayedCollection.length;
			var norecordfound = $j($M.findElementParent(that.$.contentSelector,'MAXIMO-PANEL')).find('maximo-norecordfound');
			norecordfound[0].message=message;
			$j(norecordfound[0]).find('div').css({'display':(that.totalCount===0)?'block':'none','padding-top':25+'px'});	
		}
	},
	
	/**
	 * Update collection and counts when switching tabs
	 */
	filterCollection: function(e){
		var self = this;
		if (e.currentTarget.getAttribute('name')==='overdue'){
			this.filterOverdue().then(function(){
				self.displayedCollection = self.overdueCollection;
				self.overdueCount = self._getRecordCount();
				self.showMessage(self, $M.localize('uitext','mxapiwodetail','Noassignmentsoverdue'));
				$M.toggleWait(false);
			});
		} else if(e.currentTarget.getAttribute('name')==='today'){
			this.filterToday().then(function(){
				self.displayedCollection = self.todayCollection;
				self.todayCount = self._getRecordCount();
				self.showMessage(self, $M.localize('uitext','mxapiwodetail','NoassignmentsIfexpected'));
				$M.toggleWait(false);
			});
		} else if(e.currentTarget.getAttribute('name')==='tomorrow'){
			this.filterTomorrow().then(function(){
				self.displayedCollection = self.tomorrowCollection;
				self.tomorrowCount = self._getRecordCount();
				self.showMessage(self, $M.localize('uitext','mxapiwodetail','NoassignmentsToreceivetomorrow'));
				$M.toggleWait(false);
			});
		} else if(e.currentTarget.getAttribute('name')==='nextdays'){
			this.filterNextThreeDays().then(function(){
				self.displayedCollection = self.nextdaysCollection;
				self.nextdaysCount = self._getRecordCount();
				self.showMessage(self, $M.localize('uitext','mxapiwodetail','NoassignmentsToreceive3days'));
				$M.toggleWait(false);
			});
		} 
	},
	
	/**
	 * Observer method to calculate total count
	 */
	_calculateCounter: function(overdueCount, todayCount, tomorrowCount, nextdaysCount){
		this.currentCount = overdueCount + todayCount + tomorrowCount + nextdaysCount;
	},
	
	/**
	 * Process collection when executing search
	 */
	_handleRecordDataRefreshed: function() {
		if(this.currentTab==='filterToday'){
			this.todayCount = this._getRecordCount();
			this.showMessage(this, $M.localize('uitext','mxapiwodetail','NoassignmentsIfexpected'));
		} else if(this.currentTab==='filterOverdue'){
			this.overdueCount = this._getRecordCount();
			this.showMessage(this, $M.localize('uitext','mxapiwodetail','Noassignmentsoverdue'));
		} else if(this.currentTab==='filterTomorrow'){
			this.tomorrowCount = this._getRecordCount();
			this.showMessage(this, $M.localize('uitext','mxapiwodetail','NoassignmentsToreceivetomorrow'));
		} else if(this.currentTab==='filterNextThreeDays'){
			this.nextdaysCount = this._getRecordCount();
			this.showMessage(this, $M.localize('uitext','mxapiwodetail','NoassignmentsToreceive3days'));
		}
		
		this.displayedCollection = this.currentCollection.__data__.collectionData;
		this.$.maximoOpenWork.toggleLoading(false);			
	},
	
	_showWODetails: function()
	{
		
	},
	
	_selectedQueryNameChanged : function()
	{
		
	},
	
	/**
	 * Start Assignment
	 */
	startAssignment : function(e) {
		this.processAssignment(e,'wsmethod:startAssignment');
	},
	
	/**
	 * Interrupt Assignment
	 */
	interruptAssignment : function(e) {
		this.processAssignment(e,'wsmethod:interruptAssignment');
	},
	
	/**
	 * Finish Assignment
	 */
	finishAssignment : function(e) {
		this.processAssignment(e,'wsmethod:finishAssignment');
	},
	
	/**
	 * Based on the current WMASSIGNMENT record, fetches the assignment record and executes corresponding action
	 * 
	 */
	processAssignment : function(e,action){
		this.$.maximoOpenWork.toggleLoading(true);
		var self = this;
		var record = this.$.openWorkIronList.modelForElement(e.target).workorder;
		self.scrollIndex = this.$.openWorkIronList.firstVisibleIndex;
		var responseProperties = '';
		this.record=record;
		var params = {};	
		var assignmentfilterData = [{'filtertype': 'SIMPLE', 'field': 'assignmentid', 'availablevalues': [ ]}];

		//create filter to fetch assignment record
   		var filterByAssignmentId = {};
   		filterByAssignmentId.value = record.assignmentid;
   		filterByAssignmentId.selected = true;
   		assignmentfilterData[0].availablevalues.push(filterByAssignmentId);
		this.assignmentfilterData = assignmentfilterData;	
		
		this.$.assignmentcollection.refreshRecords().then(function(assignment){
			this.$.maximoOpenWork.toggleLoading(false);				
			
			//call Assignment actions
			this.$.assignmentResource.updateAction(action, params, responseProperties).then(function() {
				
				if (action==='wsmethod:startAssignment'){
					$M.notify($M.localize('messages', 'mxapiwodetail', 'Theassignmentstartedsuccessfully',[record.assignmentid]), $M.alerts.info);
				} else if (action==='wsmethod:interruptAssignment') {
					$M.notify($M.localize('messages', 'mxapiwodetail', 'Theassignmentstoppedsuccessfully',[record.assignmentid]), $M.alerts.info);
					$M.hideCard(self, e, 'tempCollection');
				} else {
					$M.notify($M.localize('messages', 'mxapiwodetail', 'Theassignmentfinishedsuccessfully',[record.assignmentid]), $M.alerts.info);
					$M.hideCard(self, e, 'tempCollection');
				}
				
				self.currentCollection.refreshRecords().then(function(collection){
					
					if(self.currentTab==='filterToday'){
						self.todayCount = self._getRecordCount();
					} else if(self.currentTab==='filterOverdue'){
						self.overdueCount = self._getRecordCount();
					} else if(self.currentTab==='filterTomorrow'){
						self.tomorrowCount = self._getRecordCount();
					} else if(self.currentTab==='filterNextThreeDays'){
						self.nextdaysCount = self._getRecordCount();
					}
					
					if(self.currentTab!=='filterToday'){
						self.setTodayCount();
					}
					
					self.displayedCollection = collection.response.member;
					
					self.toggleLoading(false);
					$M.toggleWait(false);
					self.$.openWorkIronList.scrollToIndex(self.scrollIndex);
				});
			}.bind(this), function(error) {
				$M.toggleWait(false);
				this.toggleLoading(false);
				$M.showResponseError(error);
			}.bind(this));
		}.bind(this));
	},

	_getWorkorderUrl : function(){
		if(this.woRecordData && this.woRecordData.length>0){
			return this.woRecordData[0].href;	
		} else {
			return null;
		}
	},
	
	_getAssignmentUrl : function(){
		if(this.assignmentRecordData && this.assignmentRecordData.length>0){
			return this.assignmentRecordData[0].href;	
		} else {
			return null;
		}
	},	
	
	_getRecordCount : function(){
		//return this.$.wmassignmentcollection.totalCount;
		return this.currentCollection.totalCount;
	},
	
	
	/**
	 * Display "maximo-workorderdetails-card" dialog when detail link is selected.
	 */
	workOrderDetails : function(e) {

		var assignmentClone = $M.cloneRecord(e.model.workorder);
		
		var filterData = [{'filtertype': 'SIMPLE', 'field': 'workorderid', 'availablevalues': [ ]}];

		//create filter to fetch assignment record
   		var filterByWorkorderID = {};
   		filterByWorkorderID.value = assignmentClone.workorderid;
   		filterByWorkorderID.selected = true;
   	   	filterData[0].availablevalues.push(filterByWorkorderID);
		this.filterData = filterData;
		
		var wmcollection = this.$.wmassignmentcollection;
		var self = this;
		this.$.workordercollection.refreshRecords().then(function(workorder){
			
			var woclone = $M.cloneRecord(e.model.workorder);
			woclone.wohref = workorder.response.member[0].href;
			woclone.wmcollection = wmcollection;
			woclone.currentCollection = self.currentCollection;
			woclone.id='openwork_workorderdetail';
			$M.showDialog(this, woclone, null, 'maximo-workorderdetails-card', false);
			
			this.totalCount = this.displayedCollection.length;
			var norecordfound = $j($M.findElementParent(this.$.contentSelector,'MAXIMO-PANEL')).find('maximo-norecordfound');
			$j(norecordfound[0]).find('div').css({'display':(this.totalCount===0)?'block':'none','padding-top':25+'px'});
		}.bind(this));
		
		
	},
	
	
	/**
	 * Handle "maximo-workorderdetails-card" dialog OK button.
	 */
	dialogOk: function(){
		this.$.wmassignmentcollection.refreshRecords();
	},
	
	/**
	 * Hide priority section if no priority is defined on the record.
	 */
	showPriority: function(wo){
		if(wo.wopriority){
			return false;
		} else {
			return true;
		}
	},

	/**
	 * Hide worktype section if no worktype is defined on the record.
	 */
	showWorktype: function(wo){
		if(wo.worktype){
			return false;
		} else {
			return true;
		}
	},
		
	/**
	 * Show/Hide the Start link.
	 */
	showStart : function(wo){
		if(wo.assignstatus_maxvalue==='ASSIGNED'){
			return false;
		} else if(wo.assignstatus_maxvalue==='STARTED'){
			return true;
		}
	},
	
	/**
	 * Show/Hide the Pause link.
	 */
	showPause : function(wo){
		if(wo.assignstatus_maxvalue==='ASSIGNED'){
			return true;
		} else if(wo.assignstatus_maxvalue==='STARTED'){
			return false;
		}
	},
	
	/**
	 * Show/Hide the Complete/Finish link.
	 */
	showComplete : function(wo){
		if(wo.assignstatus_maxvalue==='ASSIGNED'){
			return true;
		} else if(wo.assignstatus_maxvalue==='STARTED'){
			return false;
		}
	},
	
	/**
	 * Display records with a schedstart date which is within 30 days.
	 */
	filterOverdue : function(e) {
		$M.toggleWait(true);
		this.setTab('filterOverdue');
		this._collapseAllCards();
		
		var overduecollection = $M.getGlobalResource('overduecollection');
		var today = this._getDateFromToday();
		overduecollection.timeLineAttribute = 'scheduledate='+today+'T00:00:00'; 
		
		this.currentCollection = this.$.overduecollection;
		
		this.showMessage(this, $M.localize('uitext','mxapiwodetail','Noassignmentsoverdue'));
				
		return overduecollection.refreshRecords();
	},
	
	filterToday : function(e) {
		$M.toggleWait(true);
		this.setTab('filterToday');
		this._collapseAllCards();
		
		var todaycollection = $M.getGlobalResource('todaycollection');
		
		var today = this._getDateFromToday();
		todaycollection.timeLineAttribute = 'scheduledate='+today+'T00:00:00';
		
		this.currentCollection = this.$.todaycollection;
		
		this.showMessage(this, $M.localize('uitext','mxapiwodetail','NoassignmentsIfexpected'));
				
		return todaycollection.refreshRecords();
	},
	
	filterTomorrow : function(e) {
		$M.toggleWait(true);
		this.setTab('filterTomorrow');
		this._collapseAllCards();
		
		var tomorrowcollection = $M.getGlobalResource('tomorrowcollection');
		
		var tomorrow = this._getDateFromToday(1);
		tomorrowcollection.timeLineAttribute = 'scheduledate='+tomorrow+'T00:00:00';
		
		this.currentCollection = this.$.tomorrowcollection;
		
		this.showMessage(this, $M.localize('uitext','mxapiwodetail','NoassignmentsToreceivetomorrow'));
		
		return tomorrowcollection.refreshRecords();
	},
	
	filterNextThreeDays : function(e) {
		$M.toggleWait(true);
		this.setTab('filterNextThreeDays');
		this._collapseAllCards();
		
		var nextdayscollection = $M.getGlobalResource('nextdayscollection');
		
		var dayAfterTomorrow = this._getDateFromToday(2);
		nextdayscollection.timeLineAttribute = 'scheduledate='+dayAfterTomorrow+'T00:00:00';
		
		this.currentCollection = this.$.nextdayscollection;
		
		this.showMessage(this, $M.localize('uitext','mxapiwodetail','NoassignmentsToreceive3days'));
				
		return nextdayscollection.refreshRecords();
	},
	
	setTodayCount : function() {	
		var self = this;
		var todaycollection = $M.getGlobalResource('todaycollection');
		var today = this._getDateFromToday();
		todaycollection.timeLineAttribute = 'scheduledate='+today+'T00:00:00';	
		
		todaycollection.refreshRecords().then(function(collection){
			self.todayCount = collection.response.member.length;	
		});
	},
	
	/**
	 * Show the CraftSkill description if it exists.
	 */
	showCraftSkill : function(workorder){
		if(workorder.assignment.craftskill && (workorder.assignment.craftskill.description!==null && workorder.assignment.craftskill.description!=='')){
			return false;
		} else {
			return true;
		}
	},
	
	/** 
	 * Show the craft description if the craftskill does not exist.
	 */
	showCraft : function(workorder){
		if(workorder.assignment.craftskill && (workorder.assignment.craftskill.description!==undefined && workorder.assignment.craftskill.description!=='')){
			return true;
		} else {
			return false;
		}
	},
	
	refreshContainerRecords: function () {
		this.$.wmassignmentcollection.refreshRecords();
	},
	
	openDetailDialog: function (e) {
		
		//var dialog = this._defineDialogDetails(e);
		
		var assignmentClone = $M.cloneRecord(e.model.workorder);
		var filterData = [{'filtertype': 'SIMPLE', 'field': 'workorderid', 'availablevalues': [ ]}];

		//create filter to fetch assignment record
   		var filterByWorkorderID = {};
   		filterByWorkorderID.value = assignmentClone.workorderid;
   		filterByWorkorderID.selected = true;
   	   	filterData[0].availablevalues.push(filterByWorkorderID);
		this.filterData = filterData;
		
		var wmcollection = this.$.wmassignmentcollection;
		
		this.$.workordercollection.refreshRecords().then(function(workorder){
			var woclone = $M.cloneRecord(e.model.workorder);
			woclone.wohref = workorder.response.member[0].href;
			woclone.wmcollection = wmcollection;
			woclone.id='openwork_workorderdetail';
			$M.showDialog(this, woclone, null, 'maximo-plannedmaterial-card', false);
		});
		
	},
	
	_defineDialogDetails : function (e) {
		
		//get selected status
		var newstatus=document.getElementById('select_select');
		var status = newstatus[newstatus.selectedIndex].value;
		
		return 'maximo-workorderdetails-card';
		
	},
	

	
	_transferCollection: function(newValue, oldValue) {
		if (this.listenerOn) {
			this.displayedCollection = this.tempCollection;
		}
	},
	
	_getDateFromToday: function (/*int*/ days){
		
		if (!days) {
			days = 0;
		}
		
		var date = new Date();
		date.setDate(date.getDate() + (days));
		var day = date.getDate();
		day =  day<10 ? '0'+day : day;
		
		var month = date.getMonth()+1;
		month =  month<10 ? '0'+month : month;
  		
  		return date.getFullYear()+'-'+month+'-'+day;
	},
	
	/**
	 * Traverse up the dom searching parent and children for defined class.
	 * return element containing class 
	 */
	findParentElementBasedOnClass : function(element,searchclass){
		var parent = element.target.parentNode;
		while (parent!==null && !$j(parent).hasClass(searchclass)){
			var nodeElement = $j('.'+searchclass,parent);
			if(nodeElement.length>0){
				parent= nodeElement;
			}else {
				parent = parent.parentNode;	
			}
		}
		return parent;
	},
	
	_collapseAllCards: function() {
		$j(this.$.openWorkIronList).find('maximo-collapsible').each(function(i,element) {
			if (!element.collapsed){ 
				element.toggleState();
			}
		});
	},
		
	/**
	 * Set the selected content selector tab
	 */
	setTab : function(tab){
		this.currentTab = tab;
	},
	
	/**
	 * Get the current selected  tab
	 */
	getTab : function(){
		return this.currentTab;
	}
	
});
