/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-submitsr-defineissue',
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
		recordData :{
			type:Object,
			notify : true
		},
		selectedRecord :{
			type:Object,
			notify:true
		},
		additionalparams :{
			type : Object,
			notify : true
		},
		selectedItem : {
			type : Object
		}
	},
	listeners :{
		'radio-button-selected' : '_handleSelected'
	},
	ready: function() {
	},
	attached : function(){
		
	},
	goBack: function() {
		return 1;
	},
	_goNext : function(e) {
		var submitinfo = {
			step: 'Issue',
		};

		if (this.selectedItem && this.selectedItem.templateid) {
			submitinfo.value = {
				description : this.selectedItem.description,
				templateid: this.selectedItem.templateid,
			};
			this.fire('go-next', [submitinfo, {step:'Description'}]);
			return ;
		}
		
		this.fire('go-next', [submitinfo, {step:'AdditionalCommentsStep'}]);
	},
	_handleRecordDataRefreshed : function(){
		var radioData = [];
		
		for (var i = 0; i < this.recordData.length; i++) {
			radioData.push($M.cloneRecord(this.recordData[i]));
		}
		
		radioData.push({
			description:  this.localize('uitext', 'mxapisr', 'NoneOfTheAbove')
		});

		this.recordData = radioData;
	},
	_handleDataError : function(){
		
	},
	getIssues : function(selected){
		this.additionalparams = [];
		this.selectedItem = {};
		if(selected){
	  		this.additionalparams.push('oslc.where=classancestor.ancestor=%22'+selected+'%22');
	  		this.additionalparams.push('responseos=MXAPITKTMEPLATE');
	  		this.$.tktemplatecollection.refreshRecords().then(function(collection) {
	  		});
		}
	},
	_handleSelected: function(e) {
		this.selectedItem = e.detail.item;
		this.$.defineissue.disableNext = false;
	},
	initPage: function() {
		this.$.defineissue.disableNext = true;
	},
	renderPage: function(submitInfo, stackData) {
		var newStackData = [];
		if (stackData) {
			for (var idx = stackData.length -1; idx>=0; idx--) {
				if (stackData[idx].data && stackData[idx].data.length !== 0) {
					newStackData.push($M.cloneRecord(stackData[idx]));
				}
			}
		}
	
		this.$.defineissue.setStackList(newStackData);
	}
});
