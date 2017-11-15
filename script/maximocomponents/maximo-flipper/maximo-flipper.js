/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2017
 */

/*
A flipper component.
 */
Polymer({
	is: 'maximo-flipper',
  	behaviors: [BaseComponent],
	properties: {
		flipped: {
			type: Boolean,
			value: false,
			notify: true,
			observer: '_flipped'
		},
  		border: {
  			type: String,
  			value: ''
  		}
	},

  	/**
	 * Show the front content
	 */
	showFront: function(){
		this.flipped = false;
	},

	/**
	 * Show the back content
	 */
	showBack: function(){
		this.flipped = true;
	},

	/**
	 * Is the front currently showing 
	 */
	isFlippedFront: function(){
		return !this.flipped;
	},
	
	_flipped: function(value){
		$j(this.$.container).toggleClass('flipped', value);
	},
	
	_getBorderStyle: function(border){
		return border.length===0?'':'border:'+border;
	}
});