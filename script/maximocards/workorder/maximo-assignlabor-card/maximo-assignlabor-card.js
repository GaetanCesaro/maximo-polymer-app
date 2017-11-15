/*
 * @license 
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({

	is: 'maximo-assignlabor-card',
	behaviors: [BaseComponent],
  	properties : {
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
   				return $M.localize('uitext', 'mxapiwodetail', 'FindLabortoAssign');
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
   		},
   		
   		fromDate : {
   			type: String,
   			value: '',
   			notify: true
   			//observer: 'fromDateChanged'
   		},
   		toDate : {
   			type: String,
   			value: '',
   			notify: true
   			//observer: 'toDateChanged'
   		},
   		duration : {
   			type: String,
   			value: '1',
   			notify: true
   		},
   		woLaborRecordData : {
   			type: Array,
   			notify: true
   		},
   		additionalparams : {
   			type: Array,
   			value: [],
   			notify: true
   		}
	},
	
	observers: ['evaluateEmptyList(availableLaborRecordData)'],
  		
  	created : function(){
  		
  	},
  	ready : function(){

  	},
  	attached: function(){
  		this.additionalparams = [];
  		
  		this.additionalparams.push('labor.laborcraftrate.where=defaultcraft=1');
  		this.additionalparams.push('oslc.where=person.supervisor=%22-personid-%22');
  		this.$.assignLaborAvailableLaborCollection.collectionUri = this.record.laborCollectionRef+'.MXAPILABOR';
  		this.$.assignLaborAvailableLaborCollection.refreshRecords();
  		
  		var date = new Date();
 		var self = this;
 		
  		//$j('#assignlabor_fromdate_Label_input').datepicker();
  		$j('#assignlabor_fromdate_Label_input').datepicker({
  		  onSelect: function(dateText) {
  		    //console.log('Selected date: ' + dateText + '; input current value: ' + this.value);
  		    self.fromDate = this.value;
  		  }
  		}); 
  		
  		$j('#assignlabor_fromdate_Label_input').datepicker('setDate', date);
  		$j('#assignlabor_fromdate_Label_input').attr('readonly',true);
  			  	
  		date.setDate(date.getDate() + 1);
  		//$j('#assignlabor_todate_Label_input').datepicker();
  		$j('#assignlabor_todate_Label_input').datepicker({
    		  onSelect: function(dateText) {
    		    //console.log('Selected date: ' + dateText + '; input current value: ' + this.value);
    		    self.toDate =  this.value;
    		  }
    		});
  		$j('#assignlabor_todate_Label_input').datepicker('setDate', date);
  		$j('#assignlabor_todate_Label_input').attr('readonly',true);
  		
  	},
  	
  	/**
  	 * Fetch date as ISO date without timezone calculation
  	 */
  	getISODateString : function(d) {
  	    function pad(n) {return n<10 ? '0'+n : n}
  	    return d.getFullYear()+'-'
  	         + pad(d.getMonth()+1)+'-'
  	         + pad(d.getDate())
  	},
  	  	
  	/**
  	 * Observes any change of the received work order
  	 */
  	recordChanged: function () {
  		//this.$.assignmentcollection.refreshRecords();
  	},
  	
  	fromDateChanged: function(newVal, oldVal) {
  		//console.log('from triggered....');
  	},
  	toDateChanged: function(newVal, oldVal) {
  		//console.log('to triggered....');
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
  	
  	/**
  	 * Assign the selected labor for the current work order
  	 */
	assignLabor: function (context) {
  		
		var record = this.$.availLaborsection.itemForElement(context.target);
		 
		var self = this; 		
		var responseProperties = '';
		var params = {laborcode: record.laborcode, orgid: record.orgid, laborhrs: this.duration, starttime: record.starttime};
		
		//validate duration
		if (!this.duration || this.duration===0 || this.duration===''){
			$M.alert(this.localize('messages', 'mxapiwodetail', 'Laborhoursneedstobeapostivenumber'), $M.alerts.info);
			return;
		}
		
//		var availability = this.timeStringToFDecimal(record.availability);
//		if(this.duration>availability){
//			$M.alert(this.localize('messages', 'mxapiwodetail', 'Theselectedlaborerdoesnothavefullavailabi'), $M.alerts.info);
//			return;
//		}	

		this.$.woAssignlaborResource.updateAction('wsmethod:createAssignmentwithAssignedLabor', params, responseProperties).then(function() {
			$M.notify(self.localize('messages', 'mxapiwodetail', 'WO0isassignedto1',[self.record.wonum, record.laborcode]), $M.alerts.info);
			this.container.close();
			$M.toggleWait(false);
			this.parent.refreshContainerRecords();
		}.bind(this), function(error) {
			$M.toggleWait(false);
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
	 * Closes dialog
	 */
	closeDialog : function () {
		this.container.close();
	},
	
	/**
	 * Refresh Labor Availability based on dates
	 */
	reloadAvailability : function(){ 
		
		//var calFromDate = $j(this).find('#assignlabor_fromdate_Label_input')[0].value;
		
		var calFromDate = $j('#assignlabor_fromdate_Label_input')[0].value;
		var calToDate = $j('#assignlabor_todate_Label_input')[0].value;
		
		//convert string dates to date objects.
		var fromDate = this.getISODateString(new Date(calFromDate));
		var toDate = this.getISODateString(new Date(calToDate));
		
		//validate if dates are entered
		if(!calFromDate || !calToDate || calFromDate==='' || calToDate===''){
			$M.alert(this.localize('messages', 'mxapiwodetail', 'VerifythattheFromDateandtheToDatearecorre'), $M.alerts.warn);
			return;
		}
		
		//validate if from date is less than to date		
		if(calFromDate>calToDate){
			$M.alert(this.localize('messages', 'mxapiwodetail', 'TheFromDatehastobelessthantheToDate'), $M.alerts.warn);
			return;
		}
		

		this.additionalparams=[];
		this.additionalparams.push('labor.laborcraftrate.where=defaultcraft=1');
		this.additionalparams.push('oslc.where=person.supervisor=%22-personid-%22');
		this.additionalparams.push('responseos=MXAPILABOR');
		this.additionalparams.push('fromdate='+fromDate);
		this.additionalparams.push('todate='+toDate);
		
		this.$.assignLaborAvailableLaborCollection.collectionUri = this.record.href+'?action=wsmethod:getAvailableLabor';
		
		this.$.assignLaborAvailableLaborCollection.refreshRecords().then(function(){
			$M.toggleWait(false);	
		});
	},
	
	/**
	 * Convert time to decimal
	 * 
	 * @param time
	 * @returns
	 */
	timeStringToFDecimal : function(time) {
		  var hoursMinutes = time.split(/[.:]/);
		  var hours = parseInt(hoursMinutes[0], 10);
		  var minutes = hoursMinutes[1] ? parseInt(hoursMinutes[1], 10) : 0;
		  return hours + minutes / 60;
		}
});
