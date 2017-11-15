/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-createrequest-card',
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
		recordData :{
			type:Object,
			notify : true
		},
		selectedRecord :{
			type:Object,
			notify:true
		},
		subRoute: {
			type: String,
			notify: true
		}
	},
	listeners : {
	},
	ready: function()
	{
		
	},
	attached : function(){
	},
	describeProblem : function(e){
		this.$.submitWizard.addSubmitInfo({step:'Category', value:{
			'description': ''
		}});
		var that = this;
  		this.$.submitWizard.open(null, function() {
			that.fire('hide-navbar');
		});
	},
	_imgClicked: function(e) {
		var ccid = this.recordData[e.model.index].classstructureid;
		var ccdesc = this.recordData[e.model.index].classificationdesc;
		this.$.submitWizard.addSubmitInfo({step:'Category', value:{
			'classstructureid': ccid, 
			'description': ccdesc
		}});
		var that = this;
		this.$.submitWizard.open(ccid, function() {
			that.fire('hide-navbar');
		});
	},
	_handleRecordDataRefreshed : function(){
	},
	_handleDataError : function(){
	},
	_wizardClosed : function() {
		this.fire('show-navbar');
	},
	_srCreated: function(e) {
		var that = this;
		this.$.submitWizard.close(false, function() {
			that.fire('select-page', 0);
			that.fire('refresh-pages', 'recent');
			that.fire('highlight-card', e.detail);
		});
		e.stopPropagation();
	},
	pageSelected: function() {
		this.$.submitWizard.hidden = true;
	}
});
