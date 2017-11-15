/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-work-mgmt',
  	behaviors: [BaseComponent],
	properties : {
		priority : {
			type: String,
			value:'',
			notify: true
		},
		priorityFilters : {
			type: Array,
			value: [],
			notify:true
		}
	},
  	created : function(){  		
  	},
  	ready : function(){  		
//  		this.priorityFilters = [
//			{intvalue : 'all', label: this.localize('uitext', 'mxapibase', 'All')},
//			{intvalue : 1, label: this.localize('uitext', 'mxapiwosdataset', 'Priority1')},						
//			{intvalue : 2, label: this.localize('uitext', 'mxapiwosdataset', 'Priority2')},
//			{intvalue : 3, label: this.localize('uitext', 'mxapiwosdataset', 'Priority3')},
//			{intvalue : 4, label: this.localize('uitext', 'mxapiwosdataset', 'Priority4')},
//		];
  	},
  	attached: function(){  		
  	},
  	newPriority : function(e) {  		
  		if (e.currentTarget) {
  			var intvalue = e.currentTarget.attributes.getNamedItem('intvalue');
  			if (intvalue) {
  				this.priority = intvalue.value;
  			}
  		}		
  	}
  	
});
