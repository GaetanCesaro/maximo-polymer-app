/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-supinv-mgmt',
  	behaviors: [BaseComponent],
	properties : {
		priority : {
			type: String,
			value:'',
			notify: true
		}
	},
  	created : function(){  		
  	},
  	ready : function(){
  	},
  	attached: function(){  		
  	},
  	newPriority : function(e) {
		this.priority = e.detail;
  	}
});
