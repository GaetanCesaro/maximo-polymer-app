Polymer({
	is: 'maximo-servicemanager-sredit-card',
  	behaviors: [BaseComponent],
    properties: {
    	
    	recordData: {
			type: Object,
			notify: true
		},

		assetrecord : {
			type : Object,
			notify : true,
		},
		
		selectedRecord: {
			type: Object,
			notify: true
		},
		
		woFilterData: {
			type: Object,
			value: null,
			notify: true
		},
		
		recordCount: {
			type: String,
			value: 0,
			notify: true
		},
	
		dynamicAttributeNames: {
			type: Array,
			value: [],
			notify: true
		},
		record : {
			type: Object,
			notify: true
		},
		priority : {
			type: Object,
			notify: true
		},
   		recordIndex: {
   			type: Number,
   			value : 0
   		},
   		reportedpriority: {
			type: Number,
			notify: true,
		},
   		label : {
   			type: String,
   			value : function(){
   				return $M.localize('Edit Service Request');
   			}
   		}
	},
	ready : function() {
	},
	getCheckedP1: function (){
		if (this.record.reportedpriority === 4) {
			return true;
		}
		return false;
	},
	getCheckedP2: function (){
		if (this.record.reportedpriority === 3) {
			return true;
		}
		return false;
	},
	getCheckedP3: function (){
		if (this.record.reportedpriority === 2) {
			return true;
		}
		return false;
	},
	getCheckedP4: function (){
		if (this.record.reportedpriority === 1) {
			return true;
		}
		return false;
	},
	/**s
	 * Close Dialog.
	 */
	close : function() {
		UndoBehavior.close.call(this);
	},
	changeSR : function () {
		this.toggleLoading(true);
		var self=this;	
		//get selected data
		//var status = this.$.selectStatus.$.select.value;
		var assetnum;
		var summary = this.$.sredit_summary.value;
		var detail = this.$.sredit_detail.value;
		var record = this.record;
		var priority = this.reportedpriority;
		if(this.$.sredit_assetnum.datalabel==='Not entered'){
				assetnum='';
		}
		else{
				assetnum=this.$.sredit_assetnum.datalabel.split(' ')[0];
		}
		//get changed data
		// TODO : change json format for affectedperson and asset description
		var currentDateTime = (new Date()).toISOString();  //  {'Ids':[{'Id1':'2'},{'Id2':'2'}]}
		var params = {assetnum : assetnum, description: summary, description_longdescription : detail, reportdate: currentDateTime, reportedpriority : priority};
		var responseProperties = 'description';
				
		//call changestatus action
		this.$.recordResource.updateRecord(params, responseProperties, true).then(function() {
			
			
			this.toggleLoading(false);
			$M.notify(self.localize('{0} Edit completed successfully.',[record.ticketid]), $M.alerts.info);
			record.servicerequestcollection.refreshRecords();
			
			this.close();
//			this.parent.refreshContainerRecords();
		}.bind(this), function(error) {
			$M.showResponseError(error);
		});
	},
	_selectLowReportedPriority: function(e)
	{
		console.log('basicReportedPriority selected!');
		this.reportedpriority = 4;		
	},
		
	_selectMediumReportedPriority: function(e)
	{
		console.log('minorReportedPriority selected!');
		this.reportedpriority = 3;
	},
		
	_selectHighReportedPriority: function(e)
	{
		console.log('majorReportedPriority selected!');
		this.reportedpriority = 2;
	},
	_selectUrgentReportedPriority: function(e)
	{
		console.log('UrgentReportedPriority selected!');
		this.reportedpriority = 1;
	},
	
  	toggleFindAsset : function() {
  		this.$.assetcollapse.toggle();
  	},
  	listeners: {
        //  'tap': 'selectedRow',
          'dblclick': 'selectedRow',
  	},
  	_getRecordCount : function(){
  		console.log(this.$.selectassetcollection.totalCount);
  		return this.$.selectassetcollection.totalCount;
	},
	
	selectedRow: function(e) {
		if (e.currentTarget.localName === 'maximo-servicemanager-sredit-card')
		{
			if (e.target.parentNode.record)
		    {
				
				this.$.sredit_assetnum.datalabel = e.target.parentNode.record.assetnum+' '+e.target.parentNode.record.description;
				
				this.$.assetcollapse.toggle();
		    }
		}  
	},

	created : function() {
		
	},
	
	_refresh : function() {
		if(this.selectedType === 0)
		{
			this.$.selectassetcollection._refresh();
		}
	}
});