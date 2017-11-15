/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */
Polymer({
	
	is: 'maximo-demopage-result-card',
	
	properties : {
		contents: {
			type: String,
			observer: '_contentsChanged'
		}	
	},
	_contentsChanged : function() {
		this.$.contents.innerHTML = this.contents;
	}
});