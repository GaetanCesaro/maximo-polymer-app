/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-submitsr-attachment',
  	behaviors: [BaseComponent],
    properties: {
		label: {
			type: String,
			value: 'Panel'
		},
		icon: {
			type: String,
			value: 'title'
		},		
		title: {
			type: String,
			value: 'title'
		},
		attachments: {
			type : Object,
			notify : true,
			value: []
		},
		srHref: {
			type: String,
			notify: true
		},
		attachedCount: {
			type: Number,
			value: 0
		},
		/*
		 * Interval to update download status
		 */
		updateTimeInterval: {
			type: Number,
			value: 2
		}
	},
	ready: function() {
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
	attached: function() {
		this.$.bottomButtonsWrapper.hidden = true;
	},
	_goNext : function(e) {
		this.fire('go-nextdetail', {step:'Attachment', value: {description: this.attachedCount + ' Attachments', files: this.attachments}});
	},
	_skipStep: function(e) {
		this.fire('go-nextdetail', {step:'Attachment', value: {}});
	},
	initPage: function() {
		this.attachments = [];
		this.attachedCount = 0;
		this._fileIndex = {};
		this._refreshAttachmentMenus();
	},
	_onAttachmentYes : function(){
		$j(this.$.fileInput).trigger('click');
	},	
	_addMoreBtnClicked: function() {
		$j(this.$.fileInput).trigger('click');
	},
	
	/**
	 * request createAttachment function of maximo-resource
	 */
	_handleAttachmentCreation: function(file) {
		var that = this;
		
		this._latestLoaded = 0;
		this._latestTotal = 0;
		this.startUploadTime = new Date().getTime();
		
		this._refreshInterval = setInterval(function() {
			that._updateProgress(this._latestLoaded, this._latestTotal);
		}, this.updateTimeInterval * 1000);
		
		try{
			this.$.attachmentResource.addAttachmentToMemoryRecord(file, 'doclinks{*}');
		}
		catch(err){
			clearInterval(this._refreshInterval);
			if(err.message.includes('is not a valid HTTP header field value')){
				$M.notify(file.description+' is not a valid HTTP header field value',$M.alerts.warn);
				this._removeAttachmentItem(this._currentFileIndex);
			}
			this._setButtonEnable(true);
		}
	},
	_handleFileSelection: function(e, detail, sender)
	{
		var fileList = e.target.files;
		var newFile = {};
		var that = this;
		
		if (fileList && fileList.length > 0) {
			if (this.$.yesornoWrapper.hidden === false) {
				this.$.yesornoWrapper.hidden = true;
				this.$.attListWrapper.hidden = false;
				this.$.bottomButtonsWrapper.hidden = false;
				this._updateTitle();
			}
			
			this._setButtonEnable(false);
			
			newFile.lastModified = fileList[0].lastModified;
			newFile.name = fileList[0].name;
			
			var atachmentDescription = fileList[0].name;
	
			newFile.description = atachmentDescription;
			newFile.size = fileList[0].size;
			newFile.type = fileList[0].type;
			newFile.webkitRelativePath = fileList[0].webkitRelativePath;
		
			newFile.file = fileList[0];
			newFile.src = window.URL.createObjectURL(fileList[0]);
			newFile.complete = false;
	
			var addIndex = that.attachments.push(newFile);
			this._currentFileIndex = addIndex - 1;

			var reader = new FileReader();

			reader.onloadend = function() { 
				newFile.content = reader.result; 
				that._updateAttachementsTemplate();
				that._handleAttachmentCreation(newFile);
			};
			
			reader.readAsDataURL(fileList[0]);
		}
		
		e.stopPropagation();
		this.$.fileInput.value=null;
		return false;
	},
	_displayIndex: function(index) {
		return index + 1;
	},
	_updateTitle: function() {
		this.$.attachmentstep.title= $M.localize('uitext', 'mxapisr', 'AttachmentAdded', [this.attachedCount]);
	},
	_handleNetworkError: function(index) {
		var errorNotification = document.createElement('div');
		errorNotification.className = 'errorNotification maximo-submitsr-attachment';
		
		var errorMsg = document.createElement('div');
		errorMsg.className = 'errorMessage maximo-submitsr-attachment';
		var errorIcon = Polymer.Base.create('iron-icon', {'icon':'maximo-based:urgency'});
		errorIcon.setAttribute('class','errorMessage-icon maximo-submitsr-attachment');
		var errorLabel = Polymer.Base.create('maximo-label', {'label':$M.localize('uitext','mxapisr','NetworkIssues')});
		errorLabel.setAttribute('class','errorMessage-label maximo-submitsr-attachment');
		
		errorMsg.appendChild(errorIcon);
		errorMsg.appendChild(errorLabel);
		
		var retryButton = Polymer.Base.create('maximo-button', {'icon':'maximo-based:undocard', 'action':'action', 'label':$M.localize('uitext','mxapisr','TryAgain')} );
		retryButton.setAttribute('class','errorMessage-button maximo-submitsr-attachment');
		
		var that = this;
		retryButton.onTap = function() {
			errorNotification.remove();
			var file = that.attachments[index];
			that._handleAttachmentCreation(file);
		};
		
		errorNotification.appendChild(errorMsg);
		errorNotification.appendChild(retryButton);

		var currentItem = this.$.attListWrapper.querySelector('.attachmentItemDiv[data-index="' + index + '"]');
		if (currentItem) {
			if (currentItem.children[0]) {
				currentItem.insertBefore(errorNotification, currentItem.children[0]);
			} else {
				currentItem.appendChild(errorNotification);
			}
		}
	},
	_notifyError : function(e) {
		clearInterval(this._refreshInterval);
		if(e.detail.request.status === 400){
			$M.notify($M.localize('uitext','mxapisr','UnsupportedFormat',[this.attachments[this._currentFileIndex].description]), $M.alerts.warn);
			this._removeAttachmentItem(this._currentFileIndex);
		}
		else if(e.detail.request.status === 413){
			$M.notify($M.localize('uitext','mxapisr','FileExceedsLimit',[this.attachments[this._currentFileIndex].description, this._fileSizeLimit, 'MB']), $M.alerts.warn);
			this._removeAttachmentItem(this._currentFileIndex);
		} else if (e.detail.request.status === 0) {
			this._handleNetworkError(this._currentFileIndex);
		} else {
			$M.notify('Unknown Error : ' + this.attachments[this._currentFileIndex].description, $M.alerts.warn);
			this._removeAttachmentItem(this._currentFileIndex);
		}
		this._setButtonEnable(true);
	},
	_handleAttachmentCreated: function(e) {
		clearInterval(this._refreshInterval);
		
		if (!this._prevAttachmentIds) {
			this._prevAttachmentIds = [];
		}
		
		if (e.detail.doclinks && e.detail.doclinks.member && e.detail.doclinks.member.length > 0) {
			var newRecord;
			
			var doclinkList = e.detail.doclinks.member;
			
			for (var idx in doclinkList) {
				if (doclinkList[idx].describedBy && doclinkList[idx].describedBy.description === this.attachments[this._currentFileIndex].description) {
					if (this._prevAttachmentIds.indexOf(doclinkList[idx].describedBy.identifier) === -1) {
						newRecord = doclinkList[idx];
						this._prevAttachmentIds.push(newRecord.describedBy.identifier);
						break;
					}
				}
			}

			this.attachments[this._currentFileIndex].complete = true;
			this.attachments[this._currentFileIndex].attachmentid = newRecord.describedBy.identifier;
			this.attachments[this._currentFileIndex].href = newRecord.localref;
			this.attachments[this._currentFileIndex].format = newRecord.describedBy.format.label;
			
			this._updateAttachementsTemplate();
			
			this.attachedCount++;
			this._updateTitle();
			
			this._setButtonEnable(true);
		}
	},
	_setButtonEnable:function(enable) {
		if (enable) {
			$j(this.$.addMoreButton).removeClass('button_disabled');
			$j(this.$.attNextButton).removeClass('button_disabled');
			this.$.attNextButton.disabled = false;
		}
		else {
			$j(this.$.addMoreButton).addClass('button_disabled');
			$j(this.$.attNextButton).addClass('button_disabled');
			this.$.attNextButton.disabled = true;
		}
	},
	_handleAttachmentProgress: function(e) {
		if (e.detail && e.detail.value && e.detail.value.lengthComputable) {
			this._updateProgress(e.detail.value.loaded, e.detail.value.total);
		}
	},
	_updateAttachementsTemplate: function() {
		var newAttachments = [];
		for (var i=0; i < this.attachments.length; i++)
		{
			newAttachments.push($M.cloneRecord(this.attachments[i]));
		}
		this.attachments = newAttachments;
	},
	_cancelAttachment: function(e) {
		e.stopPropagation();
		
		clearInterval(this._refreshInterval);
		this.$.attachmentResource.abortAddAttachmentToMemoryRecord();
		var idx = e.currentTarget.getAttribute('data-index');
		if (idx !== null) {
			this._removeAttachmentItem(idx);
		}
		this._setButtonEnable(true);
	},
	_removeAttachmentItem: function(index) {
		this.attachments.splice(index, 1);
		this._updateAttachementsTemplate();	
		this._refreshAttachmentMenus();
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
	_refreshAttachmentMenus: function() {
		if (this.attachments.length > 0) {
			this._updateTitle();
			this.$.yesornoWrapper.hidden = true;
			this.$.attListWrapper.hidden = false;
			this.$.bottomButtonsWrapper.hidden =false;
		}
		else {
			this.$.attachmentstep.title= $M.localize('uitext', 'mxapisr', 'AttachmentStep');
			this.$.yesornoWrapper.hidden = false;
			this.$.attListWrapper.hidden = true;
			this.$.bottomButtonsWrapper.hidden = true;
		}
	},
	_updateProgress: function(loaded, total) {
		if (!total) {
			return ;
		}
		var progressBar = this.$.attListWrapper.querySelector('.attachmentProgress[data-index="' + this._currentFileIndex + '"]');
		var timeReaminLabel = this.$.attListWrapper.querySelector('.attachmentRemainTime[data-index="' + this._currentFileIndex + '"]');
		
		var currentTime = new Date().getTime();
		var speed = loaded / (currentTime - this.startUploadTime) * 1000;
		var remainTime = this._formatTime((total - loaded) / speed) ;
        
        if (timeReaminLabel) {
        	timeReaminLabel.label = remainTime;
        }
		
		var calc = parseInt(loaded / total * 100);

		if (progressBar)
		{
			progressBar.value = calc;
		}
		this._latestLoaded = loaded;
		this._latestTotal = total;
	},
	_showPreview : function(e) {
		var format = this.attachments[e.model.index].format;
		
//		var url = this.attachments[e.model.index].href+'?id='+'"'+Date.now()+'"';
		var url = this.attachments[e.model.index].content;
		
		this.attachmentFilename = this.attachments[e.model.index].description;
		var checkAudFmt = this.attachmentFilename.toLowerCase();
		if(format.includes('image') || format==='video/mp4' || format === 'video/webm' || format === 'video/ogg' || checkAudFmt.includes('.mp3') || checkAudFmt.includes('.wav') || checkAudFmt.includes('.ogg')){
			e.preventDefault();
			var previewSlide = Polymer.Base.create('maximo-attachmentsprv-card',{'id':'attpreview','attachmentUrl': url, 'attachmentFilename': this.attachmentFilename, 'fileFormat': format,'hidden':true, 'supportSlide':'true'});
			previewSlide.setAttribute('class','attachmentPreviewCard panel-slide maximo-submitsr-attachment');
			this.insertBefore(previewSlide,this.children[0]);
		}
	},
	_deleteAttachment: function(e) {
		e.stopPropagation();
		
		var idx = e.currentTarget.getAttribute('data-index');

		var filename = this.attachments[idx].description;
		
		var message = $M.localize('uitext','mxapisr','are_you_sure_delete',[filename]);
		this.$.deleteDialog.recordIndex  = idx;
		this.$.deleteDialog.filename  = filename;
		this.$.deleteDialog.message = message;
		this.$.deleteDialog.hidden = false;
	},
	_deleteFile : function(e) {
		e.stopPropagation();
		
		var that = this;
		
		var idx = e.detail.recordIndex;
		
		if (idx !== null) {
			this.$.attachmentResource.removeAttachmentFromMemoryRecord(this.attachments[idx].href).then(function() {
				that.attachedCount--;
				that._removeAttachmentItem(idx);
				that.$.deleteDialog.hidden = true;
			});
		}	
	},		
	renderPage: function(submitInfo, stackData) {
		// refresh screen menu
		this._refreshAttachmentMenus();
		
		var newStackData = [];
		if (stackData) {
			for (var idx = stackData.length -1; idx>=0; idx--) {
				if (stackData[idx].data && stackData[idx].data.length !== 0) {
					newStackData.push($M.cloneRecord(stackData[idx]));
				}
			}
		}
		
		this.$.attachmentstep.setStackList(newStackData);
	}
});
