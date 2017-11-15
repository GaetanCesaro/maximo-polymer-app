/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-submitsr-describeissue',
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
		nextStep: {
			type : Number
		}
	},
	ready: function()
	{
	},
	_goNext : function(e) {
		this.fire('go-nextdetail', {step:'Description', nextStep: this.nextStep, value: {description: this.$.description.value}});
	},
	_skipStep: function(e) {
		this.fire('go-nextdetail', {step:'Description', nextStep: this.nextStep});
	},
	_onUpdateValue: function(e) {
		if (this.$.description.value && this.$.description.value.length > 0) {
			this.$.saveButton.disabled = false;
		} else {
			this.$.saveButton.disabled = true;
		}
	},
	initPage: function() {
		this.$.description.value = '';
	},
	renderPage: function(submitInfo, stackData) {
		// refresh current page data
		if (submitInfo.Description && submitInfo.Description.contents && submitInfo.Description.contents.description) {
			this.$.description.value = submitInfo.Description.contents.description;
		} else {
			this.$.description.value = '';
		}
		
		var newStackData = [];
		if (stackData) {
			for (var idx = stackData.length -1; idx>=0; idx--) {
				if (stackData[idx].data && stackData[idx].data.length !== 0) {
					newStackData.push($M.cloneRecord(stackData[idx]));
				}
			}
		}
		
		this.$.describeissue.setStackList(newStackData);
	}
});
