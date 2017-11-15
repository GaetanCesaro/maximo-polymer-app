/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-inspector-container',
	
  	behaviors: [BaseComponent, Polymer.IronResizableBehavior, QuestionGroups],
  	
  	listeners: {
  		'iron-resize': '_onIronResize',
  		'chooseQuestion' : '_questionSelectedinList',
  	},
  	
    properties: {
    	
    	/**
    	 * inspresult record
    	 */
    	recordResult: {
    		type: Object,
    		observer: '_inspResultChange'
    	},
    	
    	/**
    	 * inspection form template
    	 */
    	inspform: {
    		type: Object,
    		observer: '_inspFormChanged'
    	},
    	
    	/**
    	 * flag to show or hide instruction
    	 */
    	hasInstruction: {
    		type: Boolean,
    		computed: '_checkInstruction(inspform)'
    	},
    	
    	/**
    	 * inspection form response field
    	 */
    	inspfieldresult: {
    		type: Array,
    		value: []
    	},
    	
    	/**
    	 * questions array of inspection template
    	 */
    	questions: {
    		type: Array,
    		value: [],
    	},
    	
    	/**
    	 * list of question passed to datalist component
    	 */
    	dataListQuestions: {
    		type: Array,
    		value: []
    	},
    	
    	/**
    	 * original data list questions
    	 * to restore after filtering
    	 */
    	originalDataListQuestions: {
    		type: Array,
    		value: [],
    		readOnly: true
    	},
    	
    	/**
    	 * Question progress object
    	 * read only
    	 */
    	progress: {
    		type: Object,
    		computed: 'computeQuestionProgress(originalDataListQuestions)'
    	},
    	
    	/**
    	 * flag if total questions same as required total
    	 * read only
    	 */
    	allRequired: {
    		type: Boolean,
    		value: false,
    		computed: 'computeAllRequired(progress)'
    	},
    	
    	/**
    	 * flag if has non required questions
    	 */
    	nonRequired: {
    		type: Boolean,
    		value: false,
    		computed: 'computeNonRequired(progress)'
    	},
    	
    	/**
    	 * hide Divisor indicator
    	 * read only
    	 */
    	hideDivisor: {
    		type: Boolean
    	},
    	
    	/**
    	 * Check box label
    	 */
    	hideOptional: {
    		type: String,
    		value: function() {
    			return $M.localize('uitext','mxapibase','No');
    		}
    	},
    	
    	/**
    	 * completion Filter
    	 */
    	completionFilter: {
    		type: String,
    		value: ''
    	},
    	
    	/**
    	 * hide optional filter
    	 */
    	requiredFilter: {
    		type: Boolean,
    		value: false
    	},
    	
    	/**
    	 * Flag to allow user complete inspection execution
    	 */
    	isInspectionComplete: {
    		type: Boolean,
    		value: false,
    		observer: '_allowInspectionCompletion'
    	},
    	
    	/**
    	 * Object type
    	 */
    	objectType: {
    		type: String,
    		computed: 'computeObjectType(recordResult)'
    	},
    	
    	/**
    	 * Object description
    	 */
    	objectDescription: {
    		type: String,
    		computed: 'computeObjectDescription(recordResult)'
    	},
    	
    	/**
    	 * flag to show or hide Done Button
    	 */
    	isCompleted: {
    		type: Boolean,
    		computed: '_isCompleted(recordResult)'
    	},
    	
	},
	
	observers: [
	            'hasDivisor(allRequired, nonRequired)',
	            'filterQuestions(completionFilter, requiredFilter)'
	          ],
	
	ready: function() {
		this.isInspectionComplete = false;
	},
	
	/**
	 * window resize listener
	 */
	_onIronResize: function() {
		
		var height = $M.workScape.getHeight();
		
		$j(this.$.shell).height((height));
		$j(this.$.instructionDialog).height((height));
	},
	
	/**
	 * isInspectionComplete observer
	 */
	_allowInspectionCompletion: function (isInspectionComplete) {
		
		this.$.completeButton.disabled = !isInspectionComplete;
		this.$.completeButton.classList.remove('hiddenIcon');
		if (!isInspectionComplete) {
			this.$.completeButton.classList.add('hiddenIcon');	
		}
	},
	
	/**
	 * Record / InspectionForm observer
	 */
	_inspResultChange: function(newV) {

		var inspForm = newV.inspectionform;
		if (!inspForm) {
			return;
		}
		
		if (inspForm && inspForm.length > 0) {
			inspForm = inspForm[0];
		}

		this.resetFilters();
		
		var inspFieldResult = (newV.inspfieldresult) ? newV.inspfieldresult : [] ;
		
		this.set('inspfieldresult', inspFieldResult);
		this.set('inspform', inspForm);
		
		
	},
	
	/**
	 * Inspection Form Observer
	 */
	_inspFormChanged: function(newInspForm) {
		var questions = newInspForm.inspquestion;
		
		this.setClonedQuestions(questions);
		
		questions = this._removeChildrenForStructureChange(questions);
		questions = this._flatToHierarchy(questions);
		
		this.set( 'questions', questions);

	},
	
	/**
	 * Clone question list and store in variables
	 */
	setClonedQuestions: function (questions) {
		
		questions = this._removeChildrenForStructureChange(questions);
		questions = this._flatToHierarchy(questions);
		
		this.set('dataListQuestions' ,this._cloneQuestions(questions) );
		this._setOriginalDataListQuestions( this._cloneQuestions(questions) );
		
		this.filterQuestions(this.completionFilter, this.requiredFilter);

	},
	
	/**
	 * Clone question set to apply filter
	 */
	_cloneQuestions: function (questions) {
		
		var cloneSet = JSON.parse( JSON.stringify( questions ) );
		
		for (var i = 0; i < cloneSet.length; i++) {
			var question = cloneSet[i];
			
			var qChildren = (question.children) ? question.children : [];
			for (var j = 0; j < qChildren.length; j++) {
				this.setAuxiliaryAttributes(qChildren[j]);
			}

			this.setAuxiliaryAttributes(question);
		}
		
		return cloneSet;
		
	},
	
	/**
	 * Include auxiliary attributes
	 * 
	 * _required
	 * _is
	 * 
	 * ** Applied to hierarchical structure **
	 */
	setAuxiliaryAttributes: function(question) {
		
		question._required = false;
		question._done = true;
		question._icon = 'Maximo:Confirm';
		
		if ( this._isGroupHeader(question) ) { //Check if children questions are required
		
			var qChildren = (question.children) ? question.children : [];
			for (var k = 0; k < qChildren.length; k++ ) {
				var qChild = qChildren[k];
				//Set question as required if it finds at least one required question
				if (qChild._done === false){
					question._done = false;
					question._icon = 'Maximo:Circle';
				}
			}
			for (var j = 0; j < qChildren.length; j++ ) {
				var qChildA = qChildren[j];
				//Set question as required if it finds at least one required question
				if (qChildA._required && qChildA._required === true){
					question._required = true;
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
					question._required = true;
					break;
				}
			}
			
			var isDone = this._isQuestionComplete(question);
			question._done = isDone;
			question._icon = (isDone) ? 'Maximo:Confirm' : 'Maximo:Circle' ;
		}
		
	},
	
	/**
	 * Finds if question is complete matching inspfield and inspresponsefield
	 */
	_isQuestionComplete: function (question) {
		//How to identify if question is done ?
		//If question is not required check if any field has any response
		//If question is required check if required fields are answered
		
		var isComplete = false;
		var fields = (question.inspfield) ? question.inspfield : [];
		var answers = this._extractValidResponses();
		
		if (answers.length <= 0 ) {
			return isComplete;
		}
		
		var resultField;
		
		if (question._required === false) { //If question is not required check if any field has any response
			
			var sampleField = fields[0];
			for (var i = 0; i < answers.length; i++) {
				resultField = answers[i];
	
				if (sampleField.inspformnum === resultField.inspformnum && 
						sampleField.inspquestionnum === resultField.inspquestionnum && 
						sampleField.revision === resultField.revision) {
	
					isComplete = true;
				}
			}
				
		} else { //If question is required check if required fields are answered
			
			var reqFields = this._extractRequiredFields(fields);
			isComplete = true;
			
			outerl:
			for (var j = 0; j < reqFields.length; j++) {
				var qfield = reqFields[j];
			
				innerl:
				for (var k = 0; k < answers.length; k++) {
					resultField = answers[k];

					if (qfield.inspformnum === resultField.inspformnum && 
							qfield.inspquestionnum === resultField.inspquestionnum && 
							qfield.inspfieldnum === resultField.inspfieldnum &&  
							qfield.revision === resultField.revision &&
							resultField.revision !== undefined &&
							resultField.revision !== '' ) {

						continue outerl;
						
					}
				}
				isComplete = false;
				break;
			}
		}
		
		return isComplete;
	},
	
	/**
	 * Grab valid responses
	 */
	_extractValidResponses: function () {
		
		var answers = (this.inspfieldresult) ? this.inspfieldresult : [];
		var validAnwsers = [];
		
		for (var i = 0; i < answers.length; i++) {
			
			if ( (answers[i].txtresponse && answers[i].txtresponse !== '') || 
					(answers[i].numresponse && answers[i].numresponse !== '') ) {
				validAnwsers.push(answers[i]);
			}
		}
		
		return validAnwsers;
	},
	
	/**
	 * Grab required fields
	 */
	_extractRequiredFields: function (fields){
		
		var requriedFields = [];
		
		for (var i = 0; i < fields.length; i++){
			if (fields[i].required === true){
				requriedFields.push(fields[i]);
			}
		}
		
		return requriedFields;
	},
	
	/**
	 * Find progress about all questions
	 * Compute function
	 */
	computeQuestionProgress: function (questions) {
		
		var progress = {};
		
		var qTotal = 0;
		var qCompleted = 0;
		var qReqTotal = 0;
		var qRecCompleted = 0;
		
		if (questions && questions.length > 0) {
			qTotal = this.countQuestions(questions);
			qReqTotal = this.countRequiredQuestions(questions);
			qCompleted = this.countCompletedQuestions(questions);
			qRecCompleted = this.countRequiredAndCompletedQuestions(questions);
		}
		
		if (qTotal === qCompleted || qReqTotal === qRecCompleted || qReqTotal === 0) {
			this.isInspectionComplete = true;
		} else {
			this.isInspectionComplete = false;
		}
		
		progress.total = qTotal;
		progress.completed = qCompleted;
		
		progress.reqtotal = qReqTotal;
		progress.reqcompleted = qRecCompleted;
		
		return progress;
		
	},
	
	/**
	 * Count total questions
	 */
	countQuestions: function (questions) {
		
		var totalQuestions = 0;

		for (var i = 0; i < questions.length; i++) {
			var q = questions[i];
			
			if (q.children) {
				totalQuestions += this.countQuestions(q.children);
			} else {
				totalQuestions++;
			}
			
		}
		return totalQuestions;
	},
	
	/**
	 * Count required questions
	 */
	countRequiredQuestions: function(questions) {

		var totalReqQuestions = 0;
		outerl:
		for (var i = 0; i < questions.length; i++) {
			var q = questions[i];
			
			if (q.children) {
				totalReqQuestions += this.countRequiredQuestions(q.children);
			} else if (q._required && q._required === true) {
				totalReqQuestions++;
			}
			
		}
		return totalReqQuestions;
		
	},
	
	/**
	 * Count completed questions
	 */
	countCompletedQuestions: function(questions) {
		var totalCompletedQuestions = 0;

		for (var i = 0; i < questions.length; i++) {
			var q = questions[i];
			
			if (q.children) {
				totalCompletedQuestions += this.countCompletedQuestions(q.children);
			} else if (q._done && q._done === true) {
				totalCompletedQuestions++;
			}
			
		}
		return totalCompletedQuestions;
	},
	
	/**
	 * countRequiredAndCompletedQuestions
	 */
	countRequiredAndCompletedQuestions: function (questions) {
		
		var totalCompReq = 0;

		for (var i = 0; i < questions.length; i++) {
			var q = questions[i];
			
			if (q.children) {
				totalCompReq += this.countRequiredAndCompletedQuestions(q.children);
			} else if (q._done && q._required && q._required === true && q._done === true) {
				totalCompReq++;
			}
			
		}
		return totalCompReq;
	},
	
	/**
	 * Listens to selected question
	 */
	_questionSelectedinList: function(e) {
		
		var questionListPanel = this.$.execution;
		
		if (e.detail._selectedRecords && (e.detail._selectedRecords.length > 0)) {
			var selectedRecord = e.detail._selectedRecords;
			questionListPanel.showQuestion(selectedRecord[0]);
			
			this.$.questionlist.clearSelected();
		}
	},
	
	/**
	 * Open dialog
	 */
	_showInfo: function(e) {
		e.stopPropagation();
		this.$.instructionDialog.classList.remove('hiddenContent');		
	},
	
	/**
	 * Closes dialog
	 */
	closeDialog: function(e) {
		this.$.instructionDialog.classList.add('hiddenContent');
	},
	
	/**
	 * Back one page
	 */
	exitExecution: function(e) {
		var self = this;
		var inspresultlistcollection = $M.getGlobalResource('inspresultlistcollection');
		inspresultlistcollection.refreshRecords();
		var pageName = 'inspResultList';
		self.fire('changePage',pageName);
	},
	
	/**
	 * Reset filters
	 */
	resetFilters: function() {
		//Reset filters
		this.set('requiredFilter', false);
		this.$.checkbox.checked = false;
		this.set('completionFilter', '');
		this.$.questionSelector.select(0);
	},
	
	/**
	 * Complete inspection
	 */
	done: function(e) {
		var detail = {'inspresult': this.recordResult, 'newstatus':'COMPLETED'};
		this.fire('changeInspectionStatus', detail);
	},
	
	/**
	 * Complex observer 
	 */
	hasDivisor: function(allRequired, nonRequired) {
		this.set('hideDivisor' , (allRequired || nonRequired));
	},
	
	/**
	 * Compute object description based on object reference of record result
	 */
	computeObjectDescription: function (recordResult) {
		
		var obj = recordResult.referenceobject;

		if ( obj === 'LOCATION' ) {
			return recordResult.locations.description;
		}else if ( obj === 'ASSET' ) {
			return recordResult.asset.description;	
		}
	},
	
	/**
	 * Compute object type based on object reference of record result
	 */
	computeObjectType: function (recordResult) {
		
		var objtype = recordResult.referenceobject;
		return $M.localize('uitext', 'mxapiinspresult', objtype.toLowerCase());
	},
	
	/**
	 * Computed function for all required flag
	 * Compute
	 */
	computeAllRequired: function (progress) {
		
		var allRequired = false;
		if (progress.reqtotal === progress.total ) {
			allRequired = true;
		}
		
		return allRequired;
	},
	
	/**
	 * Computed function for zero required flag
	 * Compute
	 */
	computeNonRequired: function (progress) {
		
		var nonReq = true;
		if (progress.reqtotal > 0 ) {
			nonReq = false;
		}
		
		return nonReq;
	},
	
	/**
	 * Compute show hide flag for instructions
	 */
	_checkInstruction: function(inspform) {
		var instruc = inspform.description_longdescription;
		if (instruc) {
			return true;
		}
		return false;
	},
	
	//------- Filtering functions -------\\
	
	/**
	 * Listens to tab selection
	 */
	selectTab: function (e) {
		
		var selectedTab = e.currentTarget.getAttribute('name');
		
		selectedTab = (selectedTab) ? selectedTab.toLowerCase() : selectedTab;
		
		//find external status value
		this.set('completionFilter', selectedTab);

	},
	
	/**
	 * Listens to toggle changes
	 */
	checkboxChanged: function(e) {

		var state = e.detail;
		
		if (state && state === true) {
			this.set('requiredFilter', true);
			this.set('hideOptional', $M.localize('uitext','mxapibase','Yes') );
		} else {
			this.set('requiredFilter', false);
			this.set('hideOptional', $M.localize('uitext','mxapibase','No') );
		}
	},
	
	/**
	 * Filter question set by complete/incomplete
	 */
	filterQuestions: function(/*String*/completionFilter, /*Boolean*/requiredOnly) {
		
		//Restore original set
		this.dataListQuestions = JSON.parse( JSON.stringify( this.originalDataListQuestions ) );
		
		if ( requiredOnly && requiredOnly === true ) {
			this.dataListQuestions = this.filterRequired(this.dataListQuestions);
		}

		if (completionFilter) {

			if (completionFilter === 'complete') {
				this.dataListQuestions = this.filterCompleted(this.dataListQuestions);
			} else if (completionFilter === 'incomplete') {
				this.dataListQuestions = this.filterCompleted(this.dataListQuestions, true);
			}

		}
		
		this.$.questionlist.refresh();
		
	},
	
	filterRequired: function(questionSet) {
		
		for (var i = 0; i < questionSet.length; i++) {
			var q = questionSet[i];
			if (this._isGroupHeader(q)){
				q.children = this.filterRequired(q.children);
			}
		}
		
		questionSet = questionSet.filter(function(val){ 
				return val._required;
		});
		
		return questionSet;
	},
	
	filterCompleted: function(questionSet, isIncomplete) {
		
		for (var i = 0; i < questionSet.length; i++) {
			var q = questionSet[i];
			if (this._isGroupHeader(q)){
				q.children = this.filterCompleted(q.children, isIncomplete);
			}
		}
		
		if (isIncomplete && isIncomplete === true) {
			var self = this;
			questionSet = questionSet.filter(function(val){
				if (val.children && val.children.length <= 0) {
					return false;
				}
				return !val._done;
			});
		}else {
			questionSet = questionSet.filter(function(val){
				if (val.children && val.children.length > 0) {
					return true;
				}
				return val._done; 
			});
		}
		
		return questionSet;
	},
	
	//**** DEPRECATED functions ****\\
	
	/**
	 * DEPRECATED
	 * Listen to question update from execution component
	 */
	questionUpdate: function(e) {
		e.stopPropagation();
	},
	
	/**
	 * DEPRECATED
	 * 
	 * Fetch questions from inspection form
	 * Re structure questions
	 */
	_fetchQuestions: function( inspform ) {
		
//		if (!inspform._originalinspquestion) {
//			inspform._originalinspquestion = JSON.parse( JSON.stringify( inspform.inspquestion ) );
//		}

		//Convert flat structure to hierarchical
		var questions = inspform.inspquestion;
//		questions = JSON.parse(JSON.stringify(inspform._originalinspquestion));
		questions = this._removeChildrenForStructureChange(questions);
		questions = this._flatToHierarchy(questions);
		
		for (var i = 0; i < questions.length; i++) {
			var question = questions[i];
			
			var qChildren = (question.children) ? question.children : [];
			for (var j = 0; j < qChildren.length; j++) {
				//this.setAuxiliaryAttributes(qChildren[j]);
			}

			//this.setAuxiliaryAttributes(question);
		}
		this.dataListQuestions = this._cloneQuestions(questions);
		return questions;

	},
	
	/**
	 * DEPRECATED
	 * Update complete flag of question
	 */
	_updateQuestionCompletion: function (question, doneFlag) {
		
		//Find question 
		var localQuestion = this.findQuestion(question, this.questions);
		
		//Update question
		if (localQuestion) {
			localQuestion._done = doneFlag;
			localQuestion._icon = (doneFlag) ? 'Maximo:Confirm' : 'Maximo:Circle' ;
		}
	},
	
	/**
	 * DEPRECATED
	 * Find matching question
	 */
	findQuestion: function (question, qSet) {
		
		var match = null;
		
		for ( var i = 0; i < qSet.length; i++ ) {
			var q = qSet[i];
			if (q.children) {
				match = this.findQuestion(question, q.children);
				if (match !== null) {
					break;
				}
			}else {
				if (question.inspquestionid === q.inspquestionid) {
					match = q;
					break;
				}
			}
		}
		
		return match;
	},
	
	/**
	 * Check if inspection record is in a COMPLETED status.
	 */
	_isCompleted : function(record){
		return (record.status_maxvalue==='COMPLETED')? true : false;
	}
	
});
