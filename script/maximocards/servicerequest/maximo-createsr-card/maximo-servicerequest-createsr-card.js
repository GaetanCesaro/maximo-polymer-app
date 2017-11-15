/*
* Licensed Materials - Property of IBM
* 5724-U18
* Copyright IBM Corporation. 2016
*/
Polymer({
	is: 'maximo-servicerequest-createsr-card',
  	behaviors: [BaseComponent],
    properties: {
    	createSRURL : {
			type: Object,
			value: ''    		
    	},
    	selectedRecord: {
			type: Object,
			notify: true
		},
		hasAttachmentFiles : {
			type: Boolean,
			notify: true,
			value: false
		},
		reportedpriority: {
			type: Number,
			notify: true,
		},
		attachmentFiles: {
			type: Array,
			value: [],
			notify: true,
			observer: '_attachmentFilesChanged'			
		},
		groupBystatusData : {
			type: Object
		},
		groupBypriorityData : {
			type: Object
		},
		chartstatusdata : {
			type:Array
		},
		chartprioritydata : {
			type:Array
		},
		statuslabels : {
			type:Array
		},
		prioritylabels : {
			type:Array
		},
		statuschartoptions: {
			type: Object,
			value: {}
		},
		prioritychartoptions: {
			type: Object,
			value: {}
		},
		srstatusDataForChart : {
			type: Object
		},
		srpriorityDataForChart : {
			type: Object
		},
		assetrecord : {
			type: Object,
			notify: true
		}
	},
	ready: function()
	{
	},
	
	createSR: function() 
	{
		this.toggleLoading(true);
		var serviceRequest = {};
		serviceRequest.reportedby = $M.userInfo.personid;
		serviceRequest.reportdate = new Date();
		serviceRequest.affectedperson = $M.userInfo.personid;
		serviceRequest.description = this.$.summary.value;
		serviceRequest.description_longdescription = this.$.details.value;
		serviceRequest.reportedpriority = this.reportedpriority;
		if (this.selectedRecord)
		{
			serviceRequest.assetnum = this.selectedRecord.assetnum;
		}
		if (this.selectedLocationRecord)
		{
			serviceRequest.location = this.selectedLocationRecord.location;
		}
		this.$.csrcollection.createRecord(serviceRequest, 'ticketid,description');
	},
	
	_handleRecordCreationSuccess: function(e)
	{
		e.stopPropagation();
		
		// show a message that record is created successfully
		console.log('handleRecordCreationSuccess called! details = ' + e.detail);
		this.createdRecordResponse = e.detail; 	
		this.createdSRHref = e.detail.href;
		this.toggleLoading(false);
		this.fire('record-create-refresh', this.createdRecordResponse);
		$M.notify(this.localize('SR creation completed successfully.'), $M.alerts.info);
			
		// create srattachments if any
		//createAttachment: function(recordURI, attachmentData, responseProperties)
		if (this.attachmentFiles.length > 0)
		{
			this.$.csrcollection.createAttachment(this.createdSRHref + '/DOCLINKS', this.attachmentFiles[0], '*,doclinks{*}');
		}
		else
		{
			this.fire('record-create-refresh', this.createdRecordResponse);
		}
	},
	_handleRecordCreationDiscard: function(){
		this.fire('record-create-refresh', this.createdRecordResponse);
	},
	
	_handleRecordCreationFailure: function()
	{
		console.log('_handleRecordCreationFailure called.');
	},
	
	
	_attachmentFilesChanged: function(e)
	{
		console.log('attachmentFiles changed called!.....');
		if (this.attachmentFiles && this.attachmentFiles.length > 0)
		{
			this.hasAttachmentFiles = true;
		}
		else
		{
			this.hasAttachmentFiles = false;
		}
	},
	_handleAttachmentCreationSuccess: function(e)
	{
		e.stopPropagation();

		if (this.attachmentFiles.length > 0)
		{
			// remove the top one and if there are more, send them to server
			this.attachmentFiles.splice(0, 1);
			
			if (this.attachmentFiles.length > 0)
			{
				this.$.csrcollection.createAttachment(this.createdSRHref + '/DOCLINKS', this.attachmentFiles[0], '*,doclinks{*}');
				return;
			}
		}
		
		this.fire('record-create-refresh', this.createdRecordResponse);
	},
	
	/**
	 * Called when a user selected one or more files from the input file element
	 */
	_handleFileSelction: function(e, detail, sender)
	{
		console.log('csr-create-view _handleFileSelction called!');
		
		var fileList = detail;
		
		var aFiles = [];
		
		for (var i=0; i<fileList.length; i++)
		{
			var newFile = {};
			newFile.lastModified = fileList[i].lastModified;
			//newFile.lastModifiedDate = fileList[i].lastModifiedDate;
			newFile.name = fileList[i].name;
			
			var atachmentDescription = fileList[i].name;

			newFile.description = atachmentDescription;
			newFile.size = fileList[i].size;
			newFile.type = fileList[i].type;
			newFile.webkitRelativePath = fileList[i].webkitRelativePath;
		
			newFile.file = fileList[i];
			newFile.src = window.URL.createObjectURL(fileList[i]);
			newFile.isNew = true;

			aFiles.push(newFile);
			
			var self = this;
			var reader = new FileReader();
			reader.onloadend = function() { 
				newFile.content = reader.result; 
			};
	        reader.readAsArrayBuffer(fileList[i]);

	        var reader1 = new FileReader();
			reader1.onloadend = function() { 
				self.imageContent = reader1.result;
			};
	        reader1.readAsDataURL(fileList[i]);
		}
		
		this.set('attachmentFiles', aFiles);
		this.notifyPath('attachmentFiles', aFiles);
		
		this.$.srattachments.opened = true;
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
	_showImageView: function(e)
	{
		var selectedAttachmentIndex = e.model.index;		
		
		this.imageSource = this.attachmentFiles[selectedAttachmentIndex].src;
		this.imageDescription = this.attachmentFiles[selectedAttachmentIndex].description;
		
		var details = {};
		details.imageSource = this.imageSource;
		details.imageDescription = this.imageDescription;
		details.attachmentFiles = this.attachmentFiles;
		details.selectedAttachmentIndex = selectedAttachmentIndex;
		
		this.fire('show-image-view', details);
	},
	
	_handleRemoveAttachment: function(e)
	{
		console.log('_handleRemoveAttachment called!.................');
		
		var deleteIndex = e.model.index;
		this.attachmentFiles.splice(deleteIndex, 1);
		
		var newAttachmentFiles = [];
		
		for (var i=0; i < this.attachmentFiles.length; i++)
		{
			newAttachmentFiles.push(this.attachmentFiles[i]);
		}
		
		this.set('attachmentFiles', newAttachmentFiles);				
		this.notifyPath('attachmentFiles', newAttachmentFiles);				
	},
	_handlesrstatusDataRefreshed : function() {
  		this.$.srstatusdata.fetchGroupByData();
  	},

  	_handlesrpriorityDataRefreshed : function() {
  		this.$.srprioritydata.fetchGroupByData();
  	},

  	togglesrInput : function() {
  		this.$.srinputcollapse.toggle();
  	},
  	togglesolInput : function() {
  		this.$.solinputcollapse.toggle();
  	},
  	togglepriorityInput : function() {
  		this.$.priorityinputcollapse.toggle();
  	},
  	toggleassetInput : function() {
  		this.$.assetinputcollapse.toggle();
  	},
  	toggleattachmentInput : function() {
  		this.$.attachmentinputcollapse.toggle();
  	},
  	
  	selectedAsset: function(record) {
		this.assetrecord = record;
    },
    showAsset : function(e){
		$M.showDialog(this, 'select-asset', 'Select Asset', 'maximo-searchasset-card', false);	
	}
});
