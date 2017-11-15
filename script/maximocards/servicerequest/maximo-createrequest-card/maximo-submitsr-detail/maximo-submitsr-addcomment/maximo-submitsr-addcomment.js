/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-submitsr-addcomment',
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
		} 
	},
	ready: function()
	{
	},
	_goNext : function(e) {
		this.fire('go-nextdetail', {step:'AdditionalCommentsStep', value: {description: this.$.comments.value}});
	},
	_skipStep: function(e) {
		this.fire('go-nextdetail', {step:'AdditionalCommentsStep', value: {}});
	},
	initPage: function() {
		this.$.comments.value = '';
	},
	renderPage: function(submitInfo, stackData) {
		// refresh current page data
		if (submitInfo['AdditionalCommentsStep'] && submitInfo['AdditionalCommentsStep'].contents && submitInfo['AdditionalCommentsStep'].contents.description) {
			this.$.comments.value = submitInfo['AdditionalCommentsStep'].contents.description;
		} else {
			this.$.comments.value = '';
		}
		
		var newStackData = [];
		if (stackData) {
			for (var idx = stackData.length -1; idx>=0; idx--) {
				if (stackData[idx].data && stackData[idx].data.length != 0) {
					newStackData.push($M.cloneRecord(stackData[idx]));
				}
			}
		}
		
		this.$.addcomment.setStackList(newStackData);
	}
});
