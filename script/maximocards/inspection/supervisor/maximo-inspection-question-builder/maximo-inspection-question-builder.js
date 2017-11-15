/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-inspection-question-builder',
	
  	behaviors: [BaseComponent],
  	
  	listeners: {
  		'chooseObject' : '_pickObject',
  		'setFocus' : '_setQuestionFocus'
  	},
  	
    properties: {
    	
    	/**
    	 * Inspection question record
    	 */
    	record: {
    		type: Object
    	},
    	
    	/**
    	 * Question object, used to pass question in for editing, duplicating, etc
    	 */
    	question: {
    		type: Object,
    		observer: '_questionChange'
    	},
    	
    	/**
    	 * Question description
    	 */
    	questionDesc: {
    		type: String
    	},
    	
    	/**
    	 * Label of required toggle button
    	 */
    	requiredLabel: {
    		type: String
    	},
    	
    	/**
    	 * Indicator whether there is response field
    	 */
    	hasQuestion: {
    		type: Boolean,
    		value: false,
    		readOnly: true
    	},
    	
    	/**
    	 * Merged inspection group with field
    	 */
    	inputTypeSet: {
    		type: Array,
    		value: []
    	},
    	
    	/**
    	 * Response field array
    	 */
    	responseFieldSet: {
    		type: Array,
    		value: []
    	},
    	
    	/**
    	 * Instruction located inside builder
    	 */
    	instruction: {
    		type: String
    	},
    	
    	/**
    	 * Synonym domain filter
    	 */
    	domainFilter: {
    		type: Object
    	},
    	
    	/**
		 *	Collection order by, required for collection sorting
		 **/
		collectionOrderBy:{
			type: String,
			value: ''
		},
        inputi:{
            type:Number,
            value: 0
        },
        loaded:{
            type:Boolean,
            value:false
        }
    },
    
    ready : function(){
    	this._buildFilter();
        $j(this.$.validationmsg).css({'display':'none'});
  	},
    
    /**
     * Handle request to delete response field
     */
    _deleteInput: function (e) {
    	// Remove input
    	
    	var index = e.model.index;
    	var removeXElements = 1;
    	// this.splice('responseFieldSet', index,  removeXElements);
        e.model.field.object.isDeleted=true;
        // this.set('responseFieldSet.'+index+'.object.isDeleted', true);
        e.target.$.outercard.style.display='none'
    	this.checkInstruction();
        this.refreshIndexes();
    },
    
    /**
     * Handle request to copy response field
     */

    _copyInput: function (e) {
        var deleteXElements = 0;
        var newElementIndex = this.responseFieldSet.length;
     	var element = e.model.field;
        var copiedelement=JSON.parse(JSON.stringify(element));
    	this.setCopy(copiedelement);
        if(copiedelement.object.inspfieldnum){
            delete copiedelement.object.inspfieldnum;
            if(copiedelement.object.inspfieldoption){
                for(var i=0;i<copiedelement.object.inspfieldoption.length;i++){
                    delete copiedelement.object.inspfieldoption[i].inspfieldoptionid;
                    delete copiedelement.object.inspfieldoption[i].inspfieldoptionid_localized;
                }
            }
        }
    	this.splice('responseFieldSet', newElementIndex, deleteXElements, copiedelement);
    	this.checkInstruction();
        this.$.inspectionInputSet.render();
        this.refreshIndexes();
    },
    
    /**
     * Flag object with new attribute
     */
    setCopy: function(element) {
    	if (!element.hasOwnProperty('object')){
    		element.object = {};
    	}
    	element.object.isCopy = true;
    },
    
    /**
     * Switch required status of every field response
     * using same value from question required
     */
    _setQuestionsRequired: function(e) {
    	var isRequired = e.detail.value;
    	
    	var nodeArray = Polymer.dom(this.$.innerCards).querySelectorAll('maximo-input-card');
		for (var i = 0; i < nodeArray.length; ++i) {
			nodeArray[i].switchRequired(isRequired);
		}
    	
    },
    
    /**
     * Build new response field 
     * based on listed synonym domain 
     */
    _pickObject : function (e) {
    	
    	var selectedResponseField = e.detail._selectedRecords;
    	
		if (selectedResponseField && (selectedResponseField.length > 0)) {
			selectedResponseField = e.detail._selectedRecords[0];
			
			if (selectedResponseField.hasOwnProperty('children') ) {
				if ( selectedResponseField.children.length >= 1 ) {
					console.warn('Group selected (' + selectedResponseField.description + '), not able to include input');
					return;
				} else {
					selectedResponseField = selectedResponseField.children[0];
				}
			}
	    	
			var field = this._buildEmptyField(selectedResponseField);
			
	    	if (!this.responseFieldSet) {
	    		this.responseFieldSet = [];
	    	}
	    	
	    	this.push('responseFieldSet', field);
            this.$.inputOptions.refresh();
	    	this.checkInstruction();
            this.refreshIndexes(); 
		}
		
	},
    refreshIndexes:function(){
        var nodeArray = document.querySelectorAll('.inputcard');
        var newindex=0;
        var optionLabel=$M.localize('uitext','mxapiinspection','option_label');
            for (var i = 0; i < nodeArray.length; i++) {
                if(!this.responseFieldSet[i].object.isDeleted){
                    $j(nodeArray[i].$.title).text((newindex+1)+'. '+this.responseFieldSet[i].title);
                    newindex++;
                }
            }
        this.inputi=newindex;
        this.loaded=true;
    },
	
	/**
	 * Create new empty input card
	 */
	_buildEmptyField: function(synDomain) {
		
		var field = {};
		field.object = {};
		
		field.object.fieldtype = synDomain.maxvalue;
		field.title = synDomain.description;
		return field;
		
	},

	/**
	 * Request inspection field types 
	 * from synonym domain
	 */
	_buildFilter: function() {
		
		this.domainFilter = [{'filtertype': 'SIMPLE', 'field': 'domainid', 'availablevalues': [ {'value': 'INSPFIELDGROUP', 'selected': true}, {'value': 'INSPFIELDTYPE', 'selected': true} ]}];
	
		this.$.inputtypedomain.refreshRecords();
	},
    
	/**
	 * Set the correct instruction 
	 * depending on response fields count 
	 */
    checkInstruction: function () {
    	
    	var inputs = this.responseFieldSet;
    	if (inputs && inputs.length > 0) {
    		
    		this.instruction = $M.localize('uitext','mxapiinspection','get_started_question3');
    		this._setHasQuestion(true);
    		
    	}else {
    		if (this.questionDesc.length > 0){
    			this.instruction = $M.localize('uitext','mxapiinspection','get_started_question2');
    			this._setHasQuestion(true);
    		}else {
    			this._setHasQuestion(false);
    		}
    	}
    	
    },
    
    /**
     * Observer of question description
     */
    _questionChange: function(newV) {
    	  var inspfield= this.question;
            if (this.question){
                this.questionDesc = this.question.description;
            
                if(this.question.inspfield){
                    for (var i = 0; i < this.question.inspfield.length; i++) {
                        var field = {};
                        field.object = {};
                    
                        field.object.fieldtype = this.question.inspfield[i].fieldtype;
                        field.object.description = this.question.inspfield[i].description;
                        field.object.inspfieldnum =  this.question.inspfield[i].inspfieldnum;
                        field.object.required =  this.question.inspfield[i].required;
                        field.object.optSet=this.question.inspfield[i].inspfieldoption;
                        // for(var j=0; j<this.question.inspfield[i].inspfieldoption.length;j++){
                        //     field.object.inspfieldoption[j]=this.question.inspfield[i].inspfieldoption[j];
                        // }
                        if(field.object.fieldtype==="SE"){
                            field.title=$M.localize('uitext','mxapiinspection','single_entry');
                        }if(field.object.fieldtype==="TR"){
                            field.title=$M.localize('uitext','mxapiinspection','text_response');
                        }
                        if(field.object.fieldtype==="SO"){
                            field.title="Single Option";
                            // field.title=$M.localize('uitext','mxapiinspection','single_option');
                        }
                     this.push('responseFieldSet', field);
                }
            }
        }
        this.checkInstruction();
    },
    
    /**
     * Reset question builder
     * Fire event back to form
     */
    _cancel: function(e) {
    	this._resetBuilder();
    	this.fire('cancel-question-builder');
    },
    
    /**
     * Trigger validation
     * Reset question builder
     * Fire event back to form
     */
    _complete: function(e) {
        var valid = this.$.qname.validator(this.$.qname,true);
        var valid_field =this.fieldvalidation();
        if(valid === false || valid_field === false){
            $j(this.$.validationmsg).css({'display':'initial'});
        }else{
            $j(this.$.validationmsg).css({'display':'none'});
            // is this a new or existing question?  (do we add or update)
            if (this.question && this.question.inspquestionid){ // existing
            	this.question.description = this.questionDesc;
            }else{
                this.question = {'description': this.questionDesc};
            }
            
            var responseFieldArray = this.grabResponseFields();
            
            this.question.inspfield = responseFieldArray;
            
            this.fire('addUpdateQuestion', this.question);
            this.fire('cancel-question-builder');
        	this._resetBuilder();
        }
    },
    
    /**
     * Reset fields to initial states
     * Clear response field array
     * Used when Saved or Canceled 
     */
    _resetBuilder: function() {
    	this.question = undefined;
    	this.questionDesc = '';
    	this.responseFieldSet = [];
        this.inputi=0;
        this.loaded=false;
    	this.checkInstruction();
    },
    getParentFromGroup: function(input){
        var inputArray=input.valueid.split('|');
        return inputArray[2];
    },
    
    /**
     * Handle success regarding synonym domain request 
     * Merge inspection group with 
     * inspection type as a hierarchical structure
     */
    _buildInputSet: function (e) {

        var domains = this.domainCollection;
        var inputSet = [];
        var inputGroup;
        var inputType;
        for (var i in domains) {
            if (domains[i].domainid.toUpperCase() === 'INSPFIELDGROUP') {
                inputGroup = domains[i].synonymdomain;
            }
            if (domains[i].domainid.toUpperCase() === 'INSPFIELDTYPE') {
                inputType = domains[i].synonymdomain;
            }
        }
        for (var j in inputGroup) {
            var group = inputGroup[j];
            if(group.maxvalue!=='MAX'){ //Maximo Inputs is not being shipped yet, so don't process this group
                group.children = [];
                for (var k in inputType) {

                    var input = inputType[k];
                    parent = this.getParentFromGroup(input);

                    if(input.maxvalue==='NR' || input.maxvalue==='MM' || input.maxvalue==='MO'){
                    	//do nothing, these are not yet implemented
                    }
                    else{
    	                if (parent === group.maxvalue) {
    	                    group.children.push(input);
    	                }
                    }
                }
                inputSet.push(group);
            }
        }

        this.inputTypeSet  = inputSet;

    }, 


    /**
     * Handle error regarding 
     * synonym domain request
     */
    _handleDomainError: function (e) {
    	console.log('Problem loading data');
    	this.inputTypeSet = [];
    },

    /**
     * Retrieve an object for each input card
     * Returns an array with all response fields 
     */
    grabResponseFields: function() {
    	
    	var rfArray = [];
    	var nodeArray = Polymer.dom(this.$.innerCards).querySelectorAll('maximo-input-card');
    	
		for (var i = 0; i < nodeArray.length; ++i) {
			var object = nodeArray[i].fetchResponseFieldObject();
			object = JSON.parse(JSON.stringify(object));
			if (object){
				//adding new field
				//object._action = 'Add';
				
				object.sequence = i + 1;
				rfArray.push(object);
			}
		}
    	
		return rfArray;
    },
    
    /**
     * Validate question builder form
     */
    validation: function(e){
        var valid= this.$.qname.validator(this.$.qname,false);
        this.$.qname.validatorcount++;
        if(valid === true){
             $j(this.$.validationmsg).css({'display':'none'});
        }
	},
    fieldvalidation: function(){
        var nodeArray = Polymer.dom(this.$.innerCards).querySelectorAll('maximo-input-card');
        for (var i = 0; i < nodeArray.length; i++) {
            if(nodeArray[i].field.fieldtype=="SO" && !nodeArray[i].field.isDeleted){
                 var valid=nodeArray[i].validator(true);
                 if(valid==false){
                    return false;
                 }
            }
        }
        return true;
    },
    // isVisible:function(item){
    //    return item.object.isDeleted === undefined || item.object.isDeleted===false;
    // }

	_setQuestionFocus: function(){
		var qname = $j(this.$.qname).find('input');
		qname.focus();
	}
	
});
