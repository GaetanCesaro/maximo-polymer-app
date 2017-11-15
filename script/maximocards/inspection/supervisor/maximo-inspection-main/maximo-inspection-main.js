/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	
	is: 'maximo-inspection-main',
	
  	behaviors: [BaseComponent, QuestionGroups],
  	
  	listeners: {
  		'buildNewForm': '_showCleanForm',
  		'editForm': '_editForm',
  		'goback':'_goBack',
		'done':'_done',
		'formSaveButton':'_savebutton',
		'saveForm':'_saveForm',
		'saveQuestionDescriptions':'_saveQuestionDescriptions',
		'preview':'_preview',
		'updateButtons':'_updateNavButtons',
		'createUpdate':'_createUpdate',
		'changeStatus':'_changeStatus',
		'record-updatewsmethod:changeFormStatus':'_changeStatusSuccess',
		'delete':'_deleteForm',
		'deleteQuestion':'_deleteQuestion',
		'createRevision':'_getRevision',
		'collapseInstructions':'_collapseInstructionInputArea',
		'duplicate':'_duplicateRecord',
		'addUpdateQuestion':'_addUpdateQuestion',
		'updateInspectionForm':'_updateInspectionForm',
		'resequenceQuestions':'_resequenceQuestionsHandler',
		'setNextEvent': '_setNextEvent',
		'processNextEvent': '_processNextEvent'
  	},
  	
    properties: {
    	
    	/**
    	 * component selected in iron-pages 
    	 */
    	selectedPage: {
    		type: String,
    		value: 'list'    	
    	},
    	
    	/**
    	 * Current object hreference
    	 */
    	inspecFormHref: {
    		type: String
    	},
    	
    	
    	/**
    	 * Last revised form pending deactivation
    	 */
    	revisedFrom: {
    		type: Object,
    		value: null
    	},
    	
    	/**
    	 * Synonym domain collection
    	 */
    	formStatusSet: {
    		type: Array,
    		observer: '_statusSetChange'
    	},
    	    	
    	/**
    	 * Inspection form status domain filter
    	 */
    	domainFilter: {
    		type: Array,
    		value: function () {
    			return [{'filtertype': 'SIMPLE', 'field': 'domainid', 'availablevalues': [ {'value': 'INSPECTFORMSTATUS', 'selected': true} ]}];
    		}
    	},
    	
    	isNewRecord: {
    		type: Boolean,
    		value: false
    	},
    	
    	saveClicked: {
    		type: Boolean,
    		value: false
    	},
    	
    	questionSort: {
    		type: Array,
    		value: function () {
    			return [{collection: 'inspectionform.inspquestion', attributes: '%2Bgroupseq'}];
    		}
    	},
    	
    	nextEvent: {
    		type: Object, // {event, target}
    		value: null
    	}
	},
	
	_handleStatusDomainSet: function(e) {
		if (this.domainStatusCollection.length > 0) {
			this.formStatusSet = this.domainStatusCollection[0].synonymdomain;
		}else {
			this.formStatusSet = [];
		}
		this.$.inspformcollection.refreshRecords();
  	},
  	
  	_handleStatusDomainSetError: function(e) {
  		console.log('Problem loading data');
    	this.formStatusSet = [];
    	this.$.inspformcollection.refreshRecords();
  	},
  	
  	_statusSetChange: function (newV) {
  	},
	
  	_refreshCurrentRecord : function(e){
  		if(!this.inspecFormHref){
  			return;
  		}
  		
  		for(var i=0;i<this.recordData.length;i++){
  			if(this.recordData[i].href===this.inspecFormHref){
  				this.mbo = this.recordData[i];
  				break;
  			}
  		}
  	},
  	
	_handleRecordDataRefreshed: function (objs) {
		this.$.formList.dataSetRefresh();
		this.$.formList.selectRecord(this.highlightedId);
		this.highlightedId = null;
		this._refreshCurrentRecord();
		$M.toggleWait(false);
	},
	
	_handleError: function (e) {
		var error = e.detail.Error;
		console.error(error);
		$M.notify(error.message, $M.alerts.error);
		
		//reset button click in case of error
		this.saveClicked = false;
		
		this.$.formList.dataSetRefresh();
		$M.toggleWait(false);
	},
	
	_handleNewRecordCreated : function(e){
		var recordData = e.detail;
		this.mbo = recordData;
		this._changePage('form');
		$M.toggleWait(false);
	},
	
	_handleRecordCreated: function (e) {
		var recordData = e.detail;
		this.inspectionFormUrl = recordData.href;
		this.inspecFormHref = recordData.href;
		this.$.formEdition.isNewRecord = false;
		this._collapseInstructionInputArea(e);
		
		this.$.inspformcollection.refreshRecords();
		//var message = $M.localize('uitext','mxapiinspection','inspectionform_created',[recordData.name]);
		//$M.notify(message, $M.alerts.info);
		//$M.toggleWait(false);
			
		if (this.selectedPage !== 'list'){
			if(this.saveClicked && this.saveClicked===true){
				this.saveClicked = false;
				this._goBack();	
			}
		}
		this.highlightedId = recordData.inspectionformid;
//		this.$.formEdition.clearForm();
		this._processNextEvent(e);	// do we have to open the question builder?
	},
	
	_handleRecordUpdated: function(e) {
		this._processNextEvent(e);	// do we have to open the question builder?
	},

	// used to store a next event to be called after some other process (like a save or update)
	_setNextEvent: function(e){
		if (e.detail){
			this.nextEvent = e.detail;
		} else {
			this.nextEvent = null;
		}
	},
	
	_processNextEvent: function(e){
		// a record has been saved, are we supposed to do something else now (like go to question builder)?
		if (this.nextEvent !== null){
			var target = this;
			if(this.nextEvent.target){
				target = this.nextEvent.target;
			}
			if (this.nextEvent.event){
				if (this.nextEvent.param){
					target.fire(this.nextEvent.event, this.nextEvent.param);
				}else {
					target.fire(this.nextEvent.event);
				}
			}
			this.nextEvent = null;
		}
	},
	
	_savebutton : function(e){
		this.saveClicked = true;
		this.$.formEdition.fire('done');
	},
	
	/**
	 * Trigger form save
	 */
	_saveForm : function(e){
		this.$.formEdition.fire('done');
	},
	
	_handleRecordSaved: function (e){
		this.isNewRecord = false;
		var recordData = e.detail;
		
		this.$.inspformcollection.refreshRecords();
		//var message = $M.localize('uitext','mxapiinspection','inspectionform_created',[recordData.name]);
		//$M.notify(message, $M.alerts.info);
		//$M.toggleWait(false);
		
		if (this.selectedPage != 'list'){
			this._goBack();
		}
		this.$.formEdition.clearForm();
	},
	
	_goBack: function (e) {		
		this._collapseInstructionInputArea(e);
		this._collapseGroupDescriptionAreas(e);
		this._closeQuestionDialog(e);
		this._changePage('list');
		this.$.formEdition.clearForm();
	},
	
	_collapseInstructionInputArea : function(e) {
		//collapse instruction section
		if ($j('#inspectorsupmain_formEdition_inspectionformcollapse').find('iron-collapse')[0].opened == true){
			$j('#inspectorsupmain_formEdition_inspectionformcollapse')[0].toggleCollapse();
		}
	},
	
	_collapseGroupDescriptionAreas : function(e) {
		//collapse group description sections
		var myarray = $j('[id^=groupSection');
  		for(var i=0;i<myarray.length;i++){
  			myarray[i].parentElement.parentElement.parentElement.remove();
  		}
	},
	
	_closeQuestionDialog : function(e) {
		//close question dialog
		$j('#questionBuilder_cancel_button').click();
	},
	
	_preview: function (e) {
	},
	
	_changeStatus: function (e) {
		
		var params = e.detail.object;
		var responseProperties = e.detail.props;
		var objHref = e.detail.href;
		
		
		//Update var inspecFormHref
		this.inspecFormHref = objHref;
		
		var message;
		var self = this;
		//Call method to update record
		this.$.inspecFormResource.updateAction('wsmethod:changeFormStatus', params, responseProperties).then(function(){
			self.$.inspformcollection.refreshRecords();
			message = $M.localize('uitext','mxapiinspection','inspectionform_updated',[' ']);
			$M.notify(message,$M.alerts.info);
		}, function(error) {
			$M.showResponseError(error);
			$M.toggleWait(false);
			self.$.inspformcollection.refreshRecords();
		});
	},
	
	_changeStatusSuccess: function (e) {
		this.revisedFrom = null;
	},
	
	_createUpdate: function (e) {
		//Grab the whole form record
		var recordData = e.detail.record;
		var properties = e.detail.props;
	
		$M.toggleWait(true);
		
		if (this.revisedFrom){
			recordData.isrevision = true;
		}
			
		this.$.inspformcollection.createRecord(recordData, properties);
		
		//Wait layer needs to be re-enabled since createRecord disables.
		$M.toggleWait(true);
	},
	
	/**
	 * Saves updates to the Inspection Form Record.
	 */
	_updateInspectionForm : function (e) {
		var dataToUpdate = {};
		var self = this;
		dataToUpdate.name = e.detail.record.name;
		dataToUpdate.description_longdescription = tinymce.editors['textareaInstructions'].getContent();
		dataToUpdate.status = e.detail.record.status;
		
		if(e.detail.record.inspquestion){
			dataToUpdate.inspquestion = [];
			for (var i = 0; i<e.detail.record.inspquestion.length; i++){
				if(e.detail.record.inspquestion[i]._action === 'Update'){
					dataToUpdate.inspquestion.push(e.detail.record.inspquestion[i]);
				}
			}
		}

		var responseProperties = 'name';
		this.$.inspecFormResource.updateRecord(dataToUpdate, responseProperties, true).then(function(result) {
			// notify record has been updated
			var message = $M.localize('uitext','mxapiinspection','inspectionform_updated',[' ']);
			$M.notify(message,$M.alerts.info);
			self.$.inspformcollection.refreshRecords();
			if(this.saveClicked){
				this.saveClicked = false;
				self._goBack();
			}
		}.bind(this), function(error) {
			$M.showResponseError(error);
		});
	},
	
	_deleteForm : function(e){
		var record = e.detail;
		//var successmessage = $M.localize('uitext','mxapiinspection','inspectionform_deleted',['\''+e.detail.name+'\'']);
		var failuremessage = $M.localize('uitext','mxapiinspection','inspectionform_notdeleted',[e.detail.name]);
		var self = this;
		
		if (record.hasrevision===false || record.status_maxvalue==='PNDREV'){
			//$M.toggleWait(true);
			this.$.inspecFormResource.deleteRecord(record.href).then(function() {
				//Instead of refreshing list we need just to remove card
				self.$.formList.removeTile(record);
				self.$.inspformcollection.refreshRecords();
			});
		} else {
			$M.notify(failuremessage,$M.alerts.warn);
		}
	},
	
	_deleteQuestion : function(e){
		// delete the question then update the remaining ones
		this._saveForm(e);
		var record = e.detail;
		var deletedhref = record.href;
		var deletedGroupid = 0;
		// was a group header deleted?
		if (record.groupid > 0 && record.sequence === 0){
			deletedGroupid = record.groupid;
		}
		var questions = this.$.formEdition.questions;
		// find array object and delete it, if a group header is deleted then delete children too
  		for(var i=0; i< questions.length; i++){
  			if(questions[i].href=== deletedhref || questions[i].groupid === deletedGroupid){
  				questions[i]._action = 'Delete';
  			}
  		}
  		this._resequenceQuestions(questions);
	},

	_saveQuestionDescriptions: function(e){	// before doing another action, update any questions that haven't been saved
		if (e && e.detail){
			var questions = e.detail;
			var questionsToUpdate = [];
			for(var i=0; i< questions.length; i++){
				var question = questions[i];
				if (question._action){	// do update if there is an existing _action
					questionsToUpdate.push(this._cloneQuestion(question, ['_action','_id','_rowstamp','href','localref','description','description_longdescription']));
				}
			}
			if (questionsToUpdate.length > 0){
				this._updateQuestions(questionsToUpdate);
			}
		}
	},
	
	_cloneQuestion: function(question, attributes){
		var clone = {};
		for(var i=0; i<attributes.length; i++){
			clone[attributes[i]] = question[attributes[i]];
		}
		return clone;
	},

	_resequenceQuestionsHandler: function(e){
		if (e && e.detail){
	  		this._resequenceQuestions(e.detail);
		}
	},

	_resequenceQuestions: function(questions){	// only sends update to server if are changes!
		// called after a delete - have to recalculate the groupid/sequence numbers
		if (questions){
			this.$.formEdition.fire('closeAllGroupInfos', true);
			var curSeq = 0;
			var curGroup = 0;
			var curChildSeq = 0;
			var lastGroup = 0;
			var hasUpdates = false;
			for(var i=0; i< questions.length; i++){
				var question = questions[i];
				if (question._action){	// do update if there is an existing _action
					hasUpdates = true;
					if (question._action === 'Delete'){	// don't process a deleted record
						continue;
					}
				}

	  			if (question.groupid > 0){	// in a group
	  				if (question.sequence === 0){  // if seq = 0, we're on a group header, set groupseq = curGroup
						curSeq ++;	// increment curSeq for each header (once per group)
						curGroup = curSeq;
						curChildSeq = 0;
	  					if (question.groupseq !== curGroup){	// update groupseq if it doesn't match the group
							question.groupseq = curGroup;
							hasUpdates = true;
	  					}
	  				}
	  				if (question.groupid !== curGroup){	// update groups if they don't match (for headers and child questions)
		  				question.groupid = curGroup;	// only update only if necessary
		  				hasUpdates = true;
	  				}
	  				if (question.sequence !== 0){	// if sequence > 0 we're on a group question, so update groupseq and sequence
	  					curChildSeq ++;
	  					if (hasUpdates || question.sequence !== curChildSeq || question.groupseq !== this._generateGroupSeq(question)){	// if hasUpdates==true the group has changed - redo groupseq and sequence
		  					question.sequence = curChildSeq;	// set this before generating groupseq
		  					question.groupseq = this._generateGroupSeq(question);	// generate groupseq ('group' . 'sequence');
		  					hasUpdates = true;
	  					}
	  				}
	  				lastGroup = curGroup;
	  			} else {	// not in a group
	  				curSeq ++;
  					if (question.sequence !== curSeq || question.groupseq !== curSeq){	// only update only if necessary
	  					question.sequence = curSeq;
	  					question.groupseq = curSeq;		// not in a group, so groupseq = sequence
	  					hasUpdates = true;
					}
	  			}
	  			if (hasUpdates && !question._action){	// if there are updates and there's not already an action, set it to Update
  					question._action = 'Update';
	  			}
	  		}
			if (hasUpdates){	// update record if there are updates
				this._updateQuestions(questions);
			}
		}
	},
	
	_findQuestionIndex: function(questions, href){
		for(var i=0;i<questions.length;i++){
  			if(questions[i].href === href){
  				return i;
  			}
  		}
		return -1;
	},
	
	_updateQuestions: function(questions){
		var dataToUpdate = {};
		dataToUpdate.inspquestion = questions;
		var responseProperties = 'name';
		var self = this;
    	$M.toggleWait(true);
    	//delete id field when duplicating to prevent out of sync records with Long description
    	if(dataToUpdate){
	    	for(var y=0; y< dataToUpdate.inspquestion.length; y++){
	    		if(dataToUpdate.inspquestion[y]._action === 'Add'){
	    			if(dataToUpdate.inspquestion[y].inspquestionid){
	    				delete dataToUpdate.inspquestion[y].inspquestionid;	
	    			}
	    		}
	    	}	
    	} 
		this.$.inspecFormResource.updateRecord(dataToUpdate, responseProperties, true).then(function(result) {
			self.$.inspformcollection.refreshRecords();
		}.bind(this), function(error) {
			$M.showResponseError(error);
			$M.toggleWait(false);
		});
	},
	
	_getRevision: function(e){
		
		var record = e.detail;
		var objHref = record.href;
		
		//Update var inspecFormHref
		this.inspecFormHref = objHref;
		var self = this;
		
		var qParams = {'responseos':'MXAPIINSPFORM'};
		
		$M.toggleWait(true);
		this.$.inspecFormResource.getAction('wsmethod:getRevision', qParams).then(
				function(e){
					var newRecord = e.response;
					newRecord.isrevision=true;
					self.mbo = newRecord;
					self.revisedFrom = record;
					self._setRevisionForm();
					self._changePage('form');
					self.isNewRecord = false;
					self.$.formEdition.fire('done');
					$M.toggleWait(false);
					
				}, function(error){
					console.log('revision failed');
					$M.toggleWait(false);
				}
		);
		
		//this.$.formEdition.createRevision(e);
	},
	
	_setRevisionForm: function() {
		this.$.formEdition.setRevision();
	},
	
	_duplicateRecord: function (e) {
		var originalRecordData = e.detail;
		this.$.inspecFormResource.duplicateRecord(originalRecordData);	
	},
	
	_handleRecordDuplicatedSuccess: function (e) {
		var duplicatedRecordData = e.detail;
		var self = this;
		
		try {
			$M.toggleWait(true);
			
			this.mbo = duplicatedRecordData;
			
			self.$.formEdition.formName = this._getDuplicatedFormName(this.recordData, duplicatedRecordData.name);
		    if (duplicatedRecordData.inspquestion){	// duplicated form comes back with questions in no particular order
				duplicatedRecordData.inspquestion.sort(function(a, b){return a.groupseq - b.groupseq;});	// sort by groupseq
		    }
			self.$.formEdition._questionsChanged(duplicatedRecordData.inspquestion);
			self.$.formEdition.fire('done');
			self._changePage('form');		
		}catch(e){
			$M.toggleWait(false);
		}

	},	
	
	_getDuplicatedFormName: function(forms, name){
		var copySuffix = $M.localize('uitext','mxapiinspection','copy');
		var copyIndex = name.indexOf('('+copySuffix);
		if(copyIndex>=0){ //this record has copy in the name, strip it to get base
			name = name.substring(0,copyIndex).trim();
		}
		var nextNbr = 1;
		//search all question to see if this exists already
		for(var i=0; i<forms.length; i++){
			var cfOrigName = forms[i].name;
			var cfName = cfOrigName;
			copyIndex = cfName.indexOf('('+copySuffix);			
			//this record has copy in the name, strip it to get to base
			cfName = cfName.substring(0,copyIndex).trim();
			if(cfName === name){
				if(copyIndex>=0){ 
					//now find if the string already contained a copy number, if so, store its number
					var copySuffixLth = copySuffix.length;
					var copyNbrIdx = copyIndex+1+copySuffixLth;
					var closingIdx = cfOrigName.indexOf(')',copyNbrIdx);
					var newNbr = cfOrigName.slice(copyNbrIdx,closingIdx).trim();
					if(!newNbr){
						newNbr = 1;
					}
					var tempNbr = parseInt(newNbr)+1;
					if(tempNbr>nextNbr){
						nextNbr = tempNbr;
					}
				}
			}
		}
		var displayNbr = '';
		if(nextNbr>1){
			displayNbr = ' '+nextNbr;
		}
		name = name+' ('+$M.localize('uitext','mxapiinspection','copy')+displayNbr+')';
		return name;
	},
	
	_editForm: function(e){
		this.$.formEdition.clearForm();
		var record = e.detail;
		this.mbo = null;
		this.mbo = record;
		this.$.formEdition.isNewRecord = false;
		this.inspecFormHref = record.href;
				
		if(this.mbo.status_maxvalue=='PNDREV'){
			//set formname as readonly if form status = PNDREV
			this._setRevisionForm();			
		}

		if(record.inspquestion){
			this.$.formEdition.questions = record.inspquestion;
		} else {
			this.$.formEdition.questions = [];
		}
		
		this._changePage('form');
	},
	
	_done: function (e) {
	},
	
	_showCleanForm: function (e) {
		//show form page 
		console.info('Creating New form.');
		this.$.formEdition.clearForm();
		
		//clear UI search value in search text box
		$j(e.target).find('#formList_searchbar_inputval')[0].value='';
		//remove search term value when creating new forms
		this.$.inspformcollection.searchTermValue='';

		this.$.inspformcollection.getNewRecordData();
		$M.toggleWait(true);
		//this._changePage(1);
	},

	_changePage: function (/*index*/ pageName) {		
		this.selectedPage = pageName;
		document.body.scrollTop = 0;
		this._fixButtons(pageName);
		this._fixQuestionButtons(pageName);
	},
		
	_updateNavButtons: function (e) {
		this._fixButtons(this.selectedPage);
		this._fixQuestionButtons(this.selectedPage);
	},
	
	_getFootberNatButtons : function(e){
   	 //Screen navigation buttons 
			return [ {'id':'goback','action':'true','label':this.localize('uitext','mxapibase','Back'),'event':'goback','icon':'chevron-left'},
        // 	{'id':'preview','action':'true','label':this.localize('uitext','mxapibase','Preview'),'event':'preview','icon':'Maximo:View'},
           	{'id':'done','default':true,'label':this.localize('uitext','mxapibase','save'),'event':'formSaveButton','icon':'Maximo:Save'}];
   },
 	
	_getQuestionButtons : function(e){
   	 //Question buttons 
			return [ {'id':'inspectorsupmain_formEdition_newQuestion','action':'true','label':this.localize('uitext','mxapibase','add_question'),'event':'addNewQuestion','icon':'Add-New'}];
   },
 	
	_fixQuestionButtons: function(tab){
		var buttons = this._getQuestionButtons();
		var context = this;
		switch(tab){
			case 'list':
			case undefined:
				buttons = null;
				this.revisedFrom = null;
				break;
			case 'form':
				context = this.$.formEdition;
				buttons[0].disabled = !this.$.formEdition._saveAllowed();
				break;
			default:
				break;
		}
		if(buttons){
			var questButton =$j(this.$.formEdition).find('#inspectorsupmain_formEdition_newQuestion');
			if(questButton[0] != null){
				questButton[0].set('disabled', buttons[0].disabled);
			}
		}
	},
  	
	_fixButtons: function(tab){
		var buttons = this._getFootberNatButtons();
		var context = this;
		switch(tab){
			case 'list':
			case undefined:
				buttons = null;
				this.revisedFrom = null;
				break;
			case 'form':
				context = this.$.formEdition;
				//This will be 2 when Preview is added back in
				//buttons[2].disabled = !this.$.formEdition._saveAllowed();
				buttons[1].disabled = !this.$.formEdition._saveAllowed();
				break;
//			case 2:
//				context = this.$.deffilter;
//				buttons[2].disabled = !this.$.deffilter._nextAllowed();
//				break;
//			case 3:
//				context = this.$.saveit;
//				buttons.pop();
//				buttons.push({'id':'savedataset','disabled':!this.$.saveit._saveAllowed(),'default':true,'label':this.localize('uitext','mxapibase','save'),'event':'_save','icon':'formatting:save'});
//				break;
			default:
				break;
		}
		$M.workScape.updateFooterToolbar(buttons, context);
	},
	
	_addUpdateQuestion : function(e) {
		//Grab the whole form record
		var recordData = e.detail;
		$M.toggleWait(true);
		if (this.revisedFrom){
			recordData.isrevision = true;
		}

		var properties = {'href':this.$.formEdition.record.href,'object':'INSPQUESTION'};
		if (recordData.href){  // update existing question
			if(recordData.inspfield){
				for (var i = 0; i <recordData.inspfield.length; i++) {
					if(recordData.inspfield[i].isCopy){
						recordData.inspfield[i]._action='Add';
					}else if(recordData.inspfield[i].isDeleted && recordData.inspfield[i].inspfieldnum){
							recordData.inspfield[i]._action='Delete';
					}else{
						if(recordData.inspfield[i].inspfieldnum){
							recordData.inspfield[i]._action='Update';
							if(recordData.inspfield[i].inspfieldoption){
								for (var j =0 ; j <recordData.inspfield[i].inspfieldoption.length; j++) {
									if(recordData.inspfield[i].inspfieldoption[j].href){
										if(recordData.inspfield[i].inspfieldoption[j].isDeleted){
											recordData.inspfield[i].inspfieldoption[j]._action='Delete';}
										else if(recordData.inspfield[i].inspfieldoption[j].inspfieldoptionid){
											recordData.inspfield[i].inspfieldoption[j]._action='Update';}
										else{
											recordData.inspfield[i].inspfieldoption[j]._action='Add';
											}
									}
									else{
										recordData.inspfield[i].inspfieldoption[j]._action='Add';
									}
							}
						}
						}else if(!recordData.inspfield[i].isDeleted){
							recordData.inspfield[i]._action='Add';
						}
						else{
							recordData.inspfield.splice(i,1);
						}
						
					}
					
				}
			this.$.inspformcollection.updateChildRecord(recordData, properties);
		}
		}else{	// create a new question
			if(recordData.inspfield){
				var i = recordData.inspfield.length;
				while(i--){
					if(!recordData.inspfield[i].isDeleted){
						recordData.inspfield[i]._action='Add';
						if(recordData.inspfield[i].inspfieldoption){
							var j = recordData.inspfield[i].inspfieldoption.length;
							while(j--){
								if(!recordData.inspfield[i].inspfieldoption[j].isDeleted){
									recordData.inspfield[i].inspfieldoption[j]._action='Add';}
								else{
									recordData.inspfield[i].inspfieldoption.splice(j,1);
								}
							}
						}
					}else{
						recordData.inspfield.splice(i,1);
					}
				}
				
			}
			if(recordData.sequence == null){ //sequence will already be set for groups
				recordData.sequence = this._getNewQuestionSequence();
				recordData.groupseq = this._generateGroupSeq(recordData);
			}
			this.$.inspformcollection.createChildRecord(recordData, properties);
			
		}
	},
	
	_getNewQuestionSequence: function(){
		var seq = 1;
		var form = this.$.formEdition.record;
		if (!form.inspquestion){ // no other questions, sequence = 1
			return seq;
		}else{	// has other questions, calculate sequence
			for(var i=0; i< form.inspquestion.length; i++){
				var q = form.inspquestion[i];
				if (q.sequence === 0 || !q.groupid){	// group header or no group
					seq ++;
				}
			}
		}
		return seq;
	},
	
	_handleChildRecordCreated : function(e){
		this.$.inspformcollection.refreshRecords();
	}
	
});
