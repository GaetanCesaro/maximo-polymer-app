/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-details-card',
  	behaviors: [BaseComponent,Polymer.IronResizableBehavior/*,Polymer.IronOverlayBehavior*/],
	properties : {
		title : {
			type : String
		},
		count : {
			type: String
		},
		recordData : {
			type: Object,
			notify : true
		},
		sr : {
			type : Object,
			observer: '_srChanged'
		},
		/**
		 * Node object from the previous list
		 */
		node: {
			type: Object,
			notify: true
		},
		ticketIndex :{
			type : String,
			notify : true
		},    	
    	searchTerms: {
    		type: String
    	},
		
		srDescription: {
			type: String,
			notify: true
		},
		
		createStatement: {
			type: String,
			notify: true
		},
		
		dueDateStatement: {
			type: String,
			notify: true
		},
		
		hidePriority: {
			type: Boolean,
			notify: true
		},
		
		hideLocation: {
			type: Boolean,
			notify: true
		},
		
		location: {
			type: String,
			notify: true
		},
		
		hideAsset: {
			type: Boolean,
			notify: true
		},
		
		asset: {
			type: String,
			notify: true
		},
		
		attachmentTitle: {
			type: String,
			notify: true
		},
		
		totalAttachments: {
			type: Number,
			notify: true
		},
		
		commenttTitle: {
			type: String,
			notify: true
		},
		
		totalComments: {
			type: Number,
			notify: true
		},
		
		workLogSet: {
			type: Array,
			notify: true
		},
		
		attachmentSet: {
			type: Array,
			notify: true
		},
		
		hidePreview: {
			type: Boolean,
			notify: true
		},
		
		hideUploading: {
			type: Boolean,
			value: true,
			notify: true
		},
		
		hideNetworkError: {
			type: Boolean,
			value: true,
			notify: true
		},
		
		attachPreview: {
			type: Object,
			notify: true
		},
		
		previewIndex: {
			type: Number,
			notify: true
		},
		
		isHistory: {
			type: Boolean,
			notify: true,
		},

		formattedTicketId: {
			type: String,
			notify: true
		},
		
		uploadingFileName: {
			type: String, 
			notify: true
		},
		/**
		 * Cancel add attachment process
		 */
		cancel : {
			type : Boolean,
			value : false
		},
	},
	listeners:{
	},
  	created : function(){
  	},
  	ready : function(){
  		this.$.maxsynonymdomain.fetchValue(); 
  		var that = this;
  		this.async(function(){
			this._windowResize();
		}, 100);
//  		$j(window).on('resize', function(){
//  			window.clearTimeout(this.resizeTimer);
//  			this.resizeTimer = window.setTimeout(function(){
//  				that._onWindowResize();
//  			}, 350);
//  		});
  	},
  	
  	attached : function(){
		this._fileSizeLimit = 0;
		this.$.maxfilesizeprop.fetchProperty();
	},
	_handleGetMaxFileSize: function(e) {
		console.log(e.detail);
		this._fileSizeLimit = e.detail;
	},
	_handleGetMaxFileSizeError: function(e) {
		console.log(e.detail);
	},
	
  	/**
  	 *  SR Observer
  	 */
  	_srChanged: function(newV, oldV) {
  		this.isHistory = this.setHistory(newV);
  		this.srDescription = this.setDescription(newV);
  		this.hidePriority = this.setPriority(newV);
  		this.createStatement = this.setCreation(newV);
  		this.dueDateStatement = this.setDueDate(newV);
  		
  		this.location = this.setLocation(newV);
  		this.asset = this.setAsset(newV);
  		
  		this.commenttTitle = this.setCommentTitle(newV);
  		this.totalComments = this.countComments(newV);
  		this.workLogSet = this.getWorkLogs(newV);
  		
  		this.attachmentTitle = this.setAttachmentTitle(newV);
  		this.totalAttachments = this.countAttachments(newV);
  		this.attachmentSet = this.getAttachments(newV);
  		this.formattedTicketId = this.formatTicketId(newV);
  		this.resetAttachmentsPreview();
  	},
  	
  	/**
  	 * Prepare SR description for display
  	 */
  	setDescription: function(sr) {
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
  	
  	/**
  	 * Prepare owner statement
  	 */
  	setCreation: function(sr) {
  		var user = '';
  		var date = sr.reportdate;
  		
  		if (sr.reportedby && date) {
			if(sr.reportedby !== $M.getMaxauth().whoami.userId){
				user = sr.reportedby;
			}
			else {
				user = $M.localize('uitext','maxpisr','you');
			}
			return $M.localize('uitext','mxapisr','CreatedByOn', [user, this.getLocaleDate(date)]);
  		}else {
  			return null;
  		}
  	},
  	
  	/**
  	 * Prepare estimated target
  	 */
  	setDueDate: function (sr) {
  		
//  		<maximo-field class$="completion {{_overdueClass(sr)}}" empty-value-string="{{localize('uitext','mxapisr','Pending')}}" label="{{localize('uitext','mxapisr','EstimatedCompletionDate')}}" datalabel="{{getLocaleDate(sr.targetfinish)}}"></maximo-field>
  		
		if (this.isHistory) {
			var dateString;
			if (sr.actualfinish) {
				dateString = this.getLocaleDate(sr.actualfinish);
			}
			else {
				dateString = this.getLocaleDate(sr.statusdate);
			}
			return $M.localize('uitext', 'mxapisr', 'CompletionDate') + ' ' + dateString;
		}
		else {
			var duedate;
	  		var due = sr.targetfinish;
	  		if (due) {
	  			duedate = this.getLocaleDate(due);
	  		}else {
	  			// duedate = $M.localize('uitext','mxapisr','Pending');
	  			// hide the field
	  			this.$.srDetailDueDate.classList.toggle('invisible');
	  		}
	  		
	  		return $M.localize('uitext', 'mxapisr', 'EstimatedCompletionDate') + ' ' + duedate;
		}
  	},
  	
  	/**
  	 * Prepare location
  	 */
  	setLocation : function(sr){
		var locationLabel;
		if(sr.location && sr.location.location){
			locationLabel = sr.location.location + ' ';
		}
		else{
			locationLabel = '';
		}
		if(sr.location && sr.location.description){
			locationLabel = locationLabel + sr.location.description;
		}
		else{
			locationLabel+='';
		}
		if(sr.serviceaddress && sr.serviceaddress.description){
			if(locationLabel !==''){
				locationLabel = locationLabel + ' - ' + sr.serviceaddress.description;
			}
			else{
				locationLabel = sr.serviceaddress.description;
			}
		}
		
		if (locationLabel.length > 0) {
			this.hideLocation = false;
		}else {
			this.hideLocation = true;
		}
		
		return locationLabel;
	},
	
	/**
  	 * Prepare location
  	 */
  	setAsset : function(sr){
		var assetLabel;
		
		if(sr.asset && sr.asset.description){
			assetLabel = sr.asset.description + ' ';
		}
		else{
			assetLabel = '';
		}
		if(sr.assetnum){
			assetLabel = assetLabel + '(' + sr.assetnum + ')';
		}
		else{
			assetLabel+='';
		}
		
		if (assetLabel.length > 0) {
			this.hideAsset = false;
		}else {
			this.hideAsset = true;
		}
		
		return assetLabel;
	},
	
	/**
  	 * Prepare attachment title
  	 */
	setAttachmentTitle : function(sr){
		if (sr.doclinks && sr.doclinks.member) {
			var len = sr.doclinks.member.length;
			if(len && len > 0){
				return $M.localize('uitext','mxapisr','Attachments');
			} else {
				return $M.localize('uitext','mxapisr','Attachment');
			}
		}
		else {
			return $M.localize('uitext','mxapisr','Attachment');
		}
  	},
  	
  	/**
  	 * Prepare attachment counter
  	 */
  	countAttachments: function (sr) {
  		if (sr.doclinks && sr.doclinks.member) {
  			var len = sr.doclinks.member.length;
	  		if (!len) {
	  			return 0;
	  		} else {
	  			return len;
	  		}
  		}
		else {
  			return 0;
  		}
  	},
  	
  	/**
  	 * Prepare attachment title
  	 */
	setCommentTitle : function(sr){
		
		var worklog = sr.worklog;
		if(worklog && worklog.length > 0){
			return $M.localize('uitext','mxapisr','Comments');
		}else{
			return $M.localize('uitext','mxapisr','Comment');
		}
  	},
  	
  	/**
  	 * Prepare comments counter
  	 */
  	countComments: function (sr) {
  		
  		var worklog = sr.worklog;
  		if (!worklog) {
  			return 0;
  		}else {
  			return worklog.length;
  		}
  	},

  	_showPlaceHolder: function(counter) {
  		if (counter > 0) {
  			return false;
  		}
  		return true;
  	},

  	_useFrame: function(counter) {
  		if (counter > 0) {
  			return 'frame';
  		}
  		return '';
  	},
  	
  	
  	/********** ATTACHMENTS SECTION functions START ************/
  	
  	/**
  	 * Set first attachment to preview mode
  	 */
  	resetAttachmentsPreview: function() {
  		this._setPreviewObject(0);
  	},
  	
  	/**
  	 * move to previous attachment
  	 */
  	previousAttachment: function (e) {
  		
  		
  		if (this.previewIndex > 0) {
//  			this.previewIndex--;
  			this._setPreviewObject(--this.previewIndex);
  		}
  	},
  	
  	/**
  	 * move to next attachment
  	 */
  	nextAttachment: function (e) {
//		this.previewIndex++;
  		this._setPreviewObject(++this.previewIndex);
  	},
  	
  	/**
  	 * set preview object for attachments
  	 */
  	_setPreviewObject: function(/*integer*/val) {
  		
  		var index = val;
  		var attachmentObj;
  		
  		var set = this.attachmentSet;
  		if (!set || set.length <= 0){
  			this.hidePreview = true;
  			
  			// reset preview href because of spinner
  			attachmentObj = {};
  			attachmentObj.href = '';
  			this.attachPreview = attachmentObj;
  			return;
  		}
  		
  		if (!index || index >= set.length) {
  			this.previewIndex = index = 0;
  		}
  		
  		var img = this.$.previewImgContainer;
  		img.children[0].style.maxHeight = (parseInt(this.offsetHeight)-180) + 'px';
  		
		attachmentObj = $M.cloneRecord(set[index]);
		attachmentObj.orghref = attachmentObj.href;
		attachmentObj.href +='?temp='+(new Date()).getTime();
  		attachmentObj.counter = (index+1) + '/' + (set.length);
  		//attachmentObj['hideBack'] = (index == 0) ? true : false;
  		attachmentObj.previourClass = (index === 0) ? 'invisible' : '';
  		//attachmentObj['hideNext'] = ((index == (set.length-1)) ? true : false);
  		attachmentObj.nextClass = (index === (set.length-1)) ? 'invisible' : '';
  		attachmentObj.label = this._getAttachmentItemLabel(set[index].description, index);
  		
  		this.$.previewWaitSpinner.hidden = false;

		this.attachPreview = attachmentObj;
		this.hidePreview = false;
  	},
  	
  	_loadedPreviewImage: function(e) {
  		if (e.detail && e.detail.value) {
  			this.$.previewWaitSpinner.hidden = true;
  		}
  	},
  	_errorPreviewImage: function(e) {
  		if (e.detail && e.detail.value) {
  			this.$.previewWaitSpinner.hidden = true;
  		}
  	},
  	
  	/**
  	 * Prepare attachments
  	 */
  	getAttachments: function (sr) {
  		var attachments;
  		if (sr.doclinks.member) {
  			attachments = sr.doclinks.member;
  		}
  		
  		var set = [];
  		if (attachments) {
  			for (var i = 0; i < attachments.length; i++) {
  				var attachItem = {
  						'href': attachments[i].href,
  						'description': attachments[i].describedBy.description,
  						'created': attachments[i].describedBy.created,
  						'format': attachments[i].describedBy.format.label
  					};
  				set.push(attachItem);
  			}
  		}
  		
  		set.sort(function(a,b){
    		  // Turn your strings into dates, and then subtract them
    		  // to get a value that is either negative, positive, or zero.
    		  return new Date(a.created) - new Date(b.created);
  		});
  		
		return set;
  	},
	
	/**
	 * Delete attachment
	 */
	deleteAttachment : function(e){
		
		var filename = this.attachPreview.description;
		//TODO in future replace by $M.localize('uitext', 'mxapisr', 'are_you_sure_delete')
		var message = 'Are you sure you want to delete ' + filename;
		this.$.deleteDialog.recordIndex  = this.previewIndex;
		this.$.deleteDialog.filename  = filename;
		this.$.deleteDialog.message = message;
		this.$.deleteDialog.hidden = false;
	},
	
	/**
	 * Listen response from dialog
	 */
	_deleteFile : function(e) {
		var attachment = this.attachPreview;
		this.$.attachmentResource.deleteAttachment(attachment.orghref);
		this.$.deleteDialog.hidden = true;
	},
	
	_handleAttachmentDeleted : function(jsonResponse){
		var delUrl = jsonResponse.detail.url;
		var members = this.sr.doclinks.member;
		
		for(var i=0; i< members.length; i++){
			if(members[i].href === delUrl){
				this.sr.doclinks.member.splice(i, 1);
				
				this.totalAttachments = this.countAttachments(this.sr);
				this.attachmentSet = this.getAttachments(this.sr);
				this.resetAttachmentsPreview();
				this._updatecount();
				
				break;
			}
		}		
	},
	
	_handleFileSelection: function(e, detail, sender){
		
		var fileList = e.target.files;
		var newFile = {};
		var that = this;
		
		if (fileList && fileList.length > 0) {
			$j(this.$.addAttachButton).addClass('addButton_disabled');
			
			this.hideUploading = false;
			if (this.totalAttachments === 0) {
				$j(this.$.attachmentContent).addClass('frame');
			}
			
			newFile.lastModified = fileList[0].lastModified;
			newFile.name = fileList[0].name;
			
			var atachmentDescription = fileList[0].name;

			this.uploadingFileName = this._getAttachmentItemLabel(atachmentDescription, this.totalAttachments);

			newFile.description = atachmentDescription;
			newFile.size = fileList[0].size;
			newFile.type = fileList[0].type;
			newFile.webkitRelativePath = fileList[0].webkitRelativePath;
		
			newFile.file = fileList[0];
			newFile.src = window.URL.createObjectURL(fileList[0]);
				
			var reader = new FileReader();
			
			reader.onloadend = function() { 
				if (Uint8Array) {
					newFile.content = new Uint8Array(reader.result);
				} else {
					newFile.content = reader.result; 
				}
				that._latestFile = newFile;
				that._handleAttachmentCreation(newFile);
			};
			
			reader.readAsArrayBuffer(fileList[0]);
		}
		
		e.stopPropagation();
		this.$.fileInput.value=null;
		return false;
	},
	
	/**
	 * request createAttachment function of maximo-collection
	 */
	_handleAttachmentCreation: function(file) {
		var that = this;
		
		try{
			this._latestLoaded = 0;
			this._latestTotal = 0;
			this._startUploadTime = new Date().getTime();
			
			this._refreshInterval = setInterval(function() {
				that._updateProgress(this._latestLoaded, this._latestTotal);
			}, this.updateTimeInterval * 1000);
			
			this.attachmentFileName = file.description;
			if (this.$.attachmentResource.urlTypeForFile && this.$.attachmentResource.urlTypeForFile.length > 0) {
				this.$.attachmentResource.createAttachment(this.sr.doclinks.href, file, 'doclinks{*}');
			} else {
				this.$.attachmentResource.getUrlType().then(
					function(result) {
						this.$.attachmentResource.urlTypeForFile = result;
						this.$.attachmentResource.createAttachment(this.sr.doclinks.href, file, 'doclinks{*}');
					}.bind(this), 
					function(error) {
					}
				);
			}
		}
		catch(err){
			if(err.message.includes('is not a valid HTTP header field value')){
				$M.notify(file.description+' is not a valid HTTP header field value',$M.alerts.warn);
			}
			this._removeProgressBar();
		}
	},

	_updateProgress:function(loaded, total) {
		if (!total) {
			return ;
		}
		
		var progressElement = this.$.attachmentProgress;
		var remainTimeElement = this.$.attachmentRemainTime;
		
		var currentTime = new Date().getTime();
		var speed = loaded / (currentTime - this._startUploadTime) * 1000;
		var remainTime = this._formatTime((total - loaded) / speed) ;

        if (remainTimeElement) {
        	remainTimeElement.label = remainTime;
        }
		
		var calc = parseInt(loaded / total * 100);

		if (progressElement)
		{
			progressElement.value = calc;
		}
		this._latestLoaded = loaded;
		this._latestTotal = total;
	},
	
	_handleAttachmentProgress: function(e) {
		var progressInfo = e.detail.value;
		console.log('_handleAttachmentProgress:'+ JSON.stringify(e.detail) );
		
		if (progressInfo && progressInfo.lengthComputable) {
			this._updateProgress(progressInfo.loaded, progressInfo.total);
		}
	},
	
	_handleAttachmentCreated : function(e) {
		if (e.detail.doclinks) {
			this.sr.doclinks = e.detail.doclinks;
		}
		else {
			this.sr.doclinks = e.detail;
		}
		
  		this.totalAttachments = this.countAttachments(this.sr);
  		this.attachmentSet = this.getAttachments(this.sr);
  		this._removeProgressBar();
		
  		this.previewIndex = (this.attachmentSet.length - 1);
  		this._setPreviewObject(this.previewIndex);

  		this._updatecount();
  		
  		this._latestFile = null;
	},
	
	_cancelAttachment: function(e)
	{
		e.stopPropagation();
		this._removeProgressBar();
		this.hideNetworkError = true;
		this.$.attachmentResource.abortCreateAttachment();
	},
	
	_retryAttachment: function(e) {
		e.stopPropagation();
		
		this.hideNetworkError = true;
		this._handleAttachmentCreation(this._latestFile);
	},
	
	_removeProgressBar: function() {
		clearInterval(this._refreshInterval);
		$j(this.$.addAttachButton).removeClass('addButton_disabled');
		this.hideUploading = true;
	},
	
	_formatTime: function (seconds) {
	    var date = new Date(seconds * 1000),
	        days = Math.floor(seconds / 86400);
	    days = days ? days + 'd ' : '';
	    return days +
	        ('0' + date.getUTCHours()).slice(-2) + 'h:' +
	        ('0' + date.getUTCMinutes()).slice(-2) + 'm:' +
	        ('0' + date.getUTCSeconds()).slice(-2) + 's';
	},
	
	_handleNetworkError: function() {
		this.hideNetworkError = false;
	},
	
	_notifyError : function(e){
		if(e.detail.request.status === 400){
			$M.notify($M.localize('uitext','mxapisr','UnsupportedFormat',[this.attachmentFileName]), $M.alerts.warn);
			this._removeProgressBar();
			$j(this.$.addAttachButton).removeClass('addButton_disabled');
		}
		else if(e.detail.request.status === 413){
			$M.notify($M.localize('uitext','mxapisr','FileExceedsLimit',[this.attachmentFileName, this._fileSizeLimit, 'MB']), $M.alerts.warn);
			this._removeProgressBar();
			$j(this.$.addAttachButton).removeClass('addButton_disabled');
		} else if (e.detail.request.status === 0 && e.detail.error.message !== 'Request aborted.') {
			this._handleNetworkError();
		} else if (e.detail.request.status === 0 && e.detail.error.message === 'Request aborted.') {
			
		} else {
			$M.notify('Unknown Error : ' + this.attachmentFileName, $M.alerts.warn);
			this._removeProgressBar();
			$j(this.$.addAttachButton).removeClass('addButton_disabled');
		}
	},
	
	/**
	 * Hooks button click with file input
	 */
	_addBtnClicked: function() {
		$j(this.$.fileInput).trigger('click');
	},
	
	/********** ATTACHMENTS SECTION functions END ************/
  	
  	/**
  	 * Show/Hide priority icon
  	 */
  	setPriority: function(sr) {
  		
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
  	
  	setHistory : function(sr){
  		// LK0 workaround due to bug on maximo-resource, it doesn't bring status_maxvalue also on workscape-selfservice.js
  		if (sr.forceHistory || (sr.status && (sr.status_maxvalue === 'RESOLVED' || sr.status_maxvalue === 'CLOSED'))) {
			return true;
		}
		return false;
  	},
  	
	/**
	 * Get label from attachment
	 */
  	_getAttachmentItemLabel : function(description, index){
		return (index+1) +'. '+ description;
	},
  	
	/**
	 * Cancelling request
	 */
	onTapCancel : function(e){	
		this.fire('cancel-request',this.sr);		
		this.close();
	},
	
	/********** COMMENTS SECTION functions START *******/
	
	/**
	 * Submit comment when enter is pressed
	 */
	_handleChange: function(e){
		if(e.keyCode===13){
			this._addComment();
		}
	},
	
  	/**
  	 * Prepare worklogs
  	 */
  	getWorkLogs: function (sr) {
  		
  		var worklog = sr.worklog;
  		var set = [];
  		if (worklog) {
  			for (var i = 0; i < worklog.length; i++) {
  				var chatEl = this.buildChatItem(worklog[i]);
  				set.push(chatEl);
  			}
  		}
  		
  		set.sort(function(a,b){
  		  // Turn your strings into dates, and then subtract them
  		  // to get a value that is either negative, positive, or zero.
  		  return new Date(a.date) - new Date(b.date);
  		});
		return set;
  	},
  	
  	/**
  	 * Prepare chat item
  	 */
  	buildChatItem: function(worklog) {
  		var chatItem = { 
			'label': this._getDescription(worklog),
			'date': worklog.createdate,
			'direction': this._getDirection(worklog),
			'maxwidth': this._getMessageWidth(),
			'person': worklog.person,
			'personImage': (worklog.person) ? worklog.person._imagelibref : null,
			'personFirstname': (worklog.person) ? worklog.person.firstname : null
		};
  		return chatItem;
  	},
	
	/**
	 * Include comment in section
	 * and saves in db
	 */
	_addComment : function() {
		
		var that = this;
		var responseProperties ='ticketid,worklog';
		var description = '';
		var description_longdescription = '';
		var merge = true;
	    var commentRequest = {
	    		'ticketid':'',
	    		'worklog' :[{}],
	    };
	    var newWorklog = {};

	    description_longdescription = this.$.inputComment.value.toString();
	    
	    if (description_longdescription) {
	    	var checkDescription = description_longdescription.trim();
		    
		    if (checkDescription.length === 0) {
		    	return;
		    }
	    }
	    else {
	    	return ;
	    }

	    description = description_longdescription.substr(0, 60);

	    if (description_longdescription.length > 60) {
	    	description += '...';
	    }
	    
		
		// ticketid of SR
		commentRequest.ticketid = this.sr.ticketid;

		// worklog data
		newWorklog.createby = $M.userInfo.personid;
		newWorklog.createdate = new Date();
		newWorklog.logtype = '!CLIENTNOTE!';
		newWorklog.description = description;
		newWorklog.description_longdescription = description_longdescription;
		newWorklog.class = this.classValue;
		newWorklog.clientviewable =  true;
		newWorklog.person =  $M.userInfo;
		
		commentRequest.worklog.push(newWorklog);
		
		// merge is true
		this.$.commentResource.updateRecord(commentRequest, responseProperties, merge).then(function(result) {
			var count = that.totalComments;
			//var comment = {description_longdescription:description_longdescription, createdate:newWorklog.createdate, createby:$M.userInfo.personid};
			that.addChatbubble(newWorklog);
			that.totalComments = parseInt(count) + 1;
			this._updatecount();
			this.$.inputComment.value = '';
		}.bind(this), function(error) {
			$M.showResponseError(error);
		});
	},
	
	/**
	 * Include recently added comment into chat history
	 */
	addChatbubble : function(comment){
		if (!this.sr.worklog){
			this.sr['worklog'] = [];
		}
		this.sr.worklog.push(comment);
		this.workLogSet = this.getWorkLogs(this.sr);
		
		this.$.wlTemplateRepeater.render();
		
		if($M.screenInfo.device === 'tablet' ||$M.screenInfo.device === 'phone') {
			this.updateScroll();
		}
	},
	
	_getDirection : function(wl){
		if(wl.createby === $M.userInfo.personid){
			return false;
		} else if (this.sr && (wl.createby === this.sr.reportedby)) {
			return false;
		} else if (this.sr && (wl.createby === this.sr.affectedperson)) {
			return false;
		}
		else {
			return true;
		}
	},
	
	updateScroll : function(){
		var element;
		if ( this.$.detailsPanel.classList.contains('desktopPanel') ) {
			element = this.$.detailsPanel.querySelector('.desktopChatContainer');
			element.scrollTop = element.scrollHeight;
		}else {
			element = this.$.detailsPanel.querySelector('.panelInternal');
			element.scrollTop = element.scrollHeight;
		}
	},
	
	_getMessageWidth : function(){
		if($M.screenInfo.device !== 'desktop'){
			return (parseInt(window.innerWidth - 132)) + 'px'; 
		}
		else{
			return '223px'; //chatWrapper width - 132px 
		}
	},
	
	_showPersonInfo : function(e) {
		if (e.target.direction) 
		{
//			this.$.personInformation.style.top = (e.target.offsetTop - 8) + 'px';	// minus padding size
//			this.$.personInformation.style.left = (e.target.offsetLeft - 8) + 'px';
			this.customStyle['--business-card-top'] = (e.target.offsetTop - 8) + 'px';
			this.customStyle['--business-card-left'] = (e.target.offsetLeft - 8) + 'px';
			$j(this.$.personInformation).removeClass('personInfoRightPos');
			$j(this.$.personInformation).addClass('personInfoLeftPos');
			
			
			$j(this.$.personInfoPictureBorder).removeClass('personInfoRightPictureBorder');
			$j(this.$.personInfoContentWrapper).removeClass('personInfoRightContentWrapper');
			$j(this.$.personInfoPictureWrapper).removeClass('personInfoRightPictureWrapper');
			
			$j(this.$.personInfoContentWrapper).addClass('personInfoLeftContentWrapper');
		}
		else {
//			this.$.personInformation.style.top = (e.target.offsetTop - 8) + 'px';	// minus padding size
//			this.$.personInformation.style.left = '';
//			this.$.personInformation.style.right = '8px';
			this.customStyle['--business-card-top'] = (e.target.offsetTop - 8) + 'px';
			this.customStyle['--business-card-right'] = (e.target.offsetLeft - 5) + 'px';
			$j(this.$.personInformation).removeClass('personInfoLeftPos');
			$j(this.$.personInformation).addClass('personInfoRightPos');

			
			$j(this.$.personInfoContentWrapper).removeClass('personInfoLeftContentWrapper');
			
			$j(this.$.personInfoPictureBorder).addClass('personInfoRightPictureBorder');
			$j(this.$.personInfoContentWrapper).addClass('personInfoRightContentWrapper');
			$j(this.$.personInfoPictureWrapper).addClass('personInfoRightPictureWrapper');
		}
		
		this.updateStyles();
		
		{
			$j('.personInfoIconContainer').css('max-height', '72px');

			var name = '';
			if (e.target.additionalInfo.firstname && e.target.additionalInfo.lastname) {
				name = e.target.additionalInfo.firstname + ' ' + e.target.additionalInfo.lastname;
			} else if (e.target.additionalInfo.firstname) {
				name = e.target.additionalInfo.firstname;
			} else if (e.target.additionalInfo.lastname) {
				name = e.target.additionalInfo.lastname;
			}
			this.$.personInfoName.label = name;
			this.$.personInfoImage.image = e.target.personImage;
			
			var infoCount = 0;
			
			if (e.target.additionalInfo.primaryemail || e.target.additionalInfo.primaryphone) {
				if (e.target.additionalInfo.primaryemail) {
					$j('.personInfoEmailLink').show();
					$j('.personInfoEmailLink').attr('href', 'mailto:' + e.target.additionalInfo.primaryemail);
					this.$.personInfoEmailContent.innerHTML = e.target.additionalInfo.primaryemail;
					infoCount++;
				}
				else {
					$j('.personInfoEmailLink').hide();
				}
				if (e.target.additionalInfo.primaryphone) {
					$j('.personInfoPhoneLink').show();
					$j('.personInfoPhoneLink').attr('href', 'tel:' + e.target.additionalInfo.primaryphone);
					this.$.personInfoPhoneContent.innerHTML = e.target.additionalInfo.primaryphone;
					infoCount++;
				}
				else {
					$j('.personInfoPhoneLink').hide();
				}
			}
			else {
				$j('.personInfoEmailLink').hide();
				$j('.personInfoPhoneLink').hide();
			}
			
			if ($M.screenInfo.device === 'phone') {
				this.$.personInfoIconContainerPhone.hidden = false;
				this.$.personInfoIconContainerDesktop.hidden = true;
				if (infoCount === 0) {
					$j('.personInfoIconContainer').css('max-height', '12px');
				}
			} else {
				this.$.personInfoIconContainerPhone.hidden = true;
				this.$.personInfoIconContainerDesktop.hidden = false;
				
				$j('.personInfoIconContainer').css('max-height', (72-30*(2-infoCount)) + 'px');
			}

			this.$.personInformation.open();
		}
	},
	
	/******* COMMENT SECTION functions END *******/
	
	open : function(callback) {
		var that = this;
		this.hidden = false;
		
		$j(this).off('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend');
		
		this.async(function() {
			if (callback) {
				$j(that).one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(e){
					if (e.target === that) {
						$j(that).off('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend');
						callback();
					}
				}); 
			}	
			$j(that).addClass('panel-slide-open');
		}, 100);
		
		if($M.screenInfo.device === 'desktop') {
			this._chatBubbleAddedCallback = function() {
				that.updateScroll();
			};
			
			this.$.chatHistory.addEventListener('dom-change', this._chatBubbleAddedCallback);
		} else {
			var internal = $j('.panelInternal');
			this._prevHeight = internal.height();

			this.addEventListener('iron-resize', this._resizeEvent);
		}
	},
	close : function() {
		var that = this;
		
		if ($M.screenInfo.device === 'desktop' && this._chatBubbleAddedCallback) {
			this.$.chatHistory.removeEventListener('dom-change', this._chatBubbleAddedCallback);
		}
		else {
			this.removeEventListener('iron-resize', this._resizeEvent);
		}

		$j(this).one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(e){
			if (e.target === that) {
				$j(that).off('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend');
				that.hidden = true;
			}
		 }); 
		$j(this).removeClass('panel-slide-open');
		this.fire('closecard', {'ticketid':this.sr.ticketid,'node':this.node});
	},

	_updatecount : function() {
		this.fire('updatecounter',{sr: this.sr, node: this.node});
	},
	
	_getDescription: function(wl) {
		if (wl.description_longdescription && wl.description_longdescription.length !== 0) {
			return wl.description_longdescription;
		} else if (wl.description && wl.description.length !== 0) {
			return wl.description;
		}
		return '';
	},
	
	_addBottomSpace: function() {
		if (this.isHistory) {
			this.$.commentDiv.classList.toggle('bottomSpace');
		}
	},
	
	formatTicketId: function(sr) {
		if (sr) {
			var text = sr.ticketid;
			if (sr.status && (sr.status.toUpperCase() == 'RESOLVED' || sr.status.toUpperCase() == 'CLOSED')) {
				return text + ' (' + sr.status_description + ')';	
			}
			return text;
		}
	},
	
	getLocaleDate : function(date){
		if(date){
			return new Date(date).toDateString();
		}
	},
	
	_windowResize : function(){
		var height;
		var orientation = $M.getOrientation();
		if($M.screenInfo.device === 'desktop'){ // for desktop mode -> fix side navbar
			height = parseInt(window.innerHeight);
			console.log('we\'re on a desktop');
			this.applyDesktopStyle();
		}
		else if($M.screenInfo.device === 'tablet' ||$M.screenInfo.device === 'phone'){ // for tablet mode
			if(orientation === 'portrait'){
				height = parseInt(window.innerHeight);
				if($M.screenInfo.device === 'tablet'){
					console.log('we\'re on a tablet portrait');
				}
				else{
					console.log('we\'re on a phone portrait');
				}
			}
			else{
				console.log('we\'re on a tablet or phone in landscape');
				height = parseInt(window.innerHeight)-30;
			}
			this.applyMobileStyle();
			
			this.updateScroll();
		}
		height+='px';
		//$j(this.$.main).css({'height':height});
	},
	
	_resizeEvent: function() {
		if (typeof this._prevHeight !== 'undefined') {
			var internal = $j('.panelInternal');
			var height = internal.height();
			var sctop = internal.scrollTop();
			var scheight = internal.prop("scrollHeight");
			
			// scroll screen if input commment is hidden by some reason such like showing screen keyboard and etc.
			// 60 is the size for comment input box.
			if (height < this._prevHeight && ((sctop + this._prevHeight) > (scheight - 60)) ) {
				internal.scrollTop(scheight);
			}
			
			this._prevHeight = height;
		}
	},
	
	applyDesktopStyle : function () {
		this.$.detailsPanel.classList.add('desktopPanel');
		
		this.$.mainDetails.classList.add('desktopDetails');
		this.$.chatWrapper.classList.add('desktopChatContainer');
		this.$.attachmentDiv.classList.add('desktopAttachmentSection');
		this.$.sectionWrapper.classList.add('desktopSectionWrapper');
		
		this.$.commentDiv.classList.add('desktopCommentSection');
		
		$j( this.$.column1Wrapper ).insertBefore( this.$.column2Wrapper );

		this.$.sendMessage.classList.add('sendMessageButtonIconDesktop');
	},
	
	applyMobileStyle : function () {
		this.$.detailsPanel.classList.remove('desktopPanel');
		
		this.$.mainDetails.classList.remove('desktopDetails');
		this.$.chatWrapper.classList.remove('desktopChatContainer');
		this.$.attachmentDiv.classList.remove('desktopAttachmentSection');
		this.$.sectionWrapper.classList.remove('desktopSectionWrapper');
		
		this.$.commentDiv.classList.remove('desktopCommentSection');
		
		$j( this.$.column1Wrapper ).insertAfter( this.$.column2Wrapper );
	},
	setPriorityLabel : function(){
		return $M.localize('uitext', 'mxapisr', 'UrgentRequest').slice(0, -1);
	},
	_handleGetValueFromDomain: function(e) {
  		this.classValue = e.detail;
  	},
  	_handleGetValueFromDomainError: function(e) {
  		console.log(e);
  	}
});
