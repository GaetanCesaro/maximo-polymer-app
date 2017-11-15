/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({

	is: 'maximo-labor-detail-card',
	
  	properties : {
  		
  		address: {
  			type: String,
  			computed: 'buildAddress(record.person.addressline1, record.person.city, record.person.stateprovince, record.person.postalcode)'
  		}
		
	},
  	
  	behaviors: [BaseComponent],
	
  	created : function(){
  		
  	},
  	ready : function(){
  		
  	},
  	attached: function(){
  		
  	},
  	
  	buildAddress: function(street, city, state, postalcode){
  		return street + ', ' + city + ', ' + state + ', ' + postalcode ;
  	},
  	
  	close: function(){
		this.container.close();
	},
	
	laborRecord: function() {
		console.info('Under construction...');
	}
  	
});
