/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({

	is: 'maximo-findsomeone-card',
	behaviors: [BaseComponent],
  	properties : {
  		/**
  		 * Work order record received
  		 */
  		record : {
			type: Object,
			notify: true,
			observer: 'recordChanged'
		},
		/**
		 * Dialog label
		 */
   		label : {
   			type: String,
   			value : function(){
   				return $M.localize('uitext', 'mxapiassignment', 'AssignNewLabor');
   			}
   		},
   		/**
   		 * Used to filter data against labor set
   		 */
   		filterData : {
   			type: Array
   		},
   		/**
   		 * List of suggested labor received
   		 */
   		availableLaborRecordData: {
   			type: Object,
   			notify: true
   		},
   		isEmptyList: {
   			type: Boolean,
   			value: false,
   			notify: true
   		}
   	/*	searchTermValue : {
   			type: String,
   			value: ''
   		}*/
	},
	
	observers: ['evaluateEmptyList(availableLaborRecordData)'],
  		
  	created : function(){
  		
  	},
  	ready : function(){
  		
  	},
  	attached: function(){
  		this.$.assignmentCleancollection.collectionUri = this.record.laborCollectionRef+'.MXAPILABOR';
  		this.$.assignmentCleancollection.refreshRecords();
  		//laborList = this.record.availableLaborRecordData;
  	},
  	
  	/**
  	 * Observes any change of the received work order
  	 */
  	recordChanged: function () {
  		//this.updateFilterData(newValue);
  		this.$.assignmentcollection.refreshRecords();
  		
  	},
  	
  	/**
  	 * Update the filter data based on work order attributes
  	 */
  	updateFilterData: function(newValue) {
  		
  		var filterArray = [];
  		var filter;
  		if (newValue.wplabor.craft) {
  			filter = {'selected':'true','value':newValue.wplabor.craft};
  			filterArray.push({'filtertype':'SIMPLE','field':'craft','availablevalues':[filter]});
  		}
  		
  		if (newValue.wplabor.skilllevel) {
  			filter = {'selected':'true','value':newValue.wplabor.skilllevel};
  			filterArray.push({'filtertype':'SIMPLE','field':'skilllevel','availablevalues':[filter]});
  		}
  		this.filterData = filterArray;
  	},
  	
  	/**
  	 * Show the location of work order in a map
  	 */
  	pinpointmap: function(e){
  		console.info('Open map dialog...' + e);
  	},
  	
  	/**
  	 * Evaluate variable against list size
  	 */
  	evaluateEmptyList: function (list){
  		
  		if (list && list.length > 0){
  			this.isEmptyList = false;
  		}else {
  			this.isEmptyList = true;
  		}
  		
  	},
  	
  	_laborHandleRecordDataRefreshed: function () {

  	},
  	
  	/**
  	 * Assign the selected labor for the current work order
  	 */
	assignLabor: function (context) {
  		
		var self = this;
		//Get labor data
  		var labor = this.$.findsomeonePanelavailLaborsection.itemForElement(context.target);
		var responseProperties = '';
		var params = {laborcode: labor.laborcode, orgid: labor.orgid};
		
		var filterData = [{'filtertype': 'SIMPLE', 'field': 'assignmentid', 'availablevalues': [ ]}];

		//create filter to fetch assignment record
   		var filterByAssignmentId = {};
   		filterByAssignmentId.value = this.record.assignmentid;
   	   	filterByAssignmentId.selected = true;
   	   	filterData[0].availablevalues.push(filterByAssignmentId);
		this.filterData = filterData;
		
		this.$.assignmentcollection.refreshRecords().then(function(){
			this.$.assignmentResource.updateAction('wsmethod:assignLabor', params, responseProperties).then(function() {
				$M.notify(self.localize('uitext', 'mxapiassignment', 'WO0isassignedto1',[self.record.wonum, labor.laborcode]), $M.alerts.info);
				this.container.close();
				$M.toggleWait(false);
				this.parent.refreshContainerRecords();
			}.bind(this), function(error) {
				//self.$.worktoassign.toggleLoading(false);
				$M.toggleWait(false);
				$M.showResponseError(error);
			});			
		}.bind(this));

	},
	
	_getAssignmentUrl : function(){
		if(this.assignmentRecordData && this.assignmentRecordData.length>0){
			return this.assignmentRecordData[0].href;	
		} else {
			return null;
		}
	},
	
	/**
	 * Open the Maximo Record
	 */
	openWorkorder : function(){
		$M.openMaximoRecord('wotrack',this.record.workorderid);
	},
	
	_handleCleanAssignmentRecordDataRefreshed : function (){
	},
	
	/**
	 * Closes dialog
	 */
	closeDialog : function () {
		this.container.close();
	}
/*	
	refreshRecords : function(){
		this.getAvailableLabors();
	},
*/	
	/**
	 * Get Available Labors. This will fetch the available labors for the current assignment.
	 */
	
//	getAvailableLabors : function() {
//		//this.$.worktoassign.toggleLoading(true);
//		var self=this;		
//		var responseProperties = '';
//		//var record = this.$.maximoPanelWorktoassignTemplate.itemForElement(e.target);
//		//this.record=record;
//		var params = {'qbeAttributes': 'laborcode', 'value': this.searchTermValue};
//		params["oslc.properties"]="*,availability, laborcraftrate.craft, laborcraftrate.skilllevel, person.displayname";
//		
//		var filterData = [{'filtertype': 'SIMPLE', 'field': 'assignmentid', 'availablevalues': [ ]}];
//
//		//create filter to fetch assignment record
//   		var filterByAssignmentId = {};
//   		filterByAssignmentId.value = this.record.assignmentid;
//   	   	filterByAssignmentId.selected = true;
//   	   	filterData[0].availablevalues.push(filterByAssignmentId);
//		this.filterData = filterData;
//		
//		this.$.assignmentcollection.refreshRecords().then(function(){
//			//call assignLabor webmethod action
//			//this.$.assignmentResource.updateAction('wsmethod:availableLabor', params, responseProperties).then(function(laborSet) {
//			this.$.assignmentResource.getAction('wsmethod:availableLabor', params).then(function(laborSet) {
//				//self.$.worktoassign.toggleLoading(false);
//				self.laborList = laborSet.response.member;
//				
//				//self.$.wmassignmentcollection.refreshRecords();
//			}.bind(this), function(error) {
//				self.$.worktoassign.toggleLoading(false);
//				$M.showResponseError(error);
//			});
//		}.bind(this));
		
//	}
//
  	
});
