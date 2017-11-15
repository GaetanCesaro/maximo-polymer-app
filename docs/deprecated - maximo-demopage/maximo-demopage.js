/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */
Polymer({
	is: 'maximo-demopage',
	
	properties: {
		component: {
			type: String,
			observer: '_componentChanged'
		},
		_componentMapping : {
			type: Object,
			value: {
				'maximo-checkbox' : '../script/maximocomponents/maximo-checkbox'
			}
		},
	},
	_onClickChangeSource: function(e) {
		var index = e.target.getAttribute('data-page');
		
		this.$.sourcePages.select(index);
	},
	_componentChanged : function() {
		if (this._componentMapping[this.component]) {
			this.$.sourceCard0.srcFile = this._componentMapping[this.component] + '/' + this.component + '.html';		
			this.$.sourceCard1.srcFile = this._componentMapping[this.component] + '/' + this.component + '.js';		
			this.$.sourceCard2.srcFile = this._componentMapping[this.component] + '/' + this.component + '-css.html';			
			this.$.exampleCard.srcFile = './maximo-demopage/demo/maximo-components/' + this.component + '.html';	
		}
	},
	_contentsUpdated: function(e) {
		this.$.resultCard.contents = e.detail; 
	}	
});
