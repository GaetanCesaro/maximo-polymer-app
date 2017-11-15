/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */
/*
A type label component.
 */
Polymer({
	is: 'maximo-typelabel',
	properties: {
		/**
    	 * type to calculate style
    	 */
    	type: {
    		type: String,
    		value: '',
    		notify: true,
    		observer: 'update'
    	}
	},
  	behaviors: [BaseComponent],
  	
  	ready: function() {

  	},
  	
  	attached: function(){
  		
  	},
  	
	
  	update: function() {
  		
		var type = this.getAttribute('type') ? this.getAttribute('type') : this.type;
		
		if (type && type.length > 0) {
	    	$j(this.$.type).toggleClass('emergency', (type.toLowerCase().trim() == 'em'));
		}
		
	}
	
});