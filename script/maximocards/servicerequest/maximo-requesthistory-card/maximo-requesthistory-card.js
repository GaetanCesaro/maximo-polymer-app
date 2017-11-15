/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-requesthistory-card',
  	behaviors: [BaseComponent],
    properties: {
		recordData: {
			type: Object,
			notify: true
		},
		selectedRecord: {
			type: Object,
			notify: true
		},
		recordCount: {
			type: String,
			value: 0,
			notify: true,
			reflectToAttribute:true
		},
		selectedQueryName: {
			type: String,
			value: 'SERVICEREQUESTHISTORY',
			notify: true
		},
		
		srFilterData: {
			type: Object,
			value: null,
			notify: true
		},	
		pageIndex : {
			type: Number
		},
     	// interval in seconds
      	interval : {
      		type: Number,
      		value: 5
      	},
		timeLineAttribute: {
			type: String,
			notify: true
		},
		isDesktop: {
			type: String,
			value: 'false',
			notify: true
		},
		subRoute: {
			type: String,
			notify: true
		}
	},
	ready: function()
	{
		this.async(function(){
			this._windowResize();
		}, 100);
	},
	beforeLogout : function() {
		
	},
	attached: function()
	{
		this.queryRecordsByTimeLine();
		var searchbar = Polymer.Base.create('maximo-searchbar', {'id':this.id+'_seearchbar', 'collection': [this.$.srhistorycollection,this.$.srhistorycollection_previousmonth,this.$.srhistorycollection_priortopreviousmonth], 'placeholder':$M.localize('uitext', 'mxapibase', 'Search')});
		$j(this.$.historysr.$.panelHeader).append(searchbar);
	},
	_handleRecordDataRefreshed: function()
	{
		console.log('_handleRecordDataRefreshed');
		this._updateRecordCount(this._getRecordCount());
		this.fire('show-wait-spinner', false);
	},
	_getRecordCount : function(){
		return this.$.srhistorycollection.totalCount+srhistorycollection_previousmonth.totalCount+srhistorycollection_priortopreviousmonth.totalCount;
	},
	_updateRecordCount : function(count) {
		this.recordCount = count;
		//this.fire('updatecount', {index: this.pageIndex, count: this.recordCount});
	},
	queryRecordsByTimeLine : function(e){
		//todays date and time
		var currentDateTime = new Date();
		
		//first date of the current month
		var firstDayOfTheMonthDate = new Date(currentDateTime.getFullYear(), currentDateTime.getMonth(), 1);
		
		//first date of the previous month
		var currentMonthFirstDate = new Date(currentDateTime.getFullYear(), currentDateTime.getMonth(), 1);
		var previousMonthFirstDate =  new Date(currentMonthFirstDate.setMonth(currentMonthFirstDate.getMonth() - 1));
		
		this.currentadditionalparams = [];
		var srhistorycollection_current = this.$.srhistorycollection;
		var firstDateCurrentMonth = this._convertDate(firstDayOfTheMonthDate);
		this.currentadditionalparams.push("internalvalues=1");
		// using opmodeor which makes ands become ors, aslo using actualfinish!="*" which means 'is null'
		this.currentadditionalparams.push("opmodeor=1&oslc.where=actualfinish>=%22"+firstDateCurrentMonth+"T00:00:00%22 and actualfinish!=%22*%22");
		
		this.previousmonthadditionalparams = [];
		var srhistorycollection_previousmonth = this.$.srhistorycollection_previousmonth;
		var firstDatePreviousMonth = this._convertDate(previousMonthFirstDate);
		this.previousmonthadditionalparams.push("internalvalues=1");
		this.previousmonthadditionalparams.push("oslc.where=actualfinish>=%22"+firstDatePreviousMonth+"T00:00:00%22 and actualfinish<%22"+firstDateCurrentMonth+"T00:00:00%22");
		
		this.priortopreviousmonthadditionalparams = [];
		var srhistorycollection_priortopreviousmonth = this.$.srhistorycollection_priortopreviousmonth;
		var firstDatePreviousMonth = this._convertDate(previousMonthFirstDate);
		this.priortopreviousmonthadditionalparams.push("internalvalues=1");
		this.priortopreviousmonthadditionalparams.push("oslc.where=actualfinish<%22"+firstDatePreviousMonth+"T00:00:00%22");
	
		srhistorycollection_current.refreshRecords();
		srhistorycollection_previousmonth.refreshRecords();
		srhistorycollection_priortopreviousmonth.refreshRecords();
	},
	
	_convertDate: function (/*int*/ date){ 
		var day = date.getDate();
		day =  day<10 ? '0'+day : day;
		
		var month = date.getMonth()+1;
		month =  month<10 ? '0'+month : month;
		
  		return date.getFullYear()+'-'+month+'-'+day;
	},

	hideSectionNoRecords: function(data){
		if(data.length>0){
			return false;
		} else{
			return true;
		}
	},
	
	/**
	 * Brings up details panel
	 */
	openDetails : function(e) {
		this.fire('open-sr-details', {'sr': e.model.sr, 'target': e.target, 'ticketIndex': e.model.index});
	},
	
	openAttachment : function(e) {
		var that = this;
		var record = e.model.sr;
		this.$.attachmentsCard.record = record;
		this.$.attachmentsCard.recordData = record.doclinks.member;
		this.$.attachmentsCard.recordCount = record.doclinks.member.length;
		this.$.attachmentsCard.ticketIndex = e.model.index;
		this.$.attachmentsCard.open(function() {
			that.fire('hide-navbar');
		});
	},
	highlightCard : function(id){
		if(id){
			$j('.cardborder[data-ticketid="'+id+'"]').addClass('highlight');
			setTimeout(function() {
				$j('.cardborder[data-ticketid="'+id+'"]').removeClass('highlight');
			}, 3000);
		}
	},
	_noRecordsFound : function (count){
		return count>0?true:false;
	},
	_windowResize : function(){
		var height;
		var orientation = $M.getOrientation();
		if($M.screenInfo.device === 'desktop'){ // for desktop mode -> fix side navbar
			this.applyDesktopStyle();
		}
		else if($M.screenInfo.device === 'tablet' ||$M.screenInfo.device === 'phone'){ // for tablet mode
			this.applyMobileStyle();
		}
	},
	
	applyDesktopStyle : function () {
		this.$.viewSRDataList.classList.add('cardDesktop');
		this.$.ongoingsr_section_2.classList.add('cardDesktop');
		this.$.ongoingsr_section_3.classList.add('cardDesktop');
		this.isDesktop = 'true';
	},
	
	applyMobileStyle : function () {
		this.$.viewSRDataList.classList.remove('cardDesktop');
		this.$.ongoingsr_section_2.classList.remove('cardDesktop');
		this.$.ongoingsr_section_3.classList.remove('cardDesktop');
		this.isDesktop = 'false';
	},

	refreshContainerRecords: function () {
		this.$.srhistorycollection.refreshRecords();
		this.$.srhistorycollection_previousmonth.refreshRecords();
		this.$.srhistorycollection_priortopreviousmonth.refreshRecords();
		this.fire('show-wait-spinner', true);
	}
});
