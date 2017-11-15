/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-inspector-execution',
	
  	behaviors: [BaseComponent],
  	
  	listeners: {
  		'maximo-response-field-changed' : '_maximoResponseFieldChanged'
  	},
  	
    properties: {
    	
    	/**
    	 * Stores insp result object
    	 */
    	record: {
    		type: Object,
    		observer: '_inspResultChange'
    	},
    	
    	questionSet: {
    		type: Array
    	},
    	
    	_done:{
    		type: Boolean,
    		value:false
    	}
    	
	},
	
	_dropDownInstructions: function(e) {
		var self = this;
		var question = e.model.question;
		var height = $j('#inspectormain_executionContainer_rightPanel').scrollTop();
		$j('#executionContainer_execution_groupInstructionsTitle')[0].innerHTML=question.listdesc;
		$j('#executionContainer_execution_groupInstructionsText')[0].innerHTML=question.description_longdescription;
		$j('#executionContainer_execution_groupInstructionsText').css({'overflow':'auto','height':'75%','width':'98%','margin-bottom':'10px'});
		$j('#executionContainer_execution_groupInstructions')[0].classList.add('float-down');
		$j('#executionContainer_execution_groupInstructions').css({'display':'block','margin-top':height,'height':'40%','overflow':'hidden'});
		
		$j('#inspectormain_executionContainer_rightPanel').on('scroll',function(){
			self.closeInstructions(e);
			$j('#inspectormain_executionContainer_rightPanel').off('scroll');
		});
		
	},
		
	closeInstructions: function(e) {
		$j('#executionContainer_execution_groupInstructionsTitle')[0].innerHTML='';
		$j('#executionContainer_execution_groupInstructionsText')[0].innerHTML='';
		$j('#executionContainer_execution_groupInstructions')[0].classList.remove('float-down');
		$j('#executionContainer_execution_groupInstructions').css('display', 'none');
	},
	
	/**
	 * Set highlight class on group level
	 */
	highlightHeader: function(question){
		if(question.groupseq !== null && question.sequence === 0 ){
			return 'highlight';	
		}
	},
	
	/**
	 * Observes changes in record prop
	 */
	_inspResultChange: function(newV) {
		
		var inspForm = newV.inspectionform;
		if (!inspForm) {
			return;
		}
		
		if (inspForm && inspForm.length > 0) {
			inspForm = inspForm[0];
		}

		//need to sort collection
		inspForm.inspquestion.sort(function(a, b) {
			return parseFloat(a.groupseq) - parseFloat(b.groupseq);
		});
			
			
		this.questionSet = inspForm.inspquestion;
		var self=this;
		this.questionSet.forEach(function(question){
			question.groupseq = parseFloat(question.groupseq);
			if(question.groupid){
				self._groupDone(question.groupid,newV);
			} else {
				self._questionDone(question,newV);
			}
		});
	},
		
	/**
	 * Update confirm/done icons that appear  for each question/group
	 */
	_maximoResponseFieldChanged : function(e){
		var eventQuestion = e.detail.currentTarget.parentElement.parentElement.parentElement.parentElement.question;
		var field = '';
		if(e.detail.target.nodeName === 'SELECT'){
			field = e.detail.target.parentElement.parentElement.parentElement.fieldEvent;	
		} else {
			field = e.detail.target.domHost.fieldEvent;	
		}
		
		var responseArray = [];//this._getFieldResponseRecord(this.record,field);
		var responsefield = (field.fieldtype==='TR' || field.fieldtype==='SO') ? 'txtresponse' : 'numresponse';
		
		var value = e.detail.target.value;
	
		if(responseArray && responseArray.length>0){
			responseArray[0][responsefield] = value;	
		}else {
			field.inspfieldresult = [];
			if(responsefield==='txtresponse'){
				field.inspfieldresult.push({'txtresponse':value});		
			} else {
				field.inspfieldresult.push({'numresponse':value});	
			}
			
		}
			
		this._groupDone(eventQuestion.groupid,this.record);			 
	},
	
	/**
	 * Update confirm/done flag on group level
	 */
	_groupDone : function(groupid,record){
		var self = this;
		var group;
		var done = true;
		this.questionSet.forEach(function(question){
			if(question.groupid && question.groupid === groupid) {
				if(question.sequence === 0){
					group = question;
				} else {
					var questionFilled = self._questionDone(question,record);
					if(!questionFilled){
						done = false;
					}
				}
			} else {
				if(question.groupid && question.sequence === 0){
					//skip
				} else {
					self._questionDone(question,record);
				}
				
			}
			
		});
		
		if(group){
			group._done = done;
			this._done ='';
			this._done = done; //triggers listener on template
		}
		
	},
	
	/**
	 * Update confirm/done flag on question level
	 */
	_questionDone : function(question,record){
		var done = true;
		var self = this;
		var allEmpty = true;
		var hasEmptyRequiredFields = false;
		
		question.inspfield && question.inspfield.forEach(function(field,index){ //check other question fields
			if (field.required){
				question.required = true;
			}
			
			var responsefield = (field.fieldtype==='TR' || field.fieldtype==='SO') ? 'txtresponse' : 'numresponse';	
			var responseArray = self._getFieldResponseRecord(record,field);
			
			if(responseArray && responseArray.length>0){ //field response match found for record
				if(responseArray[0][responsefield] && (responseArray[0][responsefield]!=='' && responseArray[0][responsefield]!==undefined) ){
					done = true;
				} else {
					done = false;
				}
			} else if(!field.inspfieldresult || (field.inspfieldresult[0] && (field.inspfieldresult[0][responsefield]===undefined || field.inspfieldresult[0][responsefield]===''))){
				done = false;
			} else if(!record.inspfieldresult){ //no field results exist on the result record
				done = false;
			} else if (field.inspfieldresult && field.inspfieldresult.length===1 && !field.inspfieldresult[0]._id && field.inspfieldresult[0][responsefield]){ //field response found with no record structure
				if(field.inspfieldresult[0][responsefield]===''){
					done = false;
				} else {
					done = true;
				}
			} else if(responseArray && responseArray.length===0){
				done = false;
			}
			
			//required field && field empty
			if(field.required && !done && !hasEmptyRequiredFields){
				hasEmptyRequiredFields = true;
			}
			
			//if field has data and allEmpty flag was not flipped, flip it
			if(done && allEmpty){
				allEmpty = false;
			}
			
		});


		if(hasEmptyRequiredFields || allEmpty){
			done = false;
		} else {
			done = true;
		}
				
		question._done = done;
		
		this._done ='';  //triggers listener on template
		this._done = done;
		return done;
	},
	
	/**
	 * Toggle confirm/circle icons
	 */
	isDone : function(question,_done){
		if(question._done){
			return true;
		} else {
			return false;
		}
	},
	
	/**
	 * Scroll or show the question
	 */
	showQuestion: function (question) {
		
		if(question){
			//this.$.inspectorListTileTemplate.render();
			var questionNum = question.inspquestionnum;
			var nodeArray = this.$.inspectorExecutionScrollerDiv.querySelectorAll('div.questionContainer');
			
			for (var i = 0; i < nodeArray.length; ++i) {
				if (nodeArray[i].dataQuestionnum === questionNum){
					nodeArray[i].scrollIntoView();
					break;
				}
			}
		}
	},
	
	/**
	 * Check if question is a group header
	 */
	isGroup : function(question){
		if((question.groupid && question.sequence === 0) || (question.children)){
			return true;
		}else{}
			return false;
	},
		
	_getFieldResponseRecord : function(resultRecord,inspField,e){
		var responseArray = [];
		
		if(resultRecord && resultRecord.inspfieldresult && inspField.inspfieldresult){
			responseArray = inspField.inspfieldresult.filter(function(el){
				return el.orgid===resultRecord.orgid && el.resultnum===resultRecord.resultnum;
			});
		} 
		
		return responseArray;		
	},
	
	/**
	 * Hide Info icon if group instructions are empty.
	 */
	hideInfoIcon : function(question){
		if (this.isGroup(question) && question.description_longdescription){
			return false;
		} else {
			return true;
		}
	}
	
});
