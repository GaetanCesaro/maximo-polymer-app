/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({

	is: 'maximo-labor-card',
	
  	properties : {
		
  		/**
  		 * Employee picture
  		 */
  		picture : {
  			type: String
  		},
  		
  		/**
  		 * Employee display name
  		 */
  		name : {
  			type: String
  		},
  		
  		/**
  		 * Employee location/site
  		 */
  		location : {
  			type: String
  		},
  		
  		/**
  		 * Employee category/job
  		 */
  		category : {
  			type: String
  		}
  		
	},
	
	listeners: {
//        'tap': 'viewLabor',
    },
  	
  	behaviors: [BaseComponent],
	
  	created : function(){
  		
  	},
  	ready : function(){
  		
  	},
  	attached: function(){
  		
  	}

  		
});
