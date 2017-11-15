/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-datadesign-save',
  	listeners: {
  		'goback':'goback',
  		'_save':'_save'
	},
  	behaviors: [BaseComponent],
    properties: {
    	dataset : {
    		type: Object,
    		value: null,
    		notify: true
    	},
    	_description : {
    		type: String,
    		value: '',
    		notify: true,
    		observer: '_changeDesc'
    	},
    	_analyticdatasetnum : {
    		type: String,
    		value: '',
    		notify: true,
    		observer: '_changeName'
    	}
	},	
	observers: [
	    '_changetab(dataset, selected)'
	],
	goback : function (e) {
		this.fire('change-wizard-step',2);
	},
	_save: function(){
		//save record - validate query only if it's a new query
		if (this.dataset.query.newQuery){
			//initialize maps.
			if(!this.dataset._sqlQuerySuccessMap){
				this.dataset._sqlQuerySuccessMap = {};	
			}
			if(!this.dataset._sqlQueryFailureMap){
				this.dataset._sqlQueryFailureMap = {};	
			}
			this.fire('_validateSQL', {'dataset':this.dataset,'save':true});
		} else {
			// don't need to validate an existing query since it cannot be modified here
			this.fire('save', null);
		}
	},
	_changetab: function(dataset, selected){
		// load data when entering the step
		if(selected === 3 && this.dataset.editmode){
			this._analyticdatasetnum = this.dataset._analyticdatasetnum;
			this._description = this.dataset._description;
		} 
	},
	_changeDesc: function(value){
		this.dataset._description = value;
	},
	_changeName: function(value){
		this.dataset._analyticdatasetnum = value;
		this.toggleSave();
	},
	_saveAllowed: function(){
		return $j(this.$.analyticdatasetnum).val() !== '';
	},
	toggleSave: function(){
		var save = $M.workScape.getFooterButton('savedataset');
		if(save){
			$j(save).prop('disabled',!this._saveAllowed());
		}
	},
	
	_editobject: function(){
	
	},
	_editfields: function(){
	
	},
	_editclause: function(){
	
	},
	_editroles: function(){
	
	},
	
	preview : function(){
		this.fire('preview');
	}
	
});
