/*
* Licensed Materials - Property of IBM
* 5724-U18
* Copyright IBM Corporation. 2016,2017
*/
Polymer({
	is: 'maximo-ongoingrequests-card',
  	behaviors: [BaseComponent],
  	
    properties: {
		recordData: {
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
			value: 'SERVICEREQUEST',
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
		newTicketId: {
			type: String
		},
		isDesktop: {
			type: String,
			value: 'false',
			notify: true
		},
		subRoute: {
			type: String,
			notify: true
		},
		
		srStatusNew: {
			type: String
		},
		
		srStatusQueued: {
			type: String
		},
		domainStatusCollection : {
			type : Object,
			notify : true
		},
		domainFilter: {
    		type: Array,
    		value: function () {
    			return [{'filtertype': 'SIMPLE', 'field': 'domainid', 'availablevalues': [ {'value': 'SRSTATUS', 'selected': true} ]}];
    		}
    	}
		
	},
  	listeners: {
  		'on-updatecount' : '_updateAttachmentCount',
  		'cancel-request' : '_onCancel',
  		'dom-change' : '_domChanged'
  	},
	// list for on-going cancelling request
  	_requestsForCancelling : {
  	},
  	// list for on-going unsubscribing request
  	_requestsForUnsubscribing : {
  	},
	attached: function()
	{
		this.queryRecordsByTimeLine();
	},
	ready: function()
	{
		var that = this;
	
  		this.$.maxsynonymdomain.refreshRecords();
	
		this.deviceMode = $M.screenInfo.device;
		window.addEventListener('unload', function(e) {
			that._processAllCancelRequest();
			that._processAllUnsubscribeRequest();
		});
		window.addEventListener('beforeunload', function(e) {
			that._processAllCancelRequest();
			that._processAllUnsubscribeRequest();
		});
		
  		this.async(function(){
			this._windowResize();
		}, 100);
	},
	beforeLogout : function() {
		console.log('beforelogout');
		this._processAllCancelRequest();
		this._processAllUnsubscribeRequest();
	},
	_sendSyncRequest: function(url, method, headers, data, callback) {
		$j.ajax({
			url: url,
			headers : headers,
			dataType: 'json',
			type: method,
			data: data,
			async: false,
			error: function(jqXHR, textStatus, errorThrown ) {
				console.log('error:' + errorThrown);
			},
			success: function(data, textStatus, jqXHR) {
				var responseType = 'text';
				if (callback) {
					if (jqXHR.responseType || jqXHR._responseType) {
						responseType = jqXHR.responseType || jqXHR._responseType;
					}
					var response = data; 
					if (responseType === 'json' && typeof data !== 'object') {
						response = JSON.parse(data);
					}
					callback(response);
				}
			}
		});
	},	
	_processAllCancelRequest : function(sync) {
		var that = this;
		
		var headers = {};
		headers['x-method-override'] = 'DELETE';
		
		Object.keys(this._requestsForCancelling).forEach(function(ticketid) {
			if (that._requestsForCancelling[ticketid].status !== 'requested') {
				that._sendSyncRequest(that._requestsForCancelling[ticketid].href, 'POST', headers, {}, function() {
					console.log('cancelled : ' + ticketid);
				});
			}
		});

		this._requestsForCancelling = {};
		console.log('_processCancelRequest end');
	},
	_processAllUnsubscribeRequest : function (sync) {
		var that = this;

			var headers = {};
			var deleteheaders = {};

			deleteheaders['x-method-override'] = 'DELETE';
			
		Object.keys(this._requestsForUnsubscribing).forEach(function(ticketid) {
			var ticketuid = that._requestsForUnsubscribing[ticketid].ticketuid;
			var url = $M.getMaxauth().baseUri + '/oslc/os/mxapibookmark?savedQuery=SERVICEREQUESTBOOKMARK&oslc.where=keyvalue=' + ticketuid + '&oslc.select=*';
							
	   	    that._sendSyncRequest(url, 'GET', headers, {}, function(bookmark) {
				if (bookmark.member && bookmark.member[0]) {
					var href = bookmark.member[0].href;
					that._sendSyncRequest(href, 'POST', deleteheaders, {}, function() {
						console.log('bookmark deleted : ' + ticketid);
					});
				}
	   	    });
		});

		this._requestsForUnsubscribing = {};
		console.log('_processUnsubscribeRequest end');
	},	
	
	/**
	 * Hook cancel operation requested from details page
	 */
	_triggerUpdateCounter: function(e) {
		
		console.log('hooking update counters');
		
		var sr = e.detail.sr;
		var node = e.detail.node;
//		var list = this.$.viewSRDataList;
//		var compId = 'ongoingsrcard_' + e.detail.index;
//		var srCard = list.querySelector('maximo-sr-card[original-id="' + compId + '"]');
		if (node && typeof node.updateCounters === 'function') {
			node.updateCounters(true);
		}

	},

	_handleRecordDataRefreshed: function()
	{
		console.log('_handleRecordDataRefreshed');
		this._updateRecordCount(this._getRecordCount());
		this.fire('subscribe-all-records', this.$.servicerequestcollection.collectionData);
		this.fire('show-wait-spinner', false);
	},
	_handleRecordDataRefreshedPrevious: function() {
		this.fire('subscribe-all-records', this.$.servicerequestcollection_previousmonth.collectionData);
		this._handleRecordDataRefreshed();
	},
	
	_handleRecordDataRefreshedPriotoPrevious: function() {
		this.fire('subscribe-all-records', this.$.servicerequestcollection_priortopreviousmonth.collectionData);
		this._handleRecordDataRefreshed();
	},
	 
	_updateRecordCount : function(count) {
		this.recordCount = count;
		this.fire('updatecount', {index: this.pageIndex, count: this.recordCount});
	},
	_getRecordCount : function(){
		return this.$.servicerequestcollection.totalCount+servicerequestcollection_previousmonth.totalCount+servicerequestcollection_priortopreviousmonth.totalCount
	},
	/**
	 * Hide priority section if no priority is defined on the record.
	 */
	showPriority: function(sr){
		if(sr.reportedpriority){
			if(sr.reportedpriority === 1){
				return false;
			}
			else{
				return true;
			}
		} else {
			return true;
		}
	},
	refreshContainerRecords: function (type) {
		//console.log(e.detail);
		
		if (type === 'recent') {
			this.$.servicerequestcollection.refreshRecords();
		}
		else {
			this.$.servicerequestcollection.refreshRecords();
			this.$.servicerequestcollection_previousmonth.refreshRecords();
			this.$.servicerequestcollection_priortopreviousmonth.refreshRecords();
		}
		this.fire('show-wait-spinner', true);
	},
	_handleDataError : function(e){
		//this.$.viewsr.toggleLoading(false);
		if (e.detail && e.detail.Error) {
			$M.alert(e.detail.Error.message);
		}
	},
	_removeRecord : function (ticketid) {
		var current = this.querySelector('.cardborder[data-ticketid="' + ticketid + '"]').parentNode;					
		current.remove();
		this._updateRecordCount(this.recordCount-1);
	},
	getLocaleDate : function(date){
		if(date){
			return new Date(date).toLocaleDateString();
		}
	},
	_checkCancellable : function(sr){ 
		if(((sr.status === 	this.srStatusQueued) || (sr.status === 	this.srStatusNew)) && 
			(Object.getOwnPropertyNames(sr.relatedwo).length===0) && 
			(Object.getOwnPropertyNames(sr.relatedticket).length ===0) && 
			(!sr.worklog) && 
			(!sr.hasactivity)) {
			return true;
		}
		else{
			return false;
		}
	},
	_onCancel : function(e) {
		var sr;
		if (e.detail) {
			sr = e.detail;
			this.cancelRequest(sr);
		}
	},
	cancelRequest : function(sr){
		var message;
		var ongoingRequestCard = this;
		var currentItem = this.querySelector('.cardborder[data-ticketid="'+sr.ticketid+'"]');
		if(currentItem){
			if (this._checkCancellable(sr)) {
				message = $M.localize('messages','mxapisr','srCancelled',[sr.ticketid]);
				var completeCallback = function(toOverlay) {
					$j(toOverlay).toggleClass('song2',true);
					$j(toOverlay).find('*').each(function(){
						$j(this).css({'pointer-events':'none'});
					});
					ongoingRequestCard._cancelRequest(sr);
				};
				var undoCallback = function() {
					delete ongoingRequestCard._requestsForCancelling[sr.ticketid];
				};
				this._requestsForCancelling[sr.ticketid] = {href:sr.href, status:'ready'};
				$M.createOverlay(currentItem, message, completeCallback, undoCallback, this.interval, this.$.ongoingsr.$.panelInternal, null);
			}
			else {
				var overlayButtonDiv = Polymer.Base.create('div', {'id':'overlaybuttondiv'+sr.ticketid, 'align': 'center'});
				var overlayButton = Polymer.Base.create('MAXIMO-LABEL', {'label':$M.localize('uitext','mxapibase','Ok')});
				overlayButtonDiv.appendChild(overlayButton);
				overlayButton.setAttribute('index',sr.ticketid);
				overlayButton.setAttribute('class','buttonInsideOverlay maximo-ongoingrequests-card');
				overlayButtonDiv.setAttribute('class', 'buttonDivInsideOverlay maximo-ongoingrequests-card');
				message = $M.localize('messages', 'mxapisr', 'srWorkInProgress', [sr.ticketid]);
				$M.createOverlay(currentItem, message, null, null, 3, this.$.ongoingsr.$.panelInternal, overlayButtonDiv);
			}
		}

	},
	updateCommentCount : function(e) {
		var eventData = e.detail;
		var index = eventData.index;
		var recordCount = eventData.recordCount;
		var comment = '';
		
		if (index === undefined) {
			return;
		}
		
		if(recordCount === 0 || recordCount === 1){
			comment = recordCount +' '+ $M.localize('uitext', 'mxapisr', 'comment');
		}
		else{
			comment =  recordCount +' '+ $M.localize('uitext', 'mxapisr', 'comments');
		}
		
		this.querySelectorAll('.commentButton')[index].label = comment;
	},
	
	/**
	 * Brings up details panel
	 */
	openDetails : function(e) {
		this.fire('open-sr-details', {'sr': e.model.sr, 'target': e.target, 'ticketIndex': e.model.index});
	},
	_isReportedBy: function(sr) {
		if (sr.reportedby && sr.reportedby.length !== 0) {
			return true;
		}
		else {
			return false;
		}
	},
	_updateAttachmentCount : function(e){
		var index = e.detail;
		this.querySelectorAll('.attachmentButton')[index].label = this.getAttachmentButton(this.recordData[index]);
	},
	_domChanged : function(){
		if(this.newTicketId){
			this.highlightCard(this.newTicketId);
		}
	},
	highlightCard : function(id){
		if(id){
			var targetCard = $j('.cardborder[data-ticketid="'+id+'"]');
			if(targetCard.length > 0){
				targetCard.addClass('highlight');
				setTimeout(function() {
					targetCard.removeClass('highlight');
				}, 3000);
				this.newTicketId = null;
			}
			else{
				this.newTicketId = id;
			}
		}
	},
	_triggerDetailsClose : function(e){
		this.fire('show-navbar');
		//this._highlightCard(e);
		var node = e.detail.node;
		node.updateCounters(true);
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
		var servicerequestcollection_current = this.$.servicerequestcollection;
		var firstDateCurrentMonth = this._convertDate(firstDayOfTheMonthDate);
		this.currentadditionalparams.push("internalvalues=1");
		// using opmodeor which makes ands become ors, aslo using reporteddate!="*" which means 'is null'
		this.currentadditionalparams.push("opmodeor=1&oslc.where=reportdate>=%22"+firstDateCurrentMonth+"T00:00:00%22 and reportdate!=%22*%22");
		
		this.previousmonthadditionalparams = [];
		var servicerequestcollection_previousmonth = this.$.servicerequestcollection_previousmonth;
		var firstDatePreviousMonth = this._convertDate(previousMonthFirstDate);
		this.previousmonthadditionalparams.push("internalvalues=1");
		this.previousmonthadditionalparams.push("oslc.where=reportdate>=%22"+firstDatePreviousMonth+"T00:00:00%22 and reportdate<%22"+firstDateCurrentMonth+"T00:00:00%22");
		
		this.priortopreviousmonthadditionalparams = [];
		var servicerequestcollection_previousmonth = this.$.servicerequestcollection_previousmonth;
		var firstDatePreviousMonth = this._convertDate(previousMonthFirstDate);
		this.priortopreviousmonthadditionalparams.push("internalvalues=1");
		this.priortopreviousmonthadditionalparams.push("oslc.where=reportdate<%22"+firstDatePreviousMonth+"T00:00:00%22");
	
		this.fire('show-wait-spinner', true);
		servicerequestcollection_current.refreshRecords();
		servicerequestcollection_previousmonth.refreshRecords();
		servicerequestcollection_priortopreviousmonth.refreshRecords();
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
	_cancelRequest : function(sr) {
		var that = this;
		this._requestsForCancelling[sr.ticketid].status = 'requested';
		// cancel request
		this.$.srResource.deleteRecord(sr.href).then(function() {
			console.log('cancel reqeuset : ' + sr.ticketid);
			delete that._requestsForCancelling[sr.ticketid];
//			that._removeRecord(sr.ticketid);
			that.refreshContainerRecords();
		});
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
	
  	_handleStatusDomainSet : function(e) {
  		if (this.domainStatusCollection.length > 0) {
  			var synonymdomain = this.domainStatusCollection[0].synonymdomain;
  			if (synonymdomain && synonymdomain.length > 0) {
  				for(var idx in synonymdomain) {
  					if (synonymdomain[idx].maxvalue === "QUEUED") {
  						this.srStatusQueued = synonymdomain[idx].value;
  					}
  					
  					if (synonymdomain[idx].maxvalue === "NEW") {
  						this.srStatusNew = synonymdomain[idx].value;
  					}
  				}
  			}
  		}else {
  			if ($M.checkSession(e)){
  				this.fire('value-data-error', e.detail.request.xhr.response);
  			}
  		}
    }

});
