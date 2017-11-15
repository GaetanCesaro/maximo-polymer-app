/*
* Licensed Materials - Property of IBM
* 5724-U18
* Copyright IBM Corporation. 2016,2017
*/
Polymer({
	is: 'maximo-sr-card',
  	behaviors: [BaseComponent],
  	
    properties: {
      	sr: {
      		type: Object,
      		value: function(){
      			return {};
      		},
      		observer : '_srChanged'
      	},
      	_template:{
      		type: Object
      	},
      	attachmentCounter: {
      		type: Number,
      		notify: true
      	},
      	commentCounter: {
      		type: Number,
      		notify: true
      	},
      	isHistory: {
      		type: Boolean,
      		notify: true
      	},
      	desktopStyle: {
      		type: String,
      		value: '',
      		observer: '_changeStyle'
      	}
	},
	attached: function () {
		/*var that = this;
		$j(this).ready(function() {
		    if(that.offsetHeight !== 0 && $M.screenInfo.device === 'desktop'){
		    	var target = that.$['viewsr-label-description'];
		    	var arr = that.querySelector('.description label').textContent.split('');
		    	while(target.scrollHeight > target.offsetHeight){
		    		arr.pop();arr.pop();arr.pop();
		    		that.querySelector('.description label').textContent = arr.join('')+'...';
		    	}
		    }
		});*/
	},
	
	_srChanged: function(newValue) {
		$j(this.$.viewSRCard).toggleClass('song2', false);
		$j(this.$.viewSRCard).find('*').each(function(){
			$j(this).css({'pointer-events':''});
		});

		this._showPriority(newValue);
		this.updateCounters(false);
	},
	
	/**
	 * Hide priority section if no priority is defined on the record.
	 */
	_showPriority: function(sr){
		var priorityNode = this.$.priorityLabel;
		priorityNode.classList.remove('invisible');
		if(sr.reportedpriority){
			if(sr.reportedpriority === 1){
				priorityNode.classList.remove('invisible');
			}
			else{
				priorityNode.classList.add('invisible');
			}
		} else {
			priorityNode.classList.add('invisible');
		}
	},
	setPriorityLabel : function(){
		return $M.localize('uitext', 'mxapisr', 'UrgentRequest').slice(0, -1);
	},
	_showLocation : function(sr) {
		var locationLabel = this.setLocation(sr);
		if (!locationLabel || locationLabel.length === 0) {
			return 'display:none;';
		}
		return '';
	},
	getLocaleDate : function(date){
		if(date){
			return new Date(date).toDateString();
		}
	},
	getCompletionDate: function(sr) {
		if (sr) {
			if (sr.actualfinish) {
				return this.getLocaleDate(sr.actualfinish);
			}
			else {
				return this.getLocaleDate(sr.statusdate);
			}
		}
	},
	_getDescription : function(sr){
		var description = sr.description?sr.description:'';
		var sep = '';
		if(description.length>0){
			sep = ' - ';
		}
		if(sr.description_longdescription && sr.description_longdescription.length>0){
			description = description + sep + sr.description_longdescription;	
		}
		return description;
	}, 
	_getReportedInfo: function(sr){
		var user = '';
		if(sr.reportedby !== $M.getMaxauth().whoami.userId){
			user = sr.reportedby;
		}
		else {
			user = $M.localize('uitext','maxpisr','you');
		}
		return $M.localize('uitext','mxapisr','CreatedByOn',[user, this.getLocaleDate(sr.reportdate)]);
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
	onTapCancel : function(e){
		//var index = e.model.index;
		//var sr = this.recordData[index];
		e.stopPropagation();
		var sr = this._template.itemForElement(e.target);
		this.fire('cancel-request',sr);
	},
	_mapButtonClass : function(sr){ // temporary function. need to clarify the condition of showing showmap button.
		var locationLabel = this.setLocation(sr);
		if (!locationLabel || locationLabel.length === 0) {
			return 'noLocation';
		}
		return '';
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
	
	showDetails: function(e) {
		if(!e.currentTarget.overlay || !e.currentTarget.overlay.contains(e.target)){
			this.fire('showdetails');
		}
	},
	
	_setCommentCounter : function(sr, skipCounter){
		var lastLogoutDate = $M.lastLogout();
		var counter = 0;
		if(skipCounter){
			$j(this.$.srCardCommentCount).toggleClass('newcomment', false);
			if(sr.worklog){
				this.commentCounter = sr.worklog.length;
			} else {
				this.commentCounter = 0;
			}
		} else {
			if(sr.worklog){
				sr.worklog.forEach(function(wlElement){
					var worklogDate = new Date(wlElement.modifydate).getTime();
					var logOutDate = new Date(lastLogoutDate).getTime();

					if(worklogDate>=logOutDate){
						counter++;
					}
				});

				if(counter>0){
					$j(this.$.srCardCommentCount).toggleClass('newcomment', true);
					this.commentCounter = counter+' '+ $M.localize('uitext','mxapisr','New');
				} else {
					$j(this.$.srCardCommentCount).toggleClass('newcomment', false);
					this.commentCounter = sr.worklog.length;
				}
			}
			else {
				$j(this.$.srCardCommentCount).toggleClass('newcomment', false);
				this.commentCounter = 0;
			}	
		}			
	},
	
	_getAttachmentCount : function(sr){
		return sr.doclinks.member.length;
	},
		
	_setAttachmentCounter : function(){
		var docs = this.sr.doclinks.member;
		if (docs && docs.length > 0) {
			this.attachmentCounter = docs.length;
		} else {
			this.attachmentCounter = 0;	
		}
	},
	
	_overdueClass: function(sr){
		if(!sr.targetfinish){
			return 'invisible';
		}
		return this.getLocaleDate(sr.targetfinish)<this.getLocaleDate(new Date())?'overdue':'';
	},
	_formatStatus: function(sr) {
		if (sr) {
			if (sr.status && (sr.status.toUpperCase() == 'RESOLVED' || sr.status.toUpperCase() == 'CLOSED')) {
				return ' (' + sr.status_description + ')';	
			}
		}
	},
	_updateAttachmentCount : function(e){
		var index = e.detail;
		this.querySelectorAll('.attachmentButton')[index].label = this.getAttachmentButton(this.recordData[index]);
	},
	/**
	 * triggered from ongoing card
	 */
	updateCounters: function(skipCounter) {
//		console.info('update counter');
//		console.log(this.sr);

		this._setCommentCounter(this.sr, skipCounter);
		this._setAttachmentCounter();
	},
	
	_hideCancelInHistory : function (sr){
		if(this._isHistory(sr)){
			return true;
		}
	},

	_isHistory: function(sr) {
		if (sr.status && (sr.status_maxvalue === 'RESOLVED' || sr.status_maxvalue === 'CLOSED')) {
			return true;
		}
		return false;
	},
	
	_changeStyle: function(newValue) {
		var cardNode = this.$.viewSRCard;
		cardNode.classList.remove('cardboardDesktop');
		if (newValue && newValue === 'true') {
			cardNode.classList.add('cardboardDesktop');
		}
	}
});
