/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */
Polymer({
	
	is: 'maximo-demopage-source-card',
	
	properties : {
		srcFile: {
			type: String,
			observer: '_srcChanged'
		},
		contents: {
			type: String,
			observer: '_contentsChanged'
		}
	},	
	ready: function() {
	},
	_srcChanged : function() {
		this.$.ajax.generateRequest();
	},
	_handleAjaxResponse: function(e, req) {
		this.contents = req.response;
	},
	_handleError: function(e) {
		console.log(e.detail);
	},
	_contentsChanged: function() {
		this.fire('update', this.contents);
	}
});
