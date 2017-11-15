/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-submitsr-review',
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
		requestorName: {
			type: String
		},
		requestorEmail: {
			type : String
		},
		affectedPersonName :{
			type: String
		},
		dataList :{
			type: Object
		}
	},
	ready: function()
	{
		if($M.screenInfo.device === 'desktop'){
			$j(this.querySelector('.reviewMain')).addClass('flex-horizontal-with-ratios');
			$j(this.querySelector('.titlePanel')).addClass('flexchild leftPanel');
			$j(this.querySelector('.dataPanel')).addClass('flexchild rightPanel');
			this.querySelector('.submitDivPhone').style.display='none';
		}
		else{
			$j(this.querySelector('.templateHeader')).addClass('templateHeaderPhone');
			$j(this.querySelector('.reviewMain')).addClass('reviewMainPhone');
			this.querySelector('.submitDiv').style.display = 'none';
			this.querySelector('.triangleLeft').style.display ='none';
		}
	},
	attached : function(){
		if($M.screenInfo.device === 'desktop'){
			$j(this.querySelector('.dataPanel')).addClass('dataPanelDesktop');
		}
		this.requestorName = $M.userInfo.displayname;
		this.requestorEmail = $M.userInfo.primaryemail; 
		//this.affectedPersonName = $M.localize('uitext', 'mxapisr','OnBehalfOf')+ ' Andrew Smith'; // need to fix
	},
	getAffectedPerson : function(){
		if(this.affectedPersonName){
			this.$.affectedpersonWrapper.hidden = false;
			return $M.localize('uitext', 'mxapisr','OnBehalfOf')+' '+this.affectedPersonName;
		}
		else{
			this.$.affectedpersonWrapper.hidden = true;
			return;
		}
	},
	getRequestorEmail : function(){
		if($M.userInfo.primaryemail){
			this.$.emailWrapper.hidden = false;
			return $M.userInfo.primaryemail;
		}
		else{
			this.$.emailWrapper.hidden = true;
			return;
		}
		
	},
	goBack: function() {
		return 1;
	},
	initPage: function() {
		this.$.checkUrgentDesktop.checked = false;
		this.$.checkUrgent.checked = false;
	},
	renderPage: function(submitInfo) {
		var stackData = [];
		for (var prop in submitInfo) {
		    if (submitInfo.hasOwnProperty(prop)) {
				if(submitInfo[prop] && submitInfo[prop].contents){
					if (submitInfo[prop].contents.description) {
				    	if(prop === 'Location') {
				    		stackData.push({'step':prop,'topic': $M.localize('uitext','mxapisr',prop), 'data':submitInfo[prop].contents.description, 'breadcrumb':submitInfo[prop].contents.breadcrumb});
				    	}
				    	else if (prop === 'Attachment') {
				    		stackData.push({'step':prop, 'topic': $M.localize('uitext','mxapisr',prop), 'data':submitInfo[prop].contents.description, 'files':submitInfo[prop].contents.files});
				    	}
				    	else{
				    		stackData.push({'step':prop, 'topic': $M.localize('uitext','mxapisr',prop), 'data':submitInfo[prop].contents.description});
				    	}
					}else{
				    	stackData.push({'step':prop, 'topic': $M.localize('uitext','mxapisr',prop), 'data':'--'});
					}
				}
		    }
		}
		stackData.reverse();
		this.dataList = stackData;
		//this.$.stackDatalist.notifyResize();
	},
	_onSubmit: function() {
		var priority = 2;
		
		if ($M.screenInfo.device === 'desktop') {
			if (this.$.checkUrgentDesktop.checked) {
				priority = 1;
			}
		} else {
			if (this.$.checkUrgent.checked) {
				priority = 1;
			}
		}
		this.fire('sr-submit', priority);
	},
	_showLocationLabel : function(step){
		if(step === 'Location'){
			return true;
		}
		else{
			return false;
		}
	},
	_showFileLabel : function(step) {
		if(step === 'Attachment'){
			return true;
		}
		else{
			return false;
		}
	},
	_getFileIndex : function(index) {
		return index + 1;
	}
});
