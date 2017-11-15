/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-attachments-card',
  	behaviors: [BaseComponent],
	properties : {
		title : {
			type : String
		},
		ticketIndex :{
			type : String,
			notify : true
		},
		attachmentUrl :{
			type: String
		},
		attachmentFilename :{
			type: String
		},
		record : {
			type : Object,
		},
		recordCount :{
			type:Number,
			notify : true
		},
		recordData: {
			type : Object,
			notify : true
		},
		updateTimeInterval: {
			type : Number,
			value: 2
		}
	},
	listeners :{
	},
  	created : function(){
  	},
  	ready : function(){
  		console.log('ready');
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
	open : function(callback) {
		var that = this;
		this.hidden = false;
		
		// workaround to show the slide animation
		setTimeout(function() {
			if (callback) {
				$j(that)
				.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend',
				 function(e){
					if (e.target === that) {
						$j(that).off('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend');
						callback();
					}
				}); 
			}
			$j(that).addClass('panel-slide-open');
		}, 100);
	},
	close : function() {
		var that = this;
		
		$j(this)
		.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend',
		 function(e){
			if (e.target === that) {
				$j(that).off('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend');
				that.hidden = true;
				return false;
			}
		 }); 
		
		$j(this).removeClass('panel-slide-open');
		this.fire('closecard', this.ticketIndex);
	},
	getAttachmentItemLabel : function(attachment, index){
		return (index+1) +'. '+attachment.describedBy.description;
	},

	deleteAttachment : function(e){
		var filename = this.recordData[e.model.index].describedBy.description;
		var message = $M.localize('uitext','mxapisr','are_you_sure_delete',[filename]);
		this.$.deleteDialog.recordIndex  = e.model.index;
		this.$.deleteDialog.filename  = filename;
		this.$.deleteDialog.message = message;
		this.$.deleteDialog.hidden = false;
	},

	_deleteFile : function(e) {
		var fileInfo = e.detail;
		var attachment = this.recordData[fileInfo.recordIndex];
		
		this.$.attachmentResource.deleteAttachment(attachment.href);
	},		
	
	_handleAttachmentDeleted : function(jsonResponse){
		var delUrl = jsonResponse.detail.url;
		for(var i=0; i<this.recordData.length; i++){
			if(this.recordData[i].href === delUrl){
				this.recordData.splice(i, 1);
				this.updateRecordCount();
				this._reloadList();
				break;
			}
		}		
		this.$.deleteDialog.hidden = true;
	},
	_reloadList : function(){
		this.$.attachmentTemplate.render();
	},
	updateRecordCount : function(){
		this.recordCount = this.recordData.length;
		this.fire('on-updatecount', this.ticketIndex);
	},
	showPreview : function(e){
		
		if(e){
		var format = this.recordData[e.model.index].describedBy.format.label;
			var url = this.recordData[e.model.index].href+'?';
			this.attachmentFilename = this.recordData[e.model.index].describedBy.description;
			var checkAudFmt = this.attachmentFilename.toLowerCase();
			if(format.includes('image') || format==='video/mp4' || format === 'video/webm' || format === 'video/ogg' || checkAudFmt.includes('.mp3') || checkAudFmt.includes('.wav') || checkAudFmt.includes('.ogg')){
				e.preventDefault();
				var previewSlide = Polymer.Base.create('maximo-attachmentsprv-card',{'id':'attpreview','attachmentUrl': url, 'attachmentFilename': this.attachmentFilename, 'fileFormat': format,'hidden':true, supportSlide: true, downloadable:true});
				previewSlide.setAttribute('class','attachmentPreviewCard panel-slide maximo-attachments-card');
				this.insertBefore(previewSlide,this.children[0]);
			}
		}
	},
	_handleFileSelection: function(e, detail, sender)
	{
		var fileList = e.target.files;
		var newFile = {};
		var that = this;
		
		$j(this.$.addButton).addClass('addButton_disabled');
		
		if (fileList && fileList.length > 0) {
			newFile.lastModified = fileList[0].lastModified;
			newFile.name = fileList[0].name;
			
			var atachmentDescription = fileList[0].name;
	
			newFile.description = atachmentDescription;
			newFile.size = fileList[0].size;
			newFile.type = fileList[0].type;
			newFile.webkitRelativePath = fileList[0].webkitRelativePath;
		
			newFile.file = fileList[0];
			newFile.src = window.URL.createObjectURL(fileList[0]);
			newFile.isNew = true;
				
			var reader = new FileReader();
			
			this._handleAttachmentPreCreation();
			
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
			this.$.attachmentResource.createAttachment(this.record.doclinks.href, file, 'doclinks{*}');
		}
		catch(err){
			clearInterval(this._refreshInterval);
			if(err.message.includes('is not a valid HTTP header field value')){
				$M.notify(file.description+' is not a valid HTTP header field value',$M.alerts.warn);
				$j(this.querySelector('.attachmentItemDiv#progressBar')).remove();
			}
		}
	},
	_updateProgress:function(loaded, total) {
		if (!total) {
			return ;
		}
		
		var progressElement = this.querySelector('.attachmentItemDiv #progress');
		var remainTimeElement = this.querySelector('.attachmentItemDiv #remainTime');
		
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
		clearInterval(this._refreshInterval);
		if (e.detail.doclinks) {
			this.record.doclinks = e.detail.doclinks;
		}
		else {
			this.record.doclinks = e.detail;
		}
		this.recordData = this.record.doclinks.member;
		this._reloadList();
		this.updateRecordCount();
		$j(this.querySelector('.attachmentItemDiv#progressBar')).remove();
		$j(this.$.addButton).removeClass('addButton_disabled');
		
		this._latestFile = null;
	},
	_addBtnClicked: function() {
		$j(this.$.fileInput).trigger('click');
	},
   _computeStyle: function(ratio) {
        return 'width: ' + this.ratio + '%;';
      },
    _handleAttachmentPreCreation: function() {
    	var that = this;
		var index = this.recordData.length + 1;
		var overlay = Polymer.Base.create('div', {'id':'progressBar', 'index':index});
		
		var attachmentItemLeftDiv = Polymer.Base.create('div', {'align':'left'});
		var attachmentDiv = Polymer.Base.create('div', {'align':'left'});
		var attachmentNoItem = Polymer.Base.create('MAXIMO-LABEL', {'label':index + '. ', 'style': 'padding-right: 3px;'});
		var progressDiv = Polymer.Base.create('MAXIMO-PROGRESS', {'id': 'progress', 'min':0, 'max' : 100, 'value' : 0});
		var attachmentItem = Polymer.Base.create('MAXIMO-LABEL', {'id':'remainTime', 'label':'', 'style': 'text-align: center;'});

		var attachmentItemRightDiv = Polymer.Base.create('div', {'align':'right'});
//		var ironIcon = Polymer.Base.create('IRON-ICON', {'icon':'action-based:trash'});
		var cancelLabel = Polymer.Base.create('MAXIMO-LABEL', {'label':'Cancel'});

		overlay.setAttribute('class', 'attachmentItemDiv container flex style-scope maximo-attachments-card');
		attachmentItemLeftDiv.setAttribute('class','attachmentItemLeft style-scope maximo-attachments-card');
		attachmentDiv.setAttribute('class','container flex-equal-around-justified maximo-attachments-card');
	
		// left 
		attachmentNoItem.setAttribute('class','attachmentItem style-scope  maximo-attachments-card');
		attachmentItem.setAttribute('class','flexchild maximo-attachments-card');
		progressDiv.setAttribute('class','flexchild attachment-progress maximo-attachments-card');
		
		// right
		attachmentItemRightDiv.setAttribute('class','attachmentItemRight style-scope maximo-attachments-card');
		cancelLabel.setAttribute('class','deleteLabel maximo-attachments-card');
		cancelLabel.addEventListener('tap', function(e) {
			e.stopPropagation();
			clearInterval(that._refreshInterval);
			that.$.attachmentResource.abortCreateAttachment();
			$j(that.querySelector('.attachmentItemDiv#progressBar')).remove();
		});
		attachmentDiv.appendChild(attachmentNoItem);
		attachmentDiv.appendChild(progressDiv);
		attachmentDiv.appendChild(attachmentItem);
		
		attachmentItemLeftDiv.appendChild(attachmentDiv);
		
		attachmentItemRightDiv.appendChild(cancelLabel);
			
		overlay.appendChild(attachmentItemLeftDiv);
		overlay.appendChild(attachmentItemRightDiv);
			
		this.$.attachmentUploading.appendChild(overlay);
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
		var errorNotification = document.createElement('div');
		errorNotification.className = 'errorNotification maximo-attachments-card';
		
		var errorMsg = document.createElement('div');
		errorMsg.className = 'errorMessage maximo-attachments-card';
		var errorIcon = Polymer.Base.create('iron-icon', {'icon':'maximo-based:urgency'});
		errorIcon.setAttribute('class','errorMessage-icon maximo-attachments-card');
		var errorLabel = Polymer.Base.create('maximo-label', {'label':$M.localize('uitext','mxapisr','NetworkIssues')});
		errorLabel.setAttribute('class','errorMessage-label maximo-attachments-card');
		
		errorMsg.appendChild(errorIcon);
		errorMsg.appendChild(errorLabel);
		
		var retryButton = Polymer.Base.create('maximo-button', {'icon':'maximo-based:undocard', 'action':'action', 'label':$M.localize('uitext','mxapisr','TryAgain')} );
		retryButton.setAttribute('class','errorMessage-button maximo-attachments-card');
		
		var that = this;
		retryButton.onTap = function() {
			errorNotification.remove();
			that._handleAttachmentCreation(that._latestFile);
		};
		
		errorNotification.appendChild(errorMsg);
		errorNotification.appendChild(retryButton);

		var currentItem = this.querySelector('.attachmentItemDiv#progressBar');
		if (currentItem) {
			if (currentItem.children[0]) {
				currentItem.insertBefore(errorNotification, currentItem.children[0]);
			} else {
				currentItem.appendChild(errorNotification);
			}
		}
	},
	_notifyError : function(e){
		clearInterval(this._refreshInterval);
		if(e.detail.request.status === 400){
			$M.notify($M.localize('uitext','mxapisr','UnsupportedFormat',[this.attachmentFileName]), $M.alerts.warn);
			$j(this.querySelector('.attachmentItemDiv#progressBar')).remove();
			$j(this.$.addButton).removeClass('addButton_disabled');
		}
		else if(e.detail.request.status === 413){
			$M.notify($M.localize('uitext','mxapisr','FileExceedsLimit',[this.attachmentFileName, this._fileSizeLimit, 'MB']), $M.alerts.warn);
			$j(this.querySelector('.attachmentItemDiv#progressBar')).remove();
			$j(this.$.addButton).removeClass('addButton_disabled');
		} else if (e.detail.request.status === 0) {
			this._handleNetworkError();
		} else {
			$M.notify('Unknown Error : ' + this.attachmentFileName, $M.alerts.warn);
			$j(this.querySelector('.attachmentItemDiv#progressBar')).remove();
			$j(this.$.addButton).removeClass('addButton_disabled');
		}
	}
});
