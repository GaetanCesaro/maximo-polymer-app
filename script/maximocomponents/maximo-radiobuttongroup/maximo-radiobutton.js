/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2017
 */
/*
A radio button component.
 */
Polymer({
	is: 'maximo-radiobutton',
  	behaviors: [BaseComponent,ArrowKeys],
	properties : {
		checked: {
			type: Boolean,
			value: false,
			observer: '_checkedChanged'
		},
		_ariaChecked: {
			type: String,
			value: 'false'
		},
		groupId: {
			type: String,
			value: ''
		},
		label: {
			type: String,
			value: ''
		},
		tabindex: {
			type: String,
			value: 0
		}
	},
	_checkedChanged: function(checked){
		this._className = (checked === true)?'radiobuttonOuter checked':'radiobuttonOuter ';
		this._ariaChecked = (checked === true)?'true':'false';
	},
  	_select: function(e){
  		if(this.domHost.tagName !== 'MAXIMO-RADIOBUTTONGROUP'){
  			this.checked = !this.checked;
  		}
  		this.domHost.fire('radio-button-selection-changed', {'event':e,'groupId':this.groupId});
  	}
 });