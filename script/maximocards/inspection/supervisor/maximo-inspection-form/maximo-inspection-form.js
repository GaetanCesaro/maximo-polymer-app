/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-inspection-form',
	
  	behaviors: [BaseComponent, QuestionGroups],
  	
  	listeners: {
		'done':'_done',
		'maximo-table-rows-selected':'handleRowsSelected',
		'closeAllGroupInfos': '_closeAllGroupInfosHandler',
		'showQuestionBuilder': '_showQuestionBuilder'
  	},
  	
    properties: {
    	
    	/**
    	 * Inspection form record
    	 */
    	record: {
    		type: Object,
    		observer: '_recordChanged'
    	},
    	
    	/**
    	 * Current form href
    	 */
    	inspectionFormHREF: {
    		type: String
    	},
    	
    	/**
    	 * question href, used to duplicate questions
    	 */
    	questionHref: {
    		type: String
    	},

    	/**
    	 * Form name
    	 */
    	formName: {
    		type: String,
    		value: function() {
    			return '';
    		},
    		observer: '_nameChanged'
    	},
    	
		columns: {
			type: Array,
			value: function(){
				return [{'attribute':'sequence','title':'Item Number','width':window.innerWidth/12 + 'px'},
						{'attribute':'description','title':'Question','width':window.innerWidth/3+ 'px'},
						{'attribute':'numberFields','title':'Number of Fields','width':window.innerWidth/10+ 'px'},
						{'attribute':'isRequired','title':'Required','width':window.innerWidth/10+ 'px'}];
			}
		},

    	/**
    	 * Revision number
    	 */
    	revisionNumber: {
    		type: Number,
    		value: 0
    	},
    	
    	isNewRecord: {
    		type: Boolean,
    		value: true
    	},
    	
    	isNewQuestion: {
    		type: Boolean,
    		value: false
    	},
    	
    	/**
    	 * Synonym domain of 
    	 * current status
    	 */
    	state: {
    		type: Object
    	},
    	
    	/**
    	 * Translation of current status
    	 */
    	booleanState: {
    		type: Boolean,
    		observer: '_boolStateChange'
    	},
    	
    	/**
    	 * Synonym domain collection
    	 */
    	formStatusSet: {
    		type: Array,
    		observer: '_formStatusSetChange'
    	},
    	
    	/**
    	 * Indicator to show/hide message
    	 */
    	hasQuestions: {
    		type: Boolean,
    		value: false,
    		readOnly: true
    	},
    	
    	/**
    	 * Form creation date
    	 */
    	createDate: {
    		type: Date,
    		value: function() {
    			return new Date();
    		}
    	},
    	
    	originalFormNum: {
    		type: String,
    		value: null
    	},
    	
    	/**
    	 * Form questions set
    	 */
    	questions: {
    		type: Array,
    		value: [],
			observer: '_questionsChanged'
    	},

    	duplicatedQuestionIDs: {
    		type: Array,
    		value: []
    	},

    	/**
    	 * Interval in seconds to 
    	 * undo delete operation
    	 */
    	undoIntervalSecs: {
    		Type: Number,
    		value: 7,
    		readOnly: false
    	},
    	
    	status: {
    		type: String
    	},
    	
    	_disableCreateGroup: {
    		Type: Boolean,
    		value: true,
    		notify: true
    	},
    	
    	originalFormName: {
    		type: String
    	},
    	
    	originalInstructions: {
    		type: String
    	},
    	
    	_duplicatedGroupHeader: {
    		type: Object
    	},
    	
    	_duplicatedGroupChildren: {
    		type: Array,
    		value: []
    	}
    	
    },    	
    	
	_recordChanged: function (newV) {
		//TODO update state
		
		if(!newV){
			return;
		}
		
		this.updateState(newV.status);
		this.revisionNumber = newV.revision;
		this.inspectionFormNum = newV.inspformnum;
		
		if(newV.description_longdescription!==undefined){
			tinymce.editors['textareaInstructions'].setContent(newV.description_longdescription);	
		}
		
		if (newV.name) {
			this.formName = newV.name;
		}
		
		if (newV.originalFormNum) {
			this.originalFormNum = newV.originalFormNum;
		}
		if(newV.inspquestion){
			this.questions = newV.inspquestion;	
		}
		this.status = newV.status_description;
		
		//set original form data to compare with changes
    	this.originalFormName = this.formName;
    	if(newV.description_longdescription===undefined || newV.description_longdescription===''){
    		this.originalInstructions = '';
    	} else {
    		this.originalInstructions = newV.description_longdescription;
    	}

	},
	
	_nameChanged: function (newV) {
		this.fire('updateButtons');
	},
	
    _formStatusSetChange: function (newV) {
    	
    	if (this.state){
    		return;
    	}
    	
    	this.state = this.getStatusEntry('inactive');
    },
    
    _boolStateChange: function(newV, oldV) {
    	
    	var statusEntry;
    	
		//find internal maxvalue for status that exists on record
    	var internalStatus = '';
    	if(this.record){
    		var recordExternalStatus = this.record.status;
    		var filterRes = this.formStatusSet.filter(function(o){return o.value === recordExternalStatus;} );
    		internalStatus = filterRes[0].maxvalue;
    	}
		
    	if (newV && newV === true) {
    		statusEntry = this.getStatusEntry('active');
    	}else if(newV === 'PNDREV' || internalStatus==='PNDREV'){
    		statusEntry = this.getStatusEntry('pndrev');
    		this.booleanState = false;
    	}else if(newV === 'DRAFT' || internalStatus==='DRAFT'){
    		statusEntry = this.getStatusEntry('draft');
    		this.booleanState = false; 
    	}else {
    		statusEntry = this.getStatusEntry('inactive');
    	}
    	
    	this.state = statusEntry;

    },
    
	updateState: function(status) {
		//find internal maxvalue
		var filterRes = this.formStatusSet.filter(function(o){return o.value === status;} );
		status = filterRes[0].maxvalue;
		
		if (this.formStatusSet) {
			var statusEntry = this.getStatusEntry(status);
			if (statusEntry !== null) {
				this.state = statusEntry;
				this.setBoolStatus(statusEntry);
			}
		}
    },
    
    setBoolStatus: function (domainEntry) {
    	if (domainEntry.maxvalue === 'ACTIVE') {
    		this.booleanState = true;
    	}else if (domainEntry.maxvalue === 'PNDREV') {
    		this.booleanState = 'PNDREV';
    	}else if (domainEntry.maxvalue === 'DRAFT') {
    		this.booleanState = 'DRAFT';
    	}else{
    		this.booleanState = false;
    	}
    },
    
    getStatusEntry: function (/*String*/ maxval) {
    	
    	if (!maxval || maxval.length === 0) {
    		console.error('Undefined maxval.');
    		return null;
    	}
    	
    	if (!this.formStatusSet){
    		console.error('No inspection form status domain set.');
    		return null;
    	}
    	
    	maxval = maxval.toUpperCase();
    	var filterRes = this.formStatusSet.filter(function(o){return o.maxvalue === maxval;} );
    	
    	if (!filterRes){
    		console.error('Problems to filter.');
    		return null;
    	}
    	
    	if (filterRes.length < 1){
    		console.error('No values filtered with ' + maxval);
    		return null;
    	}
    	
    	return filterRes? filterRes[0] : null;
    },
	
    showRevision: function (rev) {
    	return rev+'';
    },
    
    editFormInstructions: function (e) {
    	if(this.$.inspectionformcollapse.collapsed !== 'true'){ //if already expanded and closing, save it first
    		this.saveForm(e);
    	}
    	this.$.inspectionformcollapse.toggleCollapse();	
    },
    
    cancelInstructions: function (e) {
		this.fire('collapseInstructions');
		tinymce.editors['textareaInstructions'].setContent(this.originalInstructions);
    },
    
    cancelDialog: function(e){  	
    	var dialog = $j(e.srcElement).parents('MAXIMO-DIALOG');
    	dialog = dialog[0];
    	dialog.close();
    	tinymce.activeEditor.setContent('');
	},
	
	saveDialog: function (e) {
		var dialog = $j(e.srcElement).parents('MAXIMO-DIALOG');
    	dialog = dialog[0];
    	dialog.close();
	},
	
	getForm: function() {
		
	},
	
    toggleGroupInfo: function(e){
    	e.target.click();//target is actually the "i" button at this point
    },
    
    _closeAllGroupInfosHandler: function(e){
		var setUpdateAction = false;
    	if (e && e.detail){
    		setUpdateAction = e.detail;
		}
  		this._closeAllGroupInfos(setUpdateAction);
	},

	_closeAllGroupInfos : function(setUpdateAction) {
		var infos = $j('[id^=groupClose');	// close any open group infos (saving them)
  		for(var i=0; i<infos.length; i++){
  			if (infos[i]){
				if (setUpdateAction){	// set _action=Update so the changes aren't immediately saved
					var qrow = $j('#'+infos[i].id.substring(10));	// strip off groupClose to get row id
					if(qrow && qrow[0]){
						var num = this._getQuestionNum(qrow[0].id);
						var q = this._getQuestionForNum(num);
						q._action = 'Update';
					}
				}
  				infos[i].click();
  			}
  		}
	},

    closeGroupDesc: function(e){
    	var row = this.getParentRow(e.currentTarget);

		//section is already opened, so save and toggle it closed
    	if (tinymce && tinymce.editors['tag'+row.id]){
    		if (e.model.formQuestion.description_longdescription !== tinymce.editors['tag'+row.id].getContent()){
		    	e.model.formQuestion.description_longdescription = tinymce.editors['tag'+row.id].getContent();
		    	if (e.model.formQuestion._action !== 'Update'){ // only send immediate update if Update action is not already set
			    	e.model.formQuestion.inspfield = [];
			    	this.fire('addUpdateQuestion', e.model.formQuestion);
		    	}
    		}
	    	//remove editor from tinymce when closing texteditor section
	    	tinymce.EditorManager.execCommand('mceRemoveEditor',false, 'tag'+row.id);
			row.nextElementSibling.remove();
    	}
    }, 
    
    openGroupDesc: function(e){
    	var row = this.getParentRow(e.currentTarget);
		row.draggable = false;	// can't drag when info is open
		
		this.fire('saveQuestionDescriptions', this.questions);
		
		this._closeAllGroupInfos(true);
		
		//initialize specific text editor when opening
		tinymce.EditorManager.execCommand('mceAddEditor',false, 'tag'+row.id);

    	var newTR = document.createElement('tr');
    	row.parentNode.insertBefore(newTR, row.nextSibling);
		newTR.className = 'groupInfo style-scope maximo-inspection-form';
		newTR.id = 'questionGroupDetails'+'_'+row.id;
		var newTD = document.createElement('td');
		newTD.setAttribute('colspan','6');
		newTD.className = 'style-scope maximo-inspection-form';
		var newDiv = document.createElement('div');
		newDiv.id = 'groupDivCollapseSection';
		newDiv.className = 'pageDiv style-scope maximo-inspection-form';
		newDiv.style.display='block';
		var maximoSection = Polymer.Base.create('maximo-section');
		maximoSection.id = 'groupSection'+row.id;
		maximoSection.setAttribute('collapsed','false');
		maximoSection.className='instructionCollapse style-scope maximo-inspection-form x-scope maximo-section-0';
		var inputDiv = document.createElement('div');
		inputDiv.className = 'header style-scope maximo-section cold';
		var maximoRTE = Polymer.Base.create('maximo-richtexteditor');
		maximoRTE.className = 'style-scope maximo-inspection-form x-scope maximo-richtexteditor-0';
		maximoRTE.setAttribute('data-maximocomponent','true');
		maximoRTE.id = 'groupRichText'+row.id;
		maximoRTE.textareauniqueid='tag'+row.id;
		maximoRTE.setAttribute('width','100%');
		maximoRTE.placeholder=$M.localize('uitext','mxapiinspection','question_group_placeholder');		
		var maximoFooter =  Polymer.Base.create('maximo-footer', {'centered':'true'});
		maximoFooter.id=row.id+'_footer';
		maximoFooter.className = 'style-scope maximo-inspection-form x-scope maximo-footer-0';
		maximoFooter.setAttribute('data-maximocomponent','true');
		var maximoClear = Polymer.Base.create('maximo-button');
		maximoClear.id='groupClear'+row.id;
		maximoClear.label=$M.localize('uitext','mxapibase','Cancel');
		maximoClear.setAttribute('original-id','groupCancel');
		maximoClear.setAttribute('data-uniqueid','true');
		maximoClear.className='style-scope maximo-inspection-form x-scope maximo-button-0';
		maximoClear.setAttribute('action','');
		maximoClear.setAttribute('data-maximocomponent','true');
		var maximoClose = Polymer.Base.create('maximo-button');
		maximoClose.id='groupClose'+row.id;
		maximoClose.label=$M.localize('uitext','mxapibase','save');
		maximoClose.setAttribute('original-id','groupClose');
		maximoClose.setAttribute('data-uniqueid','true');
		maximoClose.className='style-scope maximo-inspection-form x-scope maximo-button-0';
		maximoClose.setAttribute('default','');
		maximoClose.setAttribute('data-maximocomponent','true');
		maximoFooter.$.footer.appendChild(maximoClear);
		maximoFooter.$.footer.appendChild(maximoClose);
		maximoFooter.$.footer.style.textAlign = 'center';
		maximoRTE.appendChild(maximoFooter);
		inputDiv.appendChild(maximoRTE);
		maximoSection.appendChild(inputDiv);
		newDiv.appendChild(maximoSection);		
		newTD.appendChild(newDiv);
		newTR.appendChild(newTD);
    	var question = e.model.formQuestion;
    	setTimeout(function(){ 
        	if(question.description_longdescription!==undefined){
    	    	tinymce.editors['tag'+row.id].setContent(question.description_longdescription);	
    		}
    	}, 250);
		$j('#'+maximoClear.id).on('tap', function(){$j(this.getTopParentElement()).find('#inspectorsupmain_formEdition')[0].cancelGroupText(e);});
		$j('#'+maximoClose.id).on('tap', function(){$j(this.getTopParentElement()).find('#inspectorsupmain_formEdition')[0].toggleGroupInfo(e);});
    },
    
    showInfo: function (e) {
    	var row = this.getParentRow(e.currentTarget);
        if(row.nextElementSibling.nodeName !== 'TR'){//last item is a group with no questions
        	//check NEXT row after Template, for some reason when description is opened, the desc row gets inserted after template row
        	if(row.nextElementSibling.nextElementSibling === null){
        		this.openGroupDesc(e);
        	}
        }
        else{
        	if(row.nextElementSibling.className.indexOf('questionRow')>-1){
            	this.openGroupDesc(e);
            }
            else{
            	this.closeGroupDesc(e);
        	}
        }
    },

    cancelGroupText: function (e) {
    	var row = this.getParentRow(e.target);
    	//remove editor from tinymce when closing texteditor section
    	tinymce.EditorManager.execCommand('mceRemoveEditor',false, 'tag'+row.id);
		row.nextElementSibling.remove();
    },

    /*
     * Walk up the dom to find the TD for the current element
     */
    getParentColumn(element){
    	var parent = element.parentElement;
    	if(parent.nodeName==='TD'){
    		return parent;
    	}
    	else{
    		return this.getParentColumn(parent);
    	}
    },
    
    /*
     * Walk up the dom to find the TR for the current element
     */
    getParentRow(element){
    	if(element.nodeName==='TR'){
    		return element;
    	}
    	else{
    		return this.getParentRow(element.parentElement);
    	}
    },
    
	clearForm: function() {
		tinymce.activeEditor.setContent('');
		this.formName = '';
		this.revisionNumber = 0;
		this.originalFormNum = null;
		this.questions=[];
		this.$.formName.readonly = false;
		this.isNewRecord = true;
		this._clearCheckboxes();
	},
	
	enableButton: function(e){
		// on a change to question description, set _action=update
		e.model.formQuestion._action = 'Update';
		$j($j(this.getParentRow(e.target)).find('.questCopied')).css({'display':'none'});
		// if description is blank, or if it's a group and the group text hasn't been changed, disable save
		if((e.target.value==='') || (this.getParentRow(e.target).className.indexOf('groupHeader')>-1 && $M.localize('uitext', 'mxapiinspection', 'newgroup')===e.target.value)){
			$j(this.getTopParentElement()).find('#done')[0].disabled=true;
		}
		else{
			$j(this.getTopParentElement()).find('#done')[0].disabled=false;
			//Only perform check for group header rows
			if (this.getParentRow(e.target).className.indexOf('groupHeader')>-1){
				$j(this.getParentColumn(e.target)).removeClass('highlight'); //remove red highlighting
			}
		}
	},
	
	_saveAllowed: function(){
		var questionDisplayed = this.$.questionModal.style.display==='block';
		if ((this.formName && this.formName.length > 0) && (!questionDisplayed)){
			return true;
		}
			
		return false;
	},
	
	/**
	 * Trigger form save if form name or instructions have been changed from original
	 */
	saveForm : function(e){
		//save form if record changed
		if(this.formName!==this.originalFormName || this.originalInstructions!==tinymce.editors['textareaInstructions'].getContent()){
			this.fire('done');
		} else {
			this.fire('processNextEvent');
		}
	},
	
	setRevision: function(){
		this.$.formName.readonly = true;
	},
	
	createDuplicated: function (record) {
		this.revisionNumber = 0;
		this.formName = record.name;
		if (record.description_longdescription) {
			tinymce.editors['textareaInstructions'].setContent(record.description_longdescription);
		}
		this.originalFormNum = record.inspformnum;
	},
	
	_done: function (e) {
		e.stopPropagation();
		
		var container = {};
		container.props = 'inspectionformid,name';
		
		var currentUser = $M.userInfo.personid;
		var object = {};
		object.name = this.formName;
		object.description_longdescription = tinymce.editors['textareaInstructions'].getContent();
		object.hasld = true;
		object.inspformnum = this.inspectionFormNum;		
		object.revision = this.revisionNumber;
		if(this.record.isrevision===true){
			//object.hasrevision = true;
			object.originalformnum = this.record.originalformnum;
		}
		object.status = this.state.value;
		object.inspquestion = this.questions;
		object.orgid = this.record.orgid;
		
		//need to make sure inspectionformid does not overwrite the newly created one from the question record.
		if(this.questions){
			for (var i = 0; i<this.questions.length; i++){
				delete this.questions[i].inspectionformid;
				delete this.questions[i].inspquestionid;
				// description is required
				if (!this.questions[i].description || this.questions[i].description === ''){
					//$M.notify($M.localize('uitext', 'mxapiinspection','validationmsg'), $M.alerts.error);
					this.questions[i].description = $M.localize('uitext','mxapiinspection','enter_description');
				}
			}
		}
		
		container.record = object;
		if(this.isNewRecord == true){
			//add record
			this.fire('createUpdate', container);
		} else {
			//update record
			this.fire('updateInspectionForm', container);
		}
		
		
	},
	
	_buildColumns: function() {
		return [
		        {'attribute':'itemNumber','title': $M.localize('uitext','mxapiinspection','item_number')},
		        {'attribute':'question','title':$M.localize('uitext','mxapiinspection','question')},
		        {'attribute':'numberFields','title':$M.localize('uitext','mxapiinspection','number_fields')},
		        {'attribute':'isRequired','title':$M.localize('uitext','mxapiinspection','is_required')}
		       ];
	},
	
	_questionsChanged: function(x){
		if(this.questions && this.questions.length > 0){
			this._setHasQuestions(true);
		} else {
			this._setHasQuestions(false);
		}
	},
	
	_handleError: function(e) {
		this._setHasQuestions(false);
	},
	
	_groupQuestion: function (e) {
		this._uncheckGroupAll();
		var nextGroupID = this._findFirstSelected();
		var newGroupText = $M.localize('uitext', 'mxapiinspection', 'newgroup');
		var newQuestion = {'description': newGroupText};
		newQuestion.inspfield = [];
		newQuestion.groupid = nextGroupID;
		newQuestion.groupseq = nextGroupID;
		newQuestion.sequence = 0; //always 0 for group headers
		newQuestion._action = 'Add';

		var firstCBIndex = this._updateGroupOnSelected(nextGroupID);	// returns array index of first selected checkbox
		this.questions.splice(firstCBIndex, 0, newQuestion);

	    this.questions.sort(function(a, b){return a.groupseq - b.groupseq;});	// sort by groupseq
	    this.fire('resequenceQuestions', this.questions);	// this will cause a server update

		this._clearCheckboxes();		
	},

	colorCheck(question){
		if(this._isGroupHeader(question)){
			var newGroupText = $M.localize('uitext', 'mxapiinspection', 'newgroup');
			if(question.description === newGroupText){
				$j(this.getTopParentElement()).find('#done')[0].disabled=true;
				return ' highlight';
			}
		}
	},
	
	_formatSequence: function(question){
		if (this._isGroupChild(question)){
			return parseFloat(question.groupseq).toFixed(2);
		} else {
			return question.groupseq;
		}
	},
	
	_findFirstSelected(){
		var newGroupNumber = 0;
		for (var i = 0; i<this.questions.length; i++){
			var question = this.questions[i];
			if(question.checked){
				newGroupNumber = question.sequence;
				break;
			}
		}	
		return newGroupNumber;
	},

	_updateGroupOnSelected(g){
		var newSequence = 1;
		var firstCheckedIndex = -1;
		for (var i = 0; i<this.questions.length; i++){
			var question = this.questions[i];
			if(question.checked){
				if (firstCheckedIndex < 0){
					firstCheckedIndex = i;
				}
				question.groupid = g;
				question.sequence = newSequence;
				question.groupseq = this._generateGroupSeq(question);
				question._action = 'Update';
				newSequence++;
				question.checked = false;
			}
		}
		return firstCheckedIndex;
	},
	
	_clearCheckboxes(){
		$j(this.$.questionTable).find('.cbgroup').each(function(idx, cb){
			if (cb.checked){
				cb.checked = false;
			}
		});
		this._disableCreateGroup = true;
	},
	
	_newQuestion: function (e) {
		this._closeAllGroupInfos(true);  // set update only, otherwise you get record update conflict
		this._clearCheckboxes();
		
		this.fire('setNextEvent', {'event': 'showQuestionBuilder', 'target': this});
		this.saveForm(e);	//save inspform
		this.fire('saveQuestionDescriptions', this.questions);	// save any uncommitted question description changes

		this.isNewQuestion = true;
		//close the instructions so the screen compresses and isn't too large with dialog scrolled at bottom.
		this.fire('collapseInstructions');
	},

	_getQuestionNum: function(theId){
		var firstUnderbar = theId.indexOf('_');
		var secondUnderbar = theId.indexOf('_',firstUnderbar+1);
		return theId.substring(firstUnderbar+1,secondUnderbar);
	},
	
	_getQuestionForNum: function(nbr){
		for(var i=0;i<this.questions.length;i++){
			var question = this.questions[i];
			if(question.inspquestionnum === nbr){
				return question;
			}
		}
		return null;
	},
	
	_showQuestionBuilder: function(){		
		//TODO turn button-color to green show modal div
		var mxBtn = this.$.newQuestion;
		mxBtn.classList.add('selectedButton');

		this.async(function(){
			var modalTopPosition = 100;
			var btn = mxBtn.querySelector('BUTTON');
			var btnRec = btn.getBoundingClientRect();
			if (btnRec && btnRec.bottom > 0) {
				modalTopPosition = btnRec.bottom + window.GetWindowScroll()[1];
			}else {
				btnRec = mxBtn.getBoundingClientRect();
				if (btnRec && btnRec.bottom > 0) {
					modalTopPosition = btnRec.bottom + window.GetWindowScroll()[1];
				}
			}
			var modal = this.$.questionModal;
			modal.style.display = 'block';
			modal.style.paddingTop = modalTopPosition + 'px';
			var footer = $j('#workscape_footer')[0];
			var padBot = footer.clientHeight + 20;
			modal.style.paddingBottom = padBot + 'px';
			var qtRec = $j('.questionTable')[0].getBoundingClientRect();
			var mRec = modal.getBoundingClientRect();
			if (modal.scrollHeight > footer.offsetTop){
				var headerHeight = $M.workScape.getHeaderHeight();
				if (qtRec.bottom > modal.clientHeight){
					modal.style.paddingBottom = padBot + headerHeight + qtRec.bottom - mRec.bottom + 'px';
				}
			}
	        this.$.questionBuilder.fire('setFocus');
			this.fire('updateButtons');
		},300);
	},
	
	_closeModal: function() {
		var mxBtn = this.$.newQuestion;
		mxBtn.classList.remove('selectedButton');
				
		var modal = this.$.questionModal;
		modal.style.display = 'none';
		this.fire('updateButtons');
	},

	_handleRecordCreated: function (e) {
	},
	
	/**
	 *	The table header was clicked, so we need to get the list of unregistered device types again, but with the sorting
	 *	defined by the data details.
	 **/
	_handleUpdateSort: function(data){

		//if the the column is not sortable, do nothing.
		if(!data.detail.sortable){
			return;
		}
	
		var attribute = data.detail.attribute;
	
		//store the next sort type
		var nextSortType;
		var self = this;
	
		var toSet = [];
	
		//update the columns and reset all sort types except the chosen one. The chosen one progresses to the next sort type.
		this.columns.forEach(function(col){
			if(data.detail.attribute === col.attribute){
				//change to the next sort type.
				col.sortType = self.$.questionsTable.nextSortType(col);
				nextSortType = col.sortType;
			}else{
				col.sortType = 'neutral';
			}
	
			toSet.push(col);
		});
	
		//when descending, the attribute type must have a - in front for IoT
		if(nextSortType === 'descending'){
			attribute = '-' + attribute;
		}else if(nextSortType === 'neutral'){
			//remove attribute
			attribute = '';
		}
	
		//set the columns
		this.set('columns',toSet);
	
	},
	
	_getTableRow: function(source){
		while (source){
			if(source.tagName === 'TR'){
				break;
			}
			source = source.parentElement;
		}
		return source;
	},
	
	deleteQuestion: function (e) {
		this.fire('saveQuestionDescriptions', this.questions);
		var detail = e.detail;
		var question = e.model.formQuestion;
		var tableRow = this._getTableRow(detail.sourceEvent.target);
		
		var message = $M.localize('uitext','mxapiinspection','inspquestion_deleted');
		
		var self = this;
		var _performDeleteQuestion = function(overlayNode) {
			self.fire('deleteQuestion', question);
			self.fire('enableFooterButtons', {buttons: ['goback','done'] });
		};

		if (this._isGroupHeader(question)){
			this.closeGroupDesc(e);
		}
		this.fire('disableFooterButtons', {buttons: ['goback','done'] });
		window._revertContext = this;
		$M.createOverlay(tableRow, message, _performDeleteQuestion, this._revertDeleteQuestion, this.undoIntervalSecs, null, null, true);
	},
	
	_revertDeleteQuestion: function (x) {
		this._revertContext.fire('enableFooterButtons', {buttons: ['goback','done'] });
	},

	checkContent: function(e){
		if((e.target.value==='') || ($M.localize('uitext', 'mxapiinspection', 'newgroup')===e.target.value)){
			e.target.value='';
		}
	},
	
	editQuestion: function(e){
		//save form if record changed
		this.saveForm(e);
		// dont save description on the question we're editing (or you get updated by another user error)
		if(e.model.formQuestion._action === 'Update'){
			e.model.formQuestion._action = '';
		}
		this.fire('saveQuestionDescriptions', this.questions);
		this.$.questionBuilder.question = e.model.formQuestion;
		this._showQuestionBuilder();
	},
	
	duplicateQuestion: function(e){
		this.saveForm(e);
		var question = e.model.formQuestion;
		if (!question.description || question.description === ''){
			question.description = $M.localize('uitext','mxapiinspection','enter_description');
		}
		this._duplicatedGroupHeader = undefined;
		this._duplicatedGroupChildren = [];
		this.questionHref = question.href;
		var properties = {'href': question.localref};
		this.$.questionResource.duplicateRecord(question, properties);	
	},

	getPlaceholder: function(question){
		if(this._isGroupHeader(question)){
			return $M.localize('uitext', 'mxapiinspection','newgroup');
		}
		else{
			return $M.localize('uitext', 'mxapiinspection','enter_question_name');
		}
	},

	getNewCopyDescription: function(question){
		var copySuffix = $M.localize('uitext','mxapiinspection','copy');
		var desc = question.description;
		var copyIndex = desc.indexOf('('+copySuffix);
		if(copyIndex>=0){ //this record has copy in the name, strip it to get base
			desc = desc.substring(0,copyIndex).trim();
		}
		var nextNbr = 1;
		//search all question to see if this exists already
		for(var i=0;i<this.questions.length;i++){
			var checkQuestion = this.questions[i];
			//really only need to search for same group or group=0 if question's group=0 unless its a group header
			if(this._isGroupHeader(question) || (checkQuestion.groupid === question.groupid)){
				var cqOrigDesc = checkQuestion.description;
				var cqDesc = checkQuestion.description;
				copyIndex = cqDesc.indexOf('('+copySuffix);			
				//this record has copy in the name, strip it to get to base
				cqDesc = cqDesc.substring(0,copyIndex).trim();
				if(cqDesc === desc){
					if(copyIndex>=0){ 
						//now find if the string already contained a copy number, if so, store its number
						var copySuffixLth = copySuffix.length;
						var copyNbrIdx = copyIndex+1+copySuffixLth;
						var closingIdx = cqOrigDesc.indexOf(')',copyNbrIdx);
						var newNbr = cqOrigDesc.slice(copyNbrIdx,closingIdx).trim();
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
		}
		var displayNbr = '';
		if(nextNbr>1){
			displayNbr = ' '+nextNbr;
		}
		desc = desc+' ('+$M.localize('uitext','mxapiinspection','copy')+displayNbr+')';
		return desc;
	},
	
	_handleRecordDuplicatedSuccess: function(e){
		if (e.detail && e.detail.inspquestion){
			var newQuestion = e.detail.inspquestion[0];
			newQuestion.description = this.getNewCopyDescription(newQuestion);
			newQuestion._action = 'Add';
			if(this._isGrouped(newQuestion)){
				this.questions.splice(this._findLastGroupQuestionIndex(newQuestion.groupid) + 1, 0, newQuestion);
				if (this._isGroupHeader(newQuestion)){	// when duplicating a group header, also duplicate it's children
					this._duplicatedGroupHeader = newQuestion;
					this._copyGroupChildren(newQuestion);
				} else if (this._duplicatedGroupHeader){	// a group child was duplicated as part of a group
					if (this._duplicatedGroupChildren.length > 0){
						this._removeDuplicatedGroupChild(newQuestion);	// remove it from the duplicated children list
					} else {
						this._duplicatedGroupHeader = undefined;
					}
				}
			} else {	// duplicating an ungrouped question
				newQuestion.sequence = newQuestion.sequence + 1;	// don't reset sequence for group headers
				this.questions.splice(this._findQuestionIndex(this.questionHref)+1, 0, newQuestion);
			}

			this.duplicatedQuestionIDs.push(newQuestion.inspquestionnum);
			if (this._duplicatedGroupChildren.length === 0){	// resequence if there are no children left to copy
				this.fire('resequenceQuestions', this.questions);	// this will cause a server update
			}
		}
	},
	
	_showDup: function(question, index){
		if(this.duplicatedQuestionIDs.length>0){
			var idIdx = this.duplicatedQuestionIDs.indexOf(question.inspquestionnum);
			if(idIdx >= 0){
				this.duplicatedQuestionIDs.splice(idIdx,1);
				//Temporarily change color for 2 seconds
				$j($j(this.$.questionTable).find('.questionRow')[index]).css({'background-color':'#C8F08F'});
				var self = this;
				setTimeout(function(){ 
					$j($j(self.$.questionTable).find('.questionRow')[index]).removeAttr('style');
		    	}, 2000);
				return 'display: block;';
			}
			else{
				return 'display: none;';
			}
		}
		else{
			return 'display: none;';
		}
	},
	
	_copyGroupChildren: function(question){
		this._duplicatedGroupChildren = this._getGroupChildren(question.groupid);
	    for(var i=0; i < this._duplicatedGroupChildren.length; i++){
			this.questionHref = this._duplicatedGroupChildren[i].href;
			var properties = {'href': this._duplicatedGroupChildren[i].localref};
			this.$.questionResource.duplicateRecord(this._duplicatedGroupChildren[i], properties);
	    }
	},
	
	_removeDuplicatedGroupChild: function(question){
	    for(var i=0; i < this._duplicatedGroupChildren.length; i++){
			var child = this._duplicatedGroupChildren[i];
			if (child.groupid === question.groupid && child.sequence === question.sequence){
				this._duplicatedGroupChildren.splice(i, 1); //remove it
				break;
			}
	    }
	},
	
	_findQuestionIndex: function(href){
		for(var i=0;i<this.questions.length;i++){
  			if(this.questions[i].href === href){
  				return i;
  			}
  		}
		return -1;
	},
	
	_groupCheckedAll: function(e){
		var checked = e.currentTarget.checked;
		var hasChecked = false;
		var self = this;
		$j(this.$.questionTable).find('.cbgroup').each(function(idx, cb){
			var question = self.$.inspectionQuestionTemplate.itemForElement(cb);
			if (question && !self._isGrouped(question)){
				question.checked = checked;
				cb.checked = checked;
				hasChecked = true;
			}
  		});
		if (hasChecked){	// don't enable create group if there are no checked boxes
			this._disableCreateGroup = !checked;
		}
	},
	
	_groupChecked: function(e){
		// set the question.checked value
		e.model.formQuestion.checked = e.currentTarget.checked;
		// enable/disable the createGroup button
		var checked = false;
		$j(this.$.questionTable).find('.cbgroup').each(function(idx, cb){
			if (cb.checked){
				checked = true;
			}
		});
		this._disableCreateGroup = !checked;
		this._uncheckGroupAll();
	},
	
	_uncheckGroupAll: function(){
		if($j('.cbgroupall').length > 0){	// disable check all
			$j('.cbgroupall')[0].checked = false;
		}
	},
		
    _getRequiredLabel: function(question) {
    	var label = $M.localize('uitext','mxapibase','No');
    	if (this._isRequired(question) === true) {
			label = $M.localize('uitext','mxapibase','Yes');
    	}
   		return label;
    },
    
	_isRequired: function(question) {
		var required = false;
		if ( this._isGroupHeader(question) ) { //Check if children questions are required
			var qChildren = (question.children) ? question.children : this._getGroupChildren(question.groupid);
			for (var j = 0; j < qChildren.length; j++ ) {
				var qChild = qChildren[j];
				//Set question as required if it finds at least one required question
				if (this._isRequired(qChild)){
					required = true;
					break;
				}
			}
		} else if (question && question.inspfield) { // check if fields are required 
			var fields = question.inspfield;

			//Iterates over fields of that question
			for (var i = 0; i < fields.length; i++) {
				var field = fields[i];
				//Set question as required if it finds at least one required field
				if (field.required === true){
					required = true;
					break;
				}
			}
		}
		return required;
	},

    _groupClass: function(question, index){
    	var rowclass = '';
		if (question.groupid){
				rowclass = 'groupQuestion';
				// are we at the last row in the table or this group?
				if ((index + 1) === this.questions.length || this.questions[index + 1].groupid !== question.groupid){
					rowclass = 'groupQuestionLast';
				}
				// are we at a group header?
				if (this._isGroupHeader(question)){
					rowclass = 'groupHeader';
				}
    	}
    	return rowclass;
    },
	
	_move: function(record, newIndex) {
		// find question array object and move it
		var targetQuestion = this.questions[newIndex];
		var hasChildren = false;
		var removedItems = [];
  		for(var i=0; i< this.questions.length; i++){
  			if(this.questions[i].href === record.href){	// find record in questions array
  				var question = this.questions[i];
  	  			var howMany = 1;
				// determine whether the question is a group header, group child or neither, and if we're dropping into a group 
				if (this._isGroupHeader(question)){	// dropping a question header, children need to be moved
					hasChildren = true;
					if (this._isGrouped(targetQuestion)){	// if target is a group, insert at end of group
						var targetGroup = targetQuestion.groupid;
						while (newIndex < this.questions.length && this.questions[newIndex].groupid === targetGroup){
							newIndex++;
						}
					}
				} else if (this._isGrouped(targetQuestion)){	// dropping a question into a group, set groupid
					question.groupid = targetQuestion.groupid;
					if (this._isGroupHeader(targetQuestion)){// dropping a question onto a group header, set groupid, inc index
						if (targetQuestion && question.groupseq > targetQuestion.groupseq){	// fix index when dropping on header
							newIndex ++;	// drop past the header
						}
					}
				} else if (this._isGrouped(question)){	// dropping a question outside of a group, clear groupid if set
					question.groupid = null;
					question.sequence = null;
				}
  				if (hasChildren){	// remove child questions as well
  					for (var j=i+1; j < this.questions.length; j++){
  						if (this.questions[j].groupid === question.groupid){
  							howMany ++;
  						}
  					}
  				}
  				removedItems = this.questions.splice(i, howMany);
				if (targetQuestion && this._isGroupHeader(question) && question.groupseq < targetQuestion.groupseq){// fix index when moving groups down
					newIndex = newIndex - removedItems.length;
				}
  				break;
  			}
  		}
  		
		if (newIndex < 0){ // dropped at top of table
			newIndex = 0;
		} else if (newIndex > this.questions.length) {	// dropped at bottom of table
			newIndex = this.questions.length;
		}

 		for(i=0; i< removedItems.length; i++){  // insert removed items
  			this.questions.splice(newIndex + i, 0, removedItems[i]);
  		}
  		this.fire('resequenceQuestions', this.questions);
	},
	_drop: function(e){
		var datalist = this.$.questionTable;
		e.preventDefault();
		$j(e.currentTarget).toggleClass('dropTarget', false);
		if(e.originalEvent.dataTransfer){
			var record = JSON.parse(e.originalEvent.dataTransfer.getData('application/json'));
			if (record){
				datalist.dragging = false;
				this._move(record, datalist.dropIndex?datalist.dropIndex:0);
			}
		}
	},
	_bindContainerDropEvents: function(){  // call for the container:  the question table
		var table = this.$.questionTable;
		var form = this;
		if(!table.containerDropEvents && table.dropSource !== null){
			$j(table).on('drop', function(e){
				form._drop(e);
			});
			$j(table).on('dragover', function(e){
				if(table.dropSource.dragging === true){
					e.preventDefault();
				}
			});
			$j(table).on('dragenter', function(e){
				$j(e.currentTarget).toggleClass('dropTarget', true);
				e.stopPropagation();
			});
			$j(table).on('dragleave', function(e){
				$j(e.currentTarget).toggleClass('dropTarget', false);
				e.stopPropagation();
			});
			$j(table).on('dragend', function(e){
				form.async(function(e){
					table.dragging = false;
					if(table.dropSource){
						table.dropSource.dragging = false;
					}
				},100);
			});
			table.containerDropEvents = true;
		}
	},
	_bindEvents: function(){
		this.async(function(){
			// attach events for each row
			var form = this;
			var qtable = this.$.questionTable;
			var questions = this.questions;
			$j(qtable).find('.questionRow').each(function(idx, row){
				// set datalist-index
				$j(row).attr({'datalist-index': idx});
				$j(row).attr({'isGrouped': form._isGrouped(questions[idx])});
				$j(row).attr({'groupid': questions[idx].groupid});
				$j(row).attr({'isGroupHeader': form._isGroupHeader(questions[idx])});
				$j(row).attr({'isGroupChild': form._isGroupChild(questions[idx])});
				
				// bind mousemove event for row focus
				$j(row).on('mousemove', function(e){
					var datalist = this.parentElement.parentElement; // question table
					var row = e.currentTarget;
					if(datalist.hovered && datalist.hovered !== row){
						datalist.hovered.toggleClass('hovered', false);
					}
					datalist.hovered = $j(row);
					$j(row).toggleClass('hovered', true);
					e.stopPropagation();
				});
				
				// bind drag/drop events for each row
				form._bindDragEvents(qtable, row);
				form._bindDropEvents(qtable, row);
			});
		});
	},
	_bindDropEvents: function(table, element){	// called for each row in the table
		var item = $j(element);
		var datalist = table;
		var form = this;
		datalist.itemDragOver = function(target, offsetX, offsetY){
			if(datalist.dropSource && datalist.dropSource.dragging === true){
				datalist.dropIndex = parseInt($j(target).attr('datalist-index'));
				return true;
			}
			return false;
		};
		if(item.attr('drag-enabled') === undefined){
			if(datalist.dropSource === datalist){
				item.on('drop', function(e){
					e.preventDefault();
					form.fire(datalist.addEvent, {'eventIndex': datalist.dropIndex?datalist.dropIndex:-1, 'records': datalist._selectedRecords});
				});
			}
			item.on('dragenter', function(e){
				$j(e.currentTarget).toggleClass('dropTarget', true);
				e.stopPropagation();
			});
			item.on('dragover', function(e){
				$j(e.currentTarget).toggleClass('dropTarget', true);
				var row = e.currentTarget;
				var draggedItem = JSON.parse($j(datalist).attr('draggeditem'));
				var dropIndex = parseInt($j(row).attr('datalist-index'));

				var headerHeight = $j('#inspectorsupmain_formEdition_mainPage').position().top;
				var wsHeight = $M.workScape.getHeight();
				var rowcr = row.getBoundingClientRect();
				if (window._waitingForTimeout !== true){
					var scrollAmt = 0;
					if (rowcr.top - 50 < headerHeight){	// there are more rows above
						scrollAmt = -50;
						window._waitingForTimeout = false;
					} else if(rowcr.bottom + 50 > headerHeight + wsHeight){ // there are more rows below
						scrollAmt = 50;
						window._waitingForTimeout = false;
					}
					if (scrollAmt !== 0 && !window._waitingForTimeout){
						window._waitingForTimeout = true;
						window.setTimeout(function(){		// slow down the scrolling
							window.scrollBy(0, scrollAmt);
							window._waitingForTimeout = false;
						}, 300);
					}
				}
				
				if (draggedItem.index === dropIndex){		// can't drop when the indexes match
					e.originalEvent.dataTransfer.dropEffect = 'none';
				} else if (draggedItem.isGroupHeader && draggedItem.groupid === parseInt($j(row).attr('groupid'))){	// can't drop a header when the groupids match
					e.originalEvent.dataTransfer.dropEffect = 'none';
				} else {
					e.originalEvent.dataTransfer.dropEffect = 'move';
					if(datalist.itemDragOver(row, e.offsetX, e.offsetY)){
						e.preventDefault();
						e.stopPropagation();
					}
				}
			});
			item.on('dragleave', function(e){
				$j(e.currentTarget).toggleClass('dropTarget', false);
				datalist.dropIndex = -1;
				e.stopPropagation();
			});
			item.attr('drag-enabled', 'true');
		}
	},
	_bindDragEvents: function(table, element){	// called for each row in the table
		var datalist = table;
		var form = this;
		$j(element).attr({'draggable':'true'});
		$j(element).on('contextmenu', function(e){
			e.preventDefault();
			e.stopPropagation();
		});

		$j(element).on('dragstart', function(e){
			datalist.dragging = true;
			var index = form.$.inspectionQuestionTemplate.indexForElement(e.currentTarget);
			var question = form.questions[index];
			$j(datalist).attr({'draggeditem': JSON.stringify({'index': index, 
					'isGrouped': form._isGrouped(question),
					'groupid': question.groupid,
					'isGroupHeader': form._isGroupHeader(question), 
					'isGroupChild': form._isGroupChild(question)}) });
			
			e.originalEvent.dataTransfer.setData('application/json', JSON.stringify(question));
			e.originalEvent.dataTransfer.effectAllowed = 'move';
		});
		$j(element).on('dragend', function(e){
			datalist.dragging = false;
			datalist.draggeditem = undefined;
		});
		var ts;
		element.addEventListener('touchstart', function(e){
			ts = e.touches[0].clientY;
			if(!e.currentTarget.longTapTimeout && !e.currentTarget.longTapped){
				e.currentTarget.longTapped = true;
				e.currentTarget.longTapTimeout = window.setTimeout(function(){
					if(!datalist.dragging){
						datalist.dragging = true;
					}
				},300);
			}
		}, datalist.supportsPassive ? { passive: true } : false); 
		$j(element).on('touchmove', function(e){
			if(true === datalist.dragging){
				if(datalist.dragItem){
					datalist.dragItem.css({'position':'absolute','left':datalist._getCoords(e)[0]+'px','top':datalist._getCoords(e)[1]+'px'});
				}
				return;
			}
			if(e.shiftKey){
				this._select(e);
			}
			else if(e.ctrlKey){
				var selected = $j(e.currentTarget).attr('aria-selected')==='true';
				if(!selected){
					form._selectElement(e.currentTarget, true);
				}
			}
			if(!datalist.dragItem){
				datalist.dragItem = $j(e.currentTarget).clone();
				$j(datalist.dragItem).css({'background-color':'#7cc7ff'});
				$j('body').append(datalist.dragItem);
			}
			datalist.dragItem.css({'position':'absolute','left':datalist._getCoords(e)[0]+'px','top':datalist._getCoords(e)[1]+'px'});
			datalist.dragging = true;
		});
		$j(element).on('touchend', function(e){
			if(e.currentTarget.longTapTimeout){
				window.clearTimeout(e.currentTarget.longTapTimeout);
				e.currentTarget.longTapTimeout = null;
			}
			delete e.currentTarget.longTapped;
			var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
			if(datalist.dragItem){
				$j(datalist.dragItem).remove();
				datalist.dragItem = null;
			}
			var dropTarget = document.elementFromPoint(touch.clientX,touch.clientY);
			if(datalist.dragTarget === dropTarget){
				datalist.dragTarget._drop(e);
			}
			else if(datalist.dragTarget.contains(dropTarget)){
				var index = $j(dropTarget).attr('datalist-index');
				datalist.dragTarget.fire(datalist.dragTarget.addEvent, {'eventIndex': index?index:-1, 'records': datalist._selectedRecords});
			}
			datalist.dragging = false;
		});
	}

});
