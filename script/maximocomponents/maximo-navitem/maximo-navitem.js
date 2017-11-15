/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */

/*
A navigation item component.
 */
Polymer({
	is: 'maximo-navitem',
	properties: {
		label: {
			type: String
		},
  		
  		icon:{
  			type: String,
  			value:'',
  			notify:true
  		},
  		count:{
  			type: Number,
  			notify : true,
  			value : 0
  		}
	},
  	behaviors: [BaseComponent],
	
  	ready: function() {
  	}
	
});