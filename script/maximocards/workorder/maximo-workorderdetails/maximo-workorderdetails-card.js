/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-workorderdetails-card',
  	behaviors: [BaseComponent, HandlerWorkOrder],
    properties: {
		record : {
			type: Object,
			notify: true
		},
   		label : {
   			type: String,
   			computed: '_computeTitle(record)'
   		},
   		fieldStyle : {
   			type: String,
   			value:''
   		},
		woFilterData: {
			type: Object,
			value: null,
			notify: true
		},
		totalMaterialCount: {
			type: Number,
			notify: true
		},
		materialPagenum: {
			type: Number,
			notify: true
		},
		totalMaterialPages: {
			type: Number,
			notify: true
		},
		totalToolCount: {
			type: Number,
			notify: true
		},
		toolPagenum: {
			type: Number,
			notify: true
		},
		totalToolPages: {
			type: Number,
			notify: true
		},			
		totalLaborCount: {
			type: Number,
			notify: true
		},
		laborPagenum: {
			type: Number,
			notify: true
		},
		totalLaborPages: {
			type: Number,
			notify: true
		},
		totalTaskCount: {
			type: Number,
			notify: true
		},
		taskPagenum: {
			type: Number,
			notify: true
		},
		totalTaskPages: {
			type: Number,
			notify: true
		}		
	},
	
	attached : function() {
		//tasks
  		this.$.workordertasks.collectionUri = this.record.wohref+'/wo_tasks';
  		this.$.workordertasks.refreshRecords().then(function(task){
  			this.totalTaskCount = task.response.responseInfo.totalCount;
  			this.taskPagenum = task.response.responseInfo.pagenum;
  			this.totalTaskPages = task.response.responseInfo.totalPages;
  		});
  		
  		//material
  		this.$.wpmaterial.collectionUri = this.record.wohref+'/wpmaterialtask';
  		this.$.wpmaterial.refreshRecords().then(function(material){
  			this.totalMaterialCount = material.response.responseInfo.totalCount;
  			this.materialPagenum = material.response.responseInfo.pagenum;
  			this.totalMaterialPages = material.response.responseInfo.totalPages;
  		});
  		
  		//tool
  		this.$.wptool.collectionUri = this.record.wohref+'/uxshowplantool';
  		this.$.wptool.refreshRecords().then(function(tool){
  			this.totalToolCount = tool.response.responseInfo.totalCount;
  			this.toolPagenum = tool.response.responseInfo.pagenum;
  			this.totalToolPages = tool.response.responseInfo.totalPages;
  		});
  		
  		//labor
  		this.$.wplabor.collectionUri = this.record.wohref+'/uxshowplanlabor';
  		this.$.wplabor.refreshRecords().then(function(labor){
  			this.totalLaborCount = labor.response.responseInfo.totalCount;
  			this.laborPagenum = labor.response.responseInfo.pagenum;
  			this.totalLaborPages = labor.response.responseInfo.totalPages;
  		});
	},
	
	_computeTitle (record) {
		return $M.localize('uitext', 'mxapiwodetail', 'WorkOrder0', [record.wonum]);
	},
	
	ok : function(){
		
//		$M.fireEvent('dialogOk', this.record);
//		this.parent.dialogOk();
//		this.container.closeMe();
//		this.updateWo();
	},
	
	cancel : function(){
		this.container.close();
	},
	
	updateWo : function () {
		var dataToUpdate = {};
		dataToUpdate.description = this.record.description;
		var responseProperties = 'description';
		this.$.woresource.updateRecord(dataToUpdate, responseProperties, true).then(function(result) {
			console.log(result);
			// notify refresh
			this.parent.dialogOk();
			this.container.close();
		}.bind(this), function(error) {
			$M.showResponseError(error);
		});
	},
	
	/**
	 * Open the Maximo Record
	 */
	openWorkorder : function(){
		$M.openMaximoRecord('wotrack',this.record.workorderid);
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
	* Apply display none style when hidden. 
	*/
	getFieldStyle: function(wo,field){
		if(wo[field]){
			return 'font-size:120%';
		} else {
			return 'display:none';
		}
	},
	
	/**
	 * Change the status of a task workorder
	 */
	changeTaskStatus: function(context) {
		$M.toggleWait(true);
		//var task = this.$.section_tasks_template_detail_dialog.itemForElement(context.target);//context.record;
		var task = this.$.maximoPanelWorktoassignTasksIronList.modelForElement(context.target).tasks;
		var filterData = [{'filtertype': 'SIMPLE', 'field': 'workorderid', 'availablevalues': [ ]}];

		//create filter to fetch workorder record
   		var filterByWorkorderId = {};
   		filterByWorkorderId.value = task.workorderid;
   		filterByWorkorderId.selected = true;
   	   	filterData[0].availablevalues.push(filterByWorkorderId);
		this.woFilterData = filterData;
		
		//clear any search term value that may exist.
		this.$.wocollection.searchTermValue='';
			
		this.$.wocollection.refreshRecords().then(function(taskwo){		 
			$M.toggleWait(false);
			var woclone = $M.cloneRecord(taskwo.response.member[0]);
			woclone.id='taskwo_changestatus';
			$M.showDialog(this, woclone, null, 'maximo-changestatus-card', false);
		}.bind(this));		
	},
	
	/**
	 * Change Status of the current record to "COMPLETE"
	 */
	completeWO : function (e) {
		this.toggleLoading(true);
		var self=this;	
		this.filterWorkOrderID = this.record.workorderid;
		var tasksComplete = true;
	
		//loop through tasks if they exist and check if parentchangestatus is unchecked.
		this.$.workordertasks.refreshRecords().then(function(tasks){
			
			//create filter to fetch workorder record
			var filterData = [{'filtertype': 'SIMPLE', 'field': 'workorderid', 'availablevalues': [ ]}];
	   		var filterByWorkorderId = {};
	   		filterByWorkorderId.value = this.filterWorkOrderID;
	   		filterByWorkorderId.selected = true;
	   	   	filterData[0].availablevalues.push(filterByWorkorderId);
			this.woFilterData = filterData;
			
			this.$.wocollection.refreshRecords().then(function(wo){
				
				if(tasks.response && tasks.response.member.length>0){
					var array = tasks.response.member;
					array.forEach(function(element){
						 var parentchgsstatus = element.parentchgsstatus;
						 var status = element.status;
						 
						 var compStatusObject = wo.response.member[0].allowedstates.COMP;
						 if(compStatusObject && compStatusObject.length>0){
							 var extCompStatus = compStatusObject[0].value;
							 if(status!==extCompStatus && parentchgsstatus===false){
								 $M.alert($M.localize('messages', 'mxapiwodetail', 'Beforeyoucompletetheworkorderyoumustcompl'), $M.alerts.info);
								 tasksComplete = false;
								 return;
							 }							 
						 }
					});
				}
				
				if(tasksComplete){
					var record = wo.response.member[0];
					var completeStatusObject = record.allowedstates.COMP;
					
					if(completeStatusObject && completeStatusObject.length>0){
						var completeStatus = completeStatusObject[0].value;
						var params = {status: completeStatus};
						var responseProperties = 'status';
										
						//call changestatus action
						this.$.workorderResource.updateAction('wsmethod:changeStatus', params, responseProperties).then(function() {
							this.container.close();
							this.parent.currentCollection.refreshRecords().then(function(collection){
								
								if(self.parent.currentTab==='filterToday'){
									self.parent.todayCount = self.parent._getRecordCount();
								} else if(self.parent.currentTab==='filterOverdue'){
									self.parent.overdueCount = self.parent._getRecordCount();
								} else if(self.parent.currentTab==='filterTomorrow'){
									self.parent.tomorrowCount = self.parent._getRecordCount();
								} else if(self.parent.currentTab==='filterOverdue'){
									self.parent.nextdaysCount = self.parent._getRecordCount();
								}
								
								self.parent.displayedCollection = collection.response.member;
								
								self.toggleLoading(false);					
								$M.notify(self.localize('messages', 'mxapiwodetail', 'Workorder0wascompleted',[record.wonum]), $M.alerts.info);	
							});
						}.bind(this), function(error) {
							$M.showResponseError(error);
							this.toggleLoading(false);
						}.bind(this));
					} else {
						$M.showResponseError(error);
					}
				}	
			}.bind(this));

	
						
		}.bind(this));
	},
	
	/**
	 * Refresh Task  Table Records after status is changed.
	 */
	refreshContainerRecords: function () {
		this.$.workordertasks.refreshRecords().then(function(task){
			$M.toggleWait(false);
		});		
	},
	
	_getWorkorderUrl : function(){
		if(this.workorderRecordData && this.workorderRecordData.length>0){
			return this.workorderRecordData[0].href;	
		} else {
			return null;
		}
	},
	
	switchContent: function(event) {
		
		var curIdArray = event.currentTarget.id.split('_');
		var sectionId = 'section_' + curIdArray[curIdArray.length-1];
		this._showHideSection(sectionId);
	},
	
	_showHideSection: function(sectionName) {
		
		var currentList;
		$j(this.$.maincontainer).children('div').each(function(index, elem) {
			if (elem.id.indexOf(sectionName) > -1) {
				currentList = this;
			}
			$j(this).hide();
		});
		
		$j(currentList).show();
	},
	
	hideTaskStatus: function(taskwo){
		if($j.isEmptyObject(taskwo.allowedStates)){
			return true;
		} else {
			return false;
		}
	},
	_showNoData: function(count)
	{
		if(count === 0)
		{
			return false;
		}
		return true;
	},
	
	_showPageChange: function(count)
	{
		if(count <= 1)
		{
			return true;
		}
		return false;
	},
	
	_handlePrePage: function(event){
		if(event.target.id.indexOf('material')>0){
			this.$.wpmaterial.pagePrevious();
		} else if(event.target.id.indexOf('labor')>0){
			this.$.wplabor.pagePrevious();
		} else if(event.target.id.indexOf('tool')>0){
			this.$.wptool.pagePrevious();
		} else if(event.target.id.indexOf('task')>0){
			this.$.workordertasks.pagePrevious();
		}
	},
	
	_handleNextPage: function(event){
		if(event.target.id.indexOf('material')>0){
			this.$.wpmaterial.pageForward();
		} else if(event.target.id.indexOf('labor')>0){
			this.$.wplabor.pageForward();
		} else if(event.target.id.indexOf('tool')>0){
			this.$.wptool.pageForward();
		} else if(event.target.id.indexOf('task')>0){
			this.$.workordertasks.pageForward();
		}
	},
	
	_refresh: function(){
		this.$.wpmaterial.refreshRecords();
		this.$.wplabor.refreshRecords();
	}
	
});
