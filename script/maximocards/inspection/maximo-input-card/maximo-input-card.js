/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-input-card',
	
  	behaviors: [BaseComponent],
  	
  	listeners: {},
  	
    properties: {
    	
    	index: {
    		type: Number,
    		value: 0
    	},
    	
    	label: {
    		type: String,
    		value: ''
    	},
    	
    	descValue: {
    		type: String,
    		value: null
    	},
    	
    	field: {
    		type: Object,
    		value: null
    	},
    	icon:{
        type: String,
        value:'Maximo:Warning'
      	},
    	
    	type: {
    		type: String,
    		value: null
    	},
    	
    	_label: {
    		type: String,
    		computed: 'computeLabel(index,inputi, label,loaded)'
    	},
    	
    	isQuestionRequired: {
    		type: Boolean,
    		value: false,
    		observer: '_requiredChanged'
    	},
    	
    	requiredStatus: {
    		type: String,
    		value: function() { return $M.localize('uitext','mxapibase','no'); }
    	},
    	
    	previewTitle: {
    		type: String,
    		function() { return $M.localize('uitext','mxapibase','preview'); }
    	},
    	
    	constructorTypes: {
    		type: Array,
    		value: ['TR','SE','SO']
    	},
    	
    	isCopy: {
    		type: Boolean,
    		value: false,
    		observer: '_isCopyChange'
    	},
    	rangeValue:{
    		type: Number,
    		value: 0
    	},
    	toValue:{
    		type:Number,
    		value:0
    	},
    	stepValue:{
    		type:Number,
    		value: 0
    	},
    	initialValue:{
    		type: String,
    		value: null
    	},
    	finalValue: {
    		type:String,
    		value:null
    	},
    	option: {
    		type: Object,
    		value: null
    	},
    	optionIndex:{
    		type: Number,
    		value: 0
    	},
    	optionSet: {
    		type: Array,
    		value: []
    	},
    	optionDesc: {
    		type: String,
    		value: null
    	},
    	valuelist:{
    		type:Array,
    		value:[]
    	},
    	validatorcount:{
    		type:Number,
    		value:0
    	},
    	placeholder: {
    		type: String,
    		value: null
    	},
    	inputi: {
    		type: Number,
    		value: 0
    	},
    	loaded: {
    		type:Boolean,
    		value:false
    	}
	},
	ready: function() {
		this._placeField();
	},
	
	attached: function() {
		this.highlight();
	},
	
	computeLabel: function (index,inputi,label,loaded) {
		if(inputi==0 && loaded==false){
			return (index+1) + '. ' + label;
			this.loaded=true;
		}
		else{
			return (inputi+1) + '. ' + label;
		}
	},
	computeOptionLabel: function (index) {
		var cArray=[];
		var optionLabel=$M.localize('uitext','mxapiinspection','option_label');
		var nodeArray = Polymer.dom(this.$.optionsHolder).querySelectorAll('input');
			for (var i = 0; i < nodeArray.length; i++) {
				if(!this.optionSet[i].isDeleted){
					cArray.push(this.optionSet[i]);
				}
			}
		return optionLabel+" " + (cArray.length+1)+": ";
	},
	
	_fireDelete: function (e) {
		
		this.fire('delete-input');
	},
	
	_fireCopy: function (e) {
		this.updateObjectAttributes();
		this.fire('clone-input');
	},
	
	/**
	 * Required field observer
	 */
	_requiredChanged: function(newV) {
		
		if (newV === true) {
			this.requiredStatus = $M.localize('uitext','mxapibase','Yes');
		} else {
			this.requiredStatus = $M.localize('uitext','mxapibase','No');
		}
	},
	
	_placeField: function() {
		
		if (!this.field) {
			console.warn('No field set.');
			return;
		}
		
		if (this.field.hasOwnProperty('isCopy')) {
			this.isCopy = this.field.isCopy;
		}
		
		this._buildConstructor();
		
	},
	refreshIndexes:function(){
		var nodeArray = Polymer.dom(this.$.optionsHolder).querySelectorAll('.optionlabel');
		var newindex=0;
		var optionLabel=$M.localize('uitext','mxapiinspection','option_label');
			for (var i = 0; i < nodeArray.length; i++) {
				if(!this.optionSet[i].isDeleted){
					nodeArray[i].innerHTML=optionLabel+' ' + (newindex+1)+': ';
					newindex++;
				}
			}
	},
	_unsetCopy: function(e) {
		if (this.isCopy === true){
			this.isCopy = false;
		}
	},
	
	_isCopyChange: function (newV) {

		var copyNode = this.$.copyIcon;
		if (newV === true){
			copyNode.classList.add('copy');
		}else {
			copyNode.classList.remove('copy');
		}
	},
	
	/**
	 * Dispatch to correct constructor
	 */
	_buildConstructor: function() {
		
		if (!this.field.fieldtype) {
			console.error('Unable to build card. Value type missing.');
		}
		
		var type = this.field.fieldtype;
		
		if (this.constructorTypes.indexOf(type) < 0){
			console.error('There is no constructor for this type of input. Input: ' + type);
		}

		if(this.field.optSet){
			this.set('optionSet',this.field.optSet);
			this.optionSet.sort(function(a, b) {
					return parseFloat(a.sequence) - parseFloat(b.sequence);
					});

		}else{
			var optSet=[];
			optSet.push({
				'description':''
			});
			optSet.push({
				'description':''
			});
			this.set('optionSet',optSet);
		}
		
		if ( this.field.description && this.field.description.length > 0 ) {
			this.descValue = this.field.description;
		}
		
		if ( this.field.hasOwnProperty('required') ) {
			this.isQuestionRequired = this.field.required;
		}
		
		switch (type) {
			case 'TR':
				this._mountTextResponse();
				break;
			// case 'NR':
			// 	this._mountNumericRange();
			// 	break;
			case 'SE':
				this._mountNumericEntry();
				break;
			case 'SO':
				this._mountSingleOption();
				break;
			default:
				console.warn('No type matching');
		}
		
	},
	
	/**
	 * Create constructor and preview for Test Response
	 */
	_mountTextResponse: function() {
		//Find holder
		var holderNode = this.$.trOptionHolder;
		
		var buildContent = Polymer.dom(holderNode).querySelector('.build');
		while (buildContent.childNodes.length > 0) {
			Polymer.dom(this.$.constructor).appendChild(buildContent.childNodes[0]);
		}
		
		var previewContent = Polymer.dom(holderNode).querySelector('.prev');
		while (previewContent.childNodes.length > 0) {
			Polymer.dom(this.$.preview).appendChild(previewContent.childNodes[0]);
		}
		
		this.previewTitle = $M.localize('uitext','mxapiinspection','example');
		
	},
	/**
	 * Create constructor and preview for Numeric Entry
	 */
	_mountNumericEntry: function() {
		//Find holder
		var holderNode = this.$.neOptionHolder;
		
		var buildContent = Polymer.dom(holderNode).querySelector('.build');
		while (buildContent.childNodes.length > 0) {
			Polymer.dom(this.$.constructor).appendChild(buildContent.childNodes[0]);
		}
		
		var previewContent = Polymer.dom(holderNode).querySelector('.prev');
		while (previewContent.childNodes.length > 0) {
			Polymer.dom(this.$.preview).appendChild(previewContent.childNodes[0]);
		}
		
		this.previewTitle = $M.localize('uitext','mxapiinspection','example');
		
	},
	_mountSingleOption:function(){
		//Find holder
		var holderNode = this.$.soOptionHolder;
		var buildContent = Polymer.dom(holderNode).querySelector('.build');
		while (buildContent.childNodes.length > 0) {
			Polymer.dom(this.$.constructor).appendChild(buildContent.childNodes[0]);
		}
		
		var previewContent = Polymer.dom(holderNode).querySelector('.prev');
		
		this.previewTitle = $M.localize('uitext','mxapiinspection','example');
				
		var placeholdertext = $M.localize('uitext','mxapibase','select_option');
		var responseField = Polymer.Base.create('maximo-select',{'id':'previewoptioninput','placeholder':placeholdertext});
		responseField.setAttribute('value','');
		responseField.setAttribute('values','1,2');
		$j(responseField.$.select).attr('disabled','disabled');
		Polymer.dom(this.$.preview).appendChild(responseField);

		this.selectObserver();
		this._iconHandler();
	},
	
	highlight: function() {
		var card = this.$.card;
		
		card.classList.add('highlight');
		this.scrollIntoView(false);
		setTimeout(function() {
			card.classList.remove('highlight');
		}, 4000);
	},
	
	/**
	 * Change question required status
	 */
	switchRequired: function(isRequired) {
		if (this.isQuestionRequired !== isRequired) {
			this.isQuestionRequired = isRequired;
		}
	},
	
	/**
	 * Applies suffix to user input 
	 * to show label in preview mode 
	 */
	computePreviewLabel: function (label){
		
		if (label) {
			return label;
		}else {
			return '';
		}
	},
	
	/**
	 * Updates attributes to field property
	 * and sends field object
	 */
	fetchResponseFieldObject: function() {
		this.updateObjectAttributes();
		return this.field;
	},
	
	/**
	 * Set properties back to original record
	 */
	updateObjectAttributes: function() {
		this.field.description = this.descValue;
		this.field.required = this.isQuestionRequired;
		this.field.skipoption = !this.isQuestionRequired;
		this.field.showdate = false;
		this.field.showtime = false;
		if(this.field.isCopy){
			if(this.field.inspfieldoption){
			for(var i=0;i<this.field.inspfieldoption.length;i++){
  				delete this.field.inspfieldoption[i].inspfieldoptionid;
                delete this.field.inspfieldoption[i].href;
                delete this.field.inspfieldoption[i].inspfieldoptionid_localized;
				this.optionSet=this.field.inspfieldoption;

                			}
            }
		}
		if(this.field.fieldtype === 'SO'){
			this.grabOptions();
			this.field.inspfieldoption=this.optionSet;
		}		
	},
	
	/**
	 * DragNDrop tests
	 */
	
	_addDragProp: function (e) {
		this.$.card.draggable = true;
	},
	
	_removeDragProp: function (e) {
		this.$.card.draggable = false;
	},
	
	_handleDragEnter: function (e) {
		e.preventDefault();
		this.$.card.classList.add('dashedBorder');
	},
	
	_handleDragLeave: function (e) {
		console.log('leaves a valid drop target.');
		this.$.card.classList.remove('dashedBorder');
	},
	_iconHandler:function(){
		var iconHolder=Polymer.dom(this.$.optionsHolder).querySelectorAll('.optionminus');
		var arrayOptions=[];
		for (var i = 0; i < this.optionSet.length; i++) {
			if(!this.optionSet[i].isDeleted){
				arrayOptions.push(this.optionSet[i]);
			}
		}
		if(arrayOptions.length>2){
			for (var i = 0; i < iconHolder.length; i++) {
				$j(iconHolder[i]).css({'fill':'#4178be'});
			}
		}
		else{
			for (var i = 0; i < iconHolder.length; i++) {
				$j(iconHolder[i]).css({'fill':'black'});
			}
		}
	},
	_addOption:function(e) {
		var deleteXElements = 0;
    	var newElementIndex = e.model.index + 1;
    	var element = e.model.option;
    	this.optionIndex=newElementIndex;
        var copiedelement=JSON.parse(JSON.stringify(element));
		delete copiedelement.inspfieldoptionid;
		delete copiedelement.href;
		delete copiedelement.sequence;
		delete copiedelement.description;
    	// this.splice('optionSet', newElementIndex, deleteXElements, copiedelement);	
    	this.push('optionSet',copiedelement);
    	var count=0;
		for (var i = 0; i <this.optionSet.length; i++) {
			if(!this.optionSet[i].isDeleted){
				count++;
			}
		}
		if(count>2){
			var nodeArray = Polymer.dom(this.$.optionsHolder).querySelectorAll('.optionminus');
			for (var i =0; i<nodeArray.length; i++) {
				nodeArray[i].classList.add('optionminusactive');
			}
		}
		this.$.inspectionOptionSet.render();
		this._iconHandler();
		this.selectObserver();
	},
	_removeOption:function(e) {
		var count=0;
		for (var i = 0; i <this.optionSet.length; i++) {
			if(!this.optionSet[i].isDeleted){
				count++;
			}
		}
		if(count>2){
    	var index = e.model.index;
    	var removeXElements = 1;
    	// this.splice('responseFieldSet', index,  removeXElements);
        e.model.option.isDeleted=true;
        // this.set('responseFieldSet.'+index+'.object.isDeleted', true);
		e.target.parentElement.style.display="none";
		this.notifyPath('option.isDeleted');	
		count--;
		this._iconHandler();
		this.selectObserver();
		this.refreshIndexes();
		this.$.inspectionOptionSet.render();
}},
	grabOptions: function(){
    	var optionsequence = this.optionSet;
    	this.optionSet=[];
		for (var i = 0; i < optionsequence.length; ++i) {
				//adding new field				
				optionsequence[i].sequence = i + 1;
				this.push('optionSet',optionsequence[i]);
		}
    },
    validator: function(b){
    	var nodeArray = Polymer.dom(this.$.optionsHolder).querySelectorAll('input');
    	var optHolder=Polymer.dom(this.$.optionsHolder).querySelectorAll('.options');
    	var iconHolder=Polymer.dom(this.$.optionsHolder).querySelectorAll('.validationicon');
    	var count=0;
      	for(var i=0; i<nodeArray.length;i++){
    		if(nodeArray[i].value=='' && b==true){
	    		$j(optHolder[i]).css({'position':'relative'});
		        $j(iconHolder[i]).css({'display':'inline-block','position':'relative','width':'50px','pointer-events':'none','right':'61%'});
		        $j(nodeArray[i]).css({'padding-left':'30px','border-color':'#d74108'});
		        count++;
	        }
    		else{
    		$j(iconHolder[i]).css({'display':'none'});
      		$j(nodeArray[i]).css({'padding-left':'3px','border-color':'#aeb8b8'});
    		}
    	}
    	if(count==0){
    		return true;
   		}
	    else{
	    	return false;
	    }
    },
    selectObserver:function(){
    	var test=this.fetchResponseFieldObject();
    	var res = [];
    	var e =this.optionSet;
    	for (var i = 0; i <e.length; i++) {
    		 var inspfieldoption= e[i];
			if(!inspfieldoption.isDeleted){
				res.push(inspfieldoption.description);
			}
		}
			this.validator(false);
		this.valuelist = res.join(','); 
    }


});
