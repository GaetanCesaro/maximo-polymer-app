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
			value: 'SERVICEREQUESTWITHSUBSCRIBED',
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
	},
  	listeners: {
  		'on-updatecount' : '_updateAttachmentCount',
  		'refresh-page' : 'refreshContainerRecords',
  		'cancel-request' : '_onCancel'
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
		this.deviceMode = $M.screenInfo.device;
		window.addEventListener('unload', function(e) {
			that._processAllCancelRequest();
			that._processAllUnsubscribeRequest();
		});
		window.addEventListener('beforeunload', function(e) {
			that._processAllCancelRequest();
			that._processAllUnsubscribeRequest();
		});
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
	_triggerCancel: function(e) {
		
		console.log('hooking cancel request');
		
		var sr = e.detail.sr;
		var list = this.$.viewSRDataList;
		var compId = 'ongoingsrcard_' + e.detail.index;
		var srCard = list.querySelector('maximo-sr-card[original-id="' + compId + '"]');
		if (srCard && typeof srCard.onTapCancel === 'function') {
			srCard.onTapCancel(e);
		}

	},
	_getBookmark : function(ticketuid) {
		this.$.bkResource.resourceUri = $M.getMaxauth().baseUri + '/oslc/os/mxapibookmark?savedQuery=SERVICEREQUESTBOOKMARK&lean=1&oslc.where=keyvalue=' + ticketuid + '&oslc.select=*';
		
		return new Promise(function (resolve, reject) {
			this.$.bkResource.loadRecord().then(function(result){ 
				resolve(result); 
			}, 
			function(error, response) { 
				reject(error); 
			});
		}.bind(this));
	},
	_unsubscribeRequest : function(ticketid, ticketuid) {
		var that = this;
		
   	    // unsubscribe request
   	   	this._getBookmark(ticketuid).then(function(bookmark) {
			console.log('get bookmark');
			if (bookmark.member[0]) {
				var href = bookmark.member[0].href;
				
				that._requestsForUnsubscribing[ticketid].status = 'requested';
				that.$.bkResource.deleteRecord(href).then(function() {
//					console.log(keyvalue + ' bookmark deleted');
					delete that._requestsForUnsubscribing[ticketid];
					that._removeRecord(ticketid);
				});					
			}
   	    });
		
		console.log('_unsubscribeRequest end');
	},
	_handleRecordDataRefreshed: function()
	{
		console.log('_handleRecordDataRefreshed');
		this._updateRecordCount(this._getRecordCount());
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
	refreshContainerRecords: function () {
		console.log('refreshContainerRecords');
		this.refreshAllSections();
	},
	_handleDataError : function(e){
		//this.$.viewsr.toggleLoading(false);
		if (e.detail && e.detail.Error) {
			$M.alert(e.detail.Error.message);
		}
	},
	_showDueDate : function(sr) {
		if (!sr.targetfinish || sr.targetfinish.legnth === 0) {
			return 'display: none;';
		}
		if($M.screenInfo.device !=='phone'){
			return '';
		}
		else{
			return 'padding-top:10px;';
		}
		
	},
	_showDescription : function(sr) {
		if ((!sr.description || sr.description.length === 0) && (!sr.description_longdescription || sr.description_longdescription.length === 0)) {
			return true;
		}
		return false;
	},
	_showNewComments : function(sr) {
		//filter worklog where worklog(modifydate) > logintracking(attemptdate)
		//displaynewcount otherwise hide.
	},
	_showLocation : function(sr) {
		var locationLabel = this.setLocation(sr);
		if (!locationLabel || locationLabel.length === 0) {
			return 'display:none;';
		}
		return '';
	},
	_removeRecord : function (ticketid) {
		var current = this.querySelector('.cardborder[data-ticketid="' + ticketid + '"]');					
		current.remove();
		this._updateRecordCount(this.recordCount-1);
	},
	getLocaleDate : function(date){
		if(date){
			return new Date(date).toLocaleDateString();
		}
	},
	setDescription : function(sr){
		if (sr.description && sr.description_longdescription){
			return sr.description+' - ' + sr.description_longdescription;
		} else if (sr.description) {
			return sr.description;
		}else if (sr.description_longdescription) {
			return sr.description_longdescription;
		} else {
			return '';
		}
	},
	setLocation : function(sr){
		var locationLabel;
		if(sr.location.location){
			locationLabel = sr.location.location + ' ';
		}
		else{
			locationLabel = '';
		}
		if(sr.location.description){
			locationLabel = locationLabel + sr.location.description;
		}
		else{
			locationLabel+='';
		}
		if(sr.serviceaddress.description){
			if(locationLabel !==''){
				locationLabel = locationLabel + ' - ' + sr.serviceaddress.description;
			}
			else{
				locationLabel = sr.serviceaddress.description;
			}
		}
		return locationLabel;
	},
	getCancelButton : function(sr){
		if(sr.reportedby === $M.userInfo.personid || sr.affectedperson === $M.userInfo.personid) {
			return false;
		}
		else{
			return true;
		}
	},
	getUnsubButton : function(sr){
		if(sr.reportedby === $M.userInfo.personid || sr.affectedperson === $M.userInfo.personid) {
			return true;
		}
		else{
			return false;
		}
	},
	_checkCancellable : function(sr){ 
		if(((sr.status === 'QUEUED') || (sr.status === 'NEW')) && (Object.getOwnPropertyNames(sr.relatedwo).length===0) && (Object.getOwnPropertyNames(sr.relatedticket).length ===0) && (!sr.worklog)){
			return true;
		}
		else{
			return false;
		}
	},
	_onCancel : function(e){
		//var index = eindex;
		var sr = e.detail.sr;
		var timer;
		var ticketid = sr.ticketid;
		var that = this;
		
		if (this._checkCancellable(sr)) {
			
			var currentItem = this.querySelector('.cardborder[data-ticketid="'+ticketid+'"]');
			var message = 'Request #'+ticketid + ' was cancelled';
			
			var completeCallback = function() {
				that._cancelRequest(sr);
			};
			var undoCallback = function() {
				delete that._requestsForCancelling[ticketid];
			};
			this._requestsForCancelling[ticketid] = {href:sr.href, status:'ready'};
			$M.createUndo(currentItem, message, completeCallback, undoCallback, this.interval);
		}
		else {
			this._showOverlay(sr.ticketid, 'Request #'+ticketid + ' can not be cancelled. Work has already began on this request.', '', 'Ok', function() {
				// clicked button on overlay
				that._closeOverlay(ticketid);
				if (timer) {
					window.clearTimeout(timer);
				}
			});
			
			timer = window.setTimeout(function() {
				that._closeOverlay(ticketid);
			}, this.interval * 1000);
		}
	},
	_showOverlay : function(id, message, buttonIcon, buttonLabel, callback){// need to improve...
		var overlay = Polymer.Base.create('div', {'id':'overlay'+id, 'align': 'center', 'index':id});
		var overlayChild = Polymer.Base.create('div', {'id':'overlayChild'+id});
		var overlayMessage = Polymer.Base.create('MAXIMO-LABEL', {'label':message});
		var overlayButton = Polymer.Base.create('MAXIMO-LABEL', {'label':buttonLabel});
		var overlayButtonDiv = Polymer.Base.create('div', {'id':'overlaybuttondiv'+id, 'align': 'center', 'index':id});
		
		if(buttonIcon !== ''){
			var overlayButtonIcon = Polymer.Base.create('IRON-ICON', {'icon':buttonIcon});
			overlayButtonIcon.setAttribute('class','buttonIconInsideOverlay maximo-ongoingrequests-card');
			overlayButtonDiv.appendChild(overlayButtonIcon);
		}
		overlay.setAttribute('class','overlay maximo-ongoingrequests-card');
		overlay.setAttribute('index',id);
		overlayChild.setAttribute('class','overlayChild maximo-ongoingrequests-card');
		overlayMessage.setAttribute('class','overlayMessage maximo-ongoingrequests-card');
		overlayButton.setAttribute('index',id);
		overlayButton.setAttribute('class','buttonInsideOverlay maximo-ongoingrequests-card');
		
		overlayButtonDiv.setAttribute('class', 'buttonDivInsideOverlay maximo-ongoingrequests-card');
		overlayButtonDiv.addEventListener('click', callback);
		overlayButtonDiv.appendChild(overlayButton);
		
		overlayChild.appendChild(overlayMessage);
		overlayChild.appendChild(Polymer.Base.create('br', {}));
		overlayChild.appendChild(overlayButtonDiv);
		
		overlay.appendChild(overlayChild);
		
		var currentItem = this.querySelector('.cardborder[data-ticketid="'+id+'"]');
		if (currentItem && currentItem.children[0]) {
			// adjust overlay size
			overlay.style.height=parseInt(currentItem.clientHeight - 1)+'px';
			overlay.style.width=parseInt(currentItem.clientWidth -1)+'px';
			currentItem.insertBefore(overlay, currentItem.children[0]);
		}
	},
	_closeOverlay : function(id){
		this.querySelector('.overlay[index="'+id+'"]').remove();
	},
	/* clicked unsubscribe btn */
	onTapUnsubscribe : function(e) {
		var index = e.model.index;
		var sr = this.recordData[index];
		var ticketid = sr.ticketid;
		var message,buttonLabel,buttonIcon;
		var that = this;
		
		this._requestsForUnsubscribing[ticketid] = {ticketuid : sr.ticketuid, status:'ready'};
		
		message = 'You are no longer subscribed to request #'+ticketid+'.';
		buttonLabel = 'Undo';
		buttonIcon = 'maximo-based:undocard';
		
		var currentItem = this.querySelector('.cardborder[data-ticketid="'+ticketid+'"]');
		
		var completeCallback = function() {
			that._unsubscribeRequest(ticketid, sr.ticketuid);
		};
		
		var undoCallback = function() {
			delete that._requestsForUnsubscribing[ticketid];
		};
		
		$M.createUndo(currentItem, message, completeCallback, undoCallback, this.interval);
	},
	toggleButton : function(e){ //need better performance..
		var toggle = $j('.divrightButtons')[e.model.index].children[0].style.display;
		if(toggle === 'block'){
			$j('.divrightButtons')[e.model.index].children[0].style.display = 'none';
			$j('.divrightButtons')[e.model.index].children[1].style.display = 'block';
			$j('.infoCollapse')[e.model.index].toggle();
		}
		else{
			$j('.divrightButtons')[e.model.index].children[0].style.display = 'block';
			$j('.divrightButtons')[e.model.index].children[1].style.display = 'none';
			$j('.infoCollapse')[e.model.index].toggle(); 
		}
	},
	collapseOpened : function(){
		if($M.screenInfo.device === 'phone'){
			return false;
		}
		else{
			return true;
		}
	},
	showRightButtons : function(){
		if($M.screenInfo.device === 'phone'){
			return 'display:block;';
		}
		else{
			return 'display:none;';
		}
	},
	getClassForChildDiv : function(ratio){
		if($M.screenInfo.device !== 'phone'){
			return 'flex'+ratio+'child';
		}
		else{
			return '';
		}
	},
	getClassForParentDiv : function(){
		if($M.screenInfo.device !== 'phone'){
			return 'container flex-horizontal-with-ratios';
		}
		else{
			return '';
		}
	},
	setDueClass : function(){
		if($M.screenInfo.device !=='phone'){
			return 'srDesktopDueClass';
		}
		else{
			return 'srdueclass';
		}
	},
	_showShowmapButton : function(sr){ // temporary function. need to clarify the condition of showing showmap button.
		var locationLabel = this.setLocation(sr);
		if (!locationLabel || locationLabel.length === 0) {
			return 'display:none;';
		}
		return '';
	},
	openComment : function(e) {
		var that = this;
		this.$.commentsCard.sr = e.model.sr;
		this.$.commentsCard.ticketIndex = e.model.index;
		this.$.commentsCard.open(function() {
			that.fire('hide-navbar');
		});
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
		var that = this;
		this.$.detailsCard.sr = e.model.sr;
		this.$.detailsCard.ticketIndex = e.model.index;
		this.$.detailsCard.open(function() {
			that.fire('hide-navbar');
		});
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
	getCommentButton : function(sr){
		if(sr.worklog){
			if(sr.worklog.length === 1){
				return sr.worklog.length +' '+ $M.localize('uitext', 'mxapisr', 'Comment');
			}
			else{
				return sr.worklog.length +' '+ $M.localize('uitext', 'mxapisr', 'Comments');
			}
		}
		else{
			return '0'+' '+ $M.localize('uitext', 'mxapisr', 'Comment');
		}
	},
	getAttachmentButton : function(sr){
		var len = sr.doclinks.member.length;
		if(len!==0){
			if(len === 1){
				return len +' '+ $M.localize('uitext', 'mxapisr', 'Attachment');
			}
			else{
				return len +' '+ $M.localize('uitext', 'mxapisr', 'Attachments');
			}
		}
		else{
			return '0'+' '+ $M.localize('uitext', 'mxapisr', 'Attachment');
		}
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
	highlightCard : function(e){
		this.fire('show-navbar');
	},
	queryRecordsByTimeLine : function(e){
		//todays date and time
		var currentDateTime = new Date();
		
		//first date of the current month
		var firstDayOfTheMonthDate = new Date(currentDateTime.getFullYear(), currentDateTime.getMonth(), 1);
		
		//first date of the previous month
		var currentMonthFirstDate = new Date(firstDayOfTheMonthDate);
		var previousMonthFirstDate =  new Date(currentMonthFirstDate.setMonth(currentMonthFirstDate.getMonth() - 1));
		
		this.currentadditionalparams = [];
		var servicerequestcollection_current = $M.getGlobalResource('servicerequestcollection');
		var firstDateCurrentMonth = this._convertDate(firstDayOfTheMonthDate);
		this.currentadditionalparams.push("oslc.where=reportdate>=%22"+firstDateCurrentMonth+"T00:00:00%22");
		
		this.previousmonthadditionalparams = [];
		var servicerequestcollection_previousmonth = $M.getGlobalResource('servicerequestcollection_previousmonth');
		var firstDatePreviousMonth = this._convertDate(previousMonthFirstDate);
		this.previousmonthadditionalparams.push("oslc.where=reportdate>=%22"+firstDatePreviousMonth+"T00:00:00%22 and reportdate<%22"+firstDateCurrentMonth+"T00:00:00%22");
		
		this.priortopreviousmonthadditionalparams = [];
		var servicerequestcollection_previousmonth = $M.getGlobalResource('servicerequestcollection_previousmonth');
		var firstDatePreviousMonth = this._convertDate(previousMonthFirstDate);
		this.priortopreviousmonthadditionalparams.push("oslc.where=reportdate<%22"+firstDatePreviousMonth+"T00:00:00%22");
	
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
	
	refreshAllSections : function(){
		this.$.servicerequestcollection.refreshRecords();
		this.$.servicerequestcollection_previousmonth.refreshRecords();
		this.$.servicerequestcollection_priortopreviousmonth.refreshRecords();
	},
	_cancelRequest : function(sr) {
		var that = this;
		this._requestsForCancelling[sr.ticketid].status = 'requested';
		// cancel request
		this.$.srResource.deleteRecord(sr.href).then(function() {
			console.log('cancel reqeuset : ' + sr.ticketid);
			delete that._requestsForCancelling[sr.ticketid];
			that._removeRecord(sr.ticketid);
		});
	},

});
