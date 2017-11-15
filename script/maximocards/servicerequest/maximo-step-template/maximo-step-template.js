/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */

Polymer({
	is: 'maximo-step-template',
	behaviors: [BaseComponent],
	properties: {
		title: {
			type: String,
			value: 'Panel'
		},
		type:{
			type: String
		},
		enableButtons:{
			type: String
		},
		stackData :{
			type: Object
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
		next : {
			type: Function,
			value: function() {}
		},
		disableNext : {
			type: Boolean,
			value: false
		}
	},
	created: function(){
	},
	ready: function(){
	},
	attached: function(){
		this.settingTemplate();
		this.requestorName = $M.userInfo.displayname;
		this.requestorEmail = $M.userInfo.primaryemail; // need to fix
		this.affectedPersonName = $M.localize('uitext', 'mxapisr','OnBehalfOf')+ ' Andrew Smith'; // need to fix

	},
	settingTemplate : function(){
		if(!this.enableButtons.includes('next')){
			this.querySelector('.nextButtonDiv').style.display = 'none';
		}
		if(!this.enableButtons.includes('skip')){
			this.querySelector('.skipButtonDiv').style.display = 'none';
		}
		if(this.enableButtons.includes('none')){
			this.querySelector('.nextButtonDiv').style.display = 'none';
			this.querySelector('.skipButtonDiv').style.display = 'none';
		}
		
		if($M.screenInfo.device === 'desktop'){
			$j(this.querySelector('.mainWrapper')).addClass('container flex-horizontal-with-ratios mainWrapperDesktop');
			$j(this.querySelector('.contentWrapper')).addClass('contentWrapperDesktop');
			$j(this.querySelector('.stackList')).addClass('stackListDesktop');
		}
	},
	setStackList: function(stackData) {
		this.stackData = stackData;
		this.$.stackDataList.notifyResize();
	},
	_nextStep: function() {
		this.fire('next-step');
	},
	_skipStep: function() {
		this.fire('skip-step');
	}
});
